import { demoStages, type DemoDay, type DemoHealth, type DemoPayment, type DemoStats } from "./types";

type Unknown = Record<string, unknown>;

const isObject = (value: unknown): value is Unknown => typeof value === "object" && value !== null;
const isNumberOrNull = (value: unknown) => value === null || typeof value === "number";

const isStage = (value: unknown) => (demoStages as readonly unknown[]).includes(value);

/**
 * Checks the fields the site reads to place and label a payment: its id, a stage and provider it knows, the amount
 * and confirmations. The times and links are trusted as the API sends them.
 */
export function isPayment(value: unknown): value is DemoPayment {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    isStage(value.stage) &&
    (value.provider === "chain" || value.provider === "stripe") &&
    typeof value.amount === "string" &&
    typeof value.confirmations === "number" &&
    (value.version === undefined || typeof value.version === "number")
  );
}

export function isStats(value: unknown): value is DemoStats {
  return (
    isObject(value) &&
    typeof value.settledCount === "number" &&
    isNumberOrNull(value.averageTimeToSettleMs) &&
    typeof value.duplicatesSkipped === "number" &&
    typeof value.failuresRecovered === "number"
  );
}

/** The health fields the portfolio reads. */
export function isHealth(value: unknown): value is DemoHealth {
  return (
    isObject(value) &&
    typeof value.cardAvailable === "boolean" &&
    typeof value.confirmations === "number" &&
    Number.isInteger(value.confirmations) &&
    value.confirmations > 0
  );
}

export function isDay(value: unknown): value is DemoDay {
  return (
    isObject(value) &&
    typeof value.day === "string" &&
    typeof value.settled === "number" &&
    typeof value.scheduled === "number" &&
    typeof value.visitor === "number" &&
    isNumberOrNull(value.averageTimeToSettleMs)
  );
}

export const isListOf = <T>(value: unknown, isItem: (item: unknown) => item is T): value is T[] =>
  Array.isArray(value) && value.every(isItem);

/** Parses JSON, returning undefined for text that is not JSON. */
export function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
