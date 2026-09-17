"use client";

import { useId, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DIGITS_UP = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGITS_DOWN = [...DIGITS_UP].reverse();

const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const FORMAT = (value: number) => NUMBER.format(value);

/**
 * The Calamansi surface: a gradient slab inside a thick white lip, matching the
 * task and morning widgets.
 */
const SHELL = [
  "relative inline-flex overflow-hidden rounded-[20px] border-[3px] border-white/80 p-1.5",
  "bg-gradient-to-br from-[#8fa37d] via-[#5c7a67] to-[#39564a] font-runde font-bold text-white",
  "dark:border-white/10 dark:from-[#1b281f] dark:via-[#16221a] dark:to-[#0e1611]",
  "sm:rounded-[24px] sm:border-4 sm:p-2",
].join(" ");

const SHELL_SHADOW: CSSProperties = {
  boxShadow:
    "0 18px 36px -16px rgba(0, 0, 0, 0.45), inset 0 -3px 14px 5px rgba(255, 255, 255, 0.25), inset 0 -6px 3px rgba(0, 0, 0, 0.2)",
};

/** The lit window the digits sit in, like the widgets' glass tiles. */
const WINDOW =
  "relative z-10 inline-flex items-center rounded-[14px] bg-white/15 px-2.5 py-1 ring-1 ring-white/25 backdrop-blur-sm sm:px-3";

/** Fractal-noise grain — the texture the widgets carry. */
function Grain({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-[0.16] mix-blend-overlay"
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

export type NumberTickerProps = {
  value: number;
  className?: string;
  /** Seconds for each digit to settle. */
  duration?: number;
  /** Delay between digits, in seconds. */
  stagger?: number;
  /** Roll the digits upward or downward. */
  direction?: "up" | "down";
  /** Static text before the digits. */
  prefix?: string;
  /** Static text after the digits. */
  suffix?: string;
  /** Turns the number into text. Defaults to a grouped en-US number. */
  format?: (value: number) => string;
};

/**
 * An odometer-style number that rolls to each new value, mounted in a Calamansi
 * window.
 *
 * Every digit is a column of 0 to 9 that slides to the active digit, which is
 * why the component only ever animates `translateY`, never layout.
 */
export function NumberTicker({
  value,
  className,
  duration = 0.7,
  stagger = 0.05,
  direction = "up",
  prefix,
  suffix,
  format = FORMAT,
}: NumberTickerProps) {
  const reduceMotion = useReducedMotion();
  const filterId = `ticker-grain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const text = format(value);
  const characters = [...text];

  return (
    <span className={cn(SHELL, className)} style={SHELL_SHADOW}>
      <Grain id={filterId} />

      <span className="sr-only">{`${prefix ?? ""}${text}${suffix ?? ""}`}</span>

      <span className={WINDOW}>
        <span
          aria-hidden
          className="inline-flex items-center tabular-nums drop-shadow-md"
        >
          {prefix}

          {characters.map((character, index) => (
            // keyed from the right so the ones column stays put as the number grows
            <DigitColumn
              key={characters.length - index}
              character={character}
              duration={reduceMotion ? 0 : duration}
              delay={
                reduceMotion ? 0 : (characters.length - index - 1) * stagger
              }
              direction={direction}
            />
          ))}

          {suffix}
        </span>
      </span>
    </span>
  );
}

function DigitColumn({
  character,
  duration,
  delay,
  direction,
}: {
  character: string;
  duration: number;
  delay: number;
  direction: "up" | "down";
}) {
  if (!/\d/.test(character)) {
    return <span className="inline-block leading-none">{character}</span>;
  }

  const strip = direction === "down" ? DIGITS_DOWN : DIGITS_UP;
  const digit = Number(character);
  // the strip is ten rows tall, so 10% of its own height is exactly one row
  const offset = (direction === "down" ? 9 - digit : digit) * 10;

  return (
    <span
      className="relative inline-block h-[1em] overflow-hidden leading-none"
      style={{ width: "0.62em" }}
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-offset}%` }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: "transform" }}
      >
        {strip.map((row) => (
          <span
            key={row}
            className="flex h-[1em] shrink-0 items-center justify-center leading-none"
          >
            {row}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
