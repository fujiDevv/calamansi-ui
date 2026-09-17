"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MarqueeProps = {
  children: ReactNode;
  className?: string;
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
 * deliberately bare — no panel, no border — so it can sit on any surface.
 */
export function Marquee({
  children,
  className,
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
