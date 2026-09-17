"use client";

import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export type ShimmerButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
  /** Primary glow/shimmer beam color. Default: "var(--primary, #b4e84c)" */
  shimmerColor?: string;
  /** Thickness of the shimmer border in pixels or CSS value. Default: 1.5 */
  shimmerSize?: number | string;
  /** Duration in seconds for one full rotation. Default: 3 */
  shimmerDuration?: number;
  /** Corner border radius of the button. Default: "9999px" */
  borderRadius?: string;
  /** Background fill color of the button interior. Default: "var(--card, #111)" */
  background?: string;
  /** Decorative sub-label rendered below the main children. */
  subLabel?: ReactNode;
  /** Extra classes merged onto button. */
  className?: string;
};

/**
 * A Calamansi action button: a rotating conic shimmer beam edge inside the
 * brand's white lip, with tactile spring squash on press and an ambient glow.
 */
export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  function ShimmerButton(
    {
      children,
      shimmerColor = "var(--primary, #b4e84c)",
      shimmerSize = 1.5,
      shimmerDuration = 3,
      borderRadius = "9999px",
      background = "var(--card, #141414)",
      subLabel,
      className,
      disabled,
      style,
      ...props
    },
    ref,
  ) {
    const borderWidth =
      typeof shimmerSize === "number" ? `${shimmerSize}px` : shimmerSize;

    return (
      <motion.button
        ref={ref}
        type="button"
        disabled={disabled}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 440, damping: 26 }}
        style={
          {
            borderRadius,
            ...style,
          } as CSSProperties
        }
        className={cn(
          // the white lip is part of the Calamansi surface: same one the task
          // and morning widgets wear, sized down to a button edge
          "group relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden border-[3px] border-white/85 font-semibold tracking-tight text-foreground outline-hidden select-none dark:border-white/15",
          "shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_18px_36px_-16px_rgba(0,0,0,0.55)] transition-shadow duration-300",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
        {...props}
      >
        {/* Outer ambient glow halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 z-0 opacity-30 blur-md transition-opacity duration-300 group-hover:opacity-75"
          style={{
            borderRadius,
            background: `radial-gradient(circle at center, ${shimmerColor} 0%, transparent 75%)`,
          }}
        />

        {/* Rotating conic gradient beam */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[150%] z-0 flex items-center justify-center"
        >
          <div
            className="aspect-square w-full animate-[spin_linear_infinite]"
            style={{
              animationDuration: `${shimmerDuration}s`,
              background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${shimmerColor} 60deg, transparent 120deg)`,
            }}
          />
        </div>

        {/* Inner button surface masking the center to reveal the rotating shimmer border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute z-1 transition-colors duration-200"
          style={{
            top: borderWidth,
            left: borderWidth,
            right: borderWidth,
            bottom: borderWidth,
            borderRadius: `calc(${borderRadius} - ${borderWidth})`,
            background,
          }}
        />

        {/* Ambient top sheen highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-2 h-1/2 opacity-20"
          style={{
            borderRadius,
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.25) 0%, transparent 100%)",
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex flex-col items-center justify-center px-6 py-2.5 text-xs font-semibold tracking-wide">
          <span className="flex items-center gap-2 leading-none">
            {children}
          </span>
          {subLabel && (
            <span className="mt-1 text-[10px] font-normal text-muted-foreground">
              {subLabel}
            </span>
          )}
        </span>
      </motion.button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
