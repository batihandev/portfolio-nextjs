import { describe, expect, it } from "vitest";
import { isPayment } from "./parse";
import { demoPayment } from "./test-data";

describe("isPayment", () => {
  it("accepts a payment as the API sends it", () => {
    expect(isPayment(demoPayment())).toBe(true);
  });

  // The site maps the stage and provider to labels and steps; one it does not know would print nothing.
  it("refuses a stage or provider the site does not know", () => {
    expect(isPayment({ ...demoPayment(), stage: "refunded" })).toBe(false);
    expect(isPayment({ ...demoPayment(), provider: "paypal" })).toBe(false);
  });

  it("refuses a payment without the amount or confirmations the site reads", () => {
    expect(isPayment({ ...demoPayment(), amount: 500 })).toBe(false);
    expect(isPayment({ ...demoPayment(), confirmations: "3" })).toBe(false);
  });
});
