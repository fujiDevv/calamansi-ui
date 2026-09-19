"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import {
  useEffect,
  useId,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE SIDEBAR
 *
 * The panel this site runs its own docs on, cut down to one file. It is a nav of
 * sections with a single marker, and the same panel is both the rail beside the
 * content and the drawer over it on a phone — `variant` picks which, so nothing
 * about the list has to be written twice.
 *
 * The marker is one element shared between rows through a motion `layoutId`, so
 * picking a row reads as it travelling rather than a second row lighting up, and
 * its colour crossfades from the section it is leaving into the section it lands
 * on. The path is not a straight line: the layout projection carries it between
 * rows while a synced x keyframe bows it out to the left, and the bow scales with
 * distance — adjacent hops barely bend, a long jump swings wide. When the arc
 * closes the label is shoved aside, so the label reads as pushed by the marker
 * rather than moving on its own.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type SidebarItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
};

export type SidebarSection = {
  /** Eyebrow above the section's rows. */
  label?: string;
  /**
   * The section's ink. The marker takes it while a row here is active and
   * crossfades into the next section's, so a jump across the nav changes colour
   * on the way. Defaults to `markerColor`.
   */
  color?: string;
  items: SidebarItem[];
};

/** How the active row is marked. */
export type SidebarMarkerStyle = "dot" | "pip" | "bar" | "glow";

export type SidebarProps = Omit<ComponentProps<"nav">, "onChange"> & {
  /** The nav itself: sections of rows, in the order they are drawn. */
  sections: SidebarSection[];
  /**
   * The row to mark, matched against an item's href — the route-driven case, and
   * the one this site uses.
   */
  activeHref?: string;
  /** Active row as a flat index, for controlled use. */
  value?: number;
  /** Active row as a flat index on mount when uncontrolled. Default: 0 */
  defaultValue?: number;
  /** Fired with the flat index and the row that was picked. */
  onChange?: (index: number, item: SidebarItem) => void;
  /** Fired on every selection, whatever drives the active row. */
  onNavigate?: (item: SidebarItem) => void;
  /** Sits above the list and does not scroll — a wordmark, a switcher. */
  header?: ReactNode;
  /** Pinned below the list and does not scroll — an account row, a version. */
  footer?: ReactNode;
  /** The static panel, or the sliding overlay. Default: "rail" */
  variant?: "rail" | "drawer";
  /** Whether the drawer is showing. Drawers only. */
  open?: boolean;
  /** Fired when the drawer asks to close — Escape, the scrim, the close button. */
  onOpenChange?: (open: boolean) => void;
  /** Announced as the nav's label, and the drawer's dialog name. Default: "Sidebar" */
  navLabel?: string;
  /** Marker shape. Default: "dot" */
  marker?: SidebarMarkerStyle;
  /** Marker colour, and the fallback for any section without one. Default: var(--primary, #b4e84c) */
  markerColor?: string;
  /**
   * Fade the list at both edges once it scrolls, with the 3rem of padding the
   * stops are matched to. Off, the rows hug the scroller's edges instead. The
   * padding comes and goes with the fade, so it is never dead space.
   * Default: true
   */
  fade?: boolean;
  /** The panel's own box — width, position, borders, and whether it sticks. */
  className?: string;
};

/** Flight time (ms) of the marker's arc, and the moment in it (0–1) it lands. */
const FLIGHT_MS = 350;
const IMPACT = 0.8;
const IMPACT_MS = FLIGHT_MS * IMPACT;
/** Near-critically damped: a bouncier spring sails past the target on long jumps. */
const SPRING = { type: "spring", stiffness: 800, damping: 52 } as const;

/**
 * How far (px) the marker bows out to the left while travelling, scaled with the
 * rows crossed. The ceiling keeps the widest arc inside the panel's gutter.
 */
const ARC_MIN = 8;
const ARC_MAX = 24;
const ARC_PER_ROW = 2;
/** Where the marker sits at the landing, with the label still at x=0. */
const TOUCH = -5;

function arcOffset(rows: number) {
  if (rows === 0) return 0;
  return -Math.min(ARC_MAX, ARC_MIN + (rows - 1) * ARC_PER_ROW);
}

/** The active label sits shoved to the right of the marker. */
const RECOIL = { type: "spring", stiffness: 1000, damping: 60 } as const;
const RETURN = { type: "spring", stiffness: 900, damping: 45 } as const;

function labelTransition(active: boolean, travelling: boolean) {
  if (!active) return RETURN;
  // wait for the marker to arrive, so the label reads as pushed rather than self-moving
  return { ...RECOIL, delay: travelling ? IMPACT_MS / 1000 : 0 };
}

const EYEBROW =
  "text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase";

const ROW =
  "relative block w-full cursor-pointer rounded-md py-1 text-left text-sm outline-none transition-colors duration-200 focus-visible:ring-[1.5px] focus-visible:ring-ring/60 focus-visible:ring-inset";

/** The scroller: no bar, and the list fades at both ends when it overflows. */
const SCROLLER =
  "min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
/** Room to breathe under the fade, added with it so it is never dead space. */
const FADE_PADDING = "py-12";

const FADE_MASK =
  "linear-gradient(to bottom, transparent 0, #000 3rem, #000 calc(100% - 3rem), transparent 100%)";

type Row = { item: SidebarItem; color?: string };

function Marker({
  layoutId,
  color,
  from,
  offset,
  marker,
  reduced,
}: {
  layoutId: string;
  /** The colour the section the marker is landing on is painted in. */
  color: string;
  /** The ink of the section it is leaving, to crossfade out of. */
  from: string;
  /** Arc bow in px; 0 means no travel, so no arc and no crossfade. */
  offset: number;
  marker: SidebarMarkerStyle;
  reduced: boolean;
}) {
  const travelling = offset !== 0;

  return (
    <motion.span
      layoutId={layoutId}
      // The shared-layout projection moves the marker in a straight line between
      // rows; a synced x keyframe on top of it bends that path into an arc.
      animate={{ x: travelling ? [0, offset, TOUCH, 0] : 0 }}
      transition={{
        layout: SPRING,
        // peak early, close on the label's edge by impact, then ride alongside it
        x: {
          duration: FLIGHT_MS / 1000,
          times: [0, 0.3, IMPACT, 1],
          ease: ["easeOut", "easeInOut", "easeOut"],
        },
      }}
      className={cn(
        "absolute left-0",
        marker === "bar"
          ? "top-1/2 h-4 w-[3px] -translate-y-1/2"
          : "top-[calc(50%-3px)] size-1.5",
      )}
    >
      {/* Colour lives on an inner span, clear of the element owning the projection. */}
      <motion.span
        // The marker mounts fresh on its new row, so the colour it is leaving has
        // to be handed to it: it starts on the old section's ink and fades across
        // to the new one over the same window the arc flies. No travel (first
        // paint, reduced motion) means no journey, so it just appears.
        initial={travelling ? { backgroundColor: from } : false}
        animate={{ backgroundColor: color }}
        transition={{
          duration: reduced ? 0 : FLIGHT_MS / 1000,
          ease: "easeOut",
        }}
        className={cn(
          "block size-full rounded-full",
          marker === "pip" &&
            "rotate-45 rounded-tl-full rounded-tr-full rounded-br-full rounded-bl-xs",
        )}
        style={
          marker === "glow" ? { boxShadow: `0 0 10px ${color}` } : undefined
        }
      />
    </motion.span>
  );
}

export function Sidebar({
  sections,
  activeHref,
  value,
  defaultValue = 0,
  onChange,
  onNavigate,
  header,
  footer,
  variant = "rail",
  open = false,
  onOpenChange,
  navLabel = "Sidebar",
  marker = "dot",
  markerColor = "var(--primary, #b4e84c)",
  fade = true,
  className,
  ...props
}: SidebarProps) {
  const reduced = useReducedMotion() === true;
  // A rail and a drawer can be mounted at once: keep each marker's shared layout
  // scoped to its own instance.
  const markerId = useId();
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Every row in nav order, so the marker knows how far it travels and what it
  // leaves behind.
  const rows: Row[] = sections.flatMap((section) =>
    section.items.map((item) => ({ item, color: section.color })),
  );
  const indexOf = new Map(rows.map((row, index) => [row.item, index]));

  const derived =
    activeHref !== undefined
      ? rows.findIndex((row) => row.item.href === activeHref)
      : undefined;
  const activeIndex = value ?? derived ?? internalValue;

  // Remember where the marker came from, updated during render (the derived-state
  // pattern) so it mounts already knowing its journey. First paint: from === to.
  const [travel, setTravel] = useState({ from: activeIndex, to: activeIndex });
  if (travel.to !== activeIndex) {
    setTravel({ from: travel.to, to: activeIndex });
  }

  // A previous index of -1 means the marker was not on screen at all (a route
  // outside the nav, say): it should appear in place rather than fly in.
  const travelled =
    travel.from >= 0 && activeIndex >= 0
      ? Math.abs(activeIndex - travel.from)
      : 0;
  const offset = reduced ? 0 : arcOffset(travelled);
  const travelling = offset !== 0;

  const activeColor = rows[activeIndex]?.color ?? markerColor;
  const leavingColor =
    travel.from >= 0 ? (rows[travel.from]?.color ?? markerColor) : activeColor;

  const select = (index: number, item: SidebarItem) => {
    // Route-driven and controlled panels already know their row.
    if (value === undefined && activeHref === undefined) {
      setInternalValue(index);
    }
    onChange?.(index, item);
    onNavigate?.(item);
  };

  const panel = (
    <>
      {header && <div className="pb-2">{header}</div>}

      <div
        className={cn(SCROLLER, fade && FADE_PADDING)}
        style={fade ? fadeStyle() : undefined}
      >
        {sections.map((section, sectionIndex) => (
          <div key={section.label ?? sectionIndex} className="mb-5 last:mb-0">
            {section.label && (
              <p className={cn(EYEBROW, "mb-2 px-1")}>{section.label}</p>
            )}

            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const index = indexOf.get(item) ?? -1;
                const active = index === activeIndex;

                const content = (
                  <motion.span
                    className="inline-flex min-w-0 items-center gap-2"
                    initial={false}
                    animate={{ x: reduced ? 0 : active ? 12 : 0 }}
                    transition={labelTransition(active, travelling)}
                  >
                    {item.icon && (
                      <span className="size-4 shrink-0 [&_svg]:size-4">
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-tight transition-colors",
                          active
                            ? "bg-primary/20 font-semibold text-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </motion.span>
                );

                const rowClass = cn(
                  ROW,
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  item.disabled && "pointer-events-none opacity-40",
                );

                return (
                  <li
                    key={`${sectionIndex}-${item.label}`}
                    className="relative"
                  >
                    {active && (
                      <Marker
                        layoutId={markerId}
                        color={activeColor}
                        from={leavingColor}
                        offset={offset}
                        marker={marker}
                        reduced={reduced}
                      />
                    )}

                    {item.disabled ? (
                      <span
                        aria-disabled="true"
                        className={cn(rowClass, "cursor-not-allowed")}
                      >
                        {content}
                      </span>
                    ) : item.href ? (
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => select(index, item)}
                        className={rowClass}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        // A row with no href still has to expose which one is
                        // marked — "page" is for links, "true" is for the rest.
                        aria-current={active ? "true" : undefined}
                        onClick={() => select(index, item)}
                        className={rowClass}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {footer && <div className="pt-2">{footer}</div>}
    </>
  );

  if (variant === "drawer") {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        navLabel={navLabel}
        reduced={reduced}
        className={className}
      >
        {panel}
      </Drawer>
    );
  }

  return (
    <nav
      aria-label={navLabel}
      className={cn("flex min-h-0 flex-col", className)}
      {...props}
    >
      {panel}
    </nav>
  );
}

/** The mask that fades a scrolling list at both ends. */
function fadeStyle(): CSSProperties {
  return { maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK };
}

/**
 * The overlay the same panel is drawn in on a phone: the page is locked behind
 * it, Escape and the scrim both dismiss it, and it slides in from the edge the
 * rail would have been on.
 */
function Drawer({
  open,
  onOpenChange,
  navLabel,
  reduced,
  className,
  children,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  navLabel: string;
  reduced: boolean;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange?.(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden="true"
            onClick={() => onOpenChange?.(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={navLabel}
            initial={{ x: reduced ? 0 : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: reduced ? 0 : "-100%" }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 420, damping: 40 }
            }
            className={cn(
              "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-background px-4 pb-6 pt-4",
              className,
            )}
          >
            <div className="mb-2 flex items-center justify-between gap-4 pb-2">
              <span className={EYEBROW}>{navLabel}</span>
              <button
                type="button"
                onClick={() => onOpenChange?.(false)}
                aria-label="Close navigation"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-[1.5px] focus-visible:ring-ring/60 focus-visible:ring-inset focus-visible:outline-none"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav aria-label={navLabel} className="flex min-h-0 flex-1 flex-col">
              {children}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;
