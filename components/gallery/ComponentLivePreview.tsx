"use client";

import {
  Bell,
  Citrus,
  Home,
  MousePointer2,
  Music2,
  Search,
  Sun,
  Zap,
} from "lucide-react";
import Calamansi from "@/components/ui/calamansi";
import { Dock, DockItem } from "@/components/ui/dock";
import { DurationPicker } from "@/components/ui/duration-picker";
import { DynamicIsland } from "@/components/ui/dynamic-island";
import {
  GitHubActivity,
  type Contribution,
  type ContributionLevel,
  type RepoContribution,
} from "@/components/ui/github-activity";
import { GooeyNav } from "@/components/ui/gooey-nav";
import { Marquee } from "@/components/ui/marquee";
import { MatrixOrb } from "@/components/ui/matrix-orb";
import { MorningWidget } from "@/components/ui/morning-widget";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { TaskWidget } from "@/components/ui/task-widget";
import { TiltCard } from "@/components/ui/tilt-card";
import { SITE_REPO } from "@/lib/site";
import { NO_LIFT } from "@/lib/squircle";
import PreviewFallback from "./PreviewFallback";

/**
 * A fixed year of contributions, worked out from its index rather than rolled at
 * random, so the gallery card never hits the network and never shifts between
 * server and client.
 */
const PREVIEW_CONTRIBUTIONS: Contribution[] = Array.from(
  { length: 364 },
  (_, index) => {
    const date = new Date(Date.UTC(2025, 0, 5) + index * 86_400_000);
    const wave =
      Math.sin(index / 5.1) + Math.sin(index / 17.3) + Math.sin(index / 2.7);
    const count =
      wave > 1.1 ? 9 : wave > 0.4 ? 5 : wave > -0.2 ? 2 : wave > -1 ? 1 : 0;

    return {
      date: date.toISOString().slice(0, 10),
      count,
      level: (count >= 9
        ? 4
        : count >= 5
          ? 3
          : count >= 2
            ? 2
            : count > 0
              ? 1
              : 0) as ContributionLevel,
    };
  },
);

const PREVIEW_REPOS: RepoContribution[] = [
  { name: "calamansi-ui", count: 24, href: SITE_REPO },
  { name: "design-tokens", count: 9 },
  { name: "docs", count: 4 },
];

const MARQUEE_TAGS_1 = ["Juicy", "Fresh", "Sour", "Citrus", "Zesty"];
const MARQUEE_TAGS_2 = ["React 19", "Next.js", "Tailwind", "Motion", "shadcn"];

function Preview({
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
            subtitle="White squircle"
          >
            <p className="text-center text-xs font-medium text-muted-foreground">
              The branded surface
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
            <p className="text-center text-xs font-medium text-current/85">
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
            /* layout only: the panel is clipped to the squircle, so a radius or a box
               shadow up here would paint a rectangle around the shape */
            className="gap-1.5 p-1.5"
          >
            <DockItem
              label="Home"
              className="flex size-8.5 items-center justify-center bg-muted/80"
            >
              <Home className="size-3.5 text-foreground/70" />
            </DockItem>
            <DockItem
              label="Search"
              className="flex size-8.5 items-center justify-center bg-muted/80"
            >
              <Search className="size-3.5 text-foreground/70" />
            </DockItem>
            <DockItem
              label="Citrus"
              className="flex size-8.5 items-center justify-center bg-muted/80"
            >
              <Citrus className="size-3.5 text-primary" />
            </DockItem>
            <DockItem
              label="Alerts"
              className="flex size-8.5 items-center justify-center bg-muted/80"
            >
              <Bell className="size-3.5 text-calamansi-flesh" />
            </DockItem>
          </Dock>
        </div>
      );

    case "dynamic-island":
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 overflow-hidden p-3">
          {/* the first pill takes the default palette, the alert one shows the far end */}
          <DynamicIsland
            state="compact"
            interactive={false}
            icon={<Music2 className="size-3.5" />}
            title="Solaris — Citrus Beat"
            trailing={<span className="tabular-nums">1:24</span>}
          />
          <DynamicIsland
            state="alert"
            interactive={false}
            variant="white"
            icon={<Zap className="size-3.5" />}
            title="Low battery"
            trailing={<span className="tabular-nums">18%</span>}
          />
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

    case "morning-widget":
      return (
        // laid out at full size and scaled down, so the cqw type stays crisp and
        // the lift comes down with it
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
          <div className="pointer-events-none w-[420px] max-w-none scale-[0.5] select-none">
            <MorningWidget tilt={false} interval={0} />
          </div>
        </div>
      );

    case "github-activity":
      return (
        // the padding keeps the slab's drop shadow off the clipping edge
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none scale-[0.6] select-none sm:scale-[0.7]">
            <GitHubActivity
              contributions={PREVIEW_CONTRIBUTIONS}
              repos={PREVIEW_REPOS}
              variant="calamansi"
              months={3}
              showMonths
              label="Top contributions in:"
            />
          </div>
        </div>
      );

    case "gooey-nav":
      return (
        // hovering moves the pill, so the tile runs the liquid on its own
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
          <GooeyNav
            items={["Home", "Docs", "Pricing"]}
            value={active ? 2 : 1}
            size="sm"
          />
        </div>
      );

    case "duration-picker":
      return (
        // hovering opens the seams, so the tile shows the split on its own
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
          <DurationPicker
            defaultValue={{ hours: active ? 2 : 1, minutes: active ? 45 : 30 }}
            editing={active}
            size="sm"
          />
        </div>
      );

    case "matrix-orb":
      return (
        // it listens while the tile is at rest and thinks once you hover it
        <div className="flex h-full w-full items-center justify-center overflow-hidden p-4">
          <div className="pointer-events-none scale-[0.55] select-none">
            <MatrixOrb state={active ? "thinking" : "listening"} size={240} />
          </div>
        </div>
      );

    default:
      return <PreviewFallback />;
  }
}

/**
 * A tile is not the place for a shadow: a surface's lift is wider than the tile's
 * padding, so it gets sliced off at the clip edge. Every preview is therefore
 * flattened — the task widget aside, which casts a shadow of its own.
 */
export default function ComponentLivePreview({
  registry,
  active = false,
}: {
  registry?: string;
  active?: boolean;
}) {
  if (registry === "task-widget") {
    return <Preview registry={registry} active={active} />;
  }

  return (
    <div style={NO_LIFT} className="h-full w-full">
      <Preview registry={registry} active={active} />
    </div>
  );
}
