"use client";

import { useState } from "react";
import {
  installCommand,
  PACKAGE_MANAGERS,
  type ComponentItem,
  type PackageManager,
} from "@/lib/components";
import { cn } from "@/lib/utils";
import { LOGOS } from "../logos";
import CopyButton from "../CopyButton";

export default function InstallCommand({ item }: { item: ComponentItem }) {
  const [pm, setPm] = useState<PackageManager>("npm");
  const command = installCommand(item, pm);
  if (!command) return null;

  return (
    <div className="overflow-hidden rounded-lg bg-popover ring-1 ring-foreground/[0.04]">
      <div className="flex items-center gap-1 border-b border-border/70 px-2 py-2">
        {PACKAGE_MANAGERS.map((manager) => {
          const Logo = LOGOS[manager];
          const active = pm === manager;
          return (
            <button
              key={manager}
              type="button"
              onClick={() => setPm(manager)}
              data-active={active}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-xs font-medium transition-[background-color,border-color,color]",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-primary-inset"
                  : "text-muted-foreground hover:border-border hover:bg-muted/70 hover:text-foreground",
              )}
            >
              <Logo className="size-3.5" />
              {manager}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-12 items-center gap-3 px-3 py-2">
        <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
          {command}
        </code>
        <CopyButton value={command} label="Copy install command" title="" />
      </div>
    </div>
  );
}
