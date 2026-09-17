"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, type ComponentItem } from "@/lib/components";
import { cn } from "@/lib/utils";
import ComponentLivePreview from "./ComponentLivePreview";

export default function ComponentCard({
  item,
  large = false,
  autoPlay = false,
  className,
}: {
  item: ComponentItem;
  large?: boolean;
  autoPlay?: boolean;
  className?: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-2 transition-colors duration-200 ease-out hover:border-foreground/20",
        large && "lg:h-full",
        className,
      )}
    >
      <div
        className={cn(
          "relative aspect-4/3 w-full overflow-hidden rounded-lg border border-border bg-muted/40",
          large && "lg:aspect-auto lg:flex-1",
        )}
      >
        <ComponentLivePreview registry={item.registry} active={active} />
      </div>

      <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
        <h3 className="font-runde text-base font-semibold tracking-tight">
          {item.name}
        </h3>
        <span className="shrink-0 text-xs text-muted-foreground">
          {CATEGORY_LABELS[item.category]}
        </span>
      </div>
    </Link>
  );
}
