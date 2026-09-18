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
import { Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

export type TiltCardVariant = "white" | "calamansi" | "slate" | "citrus";

/**
 * The Calamansi surface: one flat layer, clipped to a squircle by `Squircle`,
 * with the content sitting straight on the palette.
 *
 * `calamansi` is the default. `white` is the other end of the range — the only
 * palette that has to read on a light page: white in light mode, near-black in
 * dark. Each palette carries the ink that sits on it, and everything inside tints
 * from `currentColor`.
 */
const SURFACE = [
  "relative flex flex-col p-5 font-runde select-none",
  "sm:p-6",
].join(" ");

const VARIANTS: Record<TiltCardVariant, { paint: string; ink: string }> = {
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

/** The content layer above the surface. */
const CONTENT = "relative z-10 flex flex-1 flex-col";

export type TiltCardProps = {
  children?: ReactNode;
  className?: string;
  /** Title shown inside the card. */
  title?: ReactNode;
  /** Subtitle or detail label shown under the title. */
  subtitle?: ReactNode;
  /** Icon displayed in the header beside the title. */
  icon?: ReactNode;
  /** Badge or small element placed at the top-right of the card. */
  badge?: ReactNode;
  /** Custom header element replacing the default top title/icon row. */
  header?: ReactNode;
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
  /** Surface palette. Default: "calamansi" */
  variant?: TiltCardVariant;
};

/**
 * A Calamansi surface card that leans towards the pointer through 3D spring
 * physics, with a specular sheen tracking it. The sheen stays white — it is a
 * highlight, so it reads on the tinted palettes and on white in dark mode.
 */
export function TiltCard({
  children,
  className,
  title,
  subtitle,
  icon,
  badge,
  header,
  maxTilt = 12,
  hoverScale = 1.02,
  glare = true,
  stiffness = 220,
  damping = 18,
  variant = "calamansi",
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
  const glareBackground = useMotionTemplate`radial-gradient(320px circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35), transparent 65%)`;

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

  const hasTopHeader = Boolean(header || title || icon || subtitle || badge);

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={reset}
      style={{ perspective: 1500 }}
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
        className={cn(SURFACE, VARIANTS[variant].ink, className)}
      >
        <Squircle className={VARIANTS[variant].paint}>
          {glare && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0"
              style={{ background: glareBackground }}
            />
          )}
        </Squircle>

        <div className={CONTENT}>
          {hasTopHeader && (
            <div className="mb-4 flex items-start justify-between gap-3">
              {header ? (
                header
              ) : (
                <div className="flex items-center gap-3 min-w-0">
                  {icon && (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-current/15 text-current ring-1 ring-current/20">
                      {icon}
                    </span>
                  )}
                  {(title || subtitle) && (
                    <div className="min-w-0">
                      {title && (
                        <h3 className="truncate font-runde text-lg font-bold tracking-tight">
                          {title}
                        </h3>
                      )}
                      {subtitle && (
                        <p className="truncate text-xs font-medium text-current/70">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {badge && <div className="shrink-0">{badge}</div>}
            </div>
          )}

          {children}
        </div>
      </motion.div>
    </div>
  );
}
