"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { FuseFilter, LIQUID_THRESHOLD, useFuseId } from "@/lib/liquid";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LIQUID ORB
 *
 * One core and a ring of satellites, all of them plain circles — and the same
 * metaball fuse the Gooey nav and the Duration picker run: the stage is blurred,
 * that blur is pushed through a steep alpha ramp so any bleed between the circles
 * becomes solid material, and the crisp shapes are drawn back over the top. What
 * lands on screen is a single soft body whose lobes are joined by necks, and the
 * motion is what that body does with them: it breathes, it ripples, it churns and
 * throws off droplets that fall back in.
 *
 * The satellite geometry is the whole animation, so it is a plain request-animation
 * loop writing transforms — no canvas, no re-render per frame, and nothing to read
 * back off the DOM. A lobe's colour is `currentColor`, so the palette and the theme
 * both come for free.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type MatrixOrbState = "idle" | "listening" | "thinking";
export type MatrixOrbVariant = "white" | "calamansi" | "slate" | "citrus";

export type MatrixOrbProps = ComponentProps<"div"> & {
  /** What the orb is doing. Each state moves the body differently. Default: "idle" */
  state?: MatrixOrbState;
  /** Drive the amplitude yourself, 0 to 1 — an audio level, for instance. */
  level?: number;
  /** Width and height of the stage, in pixels. Default: 240 */
  size?: number;
  /** Body colour, overriding the palette's ink. */
  color?: string;
  /**
   * Satellites around the core, 2 to 10. More of them means a busier body and
   * shorter necks between the lobes. Default: 5
   */
  lobes?: number;
  /** Caption under the orb, per state. */
  labels?: Partial<Record<MatrixOrbState, string>>;
  /**
   * Show that caption. Default: true — turn it off when the orb is a small
   * decorative indicator rather than a status the reader is reading.
   */
  caption?: boolean;
  /** Ink the body is painted in. Default: "calamansi" */
  variant?: MatrixOrbVariant;
  /** Run the fuse at all. Off, the circles simply overlap. Default: true */
  gooey?: boolean;
  /**
   * The blur behind the fuse, in pixels — how far a lobe reaches for its neighbour
   * before the neck between them severs. Defaults to 0.078 of the stage, so the body
   * reads the same at every size.
   */
  viscosity?: number;
  /**
   * The alpha ramp's slope: how hard the fused edge is, and so how much a lobe
   * stretches before it parts. Default: 19
   */
  threshold?: number;
};

const TAU = Math.PI * 2;
const STATES: MatrixOrbState[] = ["idle", "listening", "thinking"];

const LABELS: Record<MatrixOrbState, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
};

/**
 * How big the body stands in each state, sprung rather than switched, so a change
 * of state lands rather than snaps.
 */
const SCALE: Record<MatrixOrbState, number> = {
  idle: 0.88,
  listening: 1,
  thinking: 0.92,
};

const STIFFNESS = 180;
const DAMPING = 26;
/** An amplitude on its way up arrives faster than it leaves. */
const ATTACK = 0.22;
const RELEASE = 0.08;
/** How fast a state's geometry fades in, which is what makes an interruption smooth. */
const BLEND = 0.16;

/**
 * The body, in shares of the stage: a core, and satellites whose radius and orbit
 * leave the neck between them as thick as a few pixels of blur. Those two numbers
 * are what the states push around — pull the orbit in and the lobes swallow each
 * other into a ball, push it out past the sever and they come off as droplets.
 */
const CORE = 0.155;
const SATELLITE = 0.1;
const ORBIT = 0.26;

/**
 * The blur, as a share of the stage, when the caller does not name one.
 *
 * A neck dies once the gap it spans passes ~1.35σ — the alpha ramp cuts at 0.5, and
 * that is where the blurred alphas between two circles stop reaching it. At the
 * geometry above, a satellite sits 0.005 of the stage off the core, so the lobes are
 * always joined to the body; it is the neighbours that move. At the default five the
 * gap between them is 0.106, so 0.078 puts them just touching — one silhouette with a
 * dip between the lobes rather than a pinwheel of separate drops. Fewer lobes pull
 * further apart (at three the bumps only meet at the core) and more of them close into
 * a ring, which is what `lobes` tunes its name to.
 */
const VISCOSITY_RATIO = 0.078;

const MIN_LOBES = 2;
const MAX_LOBES = 10;
const DEFAULT_LOBES = 5;

const ACCENTS: Record<MatrixOrbVariant, string> = {
  white: "text-foreground",
  calamansi: "text-[#b4e84c]",
  slate: "text-[#d8dcff]",
  citrus: "text-[#ffd166]",
};

const SURFACE =
  "relative inline-flex flex-col items-center font-runde select-none";

/** The state caption, wearing the kit's chip treatment. */
const CAPTION =
  "rounded-full bg-current/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase ring-1 ring-current/20";

/** The fuse blurs whatever the stage paints, so the circles have to stay crisp. */
const STAGE = "relative block";
const LOBE = "absolute top-0 left-0 rounded-full bg-current";

/** How far outside the stage the fuse is allowed to paint. */
const FUSE_REGION = { x: "-30%", y: "-30%", width: "160%", height: "160%" };

// no Math.abs here, its corners read as a snap at every trough
function envelope(t: number) {
  const slow = 0.5 + 0.5 * Math.sin(t * 0.62 + 0.4);
  const fast = 0.5 + 0.5 * Math.sin(t * 1.9 + 1.1);
  return 0.22 + 0.78 * (0.45 + 0.55 * slow) * fast;
}

/** Where a satellite sits around the core, and how fat it is, in stage shares. */
function satelliteAt(
  state: MatrixOrbState,
  index: number,
  count: number,
  t: number,
  amplitude: number,
) {
  if (state === "listening") {
    // a ripple leaving the core, travelling around the ring; the level is how far
    // it pushes, and at the top of the range a lobe comes off the body entirely
    const wave = 0.5 + 0.5 * Math.sin(t * 3.2 - index * 1.15);
    const push = amplitude * wave;
    return {
      orbit: ORBIT * (0.85 + 0.75 * push),
      radius: SATELLITE * (0.9 + 0.3 * wave),
    };
  }

  if (state === "thinking") {
    // each lobe runs on its own clock, so they lap each other: a neck stretches,
    // parts, and closes again as the next one comes round
    const i = index / Math.max(1, count - 1);
    return {
      orbit: ORBIT * (0.78 + 0.42 * Math.sin(t * 1.6 + i * 5.2)),
      radius: SATELLITE * (0.85 + 0.28 * Math.sin(t * 2.1 + i * 3.4)),
    };
  }

  return {
    orbit: ORBIT * (1 + 0.07 * Math.sin(t * 0.85 + index * 1.3)),
    radius: SATELLITE * (1 + 0.1 * Math.sin(t * 0.62 + index * 1.9)),
  };
}

function satelliteAngle(
  state: MatrixOrbState,
  index: number,
  count: number,
  t: number,
) {
  const base = (index / count) * TAU;

  if (state === "listening") return base + t * 0.35;
  // different speeds are what makes the lobes lap one another
  if (state === "thinking") {
    return base + t * (2.2 + 0.35 * Math.sin(index * 2.1));
  }

  return base + t * 0.22;
}

function coreAt(state: MatrixOrbState, t: number, amplitude: number) {
  if (state === "listening") return CORE * (0.95 + 0.12 * amplitude);
  if (state === "thinking") return CORE * (0.85 + 0.1 * Math.sin(t * 1.4));
  return CORE * (1 + 0.05 * Math.sin(t * 0.5));
}

type Weights = Record<MatrixOrbState, number>;

/** Every state's weight on one state, for the frames drawn before the loop runs. */
function soleWeights(state: MatrixOrbState): Weights {
  return {
    idle: state === "idle" ? 1 : 0,
    listening: state === "listening" ? 1 : 0,
    thinking: state === "thinking" ? 1 : 0,
  };
}

type Lobe = {
  /** Centre, in pixels from the stage's top-left corner. */
  x: number;
  y: number;
  /** Radius, in pixels. */
  r: number;
};

/**
 * The body at one instant, as circles to draw: the core first, then the ring of
 * satellites. Taking the state weights rather than a state is what lets an
 * interrupted change blend — the same call serves the loop and a still frame.
 */
function bodyAt(
  weights: Weights,
  satellites: number,
  t: number,
  amplitude: number,
  scale: number,
  size: number,
): Lobe[] {
  // the level also swells the whole body, so a louder signal is a bigger one
  const gain = (0.9 + 0.2 * amplitude) * scale;
  const centre = size / 2;
  let core = 0;
  for (const s of STATES) core += weights[s] * coreAt(s, t, amplitude);

  const body: Lobe[] = [{ x: centre, y: centre, r: core * size * gain }];

  for (let i = 0; i < satellites; i++) {
    let ox = 0;
    let oy = 0;
    let radius = 0;

    for (const s of STATES) {
      const w = weights[s];
      if (w < 0.001) continue;
      const { orbit, radius: r } = satelliteAt(s, i, satellites, t, amplitude);
      const angle = satelliteAngle(s, i, satellites, t);
      ox += w * Math.cos(angle) * orbit;
      oy += w * Math.sin(angle) * orbit;
      radius += w * r;
    }

    body.push({
      x: centre + ox * size * gain,
      y: centre + oy * size * gain,
      r: radius * size * gain,
    });
  }

  return body;
}

const MatrixOrb = ({
  state = "idle",
  level,
  size = 240,
  color,
  lobes = DEFAULT_LOBES,
  labels,
  caption = true,
  variant = "calamansi",
  gooey = true,
  viscosity,
  threshold = LIQUID_THRESHOLD,
  className,
  style,
  ...props
}: MatrixOrbProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const lobeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef(state);
  const levelRef = useRef(level);
  const redrawRef = useRef<(() => void) | null>(null);
  const filterId = useFuseId("matrix-orb");

  const satellites = Math.min(
    MAX_LOBES,
    Math.max(MIN_LOBES, Math.round(lobes)),
  );
  const blur = viscosity ?? size * VISCOSITY_RATIO;
  const gap = Math.round(size * 0.055);

  /*
    One frame's worth of body, worked out once: it goes into the markup so the stage
    is never empty before the loop starts — which also means a reader without JS, or
    with motion turned down, sees the orb rather than a hole. The loop takes it from
    the first frame and never looks back.
  */
  const [seed] = useState(() =>
    bodyAt(soleWeights(state), satellites, 0, envelope(0), SCALE[state], size),
  );

  useEffect(() => {
    stateRef.current = state;
    levelRef.current = level;
  }, [state, level]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const nodes = lobeRefs.current.filter((node): node is HTMLSpanElement =>
      Boolean(node),
    );
    if (nodes.length === 0) return;

    const weights: Record<MatrixOrbState, number> = {
      idle: 0,
      listening: 0,
      thinking: 0,
    };
    weights[stateRef.current] = 1;

    // a non-finite level would stick in the smoother forever
    const levelAt = (t: number) => {
      const value = levelRef.current;
      return value === undefined || !Number.isFinite(value)
        ? envelope(t)
        : Math.min(1, Math.max(0, value));
    };

    const place = (
      node: HTMLSpanElement,
      x: number,
      y: number,
      radius: number,
    ) => {
      const d = radius * 2;
      node.style.width = `${d}px`;
      node.style.height = `${d}px`;
      node.style.transform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
    };

    const draw = (t: number, amplitude: number, scale: number) => {
      const body = bodyAt(weights, satellites, t, amplitude, scale, size);
      for (let i = 0; i < body.length; i++) {
        const { x, y, r } = body[i];
        place(nodes[i], x, y, r);
      }
    };

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      // one frozen frame of the current state, and a fresh one whenever it changes
      redrawRef.current = () => {
        const current = stateRef.current;
        for (const s of STATES) weights[s] = s === current ? 1 : 0;
        draw(0, levelAt(0), SCALE[current]);
      };
      redrawRef.current();
      return () => {
        redrawRef.current = null;
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

    return () => cancelAnimationFrame(raf);
    // state and level stay out of the deps on purpose: the loop retargets, it never
    // restarts — and the geometry is in stage shares, so the size is in the deps
  }, [size, satellites]);

  useEffect(() => {
    redrawRef.current?.();
  }, [state, level]);

  return (
    <div
      data-slot="matrix-orb"
      data-state={state}
      style={{ gap, ...style }}
      className={cn(SURFACE, ACCENTS[variant], className)}
      {...props}
    >
      <FuseFilter
        id={filterId}
        blur={blur}
        threshold={threshold}
        region={FUSE_REGION}
      />

      <div
        ref={stageRef}
        aria-hidden="true"
        className={STAGE}
        style={{
          width: size,
          height: size,
          color,
          filter: gooey ? `url(#${filterId})` : undefined,
        }}
      >
        {Array.from({ length: satellites + 1 }, (_, index) => {
          // the seed is only a first paint; from the first frame the loop owns this
          const lobe = seed[index];

          return (
            <span
              key={index}
              ref={(node) => {
                lobeRefs.current[index] = node;
              }}
              className={LOBE}
              style={
                lobe
                  ? {
                      width: lobe.r * 2,
                      height: lobe.r * 2,
                      transform: `translate3d(${lobe.x - lobe.r}px, ${lobe.y - lobe.r}px, 0)`,
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      {caption && (
        <span role="status" aria-live="polite" className={CAPTION}>
          {labels?.[state] ?? LABELS[state]}
        </span>
      )}
    </div>
  );
};

export { MatrixOrb };
export default MatrixOrb;
