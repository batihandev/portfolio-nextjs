"use client";

import { LuMoon, LuSun } from "react-icons/lu";
import { theme, useTheme } from "@/lib/theme";

export const ThemeToggle = () => {
  const current = useTheme();
  const label = current === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={theme.toggle}
      title={label}
      aria-label={label}
      className="grid size-9 place-items-center rounded-[10px] text-muted transition-colors hover:bg-paper hover:text-accent"
    >
      {current === "dark" ? <LuSun className="size-4.5" /> : <LuMoon className="size-4.5" />}
    </button>
  );
};
