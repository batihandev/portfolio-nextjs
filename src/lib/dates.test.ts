import { afterEach, describe, expect, it, vi } from "vitest";
import { formatMonth, formatRange, yearsSince } from "./dates";

describe("formatMonth", () => {
  it("turns an ISO month into a short month and year", () => {
    expect(formatMonth("2025-07")).toBe("Jul 2025");
  });

  it("leaves a bare year as it is", () => {
    expect(formatMonth("2021")).toBe("2021");
  });
});

describe("formatRange", () => {
  it("joins two months with 'to'", () => {
    expect(formatRange("2023-04", "2025-06")).toBe("Apr 2023 to Jun 2025");
  });

  it("ends an open range with 'now'", () => {
    expect(formatRange("2025-12", null)).toBe("Dec 2025 to now");
  });
});

describe("yearsSince", () => {
  afterEach(() => vi.useRealTimers());

  it("counts whole years only", () => {
    vi.useFakeTimers({ now: new Date("2026-03-15T12:00:00Z") });
    expect(yearsSince("2023-04")).toBe(2);
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    expect(yearsSince("2023-04")).toBe(3);
  });

  it("treats a bare year as January of that year", () => {
    vi.useFakeTimers({ now: new Date("2026-01-01T00:00:00Z") });
    expect(yearsSince("2021")).toBe(5);
  });
});
