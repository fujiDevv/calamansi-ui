"use client";

import { type ReactNode } from "react";
import { SQUIRCLE_RADIUS, SQUIRCLE_SMOOTHING, Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

export type SpotlightCardVariant = "white" | "calamansi" | "slate" | "citrus";

/**
 * The Calamansi palettes. `calamansi` is the default slab; `white` is the other end
 * of the range — the only palette that has to read on a light page: white in light
 * mode, near-black in dark. Each palette carries the ink that sits on it, and
 * everything inside tints from `currentColor`.
 */
const VARIANTS: Record<SpotlightCardVariant, { paint: string; ink: string }> = {
  white: {
    paint: "bg-white dark:bg-[#1c1c1f]",
    ink: "text-foreground",
  },
  calamansi: {
    paint: [
      "bg-gradient-to-br from-[#8fa37d] via-[#5c7a67] to-[#39564a]",
      "dark:from-[#1b281f] dark:via-[#16221a] dark:to-[#0e1611]",
    ].join(" "),
    ink: "text-white",
  },
  slate: {
    paint: [
      "bg-gradient-to-br from-[#a79cb7] via-[#687396] to-[#4a5a7f]",
      "dark:from-[#1e1b4b] dark:via-[#1e293b] dark:to-[#0f172a]",
    ].join(" "),
    ink: "text-white",
  },
  citrus: {
    paint: [
      "bg-gradient-to-br from-[#d69f7e] via-[#b87152] to-[#7d4128]",
      "dark:from-[#2e170c] dark:via-[#22120b] dark:to-[#140a06]",
    ].join(" "),
    ink: "text-white",
  },
};

export type SpotlightCardProps = {
  children?: ReactNode;
  className?: string;
  /** Title shown inside the card. */
  title?: ReactNode;
  /** Subtitle or detail label shown under the title. */
  subtitle?: ReactNode;
  /** Icon displayed in the header beside the title. */
  icon?: ReactNode;
  /** Badge or small element placed at the top-right of the card. */
  badge?: ReactNode;
  /** Custom header element replacing the default top title/icon row. */
  header?: ReactNode;
  /** Corner radius of the squircle, in pixels. Default: 28 */
  cornerRadius?: number;
  /** Corner smoothing, from 0 (a rounded rectangle) to 1. Default: 1 */
  cornerSmoothing?: number;
  /** Surface palette. Default: "calamansi" */
  variant?: SpotlightCardVariant;
};

/**
 * The branded card: one flat surface — the Calamansi slab by default, or white,
 * slate and citrus — clipped to the squircle. No grain, no glow.
 *
 * Everything inside is drawn in `currentColor`, so a card dropped into a coloured
 * context keeps its own ink rather than assuming white on white.
 */
const SURFACE = ["relative w-full p-5 font-runde select-none", "sm:p-6"].join(
  " ",
);

const ICON_CHIP =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-current/10 text-current";

const CONTENT = "relative z-10 flex flex-col";

export function SpotlightCard({
  children,
  className,
  title,
  subtitle,
  icon,
  badge,
  header,
  cornerRadius = SQUIRCLE_RADIUS,
  cornerSmoothing = SQUIRCLE_SMOOTHING,
  variant = "calamansi",
}: SpotlightCardProps) {
  const hasTopHeader = Boolean(header || title || icon || subtitle || badge);

  return (
    <div className={cn(SURFACE, VARIANTS[variant].ink, className)}>
      <Squircle
        className={VARIANTS[variant].paint}
        radius={cornerRadius}
        smoothing={cornerSmoothing}
      />

      <div data-slot="spotlight-card" className={CONTENT}>
        {hasTopHeader && (
          <div className="mb-4 flex items-start justify-between gap-3">
            {header ? (
              header
            ) : (
              <div className="flex min-w-0 items-center gap-3">
                {icon && <span className={ICON_CHIP}>{icon}</span>}
                {(title || subtitle) && (
                  <div className="min-w-0">
                    {title && (
                      <h3 className="truncate font-runde text-lg font-bold tracking-tight">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="truncate text-xs font-medium text-current/70">
                        {subtitle}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
