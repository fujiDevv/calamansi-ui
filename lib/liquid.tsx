"use client";

import { useEffect, useId, type ReactNode } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { SQUIRCLE_SMOOTHING, Squircle } from "@/lib/squircle";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE LIQUID BAR
 *
 * Two surfaces, one fuse. A seam between them is crossed by a thread of the
 * material itself — real metaball geometry, not a drawn neck: the stage is
 * blurred, that blur is pushed through a steep alpha ramp so any bleed between
 * neighbours becomes solid matter, and the crisp stage is then drawn back over
 * the top so labels and icons stay sharp.
 *
 * The surfaces are *painted*, never laid out. Each segment draws its own squircle
 * on a layer inset by two motion values, so a seam can open and shut — or seal
 * invisibly under the neighbour it is butted against — without the layout
 * moving at all. That is what lets a bar keep a fixed width while its pieces
 * pull apart.
 *
 * It is shared by `gooey-nav` and `duration-picker`; anything that needs two
 * pieces of material to pull apart and snap back can sit on it too.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** The kit's spring, damped so nothing overshoots. */
export const LIQUID_SPRING = {
  type: "spring",
  stiffness: 200,
  damping: 28,
  mass: 1,
} as const;

/**
 * Where a blurred thread gives up, as a multiple of the blur radius.
 *
 * The metaball cut keeps every pixel whose blurred alpha reaches 0.5. Two edges
 * gaussian-blurred by sigma and facing each other still overlap at 0.5 while the
 * gap is under 1.43 sigma — but a bar has a height, and a finite height starves
 * the alpha at the midline, so the thread divides early. Measured against our own
 * proportions (a bar whose half-height is 1.8 blur radii, which is what every
 * size works out to at the default viscosity), the bridge survives to 1.234 sigma
 * and then severs. It is also the moment the bead peaks, so the two stay in step
 * when either knob moves.
 */
export const LIQUID_SEVER = 1.234;

/**
 * The default blur, as a share of the gap, so the thread reads the same at every
 * size: at 0.55 the bridge lives through the first ~68% of the travel and the rest
 * of the move is a clean detach.
 */
export const LIQUID_VISCOSITY = 0.55;

/** How hard the fused edge is, on the reference's 10–30 scale. */
export const LIQUID_THRESHOLD = 19;

/**
 * The sealed extension, in corner radii.
 *
 * A squircle's corner reaches two radii along the edge on a tall shape, and less on
 * a short one — measured against figma-squircle, 56px at r=28 on a 240px-tall box but
 * only 32px at r=28 on a 64px-tall one, and 20px at r=16 on a 40px-tall bar, so
 * 1.14–1.25 radii across the kit's shapes. Two is the bound at either end of that, so
 * a neighbour whose straight body reaches that far hides the corner completely — which
 * is what lets every segment keep the brand shape while sealed seams read as one bar.
 */
export const LIQUID_SEAL = 2;

/** The bead at the moment it leaves the thread, as a share of the bar's height. */
export const BEAD_SIZE = 0.18;
/** How far past the snap it takes to dissolve, as a share of the gap. */
export const BEAD_FADE = 0.22;
/** ... never past this much of the travel, so a live bridge still ends clean. */
export const BEAD_PEAK_MAX = 0.92;

export type LiquidMetrics = {
  /** The SVG blur behind the fuse, in pixels. */
  blur: number;
  /** Where the thread severs, in pixels. */
  sever: number;
  /** The sealed extension, in pixels — also the depth of the derived swallow. */
  seal: number;
  /** How far a surface pulls back from an open seam, on each side. */
  pull: number;
};

/**
 * The numbers a seam runs on. A `gap` opens two surfaces by `pull` each, and the
 * blur is taken as a share of that gap unless it is given — so changing the travel
 * changes how far the thread reaches with it, and the two never fall out of step.
 */
export function liquidMetrics({
  gap,
  radius,
  viscosity,
}: {
  gap: number;
  radius: number;
  viscosity?: number;
}): LiquidMetrics {
  const blur = viscosity ?? gap * LIQUID_VISCOSITY;

  return {
    blur,
    sever: LIQUID_SEVER * blur,
    seal: LIQUID_SEAL * radius,
    pull: gap / 2,
  };
}

/** A filter id that is unique per instance, so two bars never share a fuse. */
export function useFuseId(prefix: string) {
  return `${prefix}-${useId().replace(/:/g, "")}`;
}

/**
 * The bead, as a share of the bar's height. Surface tension squeezes a drop out as
 * the thread thins, so it swells to full size at the sever and then dissolves — and
 * it is zero while the seam is shut and once the piece has settled, which is why it
 * never needs hiding.
 */
export function beadPercent(gap: number, sever: number, open: number) {
  if (!Number.isFinite(gap) || open <= 0) return 0;

  const travel = gap / open;
  if (travel <= 0) return 0;

  const peak = Math.min(sever / open, BEAD_PEAK_MAX);
  if (travel < peak) return BEAD_SIZE * 100 * (travel / peak) ** 1.6;

  const fade = Math.min(BEAD_FADE, 1 - peak);
  const past = (travel - peak) / fade;
  return past >= 1 ? 0 : BEAD_SIZE * 100 * (1 - past);
}

/**
 * The share of a retraction the swallow is allowed to reach over: the last quarter.
 *
 * The swallow is the part of a sealed seam's geometry that nobody can be looking at —
 * by the time a surface has travelled this far in, the two have met and the fuse has
 * already fused them — so the rule can be as blunt as "not until it is nearly home".
 */
export const SWALLOW_REACH = 0.25;

/**
 * How much of a surface's swallow has arrived, from how far it has retracted.
 *
 * 0 while the surface is still out at its seam — a gap is something to look at, and
 * the machinery that hides a sealed seam has no business moving while one is open —
 * and 1 once it is home, so a sealed seam seals exactly as deep as it always did.
 * Eased, not linear, so the swallow has no rate of its own to arrive with.
 */
export function swallowShare(retracted: number, pull: number) {
  // a seam that never opens is already sealed everywhere it can be
  if (pull <= 0) return 1;

  const reach = SWALLOW_REACH * pull;
  const s = Math.min(1, Math.max(0, (reach - retracted) / reach));
  return s * s * (3 - 2 * s);
}

/**
 * The fuse, in three steps: blur the stage so neighbouring alphas bleed into each
 * other, push that alpha through a steep ramp so the bleed becomes solid material,
 * then draw the crisp stage back over the top so labels and icons are not part of
 * the goo.
 *
 * The box is padded past the bar on the vertical axis because a blurred edge
 * spreads upward and downward as well as sideways, and a filter that clips to the
 * stage would cut the thread off at the bar's edge.
 */
export function FuseFilter({
  id,
  blur,
  threshold = LIQUID_THRESHOLD,
  region,
}: {
  id: string;
  blur: number;
  threshold?: number;
  /**
   * Where the filter is allowed to paint. The default suits a bar — a seam bleeds
   * sideways and a little past the top — while a stage that bleeds in every
   * direction, the orb, passes its own box.
   */
  region?: { x: string; y: string; width: string; height: string };
}) {
  const box = {
    x: "-8%",
    y: "-60%",
    width: "116%",
    height: "220%",
    ...region,
  };

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <defs>
        <filter
          id={id}
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={blur}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${threshold} ${-threshold / 2}`}
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export type LiquidSegmentProps = {
  /** True when the seam on that side of this segment is open. */
  seamLeft: boolean;
  seamRight: boolean;
  /** The ends of the bar never pull back: they are its silhouette. */
  atStart: boolean;
  atEnd: boolean;
  /** The brand corner, in pixels. */
  radius: number;
  /** How far a surface pulls back from an open seam, on each side. */
  pull: number;
  /**
   * The sealed extension: enough to cover a neighbour's whole corner, and the depth
   * a surface swallows once it is home. It arrives late on purpose — see
   * `swallowShare`.
   */
  seal: number;
  /** Where the thread severs, in pixels. */
  sever: number;
  /** Leave a bead of this segment's liquid at the sever. */
  bead?: boolean;
  /**
   * The bead's ink, as a class — it is painted with `currentColor`. This is the colour
   * of the material at that seam: the palette where the pill is one of the two surfaces
   * meeting there, the tray's own colour where it is not.
   */
  beadFill?: string;
  /** The surface paint. Colour only — the behaviour classes are the primitive's. */
  paint: string;
  /** Snap instead of spring, for reduced motion. */
  reduced?: boolean;
  /** The `data-slot` on the list item, so each bar stays greppable. */
  slot?: string;
  /** The `data-slot` on the bead. Defaults to `${slot}-bead`. */
  beadSlot?: string;
  children: ReactNode;
};

/**
 * One piece of the bar. Renders an `<li>` so the parent can be a plain list, and
 * paints its own surface there — the children are content, never the surface.
 */
export function LiquidSegment({
  seamLeft,
  seamRight,
  atStart,
  atEnd,
  radius,
  pull,
  seal,
  sever,
  bead = false,
  beadFill,
  paint,
  reduced = false,
  slot = "liquid-segment",
  beadSlot = `${slot}-bead`,
  children,
}: LiquidSegmentProps) {
  /*
    Only the retraction is sprung — the part of the move you can see.

    A surface has further to travel than the gap it leaves: to seal a seam it must
    also swallow itself `seal` deep under its neighbour, so the neighbour's corner is
    covered and the bar reads as one piece. While both rode one spring, which is how
    this started, that swallow owned five sixths of the travel — so a re-merge crossed
    its whole visible gap in the spring's first frames, where a spring is moving
    fastest, and the thread was there and gone before the eye had it. Measured on the
    bar, the neck lived 25ms shutting against 120ms opening: the separation read as
    liquid and the re-merge read as a snap.

    With the swallow out of the spring, both directions move the same distance through
    the same curve, so they are one move played backwards.
  */
  const retractLeft = useSpring(!atStart && seamLeft ? pull : 0, LIQUID_SPRING);
  const retractRight = useSpring(!atEnd && seamRight ? pull : 0, LIQUID_SPRING);

  useEffect(() => {
    const to = {
      left: !atStart && seamLeft ? pull : 0,
      right: !atEnd && seamRight ? pull : 0,
    };

    if (reduced) {
      retractLeft.jump(to.left);
      retractRight.jump(to.right);
    } else {
      retractLeft.set(to.left);
      retractRight.set(to.right);
    }
  }, [
    atStart,
    atEnd,
    seamLeft,
    seamRight,
    pull,
    reduced,
    retractLeft,
    retractRight,
  ]);

  /*
    The swallow is derived from the retraction rather than sprung beside it: it waits
    for the retraction to come home and then eases in. Nothing is lost by the wait — a
    swallow is the one move nobody can be watching, since the fuse has fused the two
    surfaces long before it starts — and the wait is the whole point: it keeps the
    travel the eye reads free of the travel it cannot.
  */
  const left = useTransform(() => {
    const retracted = retractLeft.get();
    return retracted - (atStart ? 0 : seal * swallowShare(retracted, pull));
  });
  const right = useTransform(() => {
    const retracted = retractRight.get();
    return retracted - (atEnd ? 0 : seal * swallowShare(retracted, pull));
  });

  /*
    Content rides with the shape — but only a retraction moves the visible edge. A
    sealed extension is inside the continuous bar, so it counts for nothing. Keeping
    the two in step is what stops a label or a field from reading off-centre in the
    pieces either side of a seam.
  */
  const shift = useTransform(
    () => (Math.max(0, left.get()) - Math.max(0, right.get())) / 2,
  );

  /*
    Both sides of a seam are driven by the same spring from the same condition, so
    they are always equal — which makes this side's pull exactly half the gap, and
    the bead can be sized from this segment alone.
  */
  const beadHeight = useTransform(
    () => `${beadPercent(left.get() * 2, sever, pull * 2)}%`,
  );

  return (
    <li data-slot={slot} className="relative flex">
      {/*
        The surface is painted, not laid out. That is the whole trick: the content
        never moves and the bar never changes width, so the seams can open and shut
        without the layout twitching — and the sealed extension is invisible,
        because the neighbour is drawn over it.
      */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 block"
        style={{ left, right }}
      >
        <Squircle
          radius={radius}
          /* the kit's curve, stated: the corner is the brand shape, not a radius */
          smoothing={SQUIRCLE_SMOOTHING}
          /* the fuse blurs whatever the stage paints, so the surfaces stay flat */
          lift={false}
          className={cn("transition-colors duration-300 ease-out", paint)}
        />
      </motion.span>

      {/* crisp source, so the bead survives the fuse the stage is running */}
      {bead && !atStart && (
        <motion.span
          aria-hidden="true"
          data-slot={beadSlot}
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current",
            beadFill,
          )}
          style={{ left: 0, height: beadHeight, aspectRatio: 1 }}
        />
      )}

      {/*
        The content is lifted above the surfaces — its own and every neighbour's.
        A sealed neighbour extends two radii under this segment, which is how the
        seam disappears, and surfaces paint in DOM order: with the content in that
        same layer, the later sibling's surface covered the first few characters of
        the earlier one's label. Only the content is lifted, so the surfaces still
        paint over each other in order, which is what keeps sealed seams seamless.
      */}
      <motion.div className="relative z-10 flex" style={{ x: shift }}>
        {children}
      </motion.div>
    </li>
  );
}
