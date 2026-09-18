"use client";

import { motion, useReducedMotion } from "motion/react";
import { Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

const DIGITS_UP = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGITS_DOWN = [...DIGITS_UP].reverse();

const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const FORMAT = (value: number) => NUMBER.format(value);

export type NumberTickerVariant = "white" | "calamansi" | "slate" | "citrus";

/**
 * The Calamansi surface: one flat layer, clipped to a squircle by `Squircle`.
 * No lip, no glass tile, no grain — the palette is the whole treatment.
 *
 * `calamansi` is the default. `white` is the other end of the range — the only
 * palette that has to read on a light page: white in light mode, near-black in
 * dark. Each palette carries the ink that sits on it, and the content tints from
 * `currentColor`, so the digits stay legible on every one of them.
 */
const SURFACE = [
  "relative inline-flex p-1.5 font-runde font-bold select-none",
  "sm:p-2",
].join(" ");

const VARIANTS: Record<NumberTickerVariant, { paint: string; ink: string }> = {
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

/** The strip the digits sit on, straight on the surface. */
const ROW =
  "relative z-10 inline-flex items-center px-2.5 py-1 tabular-nums sm:px-3";

export type NumberTickerProps = {
  value: number;
  className?: string;
  /** Surface palette. Default: "calamansi" */
  variant?: NumberTickerVariant;
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
  variant = "calamansi",
  duration = 0.7,
  stagger = 0.05,
  direction = "up",
  prefix,
  suffix,
  format = FORMAT,
}: NumberTickerProps) {
  const reduceMotion = useReducedMotion();
  const text = format(value);
  const characters = [...text];

  return (
    <span className={cn(SURFACE, VARIANTS[variant].ink, className)}>
      <Squircle className={VARIANTS[variant].paint} />

      <span className="sr-only">{`${prefix ?? ""}${text}${suffix ?? ""}`}</span>

      <span className={ROW}>
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
