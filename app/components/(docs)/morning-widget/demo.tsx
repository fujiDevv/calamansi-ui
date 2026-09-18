"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import {
  MorningWidget,
  type MorningWidgetVariant,
  type MotivationQuote,
} from "@/components/ui/morning-widget";
import { cn } from "@/lib/utils";

/** The swatches mirror each palette's mesh: its blobs over its base. */
const VARIANTS: {
  id: MorningWidgetVariant;
  label: string;
  gradient: string;
}[] = [
  {
    id: "white",
    label: "White",
    gradient: "linear-gradient(135deg, #f5f5f6 0%, #dadbdf 50%, #c7c8cd 100%)",
  },
  {
    id: "calamansi",
    label: "Calamansi",
    gradient: "linear-gradient(135deg, #b4e84c 0%, #7d9c52 50%, #5c7a67 100%)",
  },
  {
    id: "slate",
    label: "Slate Glass",
    gradient: "linear-gradient(135deg, #a99fd6 0%, #8b84b4 50%, #5a6a9c 100%)",
  },
  {
    id: "citrus",
    label: "Warm Citrus",
    gradient: "linear-gradient(135deg, #ffc93d 0%, #fcaf58 50%, #ff8d8d 100%)",
  },
];

const PACKS: { id: string; label: string; quotes: MotivationQuote[] }[] = [
  {
    id: "founder",
    label: "Founder",
    quotes: [
      {
        text: "You have to start delegating tasks, now go carpe diem :)",
        emphasis: ["delegating tasks", "carpe diem"],
      },
      {
        text: "Ship it, then make it better. Momentum beats polish.",
        emphasis: ["Ship it", "Momentum"],
      },
      {
        text: "Small bets, compounding wins.",
        emphasis: ["compounding wins"],
      },
      {
        text: "Talk to users before you touch the pixels.",
        emphasis: ["Talk to users"],
      },
    ],
  },
  {
    id: "focus",
    label: "Deep work",
    quotes: [
      {
        text: "One task, one window, one hour. Guard it.",
        emphasis: ["one hour"],
      },
      {
        text: "Depth beats speed. Close the tabs you are not using.",
        emphasis: ["Depth beats speed"],
      },
      {
        text: "Protect the first ninety minutes of the day.",
        emphasis: ["ninety minutes"],
      },
      {
        text: "Progress is quiet. Keep going.",
        emphasis: ["Keep going"],
      },
    ],
  },
];

const CONTROL =
  "inline-flex h-8 items-center gap-1.5 rounded-full border border-border/70 bg-card shadow-2xs px-3 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function MorningWidgetDemo() {
  const [name, setName] = useState("Josh");
  const [packId, setPackId] = useState(PACKS[0]?.id ?? "founder");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  const [tilt, setTilt] = useState(true);
  const [variant, setVariant] = useState<MorningWidgetVariant>("calamansi");

  const pack = PACKS.find((item) => item.id === packId) ?? PACKS[0];
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-4 sm:gap-8 sm:p-10">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="font-runde text-lg font-semibold tracking-tight text-foreground">
          Morning motivation
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          The clock ticks digit by digit, the card leans towards your pointer,
          and each line arrives in stages.
        </p>
      </div>

      {/* Color Swatches Control */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/60 px-3.5 py-2 shadow-2xs backdrop-blur-xs">
        <span className="text-xs font-medium text-muted-foreground">
          Palette
        </span>

        <div className="flex items-center gap-2">
          {VARIANTS.map((option) => {
            const selected = variant === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setVariant(option.id)}
                aria-label={`Set color to ${option.label}`}
                aria-pressed={selected}
                title={option.label}
                className={`relative size-7 cursor-pointer rounded-xl transition-all duration-200 hover:scale-105 sm:size-8 ${
                  selected
                    ? "scale-110 shadow-md ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-80 ring-1 ring-foreground/10 hover:opacity-100"
                }`}
                style={{ background: option.gradient }}
              />
            );
          })}
        </div>

        <span className="min-w-[84px] text-xs font-semibold text-foreground transition-colors">
          {currentVariant.label}
        </span>
      </div>

      {/* Controls bar */}
      <div className="flex w-full max-w-md flex-wrap items-center justify-center gap-2 rounded-xl sm:max-w-none">
        <label className="flex items-center gap-2 rounded-full border border-border/70 bg-card shadow-2xs py-1 pr-1 pl-3 text-xs font-semibold text-muted-foreground">
          <span>To</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={16}
            aria-label="Name shown in the greeting"
            className="h-6 w-24 rounded-full bg-muted/60 px-2.5 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-card shadow-2xs p-1">
          {PACKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPackId(item.id)}
              aria-pressed={packId === item.id}
              className={cn(
                "h-6 rounded-full px-2.5 text-xs font-semibold transition-colors",
                packId === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setTimeFormat((prev) => (prev === "12h" ? "24h" : "12h"))
          }
          className={CONTROL}
        >
          Format: {timeFormat}
        </button>

        <button
          type="button"
          onClick={() => setTilt((prev) => !prev)}
          aria-pressed={tilt}
          className={cn(CONTROL, tilt && "text-foreground")}
        >
          <Sparkles className={cn("size-3.5", tilt && "text-primary")} />
          Tilt: {tilt ? "on" : "off"}
        </button>

        <button
          type="button"
          onClick={() => {
            setName("Josh");
            setPackId(PACKS[0]?.id ?? "founder");
            setTimeFormat("12h");
            setTilt(true);
            setVariant("calamansi");
          }}
          className={CONTROL}
          title="Reset the demo"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <MorningWidget
        name={name.trim() || "Friend"}
        quotes={pack?.quotes}
        timeFormat={timeFormat}
        tilt={tilt}
        variant={variant}
      />

      <p className="max-w-md text-center text-xs font-medium text-muted-foreground">
        Click the card to skip to the next line. Hovering holds it so you can
        finish reading.
      </p>
    </div>
  );
}
