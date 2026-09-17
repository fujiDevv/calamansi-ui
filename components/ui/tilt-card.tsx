"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
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

export type TiltCardVariant = "calamansi" | "slate" | "citrus";

/**
 * The Calamansi surface: a gradient slab inside a thick white lip, matching
 * the number ticker and widgets.
 */
const SHELL = [
  "relative flex flex-col overflow-hidden rounded-[24px] border-[3px] border-white/80 p-2 font-runde text-white select-none",
  "dark:border-white/10",
  "sm:rounded-[28px] sm:border-4 sm:p-2.5",
].join(" ");

const SHELL_SHADOW: CSSProperties = {
  boxShadow:
    "0 18px 36px -16px rgba(0, 0, 0, 0.45), inset 0 -3px 14px 5px rgba(255, 255, 255, 0.25), inset 0 -6px 3px rgba(0, 0, 0, 0.2)",
};

const VARIANTS: Record<TiltCardVariant, string> = {
  calamansi: [
    "bg-gradient-to-br from-[#8fa37d] via-[#5c7a67] to-[#39564a]",
    "dark:from-[#1b281f] dark:via-[#16221a] dark:to-[#0e1611]",
  ].join(" "),
  slate: [
    "bg-gradient-to-br from-[#a79cb7] via-[#687396] to-[#4a5a7f]",
    "dark:from-[#1e1b4b] dark:via-[#1e293b] dark:to-[#0f172a]",
  ].join(" "),
  citrus: [
    "bg-gradient-to-br from-[#d69f7e] via-[#b87152] to-[#7d4128]",
    "dark:from-[#2e170c] dark:via-[#22120b] dark:to-[#140a06]",
  ].join(" "),
};

/** The lit window the content sits in, matching NumberTicker's glass tile. */
const WINDOW = [
  "relative z-10 flex flex-1 flex-col overflow-hidden rounded-[16px] bg-white/15 p-5 ring-1 ring-white/25 backdrop-blur-sm",
  "sm:rounded-[20px] sm:p-6",
].join(" ");

/** Fractal-noise grain — the texture the Calamansi surface carries. */
function Grain({ id }: { id: string }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full opacity-[0.16] mix-blend-overlay"
    >
      <filter id={id}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="3"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

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
  /** Palette of the Calamansi gradient slab. Default: "calamansi" */
  variant?: TiltCardVariant;
};

/**
 * A Calamansi surface card designed exactly after the NumberTicker slab,
 * featuring 3D spring tilt physics, fractal grain noise, and an interactive light sheen.
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
  const filterId = `tilt-grain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

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
            ? SHELL_SHADOW
            : { rotateX, rotateY, transformStyle: "preserve-3d", ...SHELL_SHADOW }
        }
        whileHover={reduceMotion ? undefined : { scale: hoverScale }}
        transition={{ type: "spring", stiffness, damping }}
        className={cn(SHELL, VARIANTS[variant], className)}
      >
        <Grain id={filterId} />

        <div className={WINDOW}>
          {glare && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
              style={{ background: glareBackground }}
            />
          )}

          <div className="relative z-10 flex flex-1 flex-col">
            {hasTopHeader && (
              <div className="mb-4 flex items-start justify-between gap-3">
                {header ? (
                  header
                ) : (
                  <div className="flex items-center gap-3 min-w-0">
                    {icon && (
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-xs backdrop-blur-md">
                        {icon}
                      </span>
                    )}
                    {(title || subtitle) && (
                      <div className="min-w-0">
                        {title && (
                          <h3 className="font-runde text-lg font-bold tracking-tight text-white drop-shadow-sm truncate">
                            {title}
                          </h3>
                        )}
                        {subtitle && (
                          <p className="text-xs font-medium text-white/80 truncate">
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
        </div>
      </motion.div>
    </div>
  );
}
