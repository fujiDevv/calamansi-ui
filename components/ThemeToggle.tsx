"use client";

import { Moon, Sun } from "lucide-react";
import { playSfx } from "@/lib/sfx-client";
import { cn } from "@/lib/utils";

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const nextIsDark = !document.documentElement.classList.contains("dark");

        document.documentElement.classList.toggle("dark", nextIsDark);
        localStorage.setItem("calamansi-theme", nextIsDark ? "dark" : "light");
        playSfx("toggle");
      }}
      aria-label="Toggle theme"
      className={cn(
        "relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
