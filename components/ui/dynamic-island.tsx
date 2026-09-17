"use client";

import {
  forwardRef,
  isValidElement,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export type DynamicIslandState = "idle" | "compact" | "expanded" | "alert";

export type DynamicIslandVariant = "calamansi" | "slate" | "citrus";

/**
 * The Calamansi surface: a gradient slab inside a thick white lip, matching
 * the number ticker and widgets.
 */
const SHELL = [
  "relative flex cursor-pointer items-center justify-between overflow-hidden border-[3px] border-white/80 p-1 font-runde text-white select-none",
  "dark:border-white/10",
  "sm:border-4 sm:p-1.5",
].join(" ");

const SHELL_SHADOW: CSSProperties = {
  boxShadow:
    "0 18px 36px -16px rgba(0, 0, 0, 0.45), inset 0 -3px 14px 5px rgba(255, 255, 255, 0.25), inset 0 -6px 3px rgba(0, 0, 0, 0.2)",
};

const VARIANTS: Record<DynamicIslandVariant, string> = {
  calamansi: "bg-gradient-to-br from-[#8fa37d] via-[#5c7a67] to-[#39564a]",
  slate: "bg-gradient-to-br from-[#a79cb7] via-[#687396] to-[#4a5a7f]",
  citrus: "bg-gradient-to-br from-[#d69f7e] via-[#b87152] to-[#7d4128]",
};

/** The lit window the content sits in, matching NumberTicker's glass tile. */
const WINDOW = [
  "relative z-10 flex size-full overflow-hidden bg-white/15 ring-1 ring-white/25 backdrop-blur-sm",
].join(" ");

/** Fractal-noise grain — the texture the Calamansi surface carries. */
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

export type DynamicIslandProps = {
  /** Current state of the island. */
  state?: DynamicIslandState;
  /** Default state when uncontrolled. Default: "compact" */
  defaultState?: DynamicIslandState;
  /** Callback fired when state changes. */
  onStateChange?: (state: DynamicIslandState) => void;
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
  /** Palette of the Calamansi gradient slab. Default: "calamansi" */
  variant?: DynamicIslandVariant;
};

/**
 * A Calamansi surface island designed exactly after the NumberTicker slab,
 * featuring fluid spring layout morphing, fine fractal grain noise, and a frosted glass window.
 */
export const DynamicIsland = forwardRef<HTMLDivElement, DynamicIslandProps>(
  function DynamicIsland(
    {
      state,
      defaultState = "compact",
      onStateChange,
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
    const filterId = `island-grain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

    const isExpanded = currentState === "expanded";
    const isAlert = currentState === "alert";

    const leadingIcon = (() => {
      if (!leading) return null;
      if (typeof leading !== "object" || !("type" in leading)) return null;
      const children =
        "children" in leading
          ? Array.isArray(leading.children)
            ? leading.children
            : [leading.children]
          : [];
      const hasSoundIcon = children.some(
        (child) => isValidElement(child) && child.type === Mic,
      );
      return hasSoundIcon ? <Mic className="size-3.5" /> : null;
    })();

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

    const alertShadow: CSSProperties | undefined = isAlert
      ? {
          boxShadow:
            "0 0 24px -2px rgba(255, 65, 54, 0.7), 0 18px 36px -16px rgba(0, 0, 0, 0.45), inset 0 -3px 14px 5px rgba(255, 255, 255, 0.25), inset 0 -6px 3px rgba(0, 0, 0, 0.2)",
        }
      : undefined;

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
          layout
          onClick={toggleExpand}
          transition={{
            type: "spring",
            stiffness: 440,
            damping: 32,
            mass: 0.8,
          }}
          className={cn(
            SHELL,
            VARIANTS[variant],
            sizeClass,
            isExpanded ? "rounded-[28px] sm:rounded-[32px]" : "rounded-full",
            !interactive && "cursor-default",
          )}
          style={{
            ...(alertShadow ?? SHELL_SHADOW),
          }}
        >
          <Grain id={filterId} />

          <div
            className={cn(
              WINDOW,
              isExpanded
                ? "flex-col justify-between rounded-[20px] p-4 sm:rounded-[24px] sm:p-5"
                : "items-center justify-between rounded-full px-3.5 py-1.5",
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
                  className="relative flex size-full flex-col justify-between gap-3 text-white"
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
                  className="relative flex size-full items-center justify-between gap-3 text-white"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    {leading && <span className="shrink-0">{leading}</span>}
                    {title && (
                      <div className="truncate text-xs font-semibold tracking-tight text-white drop-shadow-sm">
                        {title}
                      </div>
                    )}
                    {leadingIcon && (
                      <motion.span
                        className="shrink-0 text-white/90"
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{
                          duration: 1.1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {leadingIcon}
                      </motion.span>
                    )}
                  </div>
                  {trailing && (
                    <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-white/90">
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
