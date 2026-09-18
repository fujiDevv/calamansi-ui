"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import {
  FuseFilter,
  LiquidSegment,
  LIQUID_THRESHOLD,
  liquidMetrics,
  useFuseId,
} from "@/lib/liquid";
import { cn } from "@/lib/utils";

/*
  The fuse, the sealed extension and the bead all live in `@/lib/liquid`, shared
  with any other bar whose pieces have to pull apart and snap back together. What
  stays here is the layer above it: the palettes, the sizes, which seams open, and
  what a label does while they open.
*/

export type GooeyNavVariant = "white" | "calamansi" | "slate" | "citrus";
export type GooeyNavSize = "xs" | "sm" | "md" | "lg";

/**
 * The Calamansi palettes, flat rather than the family's gradients because the
 * active pill is small and the seam has to read as one colour meeting another.
 * `juice` is the same colour as a text class: the bead is the one thing painted
 * with `currentColor`, and a class is what lets it follow the theme.
 */
const VARIANTS: Record<
  GooeyNavVariant,
  { paint: string; juice: string; ink: string }
> = {
  white: {
    paint: "bg-white dark:bg-[#1c1c1f]",
    juice: "text-white dark:text-[#1c1c1f]",
    ink: "text-foreground",
  },
  calamansi: {
    paint: "bg-[#5c7a67] dark:bg-[#16221a]",
    juice: "text-[#5c7a67] dark:text-[#16221a]",
    ink: "text-white",
  },
  slate: {
    paint: "bg-[#687396] dark:bg-[#1e293b]",
    juice: "text-[#687396] dark:text-[#1e293b]",
    ink: "text-white",
  },
  citrus: {
    paint: "bg-[#b87152] dark:bg-[#22120b]",
    juice: "text-[#b87152] dark:text-[#22120b]",
    ink: "text-white",
  },
};

/** The tray: the kit's hairline grey, flat so the palette can be the only mark. */
const TRAY = "bg-border";

/**
 * The tray's own colour as an ink, for the bead of a seam that has no palette in it.
 *
 * The bead is painted with `currentColor`, which is why the palettes carry an ink
 * class beside their paint — so the tray needs one too, or a seam between two quiet
 * items would wear a colour that is nowhere near it.
 */
const TRAY_INK = "text-border";

/**
 * Radii in the kit's proportion, and the gap each size opens.
 *
 * The kit pairs a 28px corner with a 64px pill, which is 0.44 of its height, and
 * every size here holds that share: 12/28, 14/32, 16/40 and 20/48 all land between
 * 0.40 and 0.44. That is why the corner is per size rather than one number — the
 * brand is the share, not 28px. Handed 28px on a 40px bar, the library clamps to
 * half the height and the corner stops being an edge at all: the tray turns into a
 * pill. Measured, not assumed: `getSvgPath` rounds its radius down to `height / 2`.
 *
 * The label padding is twice the half-gap on purpose: the surface pulls back by
 * half the gap, so the pill in its resting state has exactly the padding the class
 * says.
 */
const SIZES = {
  xs: {
    label: "gap-1 px-3.5 py-1.5 text-[11px] leading-4 [&_svg]:size-[11px]",
    radius: 12,
    separation: 14,
  },
  sm: {
    label: "gap-1.5 px-4 py-2 text-xs leading-4 [&_svg]:size-3",
    radius: 14,
    separation: 16,
  },
  md: {
    label: "gap-2 px-5 py-2.5 text-sm leading-5 [&_svg]:size-3.5",
    radius: 16,
    separation: 20,
  },
  lg: {
    label: "gap-2.5 px-6 py-3 text-base leading-6 [&_svg]:size-4",
    radius: 20,
    separation: 24,
  },
} as const;

export type GooeyNavItem =
  | string
  | { label: string; href?: string; icon?: ReactNode };

type NavItem = { label: string; href?: string; icon?: ReactNode };

const toItem = (item: GooeyNavItem): NavItem =>
  typeof item === "string" ? { label: item } : item;

export type GooeyNavProps = Omit<ComponentProps<"nav">, "onChange"> & {
  /** Labels, or `{ label, href, icon }` objects. */
  items: GooeyNavItem[];
  /** Active index, for controlled use. */
  value?: number;
  /** Active index on mount when uncontrolled. Default: 0 */
  defaultValue?: number;
  /** Fired with the new index on selection. */
  onChange?: (index: number) => void;
  /** Which palette the active pill wears. Default: "calamansi" */
  variant?: GooeyNavVariant;
  /** Label size, with it the radius and the travel. Default: "md" */
  size?: GooeyNavSize;
  /** Override the gap the pill opens up on each side, in pixels. */
  separation?: number;
  /**
   * Override the corner radius in pixels. Defaults to the kit's share of the bar —
   * about two fifths of its height, which is the 28px corner on a 64px pill.
   */
  radius?: number;
  /**
   * The SVG blur behind the fuse, in pixels. This is how far a thread reaches:
   * the bridge survives to about 1.234 of this before it severs. Defaults to
   * 0.55 of the gap, so the thread reads the same at every size.
   */
  viscosity?: number;
  /**
   * The alpha ramp's slope: how hard the fused edge is, and how much the thread
   * thins before it parts. Default: 19
   */
  threshold?: number;
  /** Run the fuse at all. Off, the surfaces simply pull apart. Default: true */
  gooey?: boolean;
  /**
   * Leave a bead of palette juice behind when the thread severs. Default: true —
   * the detail that makes the move read as a liquid rather than a slide.
   */
  bead?: boolean;
};

type NavLabelProps = NavItem & {
  isActive: boolean;
  size: GooeyNavSize;
  ink: string;
  onSelect: () => void;
};

function NavLabel({
  label,
  href,
  icon,
  isActive,
  size,
  ink,
  onSelect,
}: NavLabelProps) {
  const className = cn(
    "flex w-full cursor-pointer items-center justify-center whitespace-nowrap font-runde font-semibold [&_svg]:shrink-0",
    // the label arrives with the pill and leaves the moment it does, so a slow
    // fade out never hangs on an item the pill has already left
    isActive
      ? "transition-colors duration-[400ms]"
      : "transition-colors duration-0",
    SIZES[size].label,
    isActive ? ink : "text-muted-foreground",
  );

  const shared = {
    "data-slot": "gooey-nav-item",
    "data-active": isActive,
    "aria-current": isActive ? (href ? ("page" as const) : true) : undefined,
    className,
    onClick: onSelect,
  };

  return href ? (
    <Link href={href} {...shared}>
      {icon}
      {label}
    </Link>
  ) : (
    <button type="button" {...shared}>
      {icon}
      {label}
    </button>
  );
}

export function GooeyNav({
  items,
  value,
  defaultValue = 0,
  onChange,
  variant = "calamansi",
  size = "md",
  separation,
  radius,
  viscosity,
  threshold = LIQUID_THRESHOLD,
  gooey = true,
  bead = true,
  className,
  ...props
}: GooeyNavProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const filterId = useFuseId("gooey-nav");

  const routeIndex = items.findIndex((item) => toItem(item).href === pathname);
  const [uncontrolled, setUncontrolled] = useState(() =>
    routeIndex === -1 ? defaultValue : routeIndex,
  );
  const [seenRoute, setSeenRoute] = useState(routeIndex);

  // in render, not an effect: an effect here cascades renders
  if (routeIndex !== seenRoute) {
    setSeenRoute(routeIndex);
    if (routeIndex !== -1 && value === undefined) setUncontrolled(routeIndex);
  }

  const active = value ?? uncontrolled;
  const gap = separation ?? SIZES[size].separation;
  const corner = radius ?? SIZES[size].radius;
  const { blur, sever, seal, pull } = liquidMetrics({
    gap,
    radius: corner,
    viscosity,
  });
  const palette = VARIANTS[variant];
  // a fused edge over a moving layer is exactly what reduced motion is asking us
  // not to do, and the surfaces still part on their own
  const fused = gooey && !reduced;

  /*
    A seam opens when it is either side of the active pill, and nowhere else — so
    the bar only breaks around the item that is moving. Nothing about this moves
    the layout: only the surfaces and their labels react.
  */
  const open = (seam: number) => seam - 1 === active || seam === active;

  return (
    <nav
      data-slot="gooey-nav"
      data-variant={variant}
      className={cn("inline-block", className)}
      {...props}
    >
      <FuseFilter id={filterId} blur={blur} threshold={threshold} />

      <ul
        className="relative flex items-center"
        style={fused ? { filter: `url(#${filterId})` } : undefined}
      >
        {items.map((item, index) => {
          const navItem = toItem(item);

          return (
            <LiquidSegment
              key={`${index}-${navItem.label}`}
              seamLeft={open(index)}
              seamRight={open(index + 1)}
              atStart={index === 0}
              atEnd={index === items.length - 1}
              radius={corner}
              pull={pull}
              seal={seal}
              sever={sever}
              bead={bead}
              /*
                The bead sits at this segment's left seam, so it wears the material of
                that seam — which is the same question as whether the seam is open: the
                palette where the pill is one of the two surfaces meeting there, the
                tray's own colour where it is not. A seam between two quiet items then
                closes with a drop of tray rather than a dot of a palette that is
                nowhere near it.
              */
              beadFill={open(index) ? palette.juice : TRAY_INK}
              paint={cn(TRAY, index === active && palette.paint)}
              reduced={reduced}
              slot="gooey-nav-segment"
              beadSlot="gooey-nav-bead"
            >
              <NavLabel
                {...navItem}
                isActive={index === active}
                size={size}
                ink={palette.ink}
                onSelect={() => {
                  if (value === undefined) setUncontrolled(index);
                  onChange?.(index);
                }}
              />
            </LiquidSegment>
          );
        })}
      </ul>
    </nav>
  );
}

export default GooeyNav;
