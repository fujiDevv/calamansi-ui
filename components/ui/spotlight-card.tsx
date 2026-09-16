"use client";

import {
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Theme-aware default: the primary colour at partial opacity. */
const PRIMARY_GLOW = "color-mix(in oklab, var(--primary) 55%, transparent)";

export type SpotlightCardProps = {
  children: ReactNode;
  className?: string;
  /** Radius of the glow, in pixels. */
  radius?: number;
  /** Any CSS colour. Defaults to the theme primary. */
  color?: string;
  /** Draw a lit border where the pointer is. */
  border?: boolean;
};

/**
 * A card that lights up under the pointer.
 *
 * The spotlight position is written straight to CSS custom properties on the
 * card, so moving the pointer never re-renders React.
 */
export function SpotlightCard({
  children,
  className,
  radius = 360,
  color = PRIMARY_GLOW,
  border = true,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerEnter={(event) => {
        track(event);
        ref.current?.style.setProperty("--spotlight-opacity", "1");
      }}
      onPointerLeave={() =>
        ref.current?.style.setProperty("--spotlight-opacity", "0")
      }
      style={
        {
          "--spotlight-x": "50%",
          "--spotlight-y": "50%",
          "--spotlight-radius": `${radius}px`,
          "--spotlight-color": color,
          "--spotlight-opacity": "0",
        } as CSSProperties
      }
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[var(--spotlight-opacity)] transition-opacity duration-300 ease-out"
        style={{
          background:
            "radial-gradient(var(--spotlight-radius) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)",
        }}
      />

      {border && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-[var(--spotlight-opacity)] transition-opacity duration-300 ease-out"
          style={{
            background:
              "radial-gradient(calc(var(--spotlight-radius) * 0.8) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
