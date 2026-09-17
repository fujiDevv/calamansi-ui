"use client";

import { useState } from "react";
import { Minus, Plus, Shuffle } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

const PRESETS = [12847, 3620, 981, 40215];

const BUTTON =
  "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border/70 bg-card px-3.5 text-xs font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function NumberTickerDemo() {
  const [value, setValue] = useState(12847);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4 sm:gap-8 sm:p-6">
      <div className="flex flex-col items-center">
        <NumberTicker
          value={value}
          className="text-4xl font-semibold tracking-tight sm:text-7xl"
        />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Kalansing
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          className={BUTTON}
          onClick={() => setValue((current) => Math.max(0, current - 275))}
        >
          <Minus className="size-3.5" />
          275
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() => setValue((current) => current + 275)}
        >
          <Plus className="size-3.5" />
          275
        </button>
        <button
          type="button"
          className={BUTTON}
          onClick={() =>
            setValue(
              PRESETS[Math.floor(Math.random() * PRESETS.length)] ?? PRESETS[0],
            )
          }
        >
          <Shuffle className="size-3.5" />
          Shuffle
        </button>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Prefix",
            node: (
              <NumberTicker
                value={value}
                prefix="$"
                className="text-2xl font-semibold"
              />
            ),
          },
          {
            label: "Suffix",
            node: (
              <NumberTicker
                value={value / 10}
                suffix="%"
                className="text-2xl font-semibold"
              />
            ),
          },
          {
            label: "Down",
            node: (
              <NumberTicker
                value={value}
                direction="down"
                className="text-2xl font-semibold"
              />
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-card p-4 ring-1 ring-foreground/[0.04]"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {stat.label}
            </p>
            <div className="mt-2">{stat.node}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
