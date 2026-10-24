import http from "node:http";
import https from "node:https";
import type { Socket } from "node:net";

/**
 * A stand-in for the demo API that forwards to the real one and can pretend it is down.
 *
 * - `pass` forwards every request, after `delayMs` when one is set.
 * - `refuse` drops every connection, open streams included, as a stopped API would.
 * - `hang` accepts requests and never answers.
 *
 * A control server on its own port switches the mode, and hands out one lease at a time, so tests
 * in different workers that change the mode take turns.
 */
export type ProxyMode = "pass" | "refuse" | "hang";
export type ProxyState = { mode: ProxyMode; delayMs: number };

type ProxyOptions = { port: number; controlPort: number; target: string };

export async function startDemoProxy({ port, controlPort, target }: ProxyOptions) {
  const upstream = new URL(target);
  // The local API is plain HTTP; a deployed one, given through E2E_DEMO_API, is HTTPS and may sit under a path.
  const client = upstream.protocol === "https:" ? https : http;
  const basePath = upstream.pathname.replace(/\/+$/, "");
  let state: ProxyState = { mode: "pass", delayMs: 0 };
  const sockets = new Set<Socket>();

  const proxy = http.createServer((req, res) => {
    if (state.mode === "refuse") return req.socket.destroy();
    if (state.mode === "hang") return;
    // The site runs on its own port, so the proxy answers CORS for any origin itself.
    const origin = req.headers.origin;
    const cors: http.OutgoingHttpHeaders = origin
      ? {
          "access-control-allow-origin": origin,
          "access-control-expose-headers": "Retry-After",
          vary: "Origin",
        }
      : {};
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        ...cors,
        "access-control-allow-headers": "content-type",
        "access-control-allow-methods": "GET,POST",
      });
      return res.end();
    }
    const forward = () => {
      const { origin: _origin, ...headers } = req.headers;
      const up = client.request(
        {
          host: upstream.hostname,
          port: upstream.port,
          path: `${basePath}${req.url ?? "/"}`,
          method: req.method,
          headers: { ...headers, host: upstream.host },
        },
        (answer) => {
          const kept = Object.fromEntries(
            Object.entries(answer.headers).filter(([name]) => !name.startsWith("access-control-")),
          );
          res.writeHead(answer.statusCode ?? 502, { ...kept, ...cors });
          answer.pipe(res);
        },
      );
      up.on("error", () => res.destroy());
      // Close the upstream when the caller leaves, or open streams pile up against the API's cap.
      res.on("close", () => up.destroy());
      req.pipe(up);
    };
    if (!state.delayMs) return forward();
    const timer = setTimeout(forward, state.delayMs);
    res.on("close", () => clearTimeout(timer));
  });
  proxy.on("connection", (socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });

  const waiting: http.ServerResponse[] = [];
  let holder: http.ServerResponse | null = null;
  const grantNext = () => {
    while (!holder && waiting.length) {
      const next = waiting.shift()!;
      if (next.destroyed) continue;
      holder = next;
      next.writeHead(200, { "content-type": "text/plain" });
      next.write("granted\n");
    }
  };

  const control = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://control");
    if (url.pathname === "/lease") {
      // The lease lasts as long as this response stays open; a worker that dies frees it too.
      res.on("close", () => {
        if (holder === res) {
          holder = null;
          state = { mode: "pass", delayMs: 0 };
        }
        grantNext();
      });
      waiting.push(res);
      return grantNext();
    }
    const mode = url.searchParams.get("mode");
    const delay = url.searchParams.get("delayMs");
    if (mode === "pass" || mode === "refuse" || mode === "hang") state = { ...state, mode };
    if (delay !== null) state = { ...state, delayMs: Number(delay) || 0 };
    if (state.mode !== "pass") for (const socket of sockets) socket.destroy();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(state));
  });

  await Promise.all([
    new Promise<void>((resolve) => proxy.listen(port, "127.0.0.1", resolve)),
    new Promise<void>((resolve) => control.listen(controlPort, "127.0.0.1", resolve)),
  ]);

  return {
    close: async () => {
      for (const socket of sockets) socket.destroy();
      proxy.closeAllConnections();
      control.closeAllConnections();
      await Promise.all([
        new Promise((resolve) => proxy.close(resolve)),
        new Promise((resolve) => control.close(resolve)),
      ]);
    },
  };
}

/** Talks to a running proxy's control server from a test. */
export class DemoProxyControl {
  readonly controlUrl: string;

  constructor(controlUrl: string) {
    this.controlUrl = controlUrl;
  }

  async set(change: Partial<ProxyState>): Promise<ProxyState> {
    const query = new URLSearchParams();
    if (change.mode) query.set("mode", change.mode);
    if (change.delayMs !== undefined) query.set("delayMs", String(change.delayMs));
    const response = await fetch(`${this.controlUrl}/?${query}`);
    return (await response.json()) as ProxyState;
  }

  /**
   * Waits for the only lease, then runs `work` with the proxy to itself. The proxy goes back to
   * plain pass mode when the lease ends.
   */
  async exclusive<T>(work: () => Promise<T>): Promise<T> {
    const lease = await new Promise<http.ClientRequest>((resolve, reject) => {
      const request = http.get(`${this.controlUrl}/lease`, { agent: false }, (granted) => {
        granted.on("error", () => {});
        granted.resume();
        resolve(request);
      });
      request.on("error", reject);
    });
    try {
      await this.set({ mode: "pass", delayMs: 0 });
      return await work();
    } finally {
      await this.set({ mode: "pass", delayMs: 0 });
      lease.destroy();
    }
  }
}
