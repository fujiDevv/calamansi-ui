"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import { getSvgPath } from "figma-squircle";
import useMeasure from "react-use-measure";
import { cn } from "./utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE CALAMANSI SURFACE
 *
 * Every card, pill and widget in the kit wears the same shape: a squircle — a
 * superellipse rather than a border radius. Figma's curve is what gives the
 * corners their softer, more continuous turn at the same radius, which is why
 * the shape is a path and not `rounded-*`.
 *
 * It is painted on its own layer, inset to the parent, so the thing it belongs to
 * stays a plain block: content can sit above it and, in the dock's case, overflow
 * past it without being clipped.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SQUIRCLE_RADIUS = 28;
export const SQUIRCLE_SMOOTHING = 1;

/**
 * The lift, written as a filter because the surface is clipped to its squircle
 * and a clip-path takes a box shadow with it.
 */
export const SQUIRCLE_LIFT = "drop-shadow(0 14px 28px rgba(0, 0, 0, 0.24))";

/**
 * The lift — plus any filters that belong with it — as one value a container can
 * switch off by setting `--squircle-lift`: the shapes go flat for everything
 * inside, without any of them knowing. See `NO_LIFT`.
 */
export const squircleLift = (...layers: string[]) =>
  `var(--squircle-lift, ${layers.join(", ")})`;

/**
 * Flattens every surface inside it: `<div style={NO_LIFT}>`. The previews use it —
 * a tile is not the place for a shadow, and their clip edge would slice one off
 * anyway. A replaced `var()` has to be a valid filter on its own, which is why
 * this is `none` and not empty.
 */
export const NO_LIFT = { "--squircle-lift": "none" } as CSSProperties;

export type SquircleProps = {
  /** Surface paint: the palette gradient, a flat colour, anything. */
  className?: string;
  /** Corner radius in pixels. Default: 28 */
  radius?: number;
  /** Corner smoothing, from 0 (rounded rectangle) to 1. Default: 1 */
  smoothing?: number;
  /** Cast the lift under the surface. Default: true */
  lift?: boolean;
  /**
   * Replace the generated filter, for surfaces that glow as well as lift — a
   * drop-shadow list is composable, and it follows the squircle either way.
   */
  filter?: string;
  /**
   * Hairline along the edge, given as the class that sets the stroke colour
   * (`"text-border"`). A border cannot follow a squircle — a 1px rect stops
   * being useful well before the corner, which begins two radii in — so this
   * strokes the same path that clips the surface and lets the clip trim the
   * outer half away, leaving a crisp line inside the shape.
   */
  border?: string;
  /** Width of that line in pixels. Default: 1 */
  borderWidth?: number;
  /** Drawn inside the shape and clipped to it — glare, grain, a lit border. */
  children?: ReactNode;
};

export function Squircle({
  className,
  radius = SQUIRCLE_RADIUS,
  smoothing = SQUIRCLE_SMOOTHING,
  lift = true,
  filter,
  border,
  borderWidth = 1,
  children,
}: SquircleProps) {
  const [ref, bounds] = useMeasure();

  const path = useMemo(
    () =>
      bounds.width > 0 && bounds.height > 0
        ? getSvgPath({
            width: bounds.width,
            height: bounds.height,
            cornerRadius: radius,
            cornerSmoothing: smoothing,
          })
        : null,
    [bounds.width, bounds.height, radius, smoothing],
  );

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 block"
      style={{
        filter: filter ?? (lift ? squircleLift(SQUIRCLE_LIFT) : undefined),
      }}
    >
      <span
        ref={ref}
        /* the radius is the fallback for the first paint and the server render */
        style={
          path ? { clipPath: `path('${path}')` } : { borderRadius: radius }
        }
        className={cn("relative block size-full overflow-hidden", className)}
      >
        {children}

        {border &&
          (path ? (
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
              fill="none"
            >
              <path
                d={path}
                className={border}
                stroke="currentColor"
                /* only the inner half of the stroke survives the clip */
                strokeWidth={borderWidth * 2}
              />
            </svg>
          ) : (
            /* the same radius the surface falls back to, so the hairline matches it */
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-0 block",
                border,
              )}
              style={{
                borderRadius: radius,
                boxShadow: `inset 0 0 0 ${borderWidth}px currentColor`,
              }}
            />
          ))}
      </span>
    </span>
  );
}
