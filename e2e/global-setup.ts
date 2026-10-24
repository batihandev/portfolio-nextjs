import { spawn, type ChildProcess } from "node:child_process";
import { cpSync, existsSync, mkdirSync, openSync, rmSync } from "node:fs";
import { connect } from "node:net";
import { join, relative } from "node:path";
import { startDemoProxy } from "./support/demo-proxy";
import {
  buildsDir,
  CLOSED_API_PORT,
  DEMO_API,
  PROXY_CONTROL_PORT,
  PROXY_PORT,
  sites,
  siteUrl,
  type SiteName,
} from "./support/servers";

const root = join(__dirname, "..");
/** Run with this Node directly, so stopping a server stops Next itself and not a wrapper. */
const next = join(root, "node_modules/next/dist/bin/next");
/** Build output that a server does not need: the compiler's cache, image cache and dev output. */
const skipped = new Set([".next/cache/turbopack", ".next/cache/images", ".next/dev"].map((path) => join(root, path)));

const listening = (port: number) =>
  new Promise<boolean>((resolve) => {
    const socket = connect(port, "127.0.0.1");
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });

async function waitForPage(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await fetch(url).then(
      (response) => response.ok,
      () => false,
    );
    if (ok) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`${url} did not answer within ${timeoutMs} ms`);
}

/** Runs a build without blocking this process, which also serves the demo proxy the build reads through. */
function run(args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<{ code: number | null; output: string }>((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, env });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output }));
  });
}

/** Builds the site for one demo URL in `.next`, then copies the output to its own folder. */
async function build(name: SiteName): Promise<string> {
  const env = { ...process.env, NODE_ENV: "production", NEXT_PUBLIC_DEMO_API_URL: sites[name].demoApi } as const;
  const result = await run([next, "build"], env);
  if (result.code !== 0) throw new Error(`next build for ${name} failed:\n${result.output}`);
  // The build warns when it could not read the demo; only the refused build should.
  const resting = result.output.includes("Payment demo unavailable at build time");
  if (resting === sites[name].snapshot)
    throw new Error(
      `The ${name} build ${resting ? "could not read" : "unexpectedly read"} the demo:\n${result.output}`,
    );
  const dir = join(buildsDir, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const file of ["package.json", "next.config.ts", "public"].filter((file) => existsSync(join(root, file))))
    cpSync(join(root, file), join(dir, file), { recursive: true });
  cpSync(join(root, ".next"), join(dir, ".next"), {
    recursive: true,
    filter: (source) => !skipped.has(source),
  });
  return dir;
}

/** How long a server gets to exit on SIGTERM before it is killed. */
const STOP_GRACE_MS = 5000;

/**
 * Stops a `next start` server and the next-server process it runs, by signalling the server's whole process group,
 * and waits until the server has exited.
 */
async function stopServer(server: ChildProcess) {
  if (server.pid === undefined || server.exitCode !== null || server.signalCode !== null) return;
  const exited = new Promise<void>((resolve) => server.once("exit", () => resolve()));
  const signal = (name: NodeJS.Signals) => {
    try {
      process.kill(-server.pid!, name);
    } catch {
      // The group is already gone.
    }
  };
  signal("SIGTERM");
  const timer = setTimeout(() => signal("SIGKILL"), STOP_GRACE_MS);
  await exited;
  clearTimeout(timer);
  // next-server can outlive the CLI that started it by a moment; make sure nothing in the group is left.
  signal("SIGKILL");
}

/**
 * Starts the demo proxy, then builds and serves the site once per demo URL. Each copy keeps its
 * own ISR cache, so a test that stops the proxied API never changes what the direct site serves.
 */
export default async function globalSetup() {
  const ports = [...Object.values(sites).map((site) => site.port), PROXY_PORT, PROXY_CONTROL_PORT];
  for (const port of ports)
    if (await listening(port)) throw new Error(`Port ${port} is in use; stop whatever runs there first.`);
  if (await listening(CLOSED_API_PORT))
    throw new Error(`Port ${CLOSED_API_PORT} must stay closed for the refused build.`);
  const demoUp = await fetch(`${DEMO_API}/health`, { signal: AbortSignal.timeout(5000) }).then(
    (response) => response.ok,
    () => false,
  );
  if (!demoUp) throw new Error(`The demo API at ${DEMO_API} is not running.`);

  const proxy = await startDemoProxy({ port: PROXY_PORT, controlPort: PROXY_CONTROL_PORT, target: DEMO_API });
  const servers: ChildProcess[] = [];
  const stop = async () => {
    await Promise.all(servers.map(stopServer));
    await proxy.close();
  };

  try {
    for (const name of Object.keys(sites) as SiteName[]) {
      const dir = await build(name);
      const log = openSync(`${dir}.log`, "w");
      const server = spawn(process.execPath, [next, "start", relative(root, dir), "-p", String(sites[name].port)], {
        cwd: root,
        env: { ...process.env, NODE_ENV: "production" },
        // A stopped API makes the server log failed regenerations; they go to a file beside the build.
        stdio: ["ignore", log, log],
        // Its own process group, so stopping it also stops the next-server process that `next start` runs.
        detached: true,
      });
      servers.push(server);
      await waitForPage(siteUrl(name), 60_000);
    }
  } catch (error) {
    await stop();
    throw error;
  }
  return stop;
}
