"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ComponentProps,
} from "react";
import { cn } from "@/lib/utils";

export type MatrixOrbState = "idle" | "listening" | "thinking";
export type MatrixOrbVariant = "white" | "calamansi" | "slate" | "citrus";

export type MatrixOrbProps = ComponentProps<"div"> & {
  /** What the orb is doing. Each state moves it differently. Default: "idle" */
  state?: MatrixOrbState;
  /** Drive the amplitude yourself, 0 to 1 — an audio level, for instance. */
  level?: number;
  /** Width and height of the dot matrix, in pixels. Default: 240 */
  size?: number;
  /** Dot colour, overriding the palette's accent. */
  color?: string;
  /** Grid resolution: higher is a finer sphere. Default: 11 */
  dots?: number;
  /** Caption under the orb, per state. */
  labels?: Partial<Record<MatrixOrbState, string>>;
  /** Accent palette the dots are painted in. Default: "calamansi" */
  variant?: MatrixOrbVariant;
};

const TAU = Math.PI * 2;
const STATES: MatrixOrbState[] = ["idle", "listening", "thinking"];

const LABELS: Record<MatrixOrbState, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
};

const SCALE: Record<MatrixOrbState, number> = {
  idle: 0.88,
  listening: 1,
  thinking: 0.92,
};

const STIFFNESS = 180;
const DAMPING = 26;
const ATTACK = 0.22;
const RELEASE = 0.08;
const BLEND = 0.16;
const BRAND_LIME = "#b4e84c";

const ORBITERS = [
  { radius: 0.62, speed: 2.2, phase: 0, spread: 0.42 },
  { radius: 0.4, speed: -1.7, phase: 2.1, spread: 0.36 },
  { radius: 0.8, speed: 1.15, phase: 4, spread: 0.34 },
];

/**
 * The orb is the dots and nothing else — no slab behind them, so it drops into a
 * chat header or a status row as it is. The palette picks the accent the dots are
 * painted in; `white` is the ink itself, read from the theme, which is the canvas
 * equivalent of painting from `currentColor`.
 */
const ACCENTS: Record<MatrixOrbVariant, string | null> = {
  white: null,
  calamansi: BRAND_LIME,
  slate: "#d8dcff",
  citrus: "#ffd166",
};

const SURFACE =
  "relative inline-flex flex-col items-center font-runde select-none";

/** The state caption, wearing the kit's chip treatment. */
const CAPTION =
  "rounded-full bg-current/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase ring-1 ring-current/20";

// no Math.abs here, its corners read as a snap at every trough
function envelope(t: number) {
  const slow = 0.5 + 0.5 * Math.sin(t * 0.62 + 0.4);
  const fast = 0.5 + 0.5 * Math.sin(t * 1.9 + 1.1);
  return 0.22 + 0.78 * (0.45 + 0.55 * slow) * fast;
}

function intensityOf(
  state: MatrixOrbState,
  d: number,
  nx: number,
  ny: number,
  t: number,
  amplitude: number,
) {
  if (state === "listening") {
    const ripple = 0.5 + 0.5 * Math.sin(d * 4.2 - t * 3);
    return 0.32 + amplitude * (0.34 + 0.38 * ripple);
  }

  if (state === "thinking") {
    let heat = 0;
    for (const o of ORBITERS) {
      const a = t * o.speed + o.phase;
      const dx = nx - Math.cos(a) * o.radius;
      const dy = ny - Math.sin(a) * o.radius;
      heat += Math.exp(-(dx * dx + dy * dy) / (o.spread * o.spread));
    }
    return 0.26 + 0.8 * Math.min(1, heat);
  }

  return 0.62 + 0.12 * Math.sin(t * 1.05 - d * 2.4);
}

function subscribeToZoom(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

// zoom changes devicePixelRatio, and a buffer built for the old one gets upscaled
function useDevicePixelRatio() {
  return useSyncExternalStore(
    subscribeToZoom,
    () => Math.min(window.devicePixelRatio || 1, 4),
    () => 1,
  );
}

const MatrixOrb = ({
  state = "idle",
  level,
  size = 240,
  color,
  dots = 11,
  labels,
  variant = "calamansi",
  className,
  style,
  ...props
}: MatrixOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const levelRef = useRef(level);
  const accentRef = useRef(color ?? ACCENTS[variant]);
  const redrawRef = useRef<(() => void) | null>(null);
  const dpr = useDevicePixelRatio();

  const accent = color ?? ACCENTS[variant];
  const gap = Math.round(size * 0.055);

  useEffect(() => {
    stateRef.current = state;
    levelRef.current = level;
    accentRef.current = accent;
  }, [state, level, accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // scaling by buffer/size, not dpr, keeps the transform exact when it rounds
    const buffer = Math.round(size * dpr);
    canvas.width = canvas.height = buffer;
    ctx.scale(buffer / size, buffer / size);

    const grid = Math.max(3, Math.round(dots));
    const half = (grid - 1) / 2;
    const spacing = (size * 0.74) / (grid - 1);
    const maxRadius = spacing * 0.6;
    const center = size / 2;

    const weights: Record<MatrixOrbState, number> = {
      idle: 0,
      listening: 0,
      thinking: 0,
    };
    weights[stateRef.current] = 1;

    // a non-finite level would stick in the smoother forever
    const levelAt = (t: number) => {
      const v = levelRef.current;
      return v === undefined || !Number.isFinite(v)
        ? envelope(t)
        : Math.min(1, Math.max(0, v));
    };

    /*
      The `white` palette is the ink, and a canvas cannot paint `currentColor` —
      so the theme's colour is read off the element, a couple of times a second
      rather than every frame, and once more whenever the theme flips.
    */
    let ink = BRAND_LIME;
    let inkAt = -Infinity;
    const dotAt = (t: number) => {
      const accent = accentRef.current;
      if (accent) return accent;
      if (t - inkAt > 0.5) {
        inkAt = t;
        ink = getComputedStyle(canvas).color || ink;
      }
      return ink;
    };

    const theme = new MutationObserver(() => {
      inkAt = -Infinity;
      redrawRef.current?.();
    });
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const draw = (t: number, amplitude: number, scale: number) => {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = dotAt(t);

      for (let iy = 0; iy < grid; iy++) {
        for (let ix = 0; ix < grid; ix++) {
          const nx = (ix - half) / half;
          const ny = (iy - half) / half;
          const d = Math.hypot(nx, ny);
          // 1.12, not the square's 1.41 corner, is what makes the outline round
          if (d > 1.12) continue;

          let blended = 0;
          for (const s of STATES) {
            if (weights[s] < 0.001) continue;
            blended += weights[s] * intensityOf(s, d, nx, ny, t, amplitude);
          }

          const intensity = Math.min(1, Math.max(0, blended));
          const radius = maxRadius * Math.exp(-d * d * 1.7) * intensity * scale;
          // anything under half a device pixel renders as haze, not a dot
          if (radius * dpr < 0.5) continue;

          ctx.beginPath();
          ctx.arc(
            center + (ix - half) * spacing * scale,
            center + (iy - half) * spacing * scale,
            radius,
            0,
            TAU,
          );
          ctx.fill();
        }
      }
    };

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      redrawRef.current = () => {
        const current = stateRef.current;
        for (const s of STATES) weights[s] = s === current ? 1 : 0;
        // a frozen frame still has to follow the theme
        inkAt = -Infinity;
        draw(0, levelAt(0), SCALE[current]);
      };
      redrawRef.current();
      return () => {
        redrawRef.current = null;
        theme.disconnect();
      };
    }

    let t = 0;
    let amplitude = 0;
    let scale = SCALE[stateRef.current];
    let velocity = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const current = stateRef.current;
      const target = levelAt(t);
      const rate = target > amplitude ? ATTACK : RELEASE;
      amplitude += (target - amplitude) * (1 - Math.pow(1 - rate, dt * 60));

      // per-state weights, so interrupting a change blends from what is on screen
      const step = 1 - Math.pow(1 - BLEND, dt * 60);
      for (const s of STATES) {
        weights[s] += ((s === current ? 1 : 0) - weights[s]) * step;
      }

      velocity +=
        (-STIFFNESS * (scale - SCALE[current]) - DAMPING * velocity) * dt;
      scale += velocity * dt;

      draw(t, amplitude, scale);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      theme.disconnect();
    };
    // state, level and colour stay out of the deps on purpose: the loop retargets,
    // it never restarts
  }, [size, dots, dpr]);

  useEffect(() => {
    redrawRef.current?.();
  }, [state, level, accent]);

  return (
    <div
      data-slot="matrix-orb"
      data-state={state}
      style={{ gap, ...style }}
      className={cn(SURFACE, className)}
      {...props}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="block"
        style={{ width: size, height: size }}
      />

      <span role="status" aria-live="polite" className={CAPTION}>
        {labels?.[state] ?? LABELS[state]}
      </span>
    </div>
  );
};

export { MatrixOrb };
export default MatrixOrb;
