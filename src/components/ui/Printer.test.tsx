import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrinterFeed, type PrinterPhase } from "./Printer";

const feed = (phase: PrinterPhase) =>
  render(
    <PrinterFeed phase={phase} paperKey={1}>
      <p>Receipt</p>
    </PrinterFeed>,
  ).container.firstElementChild;

describe("PrinterFeed", () => {
  // Clipping hides the paper above the slot while it feeds; at any other time it would cut off the paper's shadow.
  it("clips the paper only while it feeds", () => {
    expect(feed("feeding")).toHaveClass("overflow-hidden");
    expect(feed("idle")).not.toHaveClass("overflow-hidden");
    expect(feed("shredding")).not.toHaveClass("overflow-hidden");
  });
});
