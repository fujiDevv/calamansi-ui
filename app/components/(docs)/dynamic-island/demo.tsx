"use client";

import { useState } from "react";
import { Dock, DockItem } from "@/components/ui/dock";
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

const VARIANTS: { id: DynamicIslandVariant; label: string }[] = [
  { id: "calamansi", label: "Calamansi" },
  { id: "slate", label: "Slate Glass" },
  { id: "citrus", label: "Warm Citrus" },
];

export default function DynamicIslandDemo() {
  const [mode, setMode] = useState<"media" | "timer" | "call">("media");
  const [islandState, setIslandState] = useState<DynamicIslandState>("compact");
  const [isPlaying, setIsPlaying] = useState(true);
  const [variant, setVariant] = useState<DynamicIslandVariant>("calamansi");

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5 py-4 sm:gap-6 sm:py-6">
      {/* Top controls: Colour changer and state morphology controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Colour changer */}
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

      {/* Island Stage Container */}
      <div className="relative flex min-h-[300px] w-full flex-col items-center justify-start overflow-hidden rounded-3xl border border-border/70 bg-card/40 p-4 pt-6 backdrop-blur-xs sm:p-6 sm:pt-8">
        <p className="mb-4 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Tap island to expand or collapse
        </p>

        {mode === "media" && (
          <DynamicIsland
            state={islandState}
            onStateChange={setIslandState}
            variant={variant}
            icon={<Music2 className="size-3.5" />}
            title="Solaris — Citrus Beat"
            trailing={
              <div className="flex items-center gap-1.5">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-full bg-white animate-pulse rounded-full" />
                  <span className="w-0.5 h-2/3 bg-white/80 animate-pulse rounded-full delay-75" />
                  <span className="w-0.5 h-4/5 bg-white/90 animate-pulse rounded-full delay-150" />
                </div>
              </div>
            }
            expandedContent={
              <div className="flex size-full flex-col justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 shrink-0 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs ring-1 ring-white/25">
                    <Music2 className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-xs font-semibold text-white">
                      Solaris (Acoustic Version)
                    </h4>
                    <p className="truncate text-[11px] text-white/70">
                      Calamansi Sound Collective
                    </p>
                  </div>
                  <div className="text-white/60">
                    <Volume2 className="size-4" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-2/5 rounded-full bg-white" />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/60">
                    <span>1:24</span>
                    <span>-2:48</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6">
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/75 hover:text-white transition"
                  >
                    <SkipBack className="size-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlaying((p) => !p);
                    }}
                    className="flex size-8 items-center justify-center rounded-full bg-white text-neutral-900 shadow-xs transition hover:scale-105"
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
                    className="text-white/75 hover:text-white transition"
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
              <span className="font-mono text-xs font-semibold text-white/90">
                24:18
              </span>
            }
            expandedContent={
              <div className="flex size-full flex-col items-center justify-between py-1 text-center">
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-medium text-white/70">
                    Pomodoro Interval
                  </span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-xs ring-1 ring-white/20">
                    Active
                  </span>
                </div>
                <div className="font-mono text-3xl font-bold tracking-tight text-white">
                  24:18
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-white/20 px-4 py-1 text-xs font-medium text-white transition hover:bg-white/30"
                  >
                    +5 min
                  </button>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-full bg-white px-4 py-1 text-xs font-semibold text-neutral-900 shadow-xs transition hover:bg-white/90"
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
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-xs">
                98%
              </span>
            }
            expandedContent={
              <div className="flex size-full flex-col justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white ring-1 ring-white/25">
                    <Headphones className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      Connected to Mac Studio
                    </p>
                    <p className="text-[11px] text-white/70">
                      Spatial Audio Active
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/10 p-2 text-center text-xs ring-1 ring-white/10">
                  <div>
                    <p className="text-[10px] text-white/60">Left Earbud</p>
                    <p className="font-semibold text-white">98%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/60">Right Earbud</p>
                    <p className="font-semibold text-white">95%</p>
                  </div>
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* Scenario Switcher Dock placed at the bottom */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Scenario Switcher
        </p>
        <Dock size={42} magnify={60} reach={110} panelHeight={58}>
          <DockItem
            label="Music Player"
            onClick={() => {
              setMode("media");
              setIslandState("compact");
            }}
            className={
              mode === "media"
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                : undefined
            }
          >
            <Music2 className="size-4" />
          </DockItem>

          <DockItem
            label="Focus Timer"
            onClick={() => {
              setMode("timer");
              setIslandState("compact");
            }}
            className={
              mode === "timer"
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                : undefined
            }
          >
            <Timer className="size-4" />
          </DockItem>

          <DockItem
            label="Earbuds Alert"
            onClick={() => {
              setMode("call");
              setIslandState("compact");
            }}
            className={
              mode === "call"
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                : undefined
            }
          >
            <Headphones className="size-4" />
          </DockItem>
        </Dock>
      </div>
    </div>
  );
}
