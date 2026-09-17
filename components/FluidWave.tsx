"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * The animated citrus sea that sits behind the footer.
 *
 * Two layers of motion, both purely decorative:
 *
 * 1. `WaveLayer` — a wave SVG that scrolls sideways forever. The wave path is
 *    exactly one period wide and the strip holds two copies of it, so sliding
 *    the strip by 50% of its own width lands copy #2 where copy #1 started and
 *    the loop has no seam. Each layer moves at its own speed (some backwards)
 *    and bobs gently, which is what makes the stack read as liquid rather than
 *    as a shape sliding past.
 * 2. `Blob` — soft radial washes of rind, leaf, flesh and blush drifting across
 *    the upper area so the footer never looks flat behind the headline.
 *
 * Every duration, colour and opacity lives in the arrays below, so restyling
 * this is a data edit. `prefers-reduced-motion` drops all of it (the layers then
 * render as static shapes at their resting offsets) and the whole thing is
 * `aria-hidden` + `pointer-events-none`, so it can never intercept a click.
 */

/** One period of the wave: crest at y≈12, trough at y≈140, closed to the floor. */
const WAVE_PATH = "M0 76 Q120 12 240 76 Q360 140 480 76 L480 200 L0 200 Z";

const WAVES = [
  {
    fill: "fill-calamansi-leaf",
    height: "h-[62%]",
    opacity: "opacity-[0.10] dark:opacity-[0.18]",
    duration: 46,
    reverse: false,
  },
  {
    fill: "fill-calamansi-rind",
    height: "h-[52%]",
    opacity: "opacity-[0.16] dark:opacity-[0.22]",
    duration: 34,
    reverse: true,
  },
  {
    fill: "fill-calamansi-flesh",
    height: "h-[42%]",
    opacity: "opacity-[0.14] dark:opacity-[0.2]",
    duration: 27,
    reverse: false,
  },
  {
    fill: "fill-calamansi-blush",
    height: "h-[31%]",
    opacity: "opacity-[0.10] dark:opacity-[0.16]",
    duration: 21,
    reverse: true,
  },
] as const;

const BLOBS = [
  {
    color: "var(--calamansi-rind)",
    className: "-top-[8%] -left-[12%] size-[42rem]",
    opacity: "opacity-25 dark:opacity-30",
    x: [0, 60, 0],
    y: [0, -28, 0],
    duration: 30,
  },
  {
    color: "var(--calamansi-flesh)",
    className: "-right-[10%] top-[10%] size-[36rem]",
    opacity: "opacity-20 dark:opacity-25",
    x: [0, -48, 0],
    y: [0, 32, 0],
    duration: 38,
  },
  {
    color: "var(--calamansi-leaf)",
    className: "left-[38%] -top-[16%] size-[30rem]",
    opacity: "opacity-20 dark:opacity-25",
    x: [0, 26, 0],
    y: [0, 40, 0],
    duration: 44,
  },
] as const;

function WaveLayer({
  fill,
  height,
  opacity,
  duration,
  reverse,
}: (typeof WAVES)[number]) {
  const reduceMotion = useReducedMotion();

  const rest = reverse ? "-50%" : "0%";
  const target = reverse ? "0%" : "-50%";

  return (
    <div className={cn("absolute inset-x-0 bottom-0", height)}>
      <motion.div
        className="flex h-full w-[200%] will-change-transform"
        initial={{ x: rest, y: 0 }}
        animate={
          reduceMotion
            ? { x: rest, y: 0 }
            : { x: [rest, target], y: [0, -10, 0] }
        }
        transition={{
          x: { duration, ease: "linear", repeat: Infinity },
          y: { duration: duration / 3, ease: "easeInOut", repeat: Infinity },
        }}
      >
        {[0, 1].map((copy) => (
          <svg
            key={copy}
            viewBox="0 0 480 200"
            preserveAspectRatio="none"
            className={cn("h-full w-1/2", fill, opacity)}
          >
            <path d={WAVE_PATH} />
          </svg>
        ))}
      </motion.div>
    </div>
  );
}

function Blob({
  color,
  className,
  opacity,
  x,
  y,
  duration,
}: (typeof BLOBS)[number]) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "absolute rounded-full blur-3xl will-change-transform",
        className,
        opacity,
      )}
      style={{
        backgroundImage: `radial-gradient(circle_at_center,${color},transparent_72%)`,
      }}
      initial={{ x: 0, y: 0, scale: 1 }}
      animate={
        reduceMotion
          ? { x: 0, y: 0, scale: 1 }
          : { x: [...x], y: [...y], scale: [1, 1.08, 1] }
      }
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    />
  );
}

export default function FluidWave({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {BLOBS.map((blob) => (
        <Blob key={blob.className} {...blob} />
      ))}

      {WAVES.map((wave) => (
        <WaveLayer key={wave.fill} {...wave} />
      ))}
    </div>
  );
}
