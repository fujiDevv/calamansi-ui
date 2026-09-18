"use client";

import { useState } from "react";
import {
  Bell,
  Camera,
  Compass,
  House,
  Layers,
  Music,
  Search,
  Settings,
} from "lucide-react";
import { Dock, DockItem, type DockVariant } from "@/components/ui/dock";

const VARIANTS: {
  id: DockVariant;
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

const ITEMS = [
  { label: "Home", Icon: House },
  { label: "Search", Icon: Search },
  { label: "Explore", Icon: Compass },
  { label: "Library", Icon: Layers },
  { label: "Music", Icon: Music },
  { label: "Camera", Icon: Camera },
  { label: "Alerts", Icon: Bell },
  { label: "Settings", Icon: Settings },
];

export default function DockDemo() {
  const [active, setActive] = useState("Home");
  const [variant, setVariant] = useState<DockVariant>("calamansi");
  const currentVariant = VARIANTS.find((v) => v.id === variant) ?? VARIANTS[0];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-2 sm:gap-10 sm:p-6">
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

      <div className="text-center">
        <p className="font-runde text-lg font-semibold tracking-tight">
          Glide along the dock
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Each icon measures its distance from your pointer and springs to meet
          it.
        </p>
      </div>

      {/*
        The row scrolls sideways when the dock is wider than the screen, but `overflow-x-auto`
        clips on both axes, so the container has to carry every bit of headroom the dock needs and
        pull it back out with negative margins. Two things stick out of the panel: the magnified
        icon and its hover label above it (about 48px), and the panel's own drop-shadow lift (42px
        below, and about 28px to the sides — it is a filter, so it is cut exactly like the icons).
      */}
      <div className="-mt-16 -mb-12 flex w-full max-w-full justify-start overflow-x-auto overscroll-x-contain px-8 pt-16 pb-12 [scrollbar-width:none] sm:w-auto sm:justify-center">
        <Dock variant={variant}>
          {ITEMS.map(({ label, Icon }) => (
            <DockItem
              key={label}
              label={label}
              onClick={() => setActive(label)}
              className={
                active === label
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : undefined
              }
            >
              <Icon className="size-1/2" />
            </DockItem>
          ))}
        </Dock>
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {active} selected
      </p>
    </div>
  );
}
