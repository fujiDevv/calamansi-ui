"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

const DockMouseContext = createContext<MotionValue<number> | null>(null);

const DockConfigContext = createContext({
  reach: 130,
  size: 48,
  magnify: 78,
});

/**
 * The Calamansi surface, shared with the number ticker and the cards: one flat
 * palette layer, clipped to a squircle.
 *
 * The surface is painted on its own layer rather than on the panel itself, and
 * deliberately so: items magnify past the panel's top edge and their labels float
 * above that, so the panel has to stay overflow-visible. The height is driven by
 * `panelHeight` (default `size + 16`).
 */
export type DockVariant = "white" | "calamansi" | "slate" | "citrus";

const PANEL = [
  "relative flex items-end gap-2 overflow-visible p-2 select-none",
].join(" ");

/**
 * `calamansi` is the default slab. `white` is the other end of the range — the only
 * palette that has to read on a light page: white in light mode, near-black in dark.
 * Each palette carries the ink that sits on it, and the items tint from
 * `currentColor`.
 */
const VARIANTS: Record<DockVariant, { paint: string; ink: string }> = {
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

/** The tile an icon sits on, tinted from the surface ink so it works on white too. */
const ITEM = [
  "relative flex aspect-square cursor-pointer items-center justify-center rounded-[20px]",
  "border border-current/20 bg-current/15 backdrop-blur-md",
  "transition-colors hover:border-current/35 hover:bg-current/25",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/50",
].join(" ");

export type DockProps = {
  children: ReactNode;
  className?: string;
  /** Surface palette. Default: "calamansi" */
  variant?: DockVariant;
  /** How far from the pointer, in pixels, an item starts growing. */
  reach?: number;
  /** Item size at rest, in pixels. */
  size?: number;
  /** Item size under the pointer, in pixels. */
  magnify?: number;
  /** Fixed height of the dock border box in pixels. Defaults to size + 16. */
  panelHeight?: number;
};

/**
 * A Calamansi dock that magnifies the item under the pointer, Mac-style.
 *
 * Each item measures its own distance from the pointer and springs to a size,
 * so the lift is continuous rather than a hover state.
 *
 * The panel stays overflow-visible on purpose: items grow past its top edge and
 * their labels float above that. A parent that has to clip in one axis — an
 * `overflow-x-auto` row on phones, for example — needs to leave roughly 48px of
 * headroom above the dock so neither the magnified item nor its label is cut.
 */
export function Dock({
  children,
  className,
  variant = "calamansi",
  reach = 130,
  size = 48,
  magnify = 78,
  panelHeight,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const fixedHeight = panelHeight ?? size + 16;

  return (
    <DockMouseContext.Provider value={mouseX}>
      <motion.div
        onPointerMove={(event) => mouseX.set(event.pageX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        style={{ height: fixedHeight }}
        className={cn(PANEL, VARIANTS[variant].ink, className)}
      >
        <Squircle className={VARIANTS[variant].paint} />

        <DockConfigContext.Provider value={{ reach, size, magnify }}>
          {children}
        </DockConfigContext.Provider>
      </motion.div>
    </DockMouseContext.Provider>
  );
}

export type DockItemProps = {
  children: ReactNode;
  /** Label shown above the item on hover. */
  label?: string;
  className?: string;
  onClick?: () => void;
};

export function DockItem({
  children,
  label,
  className,
  onClick,
}: DockItemProps) {
  const dockMouseX = useContext(DockMouseContext);
  const { reach, size, magnify } = useContext(DockConfigContext);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // standalone items (outside a Dock) simply render at rest
  const localMouseX = useMotionValue(Infinity);
  const mouseX = dockMouseX ?? localMouseX;

  const distance = useTransform(mouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return reach;
    return value - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(
    distance,
    [-reach, 0, reach],
    [size, magnify, size],
  );
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });

  return (
    <div
      ref={ref}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="relative flex flex-col items-center"
    >
      <motion.button
        type="button"
        onClick={onClick}
        style={{
          width: reduceMotion ? size : width,
          height: reduceMotion ? size : width,
        }}
        className={cn(ITEM, className)}
      >
        {children}
      </motion.button>

      {label && (
        <span
          aria-hidden={!hovered}
          className={cn(
            "pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2 rounded-xl bg-neutral-900/90 px-2.5 py-1 font-runde text-[11px] font-semibold whitespace-nowrap text-white shadow-lg ring-1 ring-white/15 backdrop-blur-md transition-all duration-200 ease-out",
            "dark:bg-white/15",
            hovered ? "scale-100 opacity-100" : "scale-90 opacity-0",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
