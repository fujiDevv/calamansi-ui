"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export type CalamansiMood = "happy" | "love" | "sleepy" | "tart";

/**
 * `textured` (the default) lights the rind: fractal noise drives two lighting
 * passes, so the peel has pores and slow waxy undulation instead of a flat grain
 * stamped over it, with a tight specular core, a directional bevel and a grounding
 * shadow underneath. `plain` is the flat, minimal take on the same fruit.
 */
export type CalamansiTexture = "textured" | "plain";
export type CalamansiVariant = "default" | "primary" | "citrus" | "slate";

export type CalamansiProps = {
  className?: string;
  size?: number;
  variant?: CalamansiVariant;
  texture?: CalamansiTexture;
  mood?: CalamansiMood;
  interactive?: boolean;
  followCursor?: boolean;
  pressable?: boolean;
  /** Optional title displayed in a vertical flex stack */
  title?: ReactNode;
  /** Optional description text displayed below the title */
  description?: ReactNode;
};

/**
 * All mascot art lives in a 612x612 coordinate space. The eye rects, the tart
 * mark transform and the pointer math below are all expressed in those units,
 * so the body shape can be replaced without touching the interaction code.
 */
export const CALAMANSI_VIEWBOX = "0 0 612 612";

/** A round calamansi with a soft navel dimple at the base. */
export const CALAMANSI_BODY_PATH =
  "M306 104c94 0 166 52 196 122 32 74 26 164-24 220-40 44-106 74-148 68-12-2-19-11-24-18-5 7-12 16-24 18-42 6-108-24-148-68-50-56-56-146-24-220 30-70 102-122 196-122Z";

/** The stem sprouting from the top of the fruit. */
export const CALAMANSI_STEM_PATH = "M298 112c0-26 2-46 8-60 6 14 8 34 8 60Z";

/** The single leaf angled up and to the right. */
export const CALAMANSI_LEAF_PATH =
  "M312 66c32-44 98-64 156-52-8 52-68 88-130 80-14-2-24-14-26-28Z";

/**
 * The dimples the light catches along the lower flanks. They follow the curve of
 * the sphere where it turns away from the light — soft, and few, so the rind reads
 * as porous rather than speckled.
 */
const PEEL_DIMPLES: [number, number, number][] = [
  [178, 384, 7],
  [206, 424, 6],
  [238, 454, 7],
  [276, 470, 6],
  [312, 476, 7],
  [350, 466, 6],
  [386, 448, 7],
  [416, 414, 6],
  [440, 374, 7],
  [162, 332, 6],
  [454, 318, 6],
  [200, 446, 5],
];

const bodyStyle = {
  transformBox: "view-box",
  transformOrigin: "306px 518px",
} satisfies CSSProperties;

const eyeData = {
  left: {
    height: 103.245,
    rx: 27.295,
    y: 254.878,
  },
  right: {
    height: 103.245,
    rx: 27.295,
    y: 254.878,
  },
};

const TAP_WINDOW_MS = 2500;
const TART_TAP_THRESHOLD = 5;
const TART_COOLDOWN_MS = 5000;
const PAT_WINDOW_MS = 1100;
const PAT_MOVE_THRESHOLD_PX = 14;
const PAT_DIRECTION_CHANGES = 3;
const BLUSH_COOLDOWN_MS = 5000;

type PatGesture = {
  startTime: number;
  lastX: number;
  lastDirection: -1 | 0 | 1;
  directionChanges: number;
};

const LEAF_FALLBACK = "oklch(0.62 0.16 145)";
const BLUSH_FALLBACK = "oklch(0.78 0.15 15)";

/**
 * Static, monochrome-friendly mark. Use it for logos and favicons; use
 * `Calamansi` when you want the living, interactive fruit.
 */
export function CalamansiMark({
  className,
  size = 32,
  title,
}: {
  className?: string;
  size?: number;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const filterId = `${uid}-calamansi-mark`;

  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
      height={size}
      role={title ? "img" : undefined}
      viewBox={CALAMANSI_VIEWBOX}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feOffset dy="4" in="SourceAlpha" result="offset" />
          <feGaussianBlur stdDeviation="4" in="offset" result="blur" />
          <feComposite
            in="SourceAlpha"
            in2="blur"
            operator="out"
            result="inner"
          />
          <feFlood floodColor="white" floodOpacity="1" result="color" />
          <feComposite in="color" in2="inner" operator="in" result="shadow" />
          <feComposite in="shadow" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>

      <path
        d={CALAMANSI_STEM_PATH}
        fill={`var(--calamansi-leaf, ${LEAF_FALLBACK})`}
      />
      <path
        d={CALAMANSI_LEAF_PATH}
        fill={`var(--calamansi-leaf, ${LEAF_FALLBACK})`}
      />
      <path
        d={CALAMANSI_BODY_PATH}
        fill="var(--primary)"
        filter={`url(#${filterId})`}
      />
      <rect
        x="201.569"
        y="254.878"
        width="54.589"
        height="103.245"
        rx="27.295"
        fill="var(--primary-foreground)"
      />
      <rect
        x="355.842"
        y="254.878"
        width="54.589"
        height="103.245"
        rx="27.295"
        fill="var(--primary-foreground)"
      />
    </svg>
  );
}

export function Calamansi({
  className,
  size = 160,
  variant = "default",
  texture = "textured",
  mood = "happy",
  interactive = true,
  followCursor,
  pressable,
  title,
  description,
}: CalamansiProps) {
  const isPlain = texture === "plain";
  const shouldFollowCursor = followCursor ?? interactive;
  const shouldPress = pressable ?? interactive;
  const shadowId = useId().replace(/:/g, "");
  const clipId = `${shadowId}-body-clip`;
  const blurId = `${shadowId}-inner-shadow-blur`;
  const mainGlowId = `${shadowId}-main-glow`;
  const rimGlowId = `${shadowId}-rim-glow`;
  const peelHighlightId = `${shadowId}-peel-highlight`;
  const peelShadowId = `${shadowId}-peel-shadow`;
  const mottleId = `${shadowId}-wax-mottle`;
  const softenId = `${shadowId}-soften`;
  const contactId = `${shadowId}-grounding`;
  const depthGradientId = `${shadowId}-citrus-depth`;
  const sunSheenId = `${shadowId}-sun-sheen`;
  const dimpleGradientId = `${shadowId}-dimple-depth`;
  const leafShadeId = `${shadowId}-leaf-shade`;
  const stemShadeId = `${shadowId}-stem-shade`;

  const isPrimary = variant === "primary";
  const isCitrus = variant === "citrus";
  const isSlate = variant === "slate";

  let bodyFill = "currentColor";
  let leafFill = "currentColor";
  let eyeFill = "var(--background)";
  const blushFill = `var(--calamansi-blush, ${BLUSH_FALLBACK})`;

  if (isPrimary) {
    bodyFill = "var(--primary)";
    leafFill = `var(--calamansi-leaf, ${LEAF_FALLBACK})`;
    eyeFill = "var(--primary-foreground)";
  } else if (isCitrus) {
    bodyFill = "#f59e0b";
    leafFill = "#16a34a";
    eyeFill = "#1f2937";
  } else if (isSlate) {
    bodyFill = "#94a3b8";
    leafFill = "#475569";
    eyeFill = "#0f172a";
  }
  const fruitRef = useRef<SVGSVGElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const tartMarkRef = useRef<SVGGElement>(null);
  const blushRef = useRef<SVGPathElement>(null);
  const leftEyeRef = useRef<SVGRectElement>(null);
  const rightEyeRef = useRef<SVGRectElement>(null);
  const activeTweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(
    null,
  );
  const lookTweenRef = useRef<gsap.core.Timeline | null>(null);
  const followTweenRef = useRef<gsap.core.Tween | null>(null);
  const tartMarkTweenRef = useRef<gsap.core.Tween | null>(null);
  const blushTweenRef = useRef<gsap.core.Tween | null>(null);
  const blinkTweensRef = useRef<Set<gsap.core.Timeline>>(new Set());
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkStaggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const lookTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tartTweenRef = useRef<gsap.core.Tween | null>(null);
  const patGestureRef = useRef<PatGesture | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const scheduleBlinkRef = useRef<(() => void) | null>(null);
  const reduceMotionRef = useRef(false);
  const isPressedRef = useRef(false);
  const isTartRef = useRef(false);
  const isHoveringRef = useRef(false);
  const hasPointerRef = useRef(false);

  useEffect(() => {
    const fruit = fruitRef.current;
    const eyes = eyesRef.current;
    const tartMark = tartMarkRef.current;
    const blush = blushRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!fruit || !eyes || !tartMark || !blush || !leftEye || !rightEye) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reduceMotionRef.current = reduceMotion;

    gsap.set([eyes, leftEye, rightEye], { transformOrigin: "50% 50%" });
    gsap.set(tartMark, {
      opacity: 0,
      scale: 0.72,
      transformOrigin: "50% 50%",
    });
    gsap.set(blush, {
      opacity: 0,
      scale: 0.9,
      transformOrigin: "50% 50%",
    });

    const blinkEye = (
      eye: SVGRectElement,
      data: { height: number; rx: number; y: number },
    ) => {
      if (isPressedRef.current || isTartRef.current) return;

      const tween = gsap
        .timeline({
          onComplete: () => blinkTweensRef.current.delete(tween),
        })
        .to(eye, {
          attr: {
            height: 0,
            rx: 0,
            y: data.y + data.height / 2,
          },
          duration: 0.1,
          ease: "power2.in",
          overwrite: "auto",
        })
        .to(eye, {
          attr: {
            height: data.height,
            rx: data.rx,
            y: data.y,
          },
          duration: 0.16,
          ease: "power2.out",
          overwrite: "auto",
        });

      blinkTweensRef.current.add(tween);
    };

    const scheduleBlink = () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);

      blinkTimerRef.current = setTimeout(
        () => {
          if (isPressedRef.current || isTartRef.current) {
            scheduleBlink();
            return;
          }

          const isLeftFirst = Math.random() > 0.5;
          blinkEye(isLeftFirst ? leftEye : rightEye, eyeData.left);

          blinkStaggerTimerRef.current = setTimeout(
            () => {
              blinkEye(isLeftFirst ? rightEye : leftEye, eyeData.right);
            },
            gsap.utils.random(45, 85),
          );

          scheduleBlink();
        },
        gsap.utils.random(1800, 5000),
      );
    };

    scheduleBlinkRef.current = scheduleBlink;

    const followPointer = (event: PointerEvent) => {
      hasPointerRef.current = true;
      lookTweenRef.current?.kill();
      lookTweenRef.current = null;

      if (lookTimerRef.current) clearTimeout(lookTimerRef.current);

      const rect = fruit.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const localX = (event.clientX - rect.left) * (612 / rect.width);
      const localY = (event.clientY - rect.top) * (612 / rect.height);
      const dx = localX - 306;
      const dy = localY - 306;
      const distance = isHoveringRef.current ? 0.28 : 0.16;

      followTweenRef.current = gsap.to(eyes, {
        duration: isHoveringRef.current ? 0.34 : 0.5,
        ease: "power3.out",
        overwrite: "auto",
        x: gsap.utils.clamp(-70, 70, dx * distance),
        y: gsap.utils.clamp(-40, 40, dy * distance),
      });
    };

    const stopAnimation = () => {
      activeTweenRef.current?.kill();
      activeTweenRef.current = null;
    };

    const scheduleLook = () => {
      if (lookTimerRef.current) clearTimeout(lookTimerRef.current);

      lookTimerRef.current = setTimeout(
        () => {
          if (isHoveringRef.current || hasPointerRef.current) return;

          lookTweenRef.current?.kill();
          lookTweenRef.current = gsap
            .timeline()
            .to(eyes, {
              duration: gsap.utils.random(0.35, 0.6),
              ease: "power2.inOut",
              x: (Math.random() > 0.5 ? 1 : -1) * gsap.utils.random(35, 60),
            })
            .to(eyes, {
              delay: gsap.utils.random(0.3, 1),
              duration: gsap.utils.random(0.4, 0.7),
              ease: "power2.inOut",
              x: 0,
            });

          scheduleLook();
        },
        gsap.utils.random(1000, 3500),
      );
    };

    if (interactive && !reduceMotion) {
      scheduleBlink();
      scheduleLook();
    }

    if (shouldFollowCursor && !reduceMotion) {
      window.addEventListener("pointermove", followPointer);
    }

    const blinkTweens = blinkTweensRef.current;
    const lookTween = lookTweenRef.current;
    const followTween = followTweenRef.current;
    const tartTween = tartTweenRef.current;
    const tartMarkTween = tartMarkTweenRef.current;
    const blushTween = blushTweenRef.current;
    const blinkTimer = blinkTimerRef.current;
    const blinkStaggerTimer = blinkStaggerTimerRef.current;
    const lookTimer = lookTimerRef.current;
    const tartTimer = tartTimerRef.current;
    const blushTimer = blushTimerRef.current;

    return () => {
      stopAnimation();
      lookTween?.kill();
      followTween?.kill();
      tartTween?.kill();
      tartMarkTween?.kill();
      blushTween?.kill();
      scheduleBlinkRef.current = null;
      blinkTweens.forEach((tween) => tween.kill());
      blinkTweens.clear();

      if (blinkTimer) clearTimeout(blinkTimer);
      if (blinkStaggerTimer) clearTimeout(blinkStaggerTimer);
      if (lookTimer) clearTimeout(lookTimer);
      if (tartTimer) clearTimeout(tartTimer);
      if (blushTimer) clearTimeout(blushTimer);

      window.removeEventListener("pointermove", followPointer);
    };
  }, [interactive, shouldFollowCursor]);

  useEffect(() => {
    if (interactive) return;

    const eyes = eyesRef.current;
    const tartMark = tartMarkRef.current;
    const blush = blushRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!eyes || !tartMark || !blush || !leftEye || !rightEye) return;

    gsap.killTweensOf([eyes, tartMark, blush, leftEye, rightEye]);
    gsap.set(eyes, { x: 0, y: 0, scale: 1 });
    gsap.set([leftEye, rightEye], {
      attr: eyeData.left,
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: "50% 50%",
    });
    gsap.set(tartMark, { opacity: 0, scale: 0.72 });
    gsap.set(blush, { opacity: 0, scale: 0.9 });

    const common = {
      duration: 0.48,
      ease: "back.out(1.8)",
      overwrite: "auto" as const,
    };

    if (mood === "happy") {
      gsap.to([leftEye, rightEye], {
        ...common,
        scaleX: 1.05,
        scaleY: 0.72,
        y: -4,
      });
    }

    if (mood === "love") {
      gsap.to([leftEye, rightEye], {
        ...common,
        scaleX: 1.08,
        scaleY: 0.36,
        y: 4,
        rotate: (index) => (index === 0 ? -8 : 8),
      });
      gsap.to(blush, {
        duration: 0.35,
        ease: "power2.out",
        opacity: 1,
        scale: 1,
      });
    }

    if (mood === "sleepy") {
      gsap.to([leftEye, rightEye], {
        ...common,
        scaleX: 1.1,
        scaleY: 0.14,
        y: 10,
      });
    }

    if (mood === "tart") {
      gsap.to([leftEye, rightEye], {
        ...common,
        scaleX: 1.24,
        scaleY: 0.3,
        y: 1,
        rotate: (index) => (index === 0 ? 13 : -13),
      });
      gsap.to(tartMark, {
        duration: 0.35,
        ease: "back.out(2)",
        opacity: 1,
        scale: 1,
      });
    }
  }, [interactive, mood]);

  const clearBlinking = () => {
    if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    if (blinkStaggerTimerRef.current)
      clearTimeout(blinkStaggerTimerRef.current);
    blinkTweensRef.current.forEach((tween) => tween.kill());
    blinkTweensRef.current.clear();
  };

  const animateTartEyes = () => {
    const tartMark = tartMarkRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    if (!leftEye || !rightEye) return;

    clearBlinking();
    gsap.set(leftEye, { attr: eyeData.left });
    gsap.set(rightEye, { attr: eyeData.right });

    tartTweenRef.current?.kill();
    tartTweenRef.current = gsap.to([leftEye, rightEye], {
      duration: 0.18,
      ease: "back.out(2.6)",
      overwrite: "auto",
      scaleX: 1.28,
      scaleY: 0.28,
      rotate: (index) => (index === 0 ? 14 : -14),
    });

    if (tartMark) {
      tartMarkTweenRef.current?.kill();
      tartMarkTweenRef.current = gsap.to(tartMark, {
        duration: 0.22,
        ease: "back.out(2.9)",
        opacity: 1,
        scale: 1,
      });
    }
  };

  const relaxTartEyes = () => {
    const tartMark = tartMarkRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    if (!leftEye || !rightEye) return;

    isTartRef.current = false;
    tartTweenRef.current?.kill();
    tartTweenRef.current = gsap.to([leftEye, rightEye], {
      duration: 0.48,
      ease: "elastic.out(1, 0.62)",
      overwrite: "auto",
      scaleX: 1,
      scaleY: 1,
      rotate: 0,
    });

    if (tartMark) {
      tartMarkTweenRef.current?.kill();
      tartMarkTweenRef.current = gsap.to(tartMark, {
        duration: 0.2,
        ease: "power2.in",
        opacity: 0,
        scale: 0.72,
      });
    }

    if (!reduceMotionRef.current) scheduleBlinkRef.current?.();
  };

  const hideBlush = () => {
    const blush = blushRef.current;

    if (blushTimerRef.current) {
      clearTimeout(blushTimerRef.current);
      blushTimerRef.current = null;
    }

    if (!blush) return;

    blushTweenRef.current?.kill();
    blushTweenRef.current = gsap.to(blush, {
      duration: 0.18,
      ease: "power2.in",
      opacity: 0,
      scale: 0.9,
    });
  };

  const clearTart = () => {
    const tartMark = tartMarkRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (tartTimerRef.current) {
      clearTimeout(tartTimerRef.current);
      tartTimerRef.current = null;
    }

    isTartRef.current = false;
    tartTweenRef.current?.kill();

    if (leftEye && rightEye) {
      gsap.to([leftEye, rightEye], {
        duration: 0.22,
        ease: "power2.out",
        overwrite: "auto",
        rotate: 0,
        scaleX: 1,
        scaleY: isPressedRef.current ? 0.35 : 1,
      });
    }

    if (tartMark) {
      tartMarkTweenRef.current?.kill();
      tartMarkTweenRef.current = gsap.to(tartMark, {
        duration: 0.16,
        ease: "power2.in",
        opacity: 0,
        scale: 0.72,
      });
    }
  };

  const triggerTart = () => {
    hideBlush();
    isTartRef.current = true;
    animateTartEyes();
    if (tartTimerRef.current) clearTimeout(tartTimerRef.current);
    tartTimerRef.current = setTimeout(() => {
      tartTimerRef.current = null;
      if (!isPressedRef.current) relaxTartEyes();
    }, TART_COOLDOWN_MS);
  };

  const trackTapRate = () => {
    const now = performance.now();
    tapTimesRef.current = [...tapTimesRef.current, now].filter(
      (tapTime) => now - tapTime <= TAP_WINDOW_MS,
    );

    if (tapTimesRef.current.length >= TART_TAP_THRESHOLD) {
      tapTimesRef.current = [];
      triggerTart();
    }
  };

  const resetPatGesture = (clientX: number) => {
    patGestureRef.current = {
      startTime: performance.now(),
      lastX: clientX,
      lastDirection: 0,
      directionChanges: 0,
    };
  };

  const showBlush = () => {
    const blush = blushRef.current;
    if (!blush) return;

    clearTart();
    blushTweenRef.current?.kill();
    blushTweenRef.current = gsap.to(blush, {
      duration: 0.24,
      ease: "back.out(2.4)",
      opacity: 1,
      scale: 1,
    });

    if (blushTimerRef.current) clearTimeout(blushTimerRef.current);
    blushTimerRef.current = setTimeout(() => {
      blushTimerRef.current = null;
      blushTweenRef.current?.kill();
      blushTweenRef.current = gsap.to(blush, {
        duration: 0.32,
        ease: "power2.inOut",
        opacity: 0,
        scale: 0.9,
      });
    }, BLUSH_COOLDOWN_MS);
  };

  const trackPat = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!isPressedRef.current) return;

    const gesture = patGestureRef.current;
    if (!gesture) {
      resetPatGesture(event.clientX);
      return;
    }

    const now = performance.now();
    if (now - gesture.startTime > PAT_WINDOW_MS) {
      resetPatGesture(event.clientX);
      return;
    }

    const deltaX = event.clientX - gesture.lastX;
    if (Math.abs(deltaX) < PAT_MOVE_THRESHOLD_PX) return;

    const direction = deltaX > 0 ? 1 : -1;
    if (gesture.lastDirection !== 0 && direction !== gesture.lastDirection) {
      gesture.directionChanges += 1;
    }

    gesture.lastDirection = direction;
    gesture.lastX = event.clientX;

    if (gesture.directionChanges >= PAT_DIRECTION_CHANGES) {
      showBlush();
      resetPatGesture(event.clientX);
    }
  };

  const stopLook = () => {
    if (lookTimerRef.current) clearTimeout(lookTimerRef.current);

    lookTweenRef.current?.kill();
    lookTweenRef.current = null;
  };

  const resumeLook = () => {
    const eyes = eyesRef.current;

    if (
      !eyes ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    lookTimerRef.current = setTimeout(
      () => {
        if (isHoveringRef.current || hasPointerRef.current) return;

        lookTweenRef.current?.kill();
        lookTweenRef.current = gsap
          .timeline()
          .to(eyes, {
            duration: gsap.utils.random(0.35, 0.6),
            ease: "power2.inOut",
            x: (Math.random() > 0.5 ? 1 : -1) * gsap.utils.random(35, 60),
          })
          .to(eyes, {
            delay: gsap.utils.random(0.3, 1),
            duration: gsap.utils.random(0.4, 0.7),
            ease: "power2.inOut",
            x: 0,
          });

        resumeLook();
      },
      gsap.utils.random(1000, 3500),
    );
  };

  const enterHover = () => {
    const eyes = eyesRef.current;

    if (!eyes) return;

    gsap.to(eyes, {
      duration: 0.3,
      ease: "back.out(1.5)",
      scale: 1.12,
    });
  };

  const leaveHover = () => {
    const eyes = eyesRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;

    if (!eyes || !leftEye || !rightEye) return;

    gsap.to(eyes, {
      duration: 0.5,
      ease: "elastic.out(1, 0.65)",
      overwrite: "auto",
      scale: 1,
      x: 0,
      y: 0,
    });

    gsap.to([leftEye, rightEye], {
      duration: 0.25,
      ease: "power2.out",
      x: 0,
    });
  };

  const press = () => {
    const fruit = fruitRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    if (!fruit || !leftEye || !rightEye) return;

    isPressedRef.current = true;
    clearBlinking();
    gsap.set(leftEye, { attr: eyeData.left });
    gsap.set(rightEye, { attr: eyeData.right });

    activeTweenRef.current?.kill();
    activeTweenRef.current = gsap.to(fruit, {
      duration: 0.18,
      ease: "power2.out",
      scaleX: 1.08,
      scaleY: 0.9,
    });

    gsap.to([leftEye, rightEye], {
      duration: 0.15,
      ease: "power2.out",
      overwrite: "auto",
      rotate: isTartRef.current ? (index) => (index === 0 ? 14 : -14) : 0,
      scaleX: isTartRef.current ? 1.28 : 1,
      scaleY: 0.35,
    });
  };

  const pressMascotOnly = () => {
    const fruit = fruitRef.current;
    if (!fruit) return;

    isPressedRef.current = true;
    activeTweenRef.current?.kill();
    activeTweenRef.current = gsap.to(fruit, {
      duration: 0.18,
      ease: "power2.out",
      scaleX: 1.08,
      scaleY: 0.9,
    });
  };

  const releaseMascotOnly = () => {
    const fruit = fruitRef.current;
    if (!fruit || !isPressedRef.current) return;

    isPressedRef.current = false;
    activeTweenRef.current?.kill();
    activeTweenRef.current = gsap
      .timeline({ onComplete: () => (activeTweenRef.current = null) })
      .to(fruit, {
        duration: 0.18,
        ease: "power2.out",
        scaleX: 0.94,
        scaleY: 1.08,
      })
      .to(fruit, {
        duration: 0.16,
        ease: "power2.out",
        scaleX: 1.045,
        scaleY: 0.97,
      })
      .to(fruit, {
        duration: 0.14,
        ease: "power2.out",
        scaleX: 0.985,
        scaleY: 1.02,
      })
      .to(fruit, {
        duration: 0.2,
        ease: "elastic.out(1, 0.5)",
        scaleX: 1,
        scaleY: 1,
      });
  };

  const release = () => {
    const fruit = fruitRef.current;
    const leftEye = leftEyeRef.current;
    const rightEye = rightEyeRef.current;
    if (!fruit || !leftEye || !rightEye || !isPressedRef.current) return;

    isPressedRef.current = false;
    patGestureRef.current = null;
    if (!reduceMotionRef.current) scheduleBlinkRef.current?.();

    activeTweenRef.current?.kill();

    if (isTartRef.current && !tartTimerRef.current) {
      relaxTartEyes();
    } else if (isTartRef.current) {
      animateTartEyes();
    } else {
      gsap.to([leftEye, rightEye], {
        duration: 0.4,
        ease: "back.out(2.5)",
        overwrite: "auto",
        rotate: 0,
        scaleX: 1,
        scaleY: 1,
      });
    }

    activeTweenRef.current = gsap
      .timeline({ onComplete: () => (activeTweenRef.current = null) })
      .to(fruit, {
        duration: 0.18,
        ease: "power2.out",
        scaleX: 0.94,
        scaleY: 1.08,
      })
      .to(fruit, {
        duration: 0.16,
        ease: "power2.out",
        scaleX: 1.045,
        scaleY: 0.97,
      })
      .to(fruit, {
        duration: 0.14,
        ease: "power2.out",
        scaleX: 0.985,
        scaleY: 1.02,
      })
      .to(fruit, {
        duration: 0.2,
        ease: "elastic.out(1, 0.5)",
        scaleX: 1,
        scaleY: 1,
      });
  };

  const svgContent = (
    <svg
      ref={fruitRef}
      aria-label="Animated Calamansi mascot"
      className={cn(
        "calamansi-mascot group touch-none select-none overflow-visible",
        shouldPress ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        !title && !description && className,
      )}
      fill="none"
      height={size}
      role="img"
      viewBox={CALAMANSI_VIEWBOX}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      onLostPointerCapture={
        shouldPress
          ? () => {
              if (!isPressedRef.current) return;
              if (interactive) release();
              else releaseMascotOnly();
            }
          : undefined
      }
      onPointerCancel={
        shouldPress ? (interactive ? release : releaseMascotOnly) : undefined
      }
      onPointerDown={
        shouldPress
          ? (event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);

              if (interactive) {
                trackTapRate();
                resetPatGesture(event.clientX);
                press();
              } else {
                pressMascotOnly();
              }
            }
          : undefined
      }
      onPointerEnter={
        interactive
          ? () => {
              isHoveringRef.current = true;
              stopLook();
              enterHover();
            }
          : undefined
      }
      onPointerLeave={
        interactive
          ? () => {
              isHoveringRef.current = false;
              patGestureRef.current = null;
              leaveHover();
              resumeLook();
            }
          : undefined
      }
      onPointerMove={interactive ? trackPat : undefined}
      onPointerUp={
        shouldPress
          ? (event) => {
              event.preventDefault();

              if (interactive) {
                patGestureRef.current = null;
                release();
              } else {
                releaseMascotOnly();
              }

              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }
          : undefined
      }
    >
      <defs>
        <clipPath id={clipId}>
          <path d={CALAMANSI_BODY_PATH} />
        </clipPath>
        <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
        {/*
          The peel is lit, not stippled. Fractal noise drives `feDiffuseLighting`
          from a distant light in the same top-left direction as the sheen, and the
          result is split into a highlight pass and a shadow pass, so the relief
          shades the flesh instead of fogging it with a flat grain overlay.
        */}
        <filter id={peelHighlightId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            baseFrequency="0.16"
            numOctaves="4"
            result="pores"
            seed="11"
            stitchTiles="stitch"
            type="fractalNoise"
          />
          <feDiffuseLighting
            diffuseConstant="1.05"
            in="pores"
            lightingColor="#ffffff"
            result="relief"
            surfaceScale="1.3"
          >
            <feDistantLight azimuth="235" elevation="52" />
          </feDiffuseLighting>
          <feColorMatrix
            in="relief"
            result="lit"
            type="matrix"
            values="0 0 0 0 1
                    0 0 0 0 1
                    0 0 0 0 1
                    2 0 0 0 -1.15"
          />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
        <filter id={peelShadowId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            baseFrequency="0.16"
            numOctaves="4"
            result="pores"
            seed="11"
            stitchTiles="stitch"
            type="fractalNoise"
          />
          <feDiffuseLighting
            diffuseConstant="1.05"
            in="pores"
            lightingColor="#ffffff"
            result="relief"
            surfaceScale="1.3"
          >
            <feDistantLight azimuth="235" elevation="52" />
          </feDiffuseLighting>
          <feColorMatrix
            in="relief"
            result="shade"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    -2 0 0 0 1.15"
          />
          <feComposite in="shade" in2="SourceAlpha" operator="in" />
        </filter>
        {/* Slow waxy undulation under the pores: the difference between a rind and a ball. */}
        <filter id={mottleId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            baseFrequency="0.008"
            numOctaves="2"
            result="mottle"
            seed="5"
            stitchTiles="stitch"
            type="fractalNoise"
          />
          <feDiffuseLighting
            diffuseConstant="1"
            in="mottle"
            lightingColor="#ffffff"
            result="undulation"
            surfaceScale="3.2"
          >
            <feDistantLight azimuth="250" elevation="45" />
          </feDiffuseLighting>
          <feColorMatrix
            in="undulation"
            type="matrix"
            values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    -2 0 0 0 1.15"
          />
          <feComposite in="undulation" in2="SourceAlpha" operator="in" />
        </filter>
        {/* Softens the dimples, and the shadows that land on the fruit. */}
        <filter id={softenId} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        {/* The pool of shade the fruit sits in. */}
        <filter id={contactId} x="-40%" y="-160%" width="180%" height="420%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        {/*
          Spherical bottom depth. Black rather than a green-tinted stop, so the
          shading follows every palette — the citrus and slate fruits were being
          shadowed with the calamansi's own greens.
        */}
        <radialGradient id={depthGradientId} cx="50%" cy="86%" r="70%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#000000" stopOpacity="0.16" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        {/* Crisp daylight sheen on top */}
        <radialGradient id={sunSheenId} cx="32%" cy="20%" r="62%">
          <stop offset="0%" stopColor="white" stopOpacity="0.48" />
          <stop offset="28%" stopColor="white" stopOpacity="0.2" />
          <stop offset="65%" stopColor="white" stopOpacity="0.04" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {/* Main diffuse light */}
        <radialGradient id={mainGlowId} cx="36%" cy="20%" r="78%">
          <stop offset="0%" stopColor="white" stopOpacity="0.32" />
          <stop offset="36%" stopColor="white" stopOpacity="0.12" />
          <stop offset="72%" stopColor="white" stopOpacity="0.02" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        {/* Ambient backlight rim */}
        <radialGradient id={rimGlowId} cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor="white" stopOpacity="0" />
          <stop offset="92%" stopColor="white" stopOpacity="0.18" />
          <stop offset="100%" stopColor="white" stopOpacity="0.32" />
        </radialGradient>
        {/* Navel dimple shadow */}
        <radialGradient id={dimpleGradientId} cx="50%" cy="100%" r="100%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        {/* Leaf and stem shading, built from black and white so it reads on every
            palette: a lit upper edge falling away into a shaded base. */}
        <linearGradient id={leafShadeId} x1="0%" y1="0%" x2="45%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={stemShadeId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <g
        className={cn(
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          (interactive || shouldFollowCursor) && "group-hover:scale-y-[1.12]",
        )}
        style={bodyStyle}
      >
        {!isPlain && (
          /* The pool of shade the fruit grounds itself with. */
          <ellipse
            cx="306"
            cy="556"
            rx="164"
            ry="26"
            fill="#000000"
            filter={`url(#${contactId})`}
            opacity="0.32"
          />
        )}

        <path
          d={CALAMANSI_STEM_PATH}
          fill={leafFill}
          stroke={leafFill}
          strokeLinejoin="round"
          strokeWidth={isPlain ? 6 : 4}
        />
        {!isPlain && (
          <>
            {/* Stem shading down its length */}
            <path d={CALAMANSI_STEM_PATH} fill={`url(#${stemShadeId})`} />
            {/* Stem woody fiber highlight */}
            <path
              d="M304 62 L304 108"
              fill="none"
              opacity="0.3"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {/* Calyx star cap where stem meets fruit */}
            <ellipse
              cx="306"
              cy="114"
              rx="14"
              ry="6"
              fill={leafFill}
              opacity="0.8"
            />
          </>
        )}

        <path
          d={CALAMANSI_LEAF_PATH}
          fill={leafFill}
          stroke={leafFill}
          strokeLinejoin="round"
          strokeWidth={isPlain ? 6 : 4}
        />
        {!isPlain && (
          /* Lit upper edge falling into a shaded base, so the blade has a surface */
          <path d={CALAMANSI_LEAF_PATH} fill={`url(#${leafShadeId})`} />
        )}
        <path
          d={CALAMANSI_LEAF_PATH}
          fill="none"
          opacity={isPlain ? 0.45 : 0.28}
          stroke={isPrimary ? "var(--calamansi-rind-deep, #86b81f)" : eyeFill}
          strokeLinecap="round"
          strokeWidth={isPlain ? 5 : 2.5}
        />
        {!isPlain && (
          /* Veins, kept faint so the blade still reads as one surface */
          <g
            opacity="0.26"
            stroke={isPrimary ? "#ffffff" : eyeFill}
            strokeLinecap="round"
          >
            {/* Main central spine */}
            <path d="M318 64 Q382 46 454 22" fill="none" strokeWidth={2} />
            {/* Upper diagonal veins */}
            <path d="M352 56 Q370 42 392 34" fill="none" strokeWidth={1.4} />
            <path d="M386 46 Q406 34 430 26" fill="none" strokeWidth={1.4} />
            {/* Lower diagonal veins */}
            <path d="M362 60 Q382 72 408 72" fill="none" strokeWidth={1.4} />
            <path d="M398 50 Q418 62 436 60" fill="none" strokeWidth={1.4} />
          </g>
        )}

        <path d={CALAMANSI_BODY_PATH} fill={bodyFill} />
        <g clipPath={`url(#${clipId})`}>
          {!isPlain && (
            <>
              {/* 1. Spherical citrus depth at base */}
              <rect
                width="612"
                height="612"
                fill={`url(#${depthGradientId})`}
              />

              {/* 2. The leaf's shadow landing on the shoulder of the fruit */}
              <path
                d={CALAMANSI_LEAF_PATH}
                fill="#000000"
                filter={`url(#${softenId})`}
                opacity="0.18"
                transform="translate(7 18)"
              />
            </>
          )}

          {/* 3. Top-left light wash */}
          <ellipse
            cx="244"
            cy="196"
            rx="232"
            ry="188"
            fill={`url(#${mainGlowId})`}
          />
          <ellipse
            cx="210"
            cy="160"
            rx="140"
            ry="100"
            fill={`url(#${sunSheenId})`}
          />

          {/* 3. Rim bounce light */}
          <ellipse
            cx="306"
            cy="320"
            rx="306"
            ry="252"
            fill={`url(#${rimGlowId})`}
            opacity={isPlain ? 0.35 : 0.6}
          />

          {!isPlain ? (
            <>
              {/* 5. Waxy undulation, then the pores — all lit from the top left */}
              <rect
                width="612"
                height="612"
                filter={`url(#${mottleId})`}
                opacity="0.16"
              />
              <rect
                width="612"
                height="612"
                filter={`url(#${peelShadowId})`}
                opacity="0.26"
              />
              <rect
                width="612"
                height="612"
                filter={`url(#${peelHighlightId})`}
                opacity="0.3"
              />

              {/* 6. Dimples the eye reads as pores, down where the sphere turns away */}
              <g fill="#000000" filter={`url(#${softenId})`} opacity="0.08">
                {PEEL_DIMPLES.map(([cx, cy, r]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
                ))}
              </g>

              {/* 7. Navel crease, with the small highlight the fold catches */}
              <ellipse
                cx="306"
                cy="498"
                rx="48"
                ry="18"
                fill={`url(#${dimpleGradientId})`}
              />
              <path
                d="M280 490c10-10 42-10 52 0"
                fill="none"
                opacity="0.16"
                stroke="#ffffff"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* 8. Specular core: the tight window reflection the wax throws back */}
              <ellipse
                cx="216"
                cy="170"
                rx="98"
                ry="64"
                fill="#ffffff"
                filter={`url(#${softenId})`}
                opacity="0.3"
              />
              <ellipse
                cx="196"
                cy="150"
                rx="46"
                ry="27"
                fill="#ffffff"
                filter={`url(#${softenId})`}
                opacity="0.34"
              />

              {/* 9. Bevel: a lit rim on the top left, a shaded rim on the bottom right */}
              <path
                d={CALAMANSI_BODY_PATH}
                fill="none"
                filter={`url(#${blurId})`}
                opacity="0.3"
                stroke="#ffffff"
                strokeWidth="24"
                transform="translate(-5 -5)"
              />
              <path
                d={CALAMANSI_BODY_PATH}
                fill="none"
                filter={`url(#${blurId})`}
                opacity="0.22"
                stroke="#000000"
                strokeWidth="24"
                transform="translate(6 6)"
              />

              {/* 10. Glossy bounce hugging the bottom edge */}
              <path
                d={CALAMANSI_BODY_PATH}
                fill="none"
                filter={`url(#${softenId})`}
                opacity="0.26"
                stroke="#ffffff"
                strokeWidth="7"
                transform="translate(0 -4)"
              />
            </>
          ) : (
            /* Inner edge bevel glow */
            <path
              d={CALAMANSI_BODY_PATH}
              fill="none"
              filter={`url(#${blurId})`}
              opacity="0.22"
              stroke="white"
              strokeWidth="26"
            />
          )}
        </g>
        <g transform="translate(424 116) scale(0.38)">
          <g
            ref={tartMarkRef}
            aria-hidden="true"
            fill="var(--destructive)"
            opacity="0"
            pointerEvents="none"
          >
            <path d="M12.97 72.225C72.246 73.8 106.759 61.286 162.243 9.5 161 69.102 72.664 125.232 12.971 72.225" />
            <path d="M183.775 12.97c-1.575 59.275 10.939 93.788 62.724 149.272C186.898 161 130.768 72.664 183.775 12.971" />
            <path d="M243.029 183.775c-59.274-1.575-93.787 10.939-149.271 62.725 1.242-59.602 89.578-115.732 149.271-62.725" />
            <path d="M72.225 243.029C73.8 183.755 61.286 149.242 9.5 93.758 69.102 95 125.232 183.336 72.225 243.029" />
          </g>
        </g>
        <path
          ref={blushRef}
          d="M142 386a36 24 0 1 0 72 0 36 24 0 1 0-72 0M398 386a36 24 0 1 0 72 0 36 24 0 1 0-72 0"
          fill={blushFill}
          opacity="0"
          pointerEvents="none"
        />
      </g>

      <g ref={eyesRef} fill={eyeFill}>
        <rect
          ref={leftEyeRef}
          x="201.569"
          y="254.878"
          width="54.589"
          height="103.245"
          rx="27.295"
        />
        <rect
          ref={rightEyeRef}
          x="355.842"
          y="254.878"
          width="54.589"
          height="103.245"
          rx="27.295"
        />
      </g>

      {!interactive && mood === "sleepy" && (
        <g fill={eyeFill} opacity="0.75">
          <text
            x="446"
            y="192"
            fontFamily="sans-serif"
            fontSize="66"
            fontWeight="700"
          >
            z
          </text>
          <text
            x="502"
            y="136"
            fontFamily="sans-serif"
            fontSize="46"
            fontWeight="700"
          >
            z
          </text>
        </g>
      )}
    </svg>
  );

  if (title || description) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 text-center",
          className,
        )}
      >
        <div className="flex flex-col items-center gap-1.5 text-center">
          {title &&
            (typeof title === "string" ? (
              <p className="font-runde text-lg font-semibold tracking-tight text-foreground">
                {title}
              </p>
            ) : (
              title
            ))}
          {description &&
            (typeof description === "string" ? (
              <p className="max-w-sm text-xs text-muted-foreground">
                {description}
              </p>
            ) : (
              description
            ))}
        </div>
        {svgContent}
      </div>
    );
  }

  return svgContent;
}

export default Calamansi;
