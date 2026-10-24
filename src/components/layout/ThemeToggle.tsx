"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { theme, useTheme } from "@/lib/theme";

export const ThemeToggle = () => {
  const current = useTheme();
  const label = current === "dark" ? "Switch to light mode" : "Switch to dark mode";
  // A 44 px target; the negative margin keeps the header row at its old height.
  return (
    <button
      type="button"
      onClick={theme.toggle}
      title={label}
      aria-label={label}
      className="text-muted hover:bg-paper hover:text-accent -my-1 grid size-11 place-items-center rounded-[10px] transition-colors"
    >
      {current === "dark" ? <LuSun className="size-4.5" /> : <LuMoon className="size-4.5" />}
    </button>
  );
};
