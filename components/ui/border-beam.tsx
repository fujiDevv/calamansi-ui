"use client";

import {
  useId,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

export type BorderBeamProps = {
  /** Size/length of the beam along the perimeter in pixels. Default: 200 */
  size?: number;
  /** Duration of one complete cycle in seconds. Default: 12 */
  duration?: number;
  /** Delay before starting the animation in seconds. Default: 0 */
  delay?: number;
  /** Starting color of the gradient beam. Default: var(--color-calamansi-rind, #b4e84c) */
  colorFrom?: string;
  /** Ending color of the gradient beam. Default: var(--color-calamansi-flesh, #ff9e3d) */
  colorTo?: string;
  /** Thickness of the beam stroke in pixels. Default: 1.5 */
  borderWidth?: number;
  /** Anchor percentage along the beam gradient (0 to 100). Default: 90 */
  anchor?: number;
  /** Reverse travel direction (counter-clockwise). Default: false */
  reverse?: boolean;
  /** Initial starting offset percentage (0 to 100). Default: 0 */
  initialOffset?: number;
  /** Explicit corner radius in pixels matching the parent container. */
  borderRadius?: number;
  /** Extra classes merged onto the beam container. */
  className?: string;
  /** Whether the component reacts to hover. Default: interactive */
  interactive?: boolean;
};

const BLUR_IDS = ["blur", "blur2", "blur3"] as const;

/**
 * A next-level orbital border beam.
 * Combines:
 * - a main travelling beam,
 * - a second offset beam that orbits on the opposite side,
 * - a small spinning gradient core that mirrors motion inward,
 * - a reactive glow that brightens when the pointer enters the parent.
 */
export function BorderBeam({
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "var(--color-calamansi-rind, #b4e84c)",
  colorTo = "var(--color-calamansi-flesh, #ff9e3d)",
  borderWidth = 1.5,
  anchor = 90,
  reverse = false,
  initialOffset = 0,
  borderRadius,
  className,
  interactive = true,
}: BorderBeamProps) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  const pathRadius =
    borderRadius != null ? `${borderRadius}px` : `${size}px`;

  const phaseOffset = (initialOffset / 100) * duration;
  const totalOffsetDelay = -(delay + phaseOffset);
  const animationDelayValue =
    totalOffsetDelay !== 0 ? `${totalOffsetDelay}s` : undefined;

  const mainId = `beam-${id}`;
  const ghostId = `beam-ghost-${id}`;
  const orbId = `beam-orb-${id}`;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const onEnter = () => setHovered(true);
    const onLeave = () => setHovered(false);

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const glowIntensity = hovered ? 1 : 0.35;
  const chaseIntensity = hovered ? 1 : 0.55;

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent",
        className,
      )}
      style={{
        borderWidth: `${borderWidth}px`,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      } as CSSProperties}
    >
      <style>{`
        @keyframes ${mainId} { from { offset-distance: 0% } to { offset-distance: 100% } }
        @keyframes ${ghostId} { from { offset-distance: 100% } to { offset-distance: 0% } }
        @keyframes ${orbId} { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) {
          .${mainId}, .${ghostId}, .${orbId} { animation: none !important; }
        }
      `}</style>

      {/* Main travelling beam */}
      <div
        className={cn("absolute aspect-square", mainId)}
        style={{
          width: `${size}px`,
          background:
            `linear-gradient(to left, ${colorFrom}, ${colorTo}, transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${pathRadius})`,
          offsetAnchor: `${anchor}% 50%`,
          animationName: mainId,
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: animationDelayValue,
          animationDirection: reverse ? "reverse" : "normal",
          willChange: "offset-distance",
        } as CSSProperties}
      />

      {/* Ghost beam trailing behind the main beam */}
      <div
        className={cn("absolute aspect-square", ghostId)}
        style={{
          width: `${size * 0.62}px`,
          background:
            `linear-gradient(to left, ${colorTo}, ${colorFrom}, transparent)`,
          opacity: chaseIntensity,
          offsetPath: `rect(0 auto auto 0 round ${pathRadius})`,
          offsetAnchor: `${anchor - 10}% 50%`,
          animationName: ghostId,
          animationDuration: `${duration * 1.15}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: animationDelayValue,
          animationDirection: reverse ? "normal" : "reverse",
          willChange: "offset-distance",
        } as CSSProperties}
      />

      {/* Spinning gradient core inside the beam path */}
      <div
        className={cn("absolute aspect-square", orbId)}
        style={{
          width: `${size * 0.28}px`,
          left: "50%",
          top: "50%",
          marginLeft: `-${size * 0.14}px`,
          marginTop: `-${size * 0.14}px`,
          background:
            `conic-gradient(from 0deg at 50% 50%, ${colorFrom}, ${colorTo}, ${colorFrom})`,
          filter: `blur(${Math.round(2 + glowIntensity * 4)}px)`,
          opacity: 0.5 + glowIntensity * 0.4,
          animationName: orbId,
          animationDuration: `${duration * 0.55}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: animationDelayValue,
          willChange: "transform",
        } as CSSProperties}
      />

      {/* Soft ambient outer glow ring that reacts to hover */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow: `inset 0 0 ${18 + Math.round(glowIntensity * 22)}px 0 ${colorTo}`,
          opacity: glowIntensity * 0.55,
          mixBlendMode: "screen",
          pointerEvents: "none",
        } as CSSProperties}
      />
    </div>
  );
}
