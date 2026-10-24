import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { getDemoSnapshot } from "./snapshot";

/**
 * The snapshot for a page's first paint. A failure at build time gives null, so the page starts
 * resting, since there is no earlier page to keep. Any later failure throws, so a failed background
 * regeneration keeps the last good page instead of caching a resting one over it.
 */
export async function loadDemoSnapshot() {
  try {
    return await getDemoSnapshot();
  } catch (error) {
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw error;
    console.warn("Payment demo unavailable at build time; the page starts resting.", error);
    return null;
  }
}
