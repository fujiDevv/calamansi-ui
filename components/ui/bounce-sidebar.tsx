"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import Link from "next/link";
import { motion, useAnimate } from "motion/react";
import { arc } from "motion";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type BounceSidebarItem =
  | string
  | {
      label: string;
      href?: string;
      icon?: ReactNode;
      badge?: string | number;
      disabled?: boolean;
    }
  | {
      label: string;
      heading: true;
    };

export type BounceSidebarMarkerVariant = "dot" | "pip" | "glow";

export type BounceSidebarProps = Omit<ComponentProps<"ul">, "onChange"> & {
  /** Array of nav items, links, or section headings. */
  items: BounceSidebarItem[];
  /** Active item index for controlled usage. */
  value?: number;
  /** Initial active index for uncontrolled usage. Default: 0 */
  defaultValue?: number;
  /** Callback fired with the new index upon selection. */
  onChange?: (index: number) => void;
  /** Color of the bouncing marker. Default: var(--primary, #b4e84c) */
  dotColor?: string;
  /** Diameter of the marker in pixels. Default: 7 */
  markerSize?: number;
  /** Shape style of the active marker: "dot" | "pip" (citrus seed) | "glow". Default: "dot" */
  markerVariant?: BounceSidebarMarkerVariant;
  /** Enable organic velocity squash-and-stretch flight dynamics. Default: true */
  squish?: boolean;
  /** Enable expanding micro-ripple on arrival. Default: true */
  ripple?: boolean;
};

/**
 * An animated vertical navigation list with organic squash-and-stretch
 * kinetic physics, curved arc trajectories, and tactile landing ripples.
 */
export function BounceSidebar({
  items,
  value,
  defaultValue = 0,
  onChange,
  dotColor = "var(--primary, #b4e84c)",
  markerSize = 7,
  markerVariant = "dot",
  squish = true,
  ripple = true,
  className,
  ...props
}: BounceSidebarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeIndex = value ?? internalValue;

  const [dot, animate] = useAnimate<HTMLSpanElement>();
  const [rippleEl, animateRipple] = useAnimate<HTMLSpanElement>();
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const prevY = useRef<number | null>(null);

  const [calibratedSize, setCalibratedSize] = useState(markerSize);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    setCalibratedSize(Math.round(markerSize * dpr) / dpr);
  }, [markerSize]);

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    const snap = () => {
      const el = itemRefs.current[activeIndex];
      if (cancelled || !el || !dot.current) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.round(markerSize * dpr) / dpr;
      const toY =
        Math.round((el.offsetTop + el.offsetHeight / 2 - size / 2) * dpr) / dpr;
      animate(
        dot.current,
        { x: 0, y: toY, scaleX: 1, scaleY: 1 },
        { duration: 0 },
      );
      prevY.current = toY;
      setReady(true);
    };

    snap();
    const raf = requestAnimationFrame(snap);
    document.fonts?.ready.then(snap);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (!el || !dot.current) return;

    const dpr = window.devicePixelRatio || 1;
    const toY =
      Math.round(
        (el.offsetTop + el.offsetHeight / 2 - calibratedSize / 2) * dpr,
      ) / dpr;

    if (prevY.current === null) {
      animate(
        dot.current,
        { x: 0, y: toY, scaleX: 1, scaleY: 1 },
        { duration: 0 },
      );
      prevY.current = toY;
      return;
    }

    const fromY = prevY.current;
    const delta = toY - fromY;
    prevY.current = toY;
    if (delta === 0) return;

    const distance = Math.abs(delta);
    const path = arc({
      strength: Math.min(0.85, 16 / distance),
      direction: delta > 0 ? "ccw" : "cw",
    });

    // Calamansi kinetic physics: velocity-based stretch
    const stretchY = squish ? Math.min(1.4, 1 + distance / 320) : 1;
    const squishX = squish ? 1 / Math.sqrt(stretchY) : 1;

    // Trigger arrival ripple
    if (ripple && rippleEl.current) {
      animateRipple(
        rippleEl.current,
        {
          x: 0,
          y: toY,
          scale: [0.6, 1.8],
          opacity: [0.6, 0],
        },
        {
          duration: 0.38,
          delay: 0.16,
          ease: "easeOut",
        },
      );
    }

    // Travel along arc with squash & stretch deformation
    animate(
      dot.current,
      {
        x: 0,
        y: toY,
        scaleY: squish ? [1, stretchY, 0.78, 1.05, 1] : 1,
        scaleX: squish ? [1, squishX, 1.22, 0.96, 1] : 1,
      },
      {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        path,
      },
    );
  }, [
    activeIndex,
    animate,
    animateRipple,
    calibratedSize,
    dot,
    ripple,
    rippleEl,
    squish,
  ]);

  const select = (index: number) => {
    if (value === undefined) setInternalValue(index);
    onChange?.(index);
  };

  return (
    <ul
      data-slot="bounce-sidebar"
      className={cn("relative flex flex-col gap-1 pl-6", className)}
      {...props}
    >
      {/* Expanding arrival ripple */}
      {ripple && (
        <span
          ref={rippleEl}
          aria-hidden
          className="pointer-events-none absolute left-2 top-0 rounded-full border opacity-0"
          style={{
            width: calibratedSize * 2.2,
            height: calibratedSize * 2.2,
            marginLeft: -(calibratedSize * 0.6),
            marginTop: -(calibratedSize * 0.6),
            borderColor: dotColor,
          }}
        />
      )}

      {/* Animated kinetic marker */}
      <span
        ref={dot}
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-2 top-0 flex items-center justify-center transition-opacity duration-150",
          markerVariant === "pip" &&
            "rotate-45 rounded-tl-full rounded-tr-full rounded-br-full rounded-bl-xs",
          markerVariant === "glow" &&
            "rounded-full shadow-[0_0_10px_currentColor]",
          markerVariant === "dot" &&
            "rounded-full ring-1 ring-black/15 dark:ring-white/20",
        )}
        style={{
          width: calibratedSize,
          height: calibratedSize,
          backgroundColor: dotColor,
          color: dotColor,
          opacity: ready ? 1 : 0,
        }}
      />

      {items.map((item, index) => {
        const isObj = typeof item !== "string";
        const label = isObj ? item.label : item;

        if (isObj && "heading" in item && item.heading) {
          return (
            <li
              key={`${index}-${label}`}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              role="presentation"
              data-slot="bounce-sidebar-heading"
              className="px-2 pb-1 pt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/75 first:pt-1"
            >
              {label}
            </li>
          );
        }

        const href = isObj && "href" in item ? item.href : undefined;
        const icon = isObj && "icon" in item ? item.icon : undefined;
        const badge = isObj && "badge" in item ? item.badge : undefined;
        const disabled = isObj && "disabled" in item ? item.disabled : false;
        const isActive = index === activeIndex;

        const itemContent = (
          <>
            {icon && (
              <span
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/70 group-hover:text-foreground",
                )}
              >
                {icon}
              </span>
            )}
            <span className="truncate">{label}</span>
            {badge !== undefined && (
              <span
                className={cn(
                  "ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-tight transition-colors",
                  isActive
                    ? "bg-primary/20 font-semibold text-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground",
                )}
              >
                {badge}
              </span>
            )}
          </>
        );

        const itemClassName = cn(
          "group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-all duration-200",
          isActive
            ? "bg-muted/70 font-semibold text-foreground"
            : "text-foreground/60 hover:bg-muted/40 hover:text-foreground",
          disabled && "pointer-events-none opacity-40",
        );

        return (
          <li
            key={`${index}-${label}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            {href ? (
              <MotionLink
                href={href}
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {itemContent}
              </MotionLink>
            ) : (
              <motion.button
                type="button"
                data-slot="bounce-sidebar-item"
                data-active={isActive}
                disabled={disabled}
                onClick={() => select(index)}
                className={itemClassName}
              >
                {itemContent}
              </motion.button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
