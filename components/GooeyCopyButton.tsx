"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FuseFilter,
  LiquidSegment,
  LIQUID_THRESHOLD,
  liquidMetrics,
  useFuseId,
} from "@/lib/liquid";
import { SQUIRCLE_RADIUS, SQUIRCLE_SHARE } from "@/lib/squircle";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE GOOEY COPY COMMAND
 *
 * The install command and its glyph are two surfaces of one bar, fused the way the
 * Duration picker's pieces are. Press it and they part on a real metaball thread
 * while the glyph's end of the tray turns to the palette and a tick draws itself
 * on; a moment later they merge back under it, the thread across the seam again —
 * and a drop of the palette is left at the seam while it closes.
 *
 * The bar is a single `<button>`, so the pieces render as `span`s rather than list
 * items: a control holds phrasing content, and the primitive takes the tag for
 * exactly this case.
 *
 * Its plain sibling is `CopyButton` — one surface, one glyph, no fuse.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** How long the pieces stay parted — and the tick stays drawn — after a copy. */
const COPIED_MS = 1500;

/**
 * The gap a seam opens, and the curve the glyph swaps on: both are the picker's, so
 * the material and the ink move together at the same weight.
 */
const GAP = 12;
const ICON_SPRING = { stiffness: 300, damping: 30 } as const;

/**
 * The palette the parted end is painted in: the site's own mark, taken from the
 * theme so it follows light and dark rather than being stated twice.
 */
const PALETTE = {
  paint: "bg-primary",
  juice: "text-primary",
  ink: "text-primary-foreground",
};

/** The tray: the kit's hairline grey, the surface every bar of ours is. */
const TRAY = "bg-border";

/** The copy glyph and the tick, as paths so each can move on its own. */
const COPY_SHEET =
  "M10 8h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z";
const COPY_SLIP = "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2";
const TICK = "M4.6 12.4 9.6 17.4 19.4 7.6";

export type GooeyCopyButtonProps = Omit<
  ComponentProps<"button">,
  "value" | "children"
> & {
  /** What lands in the clipboard. */
  value: string;
  /** The accessible name — the command drawn in the bar is presentation. */
  label?: string;
  /** The command itself. It truncates rather than widening the button. */
  children: ReactNode;
};

export default function GooeyCopyButton({
  value,
  label = "Copy install command",
  className,
  children,
  title,
  ...props
}: GooeyCopyButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const filterId = useFuseId("copy-command");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /*
    The corner is the brand's share of the bar, not a number: this bar wraps to two
    lines on a phone, so its height is nothing a constant could be right about. The
    sealed extension is taken from the radius the share can reach at most, which is
    all a hidden overlap ever needs.

    Which is why the glyph's end is `w-14`: to seal a seam a surface swallows that
    extension under its neighbour, and a swallow wider than the piece it hides under
    sticks out of the bar's silhouette as a second rounded end.
  */
  const { blur, sever, seal, pull } = liquidMetrics({
    gap: GAP,
    radius: SQUIRCLE_RADIUS,
  });

  // a fused edge over a moving layer is exactly what reduced motion is asking us not
  // to do, and the pieces still part on their own
  const fused = !reduced;

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // a page with no clipboard access has nothing to confirm, so nothing parts
      return;
    }

    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  const iconTransition = reduced ? { duration: 0 } : ICON_SPRING;

  return (
    <button
      {...props}
      type="button"
      onClick={copy}
      data-slot="copy-command"
      data-copied={copied}
      aria-label={copied ? "Copied" : label}
      title={title === undefined ? label : title || undefined}
      className={cn(
        "group relative block w-full cursor-pointer text-left text-foreground",
        className,
      )}
    >
      <FuseFilter id={filterId} blur={blur} threshold={LIQUID_THRESHOLD} />

      <span
        data-slot="copy-command-bar"
        className="relative flex w-full items-stretch"
        style={fused ? { filter: `url(#${filterId})` } : undefined}
      >
        {/* the command takes the slack; its surface is painted, never laid out */}
        <LiquidSegment
          as="span"
          className="min-w-0 flex-1"
          slot="copy-command-segment"
          seamLeft={false}
          seamRight={copied}
          atStart
          atEnd={false}
          radius={SQUIRCLE_RADIUS}
          share={SQUIRCLE_SHARE}
          pull={pull}
          seal={seal}
          sever={sever}
          paint={TRAY}
          reduced={reduced}
        >
          <span className="flex h-full min-w-0 items-center py-2.5 pr-3 pl-4 sm:pl-5">
            {children}
          </span>
        </LiquidSegment>

        {/* the glyph's own end of the tray, which the palette takes while parted */}
        <LiquidSegment
          as="span"
          className="w-14 shrink-0"
          slot="copy-command-segment"
          beadSlot="copy-command-bead"
          seamLeft={copied}
          seamRight={false}
          atStart={false}
          atEnd
          radius={SQUIRCLE_RADIUS}
          share={SQUIRCLE_SHARE}
          pull={pull}
          seal={seal}
          sever={sever}
          bead
          beadFill={PALETTE.juice}
          paint={cn(TRAY, copied && PALETTE.paint)}
          reduced={reduced}
        >
          <span
            data-slot="copy-command-glyph"
            className={cn(
              "grid min-h-11 w-14 shrink-0 place-items-center transition-colors duration-300",
              copied
                ? PALETTE.ink
                : "text-muted-foreground group-hover:text-foreground",
            )}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4 overflow-visible"
            >
              {/* the glyph puts itself away as the tick draws itself on */}
              <motion.path
                d={COPY_SHEET}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ opacity: copied ? 0 : 1, y: copied ? -3 : 0 }}
                transition={iconTransition}
              />
              <motion.path
                d={COPY_SLIP}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ opacity: copied ? 0 : 1, y: copied ? -3 : 0 }}
                transition={iconTransition}
              />
              <motion.path
                d={TICK}
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  pathLength: copied ? 1 : 0,
                  opacity: copied ? 1 : 0,
                }}
                transition={iconTransition}
              />
            </svg>
          </span>
        </LiquidSegment>
      </span>
    </button>
  );
}

export { GooeyCopyButton };
