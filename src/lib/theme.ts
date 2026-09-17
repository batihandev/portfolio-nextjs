import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "./theme-init";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const systemQuery = () => matchMedia("(prefers-color-scheme: dark)");
const systemTheme = (): Theme => (systemQuery().matches ? "dark" : "light");
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const notify = () => listeners.forEach((listener) => listener());

const hasOverride = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

// Follows the system until the visitor picks the other theme; picking the system's theme again clears the override.
const followSystem = () => {
  if (hasOverride()) return;
  document.documentElement.dataset.theme = systemTheme();
  notify();
};

export const theme = {
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    const media = systemQuery();
    media.addEventListener("change", followSystem);
    return () => {
      listeners.delete(onChange);
      media.removeEventListener("change", followSystem);
    };
  },
  getSnapshot: read,
  getServerSnapshot: (): Theme => "light",
  set(next: Theme) {
    document.documentElement.dataset.theme = next;
    try {
      if (next === systemTheme()) localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    notify();
  },
  toggle: () => theme.set(read() === "dark" ? "light" : "dark"),
};

export const useTheme = () => useSyncExternalStore(theme.subscribe, theme.getSnapshot, theme.getServerSnapshot);
