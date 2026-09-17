"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import {
  MorningWidget,
  type MotivationQuote,
} from "@/components/ui/morning-widget";
import { cn } from "@/lib/utils";

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

  const pack = PACKS.find((item) => item.id === packId) ?? PACKS[0];

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
      />

      <p className="max-w-md text-center text-xs font-medium text-muted-foreground">
        Click the card to skip to the next line. Hovering holds it so you can
        finish reading. Design inspired by{" "}
        <a
          href="https://sprrrint.com/jaydwivedi"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4 hover:text-foreground"
        >
          Jay Dwivedi
        </a>
        .
      </p>
    </div>
  );
}
