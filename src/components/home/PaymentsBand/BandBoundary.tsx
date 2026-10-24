"use client";

import { Component, type ReactNode } from "react";
import { RestingBand } from "./BandFrame";

type Props = {
  children: ReactNode;
  /** What shows instead of a child that failed to render; the resting band when left out. */
  fallback?: ReactNode;
};

/**
 * Catches render bugs in the browser band, or the details page's live part, and shows a resting version instead.
 * It sits inside the server loader, so a failed snapshot read on the server is never caught here.
 */
export class BandBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? <RestingBand />) : this.props.children;
  }
}
