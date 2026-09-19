"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { Citrus } from "lucide-react";
import {
  getCachedMascotPokes,
  loadMascotPokes,
  subscribeMascotPokes,
} from "@/lib/mascot-pokes-client";
import { cn } from "@/lib/utils";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const FORMAT = new Intl.NumberFormat("en-US");

/**
 * One digit of the odometer: a ten-row strip that slides to the active number.
 * Only `translateY` animates, so the header never reflows as the count climbs
 * and commas stay put.
 */
function OdometerDigit({
  value,
  delay,
  reduceMotion,
}: {
  value: string;
  delay: number;
  reduceMotion: boolean;
}) {
  if (!/\d/.test(value)) {
    return <span className="inline-block leading-none">{value}</span>;
  }

  return (
    <span
      className="relative inline-block h-[1em] overflow-hidden leading-none"
      style={{ width: "0.62em" }}
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={false}
        animate={{ y: `${-Number(value) * 10}%` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
        }
        style={{ willChange: "transform" }}
      >
        {DIGITS.map((digit) => (
          <span
            key={digit}
            className="flex h-[1em] shrink-0 items-center justify-center leading-none"
          >
            {digit}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * The running total of mascot pokes, which the hero sits under the mascot it is
 * counting. The number is an odometer — each digit rolls to its new value — and
 * the whole figure pops once so a poke registers even when only the ones column
 * moves.
 *
 * The count is global and lives at the edge (see /api/mascot-pokes), so pokes
 * from every visitor land on the same number.
 */
export default function MascotPokeCounter({
  className,
}: {
  className?: string;
}) {
  // The store lives outside React, so subscribe to it rather than mirroring it
  // into state — that also keeps the server render on the empty placeholder.
  const count = useSyncExternalStore(
    subscribeMascotPokes,
    getCachedMascotPokes,
    () => null,
  );
  const [scope, animate] = useAnimate();
  const previous = useRef<number | null>(null);
  const reduceMotion = useReducedMotion() === true;

  useEffect(() => {
    void loadMascotPokes();
  }, []);

  // Poke the number when it grows. The first value to arrive is the page load,
  // not a poke, so it stays still.
  useEffect(() => {
    if (count === null) return;

    const last = previous.current;
    previous.current = count;

    const node = scope.current;
    if (last === null || count <= last || !node) return;

    if (reduceMotion) return;

    void animate(
      node,
      { scale: [1, 1.32, 1] },
      { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
    );
  }, [count, animate, reduceMotion, scope]);

  const characters = count === null ? [] : [...FORMAT.format(count)];

  return (
    <span
      className={cn(
        "flex items-center gap-2 text-sm font-medium whitespace-nowrap text-muted-foreground",
        className,
      )}
      title="Times the Calamansi mascot has been poked"
    >
      <Citrus className="size-4 shrink-0 text-primary" aria-hidden="true" />

      {count !== null && (
        <span role="status" className="sr-only">
          {`${FORMAT.format(count)} mascot pokes`}
        </span>
      )}

      <motion.span
        ref={scope}
        aria-hidden="true"
        className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80 tabular-nums"
      >
        {count === null ? (
          <span className="text-muted-foreground/40">&mdash;</span>
        ) : (
          <>
            <span className="inline-flex items-center">
              {characters.map((character, index) => (
                // keyed from the right so the ones column stays put as the number grows
                <OdometerDigit
                  key={characters.length - index}
                  value={character}
                  delay={
                    reduceMotion ? 0 : (characters.length - index - 1) * 0.045
                  }
                  reduceMotion={reduceMotion}
                />
              ))}
            </span>

            <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              pokes
            </span>
          </>
        )}
      </motion.span>
    </span>
  );
}
