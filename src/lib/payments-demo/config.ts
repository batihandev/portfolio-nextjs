/** The demo API's base URL without a trailing slash, or null when the demo is not configured. */
export function demoApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_DEMO_API_URL?.trim();
  return url ? url.replace(/\/+$/, "") : null;
}
