"use client";

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

export type TiltCardProps = {
  children: ReactNode;
  className?: string;
  /** Maximum rotation, in degrees, at the corners. */
  maxTilt?: number;
  /** Scale applied while the pointer is over the card. */
  hoverScale?: number;
  /** Draw a sheen that follows the pointer. */
  glare?: boolean;
  /** Spring stiffness for the return. */
  stiffness?: number;
  /** Spring damping. Lower is bouncier. */
  damping?: number;
};

/**
 * A card that leans towards the pointer in 3D.
 *
 * Pointer position is normalised to 0 to 1 and fed through springs, so the card
 * tilts continuously and settles back to flat when the pointer leaves.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 12,
  hoverScale = 1.02,
  glare = true,
  stiffness = 220,
  damping = 18,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [maxTilt, -maxTilt]),
    { stiffness, damping },
  );
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-maxTilt, maxTilt]),
    { stiffness, damping },
  );

  const glareX = useTransform(pointerX, [0, 1], [0, 100]);
  const glareY = useTransform(pointerY, [0, 1], [0, 100]);
  const glareBackground = useMotionTemplate`radial-gradient(240px circle at ${glareX}% ${glareY}%, rgb(255 255 255 / 0.3), transparent 65%)`;

  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;

    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  };

  const reset = () => {
    setHovered(false);
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={reset}
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <motion.div
        style={
          reduceMotion
            ? undefined
            : { rotateX, rotateY, transformStyle: "preserve-3d" }
        }
        whileHover={reduceMotion ? undefined : { scale: hoverScale }}
        transition={{ type: "spring", stiffness, damping }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-lg",
          className,
        )}
      >
        {glare && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0"
            style={{ background: glareBackground }}
          />
        )}

        <div className="relative">{children}</div>
      </motion.div>
    </div>
  );
}
