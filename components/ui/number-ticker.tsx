"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const DIGITS_UP = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DIGITS_DOWN = [...DIGITS_UP].reverse();

const NUMBER = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const FORMAT = (value: number) => NUMBER.format(value);

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
 * An odometer-style number that rolls to each new value.
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
  const text = format(value);
  const characters = [...text];

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono tabular-nums",
        className,
      )}
    >
      <span className="sr-only">{`${prefix ?? ""}${text}${suffix ?? ""}`}</span>

      <span aria-hidden className="inline-flex items-center whitespace-pre">
        {prefix}

        {characters.map((character, index) => (
          // keyed from the right so the ones column stays put as the number grows
          <DigitColumn
            key={characters.length - index}
            character={character}
            duration={reduceMotion ? 0 : duration}
            delay={reduceMotion ? 0 : (characters.length - index - 1) * stagger}
            direction={direction}
          />
        ))}

        {suffix}
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
