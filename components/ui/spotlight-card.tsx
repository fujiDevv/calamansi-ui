"use client";

import {
  useId,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/** Theme-aware default: glowing white light on the glass surface. */
const PRIMARY_GLOW = "rgba(255, 255, 255, 0.75)";

export type SpotlightCardVariant = "calamansi" | "slate" | "citrus";

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

const VARIANTS: Record<SpotlightCardVariant, string> = {
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

export type SpotlightCardProps = {
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
  /** Radius of the glow, in pixels. */
  radius?: number;
  /** Any CSS colour. Defaults to a crisp white light. */
  color?: string;
  /** Draw a lit border where the pointer is. */
  border?: boolean;
  /** Palette of the Calamansi gradient slab. Default: "calamansi" */
  variant?: SpotlightCardVariant;
};

/**
 * A Calamansi surface card designed exactly after the NumberTicker slab,
 * featuring fractal grain noise and a glowing border tracking the pointer along the glass window.
 */
export function SpotlightCard({
  children,
  className,
  title,
  subtitle,
  icon,
  badge,
  header,
  radius = 360,
  color = PRIMARY_GLOW,
  border = true,
  variant = "calamansi",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const filterId = `spotlight-grain-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  const track = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  };

  const hasTopHeader = Boolean(header || title || icon || subtitle || badge);

  return (
    <div
      ref={ref}
      onPointerMove={track}
      onPointerEnter={(event) => {
        track(event);
        ref.current?.style.setProperty("--spotlight-opacity", "1");
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--spotlight-opacity", "0");
      }}
      style={
        {
          "--spotlight-x": "50%",
          "--spotlight-y": "50%",
          "--spotlight-radius": `${radius}px`,
          "--spotlight-color": color,
          "--spotlight-opacity": "0",
          ...SHELL_SHADOW,
        } as CSSProperties
      }
      className={cn(SHELL, VARIANTS[variant], className)}
    >
      <Grain id={filterId} />

      <div className={WINDOW}>
        {border && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-[var(--spotlight-opacity)] transition-opacity duration-300 ease-out dark:hidden"
            style={{
              background:
                "radial-gradient(calc(var(--spotlight-radius) * 0.5) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 65%)",
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
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
    </div>
  );
}
