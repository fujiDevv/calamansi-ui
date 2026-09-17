"use client";

import { useState } from "react";
import { Code2, Eye, Terminal } from "lucide-react";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";

const VIEWS = [
  { id: "preview", label: "Preview", icon: <Eye className="size-3.5" /> },
  { id: "code", label: "Code", icon: <Code2 className="size-3.5" /> },
  { id: "terminal", label: "Console", icon: <Terminal className="size-3.5" /> },
];

const TIERS = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro", badge: "Popular" },
  { id: "enterprise", label: "Enterprise" },
];

const PERIODS = ["Monthly", "Quarterly", "Annually"];

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <span className="text-center text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {/* mx-auto centres the row while it fits and lets it scroll from the start once it does not */}
      <div className="flex w-full max-w-full justify-start overflow-x-auto p-1 [scrollbar-width:none]">
        <div className="mx-auto min-w-max">{children}</div>
      </div>
    </div>
  );
}

export default function SegmentedTabsDemo() {
  const [view, setView] = useState("preview");
  const [tier, setTier] = useState("pro");
  const [period, setPeriod] = useState("Monthly");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 p-4 sm:gap-10 sm:p-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-runde text-lg font-semibold tracking-tight text-foreground">
          Sliding Segmented Controls
        </p>
        <p className="text-xs text-muted-foreground max-w-sm">
          Framer Motion layout projection drives a continuous spring pill with
          arrow-key keyboard navigation.
        </p>
      </div>

      {/* Default recessed style */}
      <Row label="Default Recessed Bar">
        <SegmentedTabs
          items={VIEWS}
          value={view}
          onChange={setView}
          size="md"
          variant="default"
        />
      </Row>

      {/* Pills variant with badges */}
      <Row label="Pills Variant with Badges">
        <SegmentedTabs
          items={TIERS}
          value={tier}
          onChange={setTier}
          size="md"
          variant="pills"
        />
      </Row>

      {/* Underline variant */}
      <Row label="Underline Style">
        <SegmentedTabs
          items={PERIODS}
          value={period}
          onChange={setPeriod}
          size="sm"
          variant="underline"
        />
      </Row>
    </div>
  );
}
