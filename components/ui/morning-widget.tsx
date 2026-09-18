"use client";

import {
  useCallback,
  useEffect,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { Sun } from "lucide-react";
import { Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

export type MotivationQuote = {
  /** The line shown in the card. */
  text: string;
  /** Phrases from `text` to render in the emphasis colour. Matched literally. */
  emphasis?: string[];
};

export type MorningWidgetVariant = "white" | "calamansi" | "slate" | "citrus";

export type MorningWidgetProps = {
  /** Name the greeting is addressed to. Default: "Friend" */
  name?: string;
  /** Quotes the card rotates through. Default: a five line starter set. */
  quotes?: MotivationQuote[];
  /** Show the live clock above the card. Default: true */
  showClock?: boolean;
  /** Clock format. Default: "12h" */
  timeFormat?: "12h" | "24h";
  /** Seconds a quote stays up before the next one, or 0 to hold it. Default: 9 */
  interval?: number;
  /** Lean the widget towards the pointer. Default: true */
  tilt?: boolean;
  /** Surface palette. Default: "calamansi" */
  variant?: MorningWidgetVariant;
  /** Extra class names merged onto the outer container. */
  className?: string;
};

const DEFAULT_QUOTES: MotivationQuote[] = [
  {
    text: "You have to start delegating tasks, now go carpe diem :)",
    emphasis: ["delegating tasks", "carpe diem"],
  },
  {
    text: "Believe you can and you're halfway there. Keep pushing forward!",
    emphasis: ["halfway there", "pushing forward"],
  },
  {
    text: "Make today so awesome that yesterday gets jealous.",
    emphasis: ["today so awesome", "jealous"],
  },
  {
    text: "Focus on progress, not perfection. You got this!",
    emphasis: ["progress", "perfection"],
  },
  {
    text: "Don't count the days, make the days count.",
    emphasis: ["count the days", "days count"],
  },
];

/**
 * Every size and inset below is written in `cqw` — one percent of the widget's
 * own width — so the card is an exact scale of its 519px design from a phone
 * preview up to full width. The @container on the outer element is what those
 * units resolve against; nothing here needs a media query. The corner is the one
 * exception: it is the kit's squircle, so it holds the same curve as every other
 * component instead of drifting with the width.
 *
 * The palette picks the four blobs the mesh is built from plus the base they sit
 * on, and the ink that reads on top of them: a neutral dawn for `white`, the
 * Calamansi greens by default, and citrus keeps the warm sunrise.
 */
const VARIANTS: Record<MorningWidgetVariant, { mesh: string; ink: string }> = {
  white: {
    mesh: [
      "[--mesh-base:#f5f5f6] [--mesh-a:#dadbdf] [--mesh-b:#c7c8cd] [--mesh-c:#e8e8eb] [--mesh-d:#d2d3d8]",
      "dark:[--mesh-base:#0c0c0d] dark:[--mesh-a:#2c2c31] dark:[--mesh-b:#1e1e22] dark:[--mesh-c:#39393f] dark:[--mesh-d:#26262a]",
    ].join(" "),
    ink: "text-foreground",
  },
  calamansi: {
    mesh: [
      "[--mesh-base:#eff6e0] [--mesh-a:#7d9c52] [--mesh-b:#b4e84c] [--mesh-c:#5c7a67] [--mesh-d:#a8d06a]",
      "dark:[--mesh-base:#0f1409] dark:[--mesh-a:#4f7d3a] dark:[--mesh-b:#86b81f] dark:[--mesh-c:#2b4a24] dark:[--mesh-d:#6f9a4a]",
    ].join(" "),
    ink: "text-white",
  },
  slate: {
    mesh: [
      "[--mesh-base:#eeecf6] [--mesh-a:#8b84b4] [--mesh-b:#7d8bc9] [--mesh-c:#5a6a9c] [--mesh-d:#a99fd6]",
      "dark:[--mesh-base:#0d0c16] dark:[--mesh-a:#4a4b8f] dark:[--mesh-b:#33406b] dark:[--mesh-c:#6f68b8] dark:[--mesh-d:#2a3560]",
    ].join(" "),
    ink: "text-white",
  },
  citrus: {
    mesh: [
      "[--mesh-base:#ffe7cc] [--mesh-a:#fcaf58] [--mesh-b:#ff8d8d] [--mesh-c:#ffc93d] [--mesh-d:#ffb6a0]",
      "dark:[--mesh-base:#17100a] dark:[--mesh-a:#b8714a] dark:[--mesh-b:#8a4530] dark:[--mesh-c:#a8623a] dark:[--mesh-d:#6d3a25]",
    ].join(" "),
    ink: "text-white",
  },
};

const MESH_BACKGROUND = [
  "radial-gradient(circle at 10% 20%, var(--mesh-a) 0%, transparent 55%)",
  "radial-gradient(circle at 85% 50%, var(--mesh-b) 0%, transparent 60%)",
  "radial-gradient(circle at 50% 90%, var(--mesh-c) 0%, transparent 65%)",
  "radial-gradient(circle at 90% 90%, var(--mesh-d) 0%, transparent 50%)",
  "var(--mesh-base)",
].join(", ");

/** Fixed slots keep ticking digits from nudging the clock, like tabular figures. */
const slotWidth = (glyph: string) =>
  glyph === ":" || glyph === "." ? "0.34em" : "0.62em";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Splits a quote into plain and emphasised runs, so the phrase stays normal inline flow. */
function quoteParts(quote?: MotivationQuote) {
  if (!quote) return [{ value: "", emphasis: false }];

  const { text, emphasis = [] } = quote;
  if (emphasis.length === 0) return [{ value: text, emphasis: false }];

  const pattern = new RegExp(`(${emphasis.map(escapeRegExp).join("|")})`, "g");

  return text
    .split(pattern)
    .filter((value) => value.length > 0)
    .map((value) => ({ value, emphasis: emphasis.includes(value) }));
}

/**
 * One character of the clock. The slot keeps a fixed width and the glyph stays
 * in normal flow, so inline baseline alignment with the AM/PM badge is untouched
 * while the outgoing glyph rolls away.
 */
function RollingGlyph({
  glyph,
  width,
  className,
  reduceMotion,
}: {
  glyph: string;
  width?: string;
  className?: string;
  reduceMotion: boolean;
}) {
  return (
    <span
      className={cn("relative inline-block h-[1em] text-center", className)}
      style={width ? { width } : undefined}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={glyph}
          className="block"
          initial={reduceMotion ? false : { y: "0.85em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "-0.85em", opacity: 0 }}
          transition={{ type: "spring", stiffness: 330, damping: 30 }}
        >
          {glyph}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * A Calamansi squircle card holding a drifting sunrise mesh: it greets you by
 * name, keeps the time, leans towards the pointer and cycles motivational quotes
 * with a staged reveal. The palette recolours the mesh and the ink on it.
 */
export function MorningWidget({
  name = "Friend",
  quotes = DEFAULT_QUOTES,
  showClock = true,
  timeFormat = "12h",
  interval = 9,
  tilt = true,
  variant = "calamansi",
  className,
}: MorningWidgetProps) {
  const reduceMotion = Boolean(useReducedMotion());

  const [index, setIndex] = useState(0);
  const [clock, setClock] = useState({ time: "9:41", ampm: "AM" });
  const [partOfDay, setPartOfDay] = useState<
    "Morning" | "Afternoon" | "Evening"
  >("Morning");
  // reading the card (pointer or focus) holds the rotation in place
  const [held, setHeld] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [8, -8]), {
    stiffness: 180,
    damping: 20,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-8, 8]), {
    stiffness: 180,
    damping: 20,
    mass: 0.6,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hours24 = now.getHours();

      setPartOfDay(
        hours24 < 12 ? "Morning" : hours24 < 18 ? "Afternoon" : "Evening",
      );
      setClock({
        time: `${timeFormat === "12h" ? hours24 % 12 || 12 : hours24}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`,
        ampm: hours24 >= 12 ? "PM" : "AM",
      });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [timeFormat]);

  const advance = useCallback(() => {
    setIndex((current) => (current + 1) % Math.max(quotes.length, 1));
  }, [quotes.length]);

  // a timeout rather than an interval, so a manual click restarts the countdown
  useEffect(() => {
    if (!interval || held || quotes.length < 2) return;

    const timer = setTimeout(advance, interval * 1000);
    return () => clearTimeout(timer);
  }, [advance, held, index, interval, quotes.length]);

  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    // touch has no hover to lean towards, and tracking a drag fights the scroll
    if (!tilt || reduceMotion || event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  };

  const reset = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <div
      className={cn("@container relative w-full max-w-[519px]", className)}
      style={{ perspective: 1500 }}
    >
      <motion.div
        onPointerMove={track}
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => {
          reset();
          setHeld(false);
        }}
        style={reduceMotion ? undefined : { rotateX, rotateY }}
        className="relative aspect-[519/477] w-full [transform-style:preserve-3d]"
      >
        <div
          data-slot="morning-widget"
          className={cn(
            "relative size-full select-none",
            VARIANTS[variant].mesh,
            VARIANTS[variant].ink,
          )}
        >
          {/*
            The mesh lives inside the squircle layer rather than on the card, so
            the drift, the bloom and the sheen are all clipped to the shape — and
            the corner is the kit's curve, not a cqw radius.
          */}
          <Squircle className="bg-[var(--mesh-base)]">
            {/* Sunrise mesh. It drifts on its own so the surface keeps breathing. */}
            <motion.div
              aria-hidden="true"
              className="absolute -inset-1/4"
              style={{ background: MESH_BACKGROUND }}
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.08, 1], rotate: [0, 2, 0] }
              }
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Warm bloom in the top corner, swelling like a sunrise. */}
            <motion.div
              aria-hidden="true"
              className="absolute -top-1/4 -left-1/4 size-3/4 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 65%)",
              }}
              animate={
                reduceMotion ? undefined : { opacity: [0.45, 0.85, 0.45] }
              }
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* A soft light crossing the surface every few seconds. */}
            <motion.div
              aria-hidden="true"
              className="absolute -inset-1/4"
              style={{
                background:
                  "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.4) 50%, transparent 62%)",
              }}
              animate={reduceMotion ? undefined : { x: ["-40%", "40%"] }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
          </Squircle>

          {showClock && (
            /* the row carries the shadow, leaving the heading free to clip its rolling digits */
            <div className="pointer-events-none absolute top-[8.4%] left-[10%] z-30 font-runde drop-shadow-sm">
              <h1 className="text-[17.5cqw] leading-none font-bold tracking-[-0.03em] tabular-nums [clip-path:inset(0_-0.3em)]">
                <span className="sr-only">
                  {clock.time}
                  {timeFormat === "12h" ? ` ${clock.ampm}` : ""}
                </span>

                <span aria-hidden="true">
                  {[...clock.time].map((glyph, glyphIndex) => (
                    <RollingGlyph
                      key={glyphIndex}
                      glyph={glyph}
                      width={slotWidth(glyph)}
                      reduceMotion={reduceMotion}
                    />
                  ))}

                  {timeFormat === "12h" && (
                    <RollingGlyph
                      glyph={clock.ampm}
                      className="ml-[1.5cqw] text-[7.9cqw] tracking-[-0.02em]"
                      reduceMotion={reduceMotion}
                    />
                  )}
                </span>
              </h1>
            </div>
          )}

          <motion.button
            type="button"
            onClick={advance}
            onFocus={() => setHeld(true)}
            onBlur={() => setHeld(false)}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            title="Show the next motivation"
            whileHover={reduceMotion ? undefined : { y: -4 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="absolute bottom-[2.5%] left-[2.3%] z-20 flex aspect-[477/216] w-[91.9%] cursor-pointer flex-col justify-center rounded-[28px] bg-white px-[6.4cqw] text-left shadow-[0_0.6cqw_1.6cqw_rgba(0,0,0,0.05)] outline-none select-none focus-visible:ring-[0.5cqw] focus-visible:ring-foreground/25 dark:bg-[#1c1c1f] dark:shadow-[0_0.6cqw_1.6cqw_rgba(0,0,0,0.3)]"
          >
            <span className="mb-[2.3cqw] flex items-center gap-[1.9cqw]">
              <motion.span
                className="size-[5.6cqw] shrink-0 text-[#ffc20c] dark:text-[#ffc93d]"
                animate={
                  reduceMotion
                    ? undefined
                    : held
                      ? { rotate: 34, scale: 1.12 }
                      : { rotate: [0, 12, 0], scale: 1 }
                }
                transition={
                  held
                    ? { type: "spring", stiffness: 320, damping: 18 }
                    : { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <Sun className="size-full" strokeWidth={2.5} />
              </motion.span>

              <span className="min-w-0 truncate bg-gradient-to-r from-amber-500/75 to-muted-foreground/55 bg-clip-text text-[4.8cqw] font-extrabold tracking-[-0.01em] text-transparent uppercase dark:from-amber-300/85 dark:to-muted-foreground/70">
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    key={partOfDay}
                    className="inline-block"
                    initial={reduceMotion ? false : { y: "0.5em", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { y: "-0.5em", opacity: 0 }
                    }
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {partOfDay}
                  </motion.span>
                </AnimatePresence>{" "}
                {name}
              </span>

              {/* position dots, so the deck reads as a deck */}
              <span
                aria-hidden="true"
                className="ml-auto flex shrink-0 items-center gap-[0.8cqw] text-muted-foreground"
              >
                {quotes.map((_, dotIndex) => (
                  <motion.span
                    key={dotIndex}
                    className="block h-[0.9cqw] rounded-full bg-current"
                    animate={{
                      width: dotIndex === index ? "2.6cqw" : "0.9cqw",
                      opacity: dotIndex === index ? 1 : 0.35,
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ))}
              </span>
            </span>

            <span aria-live="polite" className="relative block min-h-[13.5cqw]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={index}
                  className="block text-[5.6cqw] leading-[1.18] font-semibold tracking-[-0.04em] text-muted-foreground/70"
                  initial={reduceMotion ? false : { y: "0.35em", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { y: "-0.3em", opacity: 0 }
                  }
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {quoteParts(quotes[index]).map((part, partIndex) => (
                    <motion.span
                      key={`${partIndex}-${part.value}`}
                      className={cn(
                        part.emphasis && "font-bold text-foreground",
                      )}
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: reduceMotion ? 0 : partIndex * 0.05,
                      }}
                    >
                      {part.value}
                    </motion.span>
                  ))}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
