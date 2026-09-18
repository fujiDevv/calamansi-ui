"use client";

import { useState } from "react";
import {
  DynamicIsland,
  type DynamicIslandState,
  type DynamicIslandVariant,
} from "@/components/ui/dynamic-island";
import {
  Headphones,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Timer,
  Volume2,
} from "lucide-react";

const VARIANTS: {
  id: DynamicIslandVariant;
  label: string;
  gradient: string;
}[] = [
  {
    id: "white",
    label: "White",
    gradient: "linear-gradient(135deg, #ffffff 0%, #e9e9ec 50%, #d4d4d8 100%)",
  },
  {
    id: "calamansi",
    label: "Calamansi",
    gradient: "linear-gradient(135deg, #8fa37d 0%, #5c7a67 50%, #39564a 100%)",
  },
  {
    id: "slate",
    label: "Slate Glass",
    gradient: "linear-gradient(135deg, #a79cb7 0%, #687396 50%, #4a5a7f 100%)",
  },
  {
    id: "citrus",
    label: "Warm Citrus",
    gradient: "linear-gradient(135deg, #d69f7e 0%, #b87152 50%, #7d4128 100%)",
  },
];

/** The three scenarios the island can show, and the icon each one wears. */
const SCENARIOS: {
  id: "media" | "timer" | "call";
  label: string;
  Icon: typeof Music2;
}[] = [
  { id: "media", label: "Music Player", Icon: Music2 },
  { id: "timer", label: "Focus Timer", Icon: Timer },
  { id: "call", label: "Earbuds Alert", Icon: Headphones },
];

export default function DynamicIslandDemo() {
  const [mode, setMode] = useState<"media" | "timer" | "call">("media");
  const [islandState, setIslandState] = useState<DynamicIslandState>("compact");
  const [isPlaying, setIsPlaying] = useState(true);
  const [variant, setVariant] = useState<DynamicIslandVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5 py-4 sm:gap-6 sm:py-6">
      {/* Top controls: Colour changer and state morphology controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
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

        {/* State Morphology Controls */}
        <div className="flex rounded-lg border border-border bg-muted/30 p-0.5 text-xs">
          {(["idle", "compact", "expanded"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setIslandState(s)}
              className={`rounded-md px-3 py-1 font-medium capitalize transition ${
                islandState === s
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/*
        Island Stage Container. The bottom padding is there for the dock's lift: the stage clips
        at its own edge, so a dock sitting flush against it would have its drop-shadow sliced off.
      */}
      <div className="relative flex min-h-[300px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl border border-border/70 bg-card/40 p-4 pt-6 pb-12 backdrop-blur-xs sm:p-6 sm:pt-8 sm:pb-14">
        <p className="mb-4 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Tap island to expand or collapse
        </p>

        {mode === "media" && (
          <DynamicIsland
            state={islandState}
            onStateChange={setIslandState}
            variant={variant}
            pulse
            icon={<Music2 className="size-3.5" />}
            title="Solaris — Citrus Beat"
            trailing={
              <div className="flex items-center gap-1.5">
                <div className="flex h-3 items-end gap-0.5">
                  <span className="w-0.5 h-full bg-current animate-pulse rounded-full" />
                  <span className="w-0.5 h-2/3 bg-current/80 animate-pulse rounded-full delay-75" />
                  <span className="w-0.5 h-4/5 bg-current/90 animate-pulse rounded-full delay-150" />
                </div>
              </div>
            }
            expandedContent={
              <div className="flex size-full flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-current/15 shadow-xs ring-1 ring-current/20">
                    <Music2 className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-semibold">
                      Solaris (Acoustic Version)
                    </h4>
                    <p className="truncate text-[11px] text-current/70">
                      Calamansi Sound Collective
                    </p>
                  </div>
                  <div className="text-current/60">
                    <Volume2 className="size-4" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-current/15">
                    <div className="w-2/5 h-full rounded-full bg-current" />
                  </div>
                  <div className="flex justify-between text-[10px] text-current/60">
                    <span>1:24</span>
                    <span>-2:48</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="text-current/70 transition hover:text-current"
                  >
                    <SkipBack className="size-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying((p) => !p);
                    }}
                    className="flex size-8 items-center justify-center rounded-full bg-foreground text-background shadow-xs transition hover:scale-105"
                  >
                    {isPlaying ? (
                      <Pause className="size-4 fill-current" />
                    ) : (
                      <Play className="size-4 fill-current ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="text-current/70 transition hover:text-current"
                  >
                    <SkipForward className="size-4 fill-current" />
                  </button>
                </div>
              </div>
            }
          />
        )}

        {mode === "timer" && (
          <DynamicIsland
            state={islandState}
            onStateChange={setIslandState}
            variant={variant}
            icon={<Timer className="size-3.5" />}
            title="Focus Session"
            trailing={
              <span className="font-mono text-xs font-semibold text-current/75">
                24:18
              </span>
            }
            expandedContent={
              <div className="flex size-full flex-col items-center justify-between py-1 text-center">
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-medium text-current/70">
                    Pomodoro Interval
                  </span>
                  <span className="rounded-full bg-current/15 px-2 py-0.5 text-[10px] font-semibold text-current/75 backdrop-blur-xs ring-1 ring-current/20">
                    Active
                  </span>
                </div>
                <div className="font-mono text-3xl font-bold tracking-tight">
                  24:18
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-current/15 px-4 py-1 text-xs font-medium transition hover:bg-current/25"
                  >
                    +5 min
                  </button>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-foreground px-4 py-1 text-xs font-semibold text-background shadow-xs transition hover:opacity-90"
                  >
                    Pause
                  </button>
                </div>
              </div>
            }
          />
        )}

        {mode === "call" && (
          <DynamicIsland
            state={islandState}
            onStateChange={setIslandState}
            variant={variant}
            icon={<Headphones className="size-3.5" />}
            title="Citrus Buds Pro"
            trailing={
              <span className="rounded-full bg-current/15 px-2 py-0.5 text-[10px] font-medium text-current/75 backdrop-blur-xs">
                98%
              </span>
            }
            expandedContent={
              <div className="flex size-full flex-col justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-current/15 ring-1 ring-current/20">
                    <Headphones className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">
                      Connected to Mac Studio
                    </p>
                    <p className="text-[11px] text-current/70">
                      Spatial Audio Active
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-current/10 p-2 text-center text-xs ring-1 ring-current/15">
                  <div>
                    <p className="text-[10px] text-current/60">Left Earbud</p>
                    <p className="font-semibold">98%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-current/60">Right Earbud</p>
                    <p className="font-semibold">95%</p>
                  </div>
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* Scenario Switcher: plain icon buttons, one per scenario */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Scenario Switcher
        </p>
        <div className="flex items-center gap-1">
          {SCENARIOS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => {
                setMode(id);
                setIslandState("compact");
              }}
              className={`grid size-9 cursor-pointer place-items-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                mode === id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {/* the name the icon cannot give */}
              <span className="sr-only">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
