"use client";

import { Marquee } from "@/components/ui/marquee";

const WORDS = ["Blink", "Pet", "Poke", "Blush"];
const WORD_COLORS = [
  "var(--primary)",
  "var(--calamansi-flesh)",
  "var(--foreground)",
  "var(--calamansi-blush)",
];

const COMPONENTS = [
  "Spotlight card",
  "Tilt card",
  "Dock",
  "Number ticker",
  "Marquee",
  "Calamansi mascot",
];

export default function MarqueeDemo() {
  return (
    <div className="flex h-full flex-col justify-center gap-8 p-6">
      <Marquee duration={26} gap={44}>
        {WORDS.map((word, index) => (
          <span
            key={word}
            className="font-runde text-5xl font-bold tracking-tight sm:text-6xl"
            style={{ color: WORD_COLORS[index % WORD_COLORS.length] }}
          >
            {word}
          </span>
        ))}
      </Marquee>

      <Marquee duration={38} gap={12} reverse>
        {COMPONENTS.map((name) => (
          <span
            key={name}
            className="whitespace-nowrap rounded-full border border-border/70 bg-card px-4 py-1.5 text-sm font-medium text-foreground/80"
          >
            {name}
          </span>
        ))}
      </Marquee>

      <Marquee duration={20} gap={20} fade={false} pauseOnHover={false}>
        {Array.from({ length: 6 }, (_, index) => (
          <span
            key={index}
            className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground"
          >
            no fade · no pause
          </span>
        ))}
      </Marquee>

      <p className="text-center text-xs font-medium text-muted-foreground">
        Hover a row to hold it in place. Move away and it carries on.
      </p>
    </div>
  );
}
