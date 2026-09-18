"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MarqueeVariant = "white" | "calamansi" | "slate" | "citrus";

/**
 * The palette is the accent the row carries, not a surface: the marquee stays
 * bare, so it can be dropped on any background. Anything inside that styles from
 * `currentColor` picks the accent up — `calamansi` is the brand green by default,
 * and `white` is the neutral end of the range, the page's own ink.
 */
const VARIANTS: Record<MarqueeVariant, string> = {
  white: "text-foreground",
  calamansi: "text-[#5c7a67] dark:text-[#b4e84c]",
  slate: "text-[#687396] dark:text-[#a99fd6]",
  citrus: "text-[#b87152] dark:text-[#ffc93d]",
};

export type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Accent palette the row carries. Default: "calamansi" */
  variant?: MarqueeVariant;
  /** Seconds for one full loop. Default: 30 */
  duration?: number;
  /** Scroll the other way. Default: false */
  reverse?: boolean;
  /** Hold the loop while the pointer is over it. Default: true */
  pauseOnHover?: boolean;
  /** Fade the leading and trailing edges. Default: true */
  fade?: boolean;
  /** Space between items in pixels or valid CSS string. Default: 24 */
  gap?: number | string;
  /** How many copies to render for a seamless loop. Default: 8 */
  repeat?: number;
  /** Scroll vertically instead of horizontally. Default: false */
  vertical?: boolean;
};

/**
 * An infinite, hardware-accelerated marquee.
 *
 * Renders multiple clones moving synchronously by exactly their own width
 * plus gap, creating a continuous and seamless loop on any screen width. It is
 * deliberately bare — no panel, no border — so it can sit on any surface, and it
 * carries the palette as an accent for its items to tint from.
 */
export function Marquee({
  children,
  className,
  variant = "calamansi",
  duration = 30,
  reverse = false,
  pauseOnHover = true,
  fade = true,
  gap = 24,
  repeat = 8,
  vertical = false,
}: MarqueeProps) {
  const animId = `marquee-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const gapValue = typeof gap === "number" ? `${gap}px` : gap;

  const fadeMask = vertical
    ? "linear-gradient(to bottom, transparent, #000 8%, #000 92%, transparent)"
    : "linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)";

  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden",
        VARIANTS[variant],
        vertical ? "flex-col" : "flex-row",
        className,
      )}
      style={{
        gap: gapValue,
        maskImage: fade ? fadeMask : undefined,
        WebkitMaskImage: fade ? fadeMask : undefined,
      }}
    >
      <style>{`
        @keyframes ${animId} {
          from {
            transform: ${
              vertical
                ? reverse
                  ? `translateY(calc(-100% - ${gapValue}))`
                  : "translateY(0)"
                : reverse
                  ? `translateX(calc(-100% - ${gapValue}))`
                  : "translateX(0)"
            };
          }
          to {
            transform: ${
              vertical
                ? reverse
                  ? "translateY(0)"
                  : `translateY(calc(-100% - ${gapValue}))`
                : reverse
                  ? "translateX(0)"
                  : `translateX(calc(-100% - ${gapValue}))`
            };
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .${animId} {
            animation: none !important;
          }
        }
      `}</style>

      {Array.from({ length: repeat }, (_, copy) => (
        <div
          key={copy}
          aria-hidden={copy > 0}
          className={cn(
            "flex shrink-0 items-center",
            animId,
            vertical ? "flex-col" : "flex-row",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
          style={
            {
              gap: gapValue,
              animationName: animId,
              animationDuration: `${duration}s`,
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              willChange: "transform",
            } as CSSProperties
          }
        >
          {children}
        </div>
      ))}
    </div>
  );
}
