"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EDGE_FADE =
  "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)";

export type MarqueeProps = {
  children: ReactNode;
  className?: string;
  /** Seconds for one full loop. */
  duration?: number;
  /** Scroll the other way. */
  reverse?: boolean;
  /** Hold the loop while the pointer is over it. */
  pauseOnHover?: boolean;
  /** Fade the leading and trailing edges. */
  fade?: boolean;
  /** Space between items, in pixels. */
  gap?: number;
  /** How many copies to render. Two is enough for a seamless loop. */
  repeat?: number;
};

/**
 * An infinite marquee.
 *
 * The children are rendered twice inside a `w-max` row that slides by exactly
 * one copy, so the loop is seamless at any width. The keyframes are injected
 * per instance (unique name) and switched off for reduced motion.
 */
export function Marquee({
  children,
  className,
  duration = 32,
  reverse = false,
  pauseOnHover = true,
  fade = true,
  gap = 32,
  repeat = 2,
}: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  const animation = `marquee-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      style={
        fade
          ? { maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }
          : undefined
      }
    >
      <style>{`@keyframes ${animation}{from{transform:translateX(0)}to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){.${animation}{animation:none!important}}`}</style>

      <div
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        className={cn("flex w-max", animation)}
        style={{
          animation: `${animation} ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: pauseOnHover && paused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        {Array.from({ length: repeat }, (_, copy) => (
          <div
            key={copy}
            aria-hidden={copy > 0}
            className="flex shrink-0"
            style={{ gap, paddingRight: gap }}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
