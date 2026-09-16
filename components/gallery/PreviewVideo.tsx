"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export default function PreviewVideo({
  src,
  playing = false,
  autoPlay = false,
}: {
  src: string;
  playing?: boolean;
  autoPlay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion || !autoPlay) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [autoPlay, reduceMotion]);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduceMotion || autoPlay) return;

    if (playing) {
      video.play().catch(() => {});
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [playing, autoPlay, reduceMotion]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      className="h-full w-full object-cover"
    />
  );
}
