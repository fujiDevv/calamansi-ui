"use client";

import { forwardRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { squircleLift, SQUIRCLE_LIFT, Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

export type DynamicIslandState = "idle" | "compact" | "expanded" | "alert";

export type DynamicIslandVariant = "white" | "calamansi" | "slate" | "citrus";

/**
 * The Calamansi surface: one flat layer, clipped to a squircle by `Squircle`.
 * The island changes size between states, so the shape re-measures with it:
 * compact clamps to a pill, expanded to the full corner radius.
 *
 * The palette carries its own ink, and everything inside tints from
 * `currentColor`, so a white island is as legible as a coloured one.
 */
const SURFACE = [
  "relative flex cursor-pointer items-center justify-between p-1 font-runde select-none",
  "sm:p-1.5",
].join(" ");

/** The alert state glows instead of just lifting. */
const ALERT_GLOW = "drop-shadow(0 0 22px rgba(255, 65, 54, 0.75))";

/**
 * The morph animates the real box with a CSS transition, not a layout animation.
 * A layout animation is a transform, and the squircle is clipped from the box that
 * was measured — so the shape would hold its final path for the whole morph and get
 * squashed on the way there, pinching the corners. Moving the real box lets the
 * clip path be re-measured every frame, so the pill stays a pill while it grows
 * into the slab. The content eases its own radius to match, or its clip would turn
 * into an oval partway through the collapse.
 */
const MORPH_EASE = "ease-[cubic-bezier(0.22,1,0.36,1)] duration-500";
const BOX_MORPH = `transition-[width,height,max-width] ${MORPH_EASE} motion-reduce:transition-none`;
const CONTENT_MORPH = `transition-[border-radius] ${MORPH_EASE} motion-reduce:transition-none`;

const VARIANTS: Record<DynamicIslandVariant, { paint: string; ink: string }> = {
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

/** The content layer above the surface. */
const CONTENT = ["relative z-10 flex size-full", CONTENT_MORPH].join(" ");

/** The icon chip, tinted from the surface ink so it reads on any palette. */
const ICON_BADGE = [
  "flex size-7 shrink-0 items-center justify-center rounded-xl bg-current/15 shadow-xs ring-1 ring-current/20",
].join(" ");

export type DynamicIslandProps = {
  /** Current state of the island. */
  state?: DynamicIslandState;
  /** Default state when uncontrolled. Default: "compact" */
  defaultState?: DynamicIslandState;
  /** Callback fired when state changes. */
  onStateChange?: (state: DynamicIslandState) => void;
  /** Primary icon, drawn in a chip tinted from the surface ink. */
  icon?: ReactNode;
  /** Leading slot in compact/alert state (e.g. icon, avatar, waveform). */
  leading?: ReactNode;
  /** Trailing slot in compact/alert state (e.g. timer, badge, status dot). */
  trailing?: ReactNode;
  /** Primary title or label shown in compact/alert state. */
  title?: ReactNode;
  /** Expanded content shown when state is "expanded". */
  expandedContent?: ReactNode;
  /** Allow clicking the island to toggle between compact and expanded. Default: true */
  interactive?: boolean;
  /** Optional custom CSS classes merged onto outer container. */
  className?: string;
  /** Optional ambient pulse indicator in compact/idle states. */
  pulse?: boolean;
  /** Surface palette. Default: "calamansi" */
  variant?: DynamicIslandVariant;
};

/**
 * A Calamansi surface island: a squircle pill that eases into a slab, and glows
 * instead of only lifting when it alerts.
 */
export const DynamicIsland = forwardRef<HTMLDivElement, DynamicIslandProps>(
  function DynamicIsland(
    {
      state,
      defaultState = "compact",
      onStateChange,
      icon,
      leading,
      trailing,
      title,
      expandedContent,
      interactive = true,
      className,
      pulse = false,
      variant = "calamansi",
    },
    ref,
  ) {
    const [internalState, setInternalState] =
      useState<DynamicIslandState>(defaultState);
    const currentState = state ?? internalState;
    const reduceMotion = useReducedMotion();

    const isExpanded = currentState === "expanded";
    const isAlert = currentState === "alert";
    const showPulse =
      pulse && (currentState === "compact" || currentState === "idle");

    const iconElement = icon ? (
      <span className={ICON_BADGE}>{icon}</span>
    ) : leading ? (
      <span className="shrink-0">{leading}</span>
    ) : null;

    const toggleExpand = () => {
      if (!interactive) return;
      const nextState: DynamicIslandState = isExpanded ? "compact" : "expanded";
      if (state === undefined) {
        setInternalState(nextState);
      }
      onStateChange?.(nextState);
    };

    const sizeClass = (() => {
      switch (currentState) {
        case "idle":
          return "h-10 w-32";
        case "compact":
          return "h-12 w-full max-w-68";
        case "alert":
          return "h-12 w-full max-w-80";
        case "expanded":
          return "h-52 w-full max-w-88 sm:max-w-96";
        default:
          return "h-12 w-full max-w-68";
      }
    })();

    return (
      <div
        className={cn(
          "flex w-full items-center justify-center p-2 select-none",
          isAlert && "animate-pulse",
          className,
        )}
      >
        <motion.div
          ref={ref}
          onClick={toggleExpand}
          className={cn(
            SURFACE,
            BOX_MORPH,
            VARIANTS[variant].ink,
            sizeClass,
            !interactive && "cursor-default",
          )}
        >
          <Squircle
            className={VARIANTS[variant].paint}
            filter={
              isAlert ? squircleLift(SQUIRCLE_LIFT, ALERT_GLOW) : undefined
            }
          />

          <div
            className={cn(
              CONTENT,
              // the surface is a separate clipped layer, so the content clips
              // itself to match: a pill while collapsed, the slab radius when
              // expanded. The pill radius is a finite 20px so it can ease into the
              // slab — `rounded-full` is an infinite radius and would jump, and on a
              // 36px row it clamps to the same half-height pill anyway. No vertical
              // padding either — the surface's padding already insets the row, and
              // more would push it past the pill.
              isExpanded
                ? "flex-col justify-between overflow-hidden rounded-[24px] p-4 sm:p-5"
                : "items-center justify-between overflow-hidden rounded-[20px] px-3.5",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isExpanded ? (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0, scale: 0.96, y: 2 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 2 }}
                  transition={{ duration: 0.18 }}
                  className="relative flex size-full flex-col justify-between gap-3"
                >
                  {expandedContent}
                </motion.div>
              ) : (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="relative flex size-full items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {iconElement}
                    {title && (
                      <div className="truncate text-xs font-semibold tracking-tight">
                        {title}
                      </div>
                    )}
                    {showPulse && (
                      <span
                        aria-hidden="true"
                        className="relative flex size-1.5 shrink-0"
                      >
                        {!reduceMotion && (
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                        )}
                        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
                      </span>
                    )}
                  </div>
                  {trailing && (
                    <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-current/75">
                      {trailing}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alert badge tap hint */}
          {isAlert && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 -right-1.5 flex size-4.5 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-rose-500 text-[10px] font-bold text-white shadow-xs"
            >
              !
            </div>
          )}
        </motion.div>
      </div>
    );
  },
);

DynamicIsland.displayName = "DynamicIsland";
