"use client";

import { useState } from "react";
import {
  Calamansi,
  type CalamansiMood,
  type CalamansiTexture,
  type CalamansiVariant,
} from "@/components/ui/calamansi";

const TEXTURES: { id: CalamansiTexture; label: string }[] = [
  { id: "textured", label: "Textured" },
  { id: "plain", label: "Plain" },
];

const VARIANTS: { id: CalamansiVariant; label: string }[] = [
  { id: "primary", label: "Calamansi" },
  { id: "citrus", label: "Warm Citrus" },
  { id: "slate", label: "Slate Glass" },
];

const MOODS: CalamansiMood[] = ["happy", "love", "sleepy", "tart"];

export default function CalamansiDemo() {
  const [texture, setTexture] = useState<CalamansiTexture>("textured");
  const [variant, setVariant] = useState<CalamansiVariant>("primary");
  const [isInteractive, setIsInteractive] = useState(true);
  const [mood, setMood] = useState<CalamansiMood>("happy");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 p-3 sm:gap-6 sm:p-6">
      {/* Tab Controls: Texture, Colour Variant, and Expression */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {/* Texture Selection Tabs */}
        <div className="flex items-center rounded-full border border-border/70 bg-card/60 p-1 shadow-2xs backdrop-blur-xs">
          {TEXTURES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTexture(option.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                texture === option.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Colour Variant Switcher */}
        <div className="flex items-center rounded-full border border-border/70 bg-card/60 p-1 shadow-2xs backdrop-blur-xs">
          {VARIANTS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setVariant(option.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                variant === option.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Mode / Expression Switcher */}
        <div className="flex items-center rounded-full border border-border/70 bg-card/60 p-1 shadow-2xs backdrop-blur-xs">
          <button
            type="button"
            onClick={() => {
              setIsInteractive(true);
              setMood("happy");
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
              isInteractive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Interactive
          </button>
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setIsInteractive(false);
                setMood(m);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-all ${
                !isInteractive && mood === m
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Main Mascot Stage */}
      <div className="flex flex-col items-center justify-center gap-3">
        <Calamansi
          variant={variant}
          texture={texture}
          mood={mood}
          interactive={isInteractive}
          size={144}
          className="shrink-0 drop-shadow-sm transition-transform duration-200"
        />

        <p className="max-w-xs text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
          {isInteractive
            ? "Move cursor to track eyes. Pet back and forth to blush. Poke five times for tart mode. Press and hold to squish."
            : `Displaying fixed "${mood}" mood with ${texture} rind detailing.`}
        </p>
      </div>

      {/* Expression Gallery Row */}
      <ul className="flex items-end justify-center gap-4 sm:gap-6">
        {MOODS.map((itemMood) => {
          const isCurrent = !isInteractive && mood === itemMood;

          return (
            <li
              key={itemMood}
              onClick={() => {
                setIsInteractive(false);
                setMood(itemMood);
              }}
              className="group flex cursor-pointer flex-col items-center gap-1 transition-transform hover:scale-105"
            >
              <Calamansi
                variant={variant}
                texture={texture}
                mood={itemMood}
                interactive={false}
                size={36}
                className="transition-opacity group-hover:opacity-100"
              />
              <span
                className={`text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  isCurrent
                    ? "font-bold text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {itemMood}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
