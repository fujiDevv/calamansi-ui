"use client";

import { Calamansi, type CalamansiMood } from "@/components/ui/calamansi";

const MOODS: CalamansiMood[] = ["happy", "love", "sleepy", "tart"];

export default function CalamansiDemo() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <Calamansi
        variant="primary"
        size={132}
        className="shrink-0 drop-shadow-sm"
      />

      <p className="max-w-xs text-center text-[11px] font-medium leading-4 text-muted-foreground">
        Move your cursor and it will watch you. Pet it back and forth to make it
        blush. Poke it five times and it goes tart.
      </p>

      <ul className="flex items-end justify-center gap-5">
        {MOODS.map((mood) => (
          <li key={mood} className="flex flex-col items-center gap-1">
            <Calamansi mood={mood} interactive={false} size={34} />
            <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {mood}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
