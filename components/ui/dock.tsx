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
import { cn } from "@/lib/utils";

const DockMouseContext = createContext<MotionValue<number> | null>(null);

const DockConfigContext = createContext({
  reach: 130,
  size: 48,
  magnify: 78,
});

export type DockProps = {
  children: ReactNode;
  className?: string;
  /** How far from the pointer, in pixels, an item starts growing. */
  reach?: number;
  /** Item size at rest, in pixels. */
  size?: number;
  /** Item size under the pointer, in pixels. */
  magnify?: number;
};

/**
 * A dock that magnifies the item under the pointer, Mac-style.
 *
 * Each item measures its own distance from the pointer and springs to a size,
 * so the lift is continuous rather than a hover state.
 */
export function Dock({
  children,
  className,
  reach = 130,
  size = 48,
  magnify = 78,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <DockMouseContext.Provider value={mouseX}>
      <motion.div
        onPointerMove={(event) => mouseX.set(event.pageX)}
        onPointerLeave={() => mouseX.set(Infinity)}
        className={cn(
          "relative flex items-end gap-2 rounded-[26px] border border-border/60 bg-card/70 p-2 shadow-lg backdrop-blur-xl",
          className,
        )}
      >
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
        style={{ width: reduceMotion ? size : width }}
        className={cn(
          "relative flex aspect-square cursor-pointer items-center justify-center rounded-[18px] border border-border/70 bg-muted text-foreground/80 shadow-sm transition-colors hover:bg-popover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {children}
      </motion.button>

      {label && (
        <span
          aria-hidden={!hovered}
          className={cn(
            "pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border/60 bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-lg transition-all duration-200 ease-out",
            hovered ? "scale-100 opacity-100" : "scale-90 opacity-0",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
