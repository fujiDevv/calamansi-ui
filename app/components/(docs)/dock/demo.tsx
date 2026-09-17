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
import { Dock, DockItem } from "@/components/ui/dock";

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

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-2 sm:gap-10 sm:p-6">
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
        The row scrolls sideways when the dock is wider than the screen, but it must not clip in the
        vertical axis: the magnified icon and its hover label grow past the dock's top edge, so the
        container carries the headroom as padding and pulls it back out with a negative margin.
      */}
      <div className="-mt-16 flex w-full max-w-full justify-start overflow-x-auto overscroll-x-contain px-2 pt-16 pb-2 [scrollbar-width:none] sm:w-auto sm:justify-center">
        <Dock>
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
