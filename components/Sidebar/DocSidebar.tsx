"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState, type CSSProperties } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  components,
  type ComponentCategory,
} from "@/lib/components";
import { playSfx, progressionDetune } from "@/lib/sfx-client";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE DOCS SIDEBAR
 *
 * One marker for the whole list. The active dot is a single element shared between
 * rows through a motion `layoutId`, so it travels rather than blinking from one
 * place to another, and because it mounts fresh on the row it lands on, a CSS
 * keyframe can crossfade the colour it is arriving from into the one it lands on.
 *
 * The path is not a straight line: the layout projection carries the dot between
 * rows while a synced x keyframe bows it out to the left, and the bow scales with
 * distance — adjacent hops barely bend, a long jump swings wide. When the arc closes
 * on the row the name is shoved aside, so the name reads as pushed by the dot rather
 * than moving on its own.
 *
 * Each row ticks as it is picked and hums quietly on hover, the pitch climbing the
 * further down the list you are so a run through the sidebar reads as one gesture.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Drift the top-level destinations, ahead of the component sections. */
const PAGES = [
  { href: "/components/introduction", label: "Introduction" },
  { href: "/components/installation", label: "Installation" },
];

/** Flight time (ms) of the dot's arc and colour crossfade. */
const DOT_FLIGHT_MS = 350;
/** Moment in the flight (0-1) when the arc closes on the row and "hits" the name. */
const DOT_IMPACT = 0.8;
const DOT_IMPACT_MS = DOT_FLIGHT_MS * DOT_IMPACT;
/** Near-critically damped: a bouncier spring sails past on long jumps. */
const DOT_SPRING = { type: "spring", stiffness: 800, damping: 52 } as const;

/**
 * How far (px) the dot bows out to the left while travelling, scaled with the
 * number of rows crossed. The ceiling keeps the widest arc inside the rail's gutter.
 */
const DOT_ARC_MIN = 8;
const DOT_ARC_MAX = 24;
const DOT_ARC_PER_ROW = 2;
/** Where the dot sits at impact: just left of the name, which is still at x=0. */
const DOT_TOUCH_OFFSET = -5;

function arcOffset(rows: number) {
  if (rows === 0) return 0;
  return -Math.min(DOT_ARC_MAX, DOT_ARC_MIN + (rows - 1) * DOT_ARC_PER_ROW);
}

/** The active name sits shoved to the right of the dot. */
const NAME_RECOIL = { type: "spring", stiffness: 1000, damping: 60 } as const;
const NAME_RETURN = { type: "spring", stiffness: 900, damping: 45 } as const;

function nameTransition(active: boolean, travelling: boolean) {
  if (!active) return NAME_RETURN;
  // wait for the dot to arrive, so the name reads as pushed rather than self-moving
  return { ...NAME_RECOIL, delay: travelling ? DOT_IMPACT_MS / 1000 : 0 };
}

type SectionId = ComponentCategory;
type DotColor = SectionId | "foreground";

/** Each section's ink, which the dot and the name sweep borrow. */
const SECTION_COLOR: Record<SectionId, string> = {
  display: "#b4e84c",
  effects: "#ff9e3d",
  navigation: "#7aa2ff",
  inputs: "#4e9a3e",
  feedback: "#ff7e9d",
  ai: "#a78bfa",
};

const colorOf = (color: DotColor) =>
  color === "foreground" ? "var(--foreground)" : SECTION_COLOR[color];

/** The sections, in the order the rest of the docs uses. */
const SECTIONS = CATEGORY_ORDER.map((id) => ({
  id,
  label: CATEGORY_LABELS[id],
  concepts: components
    .filter((item) => item.category === id)
    .map((item) => ({ title: item.name, href: item.href })),
})).filter((section) => section.concepts.length > 0);

/** Every row in nav order, so the dot knows how far it travels and what it leaves. */
const ROWS: { href: string; color: DotColor }[] = [
  ...PAGES.map((page) => ({ href: page.href, color: "foreground" as const })),
  ...SECTIONS.flatMap((section) =>
    section.concepts.map((concept) => ({
      href: concept.href,
      color: section.id,
    })),
  ),
];

/**
 * Flat nav position per row, worked out once — the hover pitch rises the further
 * down the list a row sits, which is the only thing this is for.
 */
const STEP_OF = new Map(ROWS.map((row, index) => [row.href, index]));

type Travel = { from: number; to: number };

function ActiveDot({
  layoutId,
  from,
  to,
  offset,
}: {
  layoutId: string;
  /** Colour of the row the dot is leaving (crossfaded from mid-flight). */
  from: DotColor;
  /** Colour of the row it lands on. */
  to: DotColor;
  /** Arc bow in px; 0 means no travel (initial mount), so no arc or crossfade. */
  offset: number;
}) {
  const travelling = offset !== 0;

  return (
    <motion.span
      layoutId={layoutId}
      // The shared-layout projection moves the dot in a straight line between rows;
      // a synced x keyframe on top of it bends that path into an arc.
      animate={{ x: travelling ? [0, offset, DOT_TOUCH_OFFSET, 0] : 0 }}
      transition={{
        layout: DOT_SPRING,
        // peak early, close on the name's edge by impact, then ride the last few px
        x: {
          duration: DOT_FLIGHT_MS / 1000,
          times: [0, 0.3, DOT_IMPACT, 1],
          ease: ["easeOut", "easeInOut", "easeOut"],
        },
      }}
      className="absolute top-[calc(50%-2px)] left-0 size-1"
    >
      {/* Colour lives on an inner span, clear of the element owning the projection. */}
      <span
        className={cn(
          "block size-full rounded-full",
          travelling && "dot-crossfade",
        )}
        style={
          {
            "--dot-from": colorOf(from),
            "--dot-to": colorOf(to),
            backgroundColor: colorOf(to),
          } as CSSProperties
        }
      />
    </motion.span>
  );
}

const LINK_CLASS =
  "inline-block rounded-[3px] py-1 outline-none transition-colors duration-200 focus-visible:ring-[1.5px] focus-visible:ring-inset focus-visible:ring-ring/60";

const EYEBROW =
  "text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase";

export default function DocSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  // The nav renders twice (rail + mobile sheet): keep each dot's shared layout
  // scoped to its own instance.
  const dotId = useId();

  const activeIndex = ROWS.findIndex((row) => row.href === pathname);

  // Remember where the dot came from, updated during render (the derived-state
  // pattern) so it mounts already knowing its journey. First paint: from === to.
  const [travel, setTravel] = useState<Travel>({
    from: activeIndex,
    to: activeIndex,
  });
  if (travel.to !== activeIndex) {
    setTravel({ from: travel.to, to: activeIndex });
  }

  // A previous index of -1 means the dot was not on screen (a 404, say): it should
  // appear in place rather than fly in from nowhere.
  const travelled =
    travel.from >= 0 && activeIndex >= 0
      ? Math.abs(activeIndex - travel.from)
      : 0;
  const offset = arcOffset(travelled);
  const travelling = offset !== 0;
  const fromColor =
    travel.from >= 0 ? ROWS[travel.from].color : ROWS[activeIndex]?.color;

  const renderDot = (to: DotColor) => (
    <ActiveDot
      layoutId={dotId}
      from={fromColor ?? to}
      to={to}
      offset={offset}
    />
  );

  const select = () => {
    playSfx("tick");
    onNavigate?.();
  };

  return (
    <nav
      aria-label="Documentation"
      // py-12 matches the fade-mask's 3rem stops, so at rest the list sits inside
      // the opaque zone and only its overflow fades.
      className={cn(
        "fade-mask-y no-scrollbar min-h-0 flex-1 overflow-y-auto py-12 text-[13px]",
        className,
      )}
      style={{ "--dot-flight": `${DOT_FLIGHT_MS}ms` } as CSSProperties}
    >
      <p className={cn(EYEBROW, "mb-2")}>Getting started</p>

      <ul className="flex flex-col gap-1">
        {PAGES.map((page) => {
          const active = pathname === page.href;

          return (
            <li key={page.href} className="relative">
              {active && renderDot("foreground")}
              <Link
                href={page.href}
                onClick={select}
                onMouseEnter={() =>
                  playSfx("tick", { detune: 0, volume: 0.08 })
                }
                aria-current={active ? "page" : undefined}
                className={cn(
                  LINK_CLASS,
                  "block sm:inline-block",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <motion.span
                  className="inline-block"
                  initial={false}
                  animate={{ x: active ? 10 : 0 }}
                  transition={nameTransition(active, travelling)}
                >
                  {page.label}
                </motion.span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ul className="mt-5 flex flex-col">
        {SECTIONS.map((section) => {
          return (
            <li key={section.id} className="mt-5">
              <div className={cn(EYEBROW, "py-1")}>{section.label}</div>

              <ul className="mt-1 flex flex-col gap-1">
                {section.concepts.map((concept) => {
                  const active = pathname === concept.href;
                  const detune = progressionDetune(
                    STEP_OF.get(concept.href) ?? 0,
                  );

                  return (
                    <li key={concept.href} className="relative">
                      {active && renderDot(section.id)}
                      <Link
                        href={concept.href}
                        onClick={select}
                        onMouseEnter={() =>
                          playSfx("tick", { detune, volume: 0.08 })
                        }
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          LINK_CLASS,
                          "block sm:inline-block",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <motion.span
                          className={cn(
                            "inline-block",
                            // the class arrives only when the row becomes active,
                            // which is what starts the sweep
                            active && travelling && "name-hit",
                          )}
                          initial={false}
                          animate={{ x: active ? 12 : 0 }}
                          transition={nameTransition(active, travelling)}
                          style={
                            {
                              "--dot-from": colorOf(fromColor ?? section.id),
                              "--dot-to": colorOf(section.id),
                            } as CSSProperties
                          }
                        >
                          {concept.title}
                        </motion.span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
