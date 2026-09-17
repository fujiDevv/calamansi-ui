"use client";

import { Bell, Citrus, Home, MousePointer2, Search, Sun, Zap } from "lucide-react";
import Calamansi from "@/components/ui/calamansi";
import { Dock, DockItem } from "@/components/ui/dock";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { TaskWidget } from "@/components/ui/task-widget";
import { TiltCard } from "@/components/ui/tilt-card";
import PreviewFallback from "./PreviewFallback";

const MARQUEE_TAGS_1 = ["Juicy", "Fresh", "Sour", "Citrus", "Zesty"];
const MARQUEE_TAGS_2 = ["React 19", "Next.js", "Tailwind", "Motion", "shadcn"];

export default function ComponentLivePreview({
  registry,
  active = false,
}: {
  registry?: string;
  active?: boolean;
}) {
  switch (registry) {
    case "calamansi":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Calamansi variant="primary" size={96} interactive={false} />
        </div>
      );

    case "spotlight-card":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <SpotlightCard
            className="w-full max-w-[210px]"
            icon={<Sun className="size-4" />}
            title="Spotlight"
            subtitle="Lit border"
          >
            <p className="text-center text-xs font-medium text-white/85">
              Tracks pointer
            </p>
          </SpotlightCard>
        </div>
      );


    case "tilt-card":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <TiltCard
            maxTilt={14}
            className="w-full max-w-[210px]"
            icon={<MousePointer2 className="size-4" />}
            title="Tilt Card"
            subtitle="3D Spring"
          >
            <p className="text-center text-xs font-medium text-white/85">
              Leans towards pointer
            </p>
          </TiltCard>
        </div>
      );

    case "marquee":
      return (
        <div className="flex h-full w-full flex-col justify-center gap-2 overflow-hidden px-1 py-4">
          <Marquee duration={14} gap={10}>
            {MARQUEE_TAGS_1.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-border/80 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </Marquee>
          <Marquee duration={16} reverse gap={10}>
            {MARQUEE_TAGS_2.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary shadow-2xs"
              >
                {tag}
              </span>
            ))}
          </Marquee>
        </div>
      );

    case "number-ticker":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
          <div className="flex items-baseline font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <NumberTicker value={100} />
            <span className="ml-0.5 text-xl text-primary">%</span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-muted-foreground">
            Rolling counter animation
          </p>
        </div>
      );

    case "dock":
      return (
        <div className="flex h-full w-full items-center justify-center p-4">
          <Dock
            size={34}
            magnify={46}
            reach={60}
            className="gap-1.5 rounded-2xl border-border/70 p-1.5 shadow-2xs"
          >
            <DockItem
              label="Home"
              className="flex size-8.5 items-center justify-center rounded-xl bg-muted/80"
            >
              <Home className="size-3.5 text-foreground/70" />
            </DockItem>
            <DockItem
              label="Search"
              className="flex size-8.5 items-center justify-center rounded-xl bg-muted/80"
            >
              <Search className="size-3.5 text-foreground/70" />
            </DockItem>
            <DockItem
              label="Citrus"
              className="flex size-8.5 items-center justify-center rounded-xl bg-muted/80"
            >
              <Citrus className="size-3.5 text-primary" />
            </DockItem>
            <DockItem
              label="Alerts"
              className="flex size-8.5 items-center justify-center rounded-xl bg-muted/80"
            >
              <Bell className="size-3.5 text-calamansi-flesh" />
            </DockItem>
          </Dock>
        </div>
      );

    case "task-widget":
      return (
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-2">
          <div className="pointer-events-none scale-[0.38] select-none sm:scale-[0.44]">
            <TaskWidget
              variant="calamansi"
              showClock={true}
              className="w-[580px]"
              defaultTasks={[
                { id: 1, title: "Brew pour-over", completed: true },
                { id: 2, title: "Review shaders", completed: false },
                { id: 3, title: "Ship release", completed: false },
              ]}
            />
          </div>
        </div>
      );

    default:
      return <PreviewFallback />;
  }
}
