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
    <div className="flex h-full flex-col items-center justify-center gap-10 p-6">
      <div className="text-center">
        <p className="font-runde text-lg font-semibold tracking-tight">
          Glide along the dock
        </p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Each icon measures its distance from your pointer and springs to meet
          it.
        </p>
      </div>

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

      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {active} selected
      </p>
    </div>
  );
}
