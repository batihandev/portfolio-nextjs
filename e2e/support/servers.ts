import { join } from "node:path";
import { DemoProxyControl } from "./demo-proxy";

/** The local demo API. Its CORS allows the direct site's origin only, so that site keeps port 3020. */
export const DEMO_API = process.env.E2E_DEMO_API ?? "http://localhost:3010";

export const PROXY_PORT = 3031;
export const PROXY_CONTROL_PORT = 3032;
export const proxyControl = new DemoProxyControl(`http://127.0.0.1:${PROXY_CONTROL_PORT}`);

/** Nothing listens here, so every call to it is refused. */
const CLOSED_API = "http://127.0.0.1:3039";

/**
 * One production build per demo URL, since Next inlines `NEXT_PUBLIC_DEMO_API_URL` at build time.
 * - `direct`: the real demo API.
 * - `proxied`: the API through the switchable proxy, built while the proxy passes.
 * - `refused`: an API that refuses from the start, so the build has no snapshot.
 */
export const sites = {
  direct: { port: 3020, demoApi: DEMO_API, snapshot: true },
  // The proxy listens on IPv4 only, and Node may try IPv6 first for "localhost".
  proxied: { port: 3021, demoApi: `http://127.0.0.1:${PROXY_PORT}`, snapshot: true },
  refused: { port: 3022, demoApi: CLOSED_API, snapshot: false },
} as const;

export type SiteName = keyof typeof sites;

export const siteUrl = (name: SiteName) => `http://localhost:${sites[name].port}`;

export const CLOSED_API_PORT = Number(new URL(CLOSED_API).port);

/** Where the setup keeps each site's build, one folder per site name. */
export const buildsDir = join(__dirname, "../../node_modules/.cache/portfolio-e2e");
