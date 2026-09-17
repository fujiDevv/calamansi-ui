"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  BounceSidebar,
  type BounceSidebarItem,
} from "@/components/ui/bounce-sidebar";
import {
  components,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from "@/lib/components";
import { cn } from "@/lib/utils";

const GETTING_STARTED = [
  { label: "Introduction", href: "/components/introduction" },
  { label: "Installation", href: "/components/installation" },
];

export default function DocSidebar({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  const items = useMemo<BounceSidebarItem[]>(() => {
    const list: BounceSidebarItem[] = [
      { label: "Getting Started", heading: true },
      ...GETTING_STARTED,
    ];

    CATEGORY_ORDER.forEach((catId) => {
      const catComponents = components.filter((c) => c.category === catId);
      if (catComponents.length === 0) return;

      list.push({
        label: CATEGORY_LABELS[catId] ?? catId,
        heading: true,
      });

      catComponents.forEach((comp) => {
        list.push({
          label: comp.name,
          href: comp.href,
        });
      });
    });

    return list;
  }, []);

  const activeIndex = useMemo(() => {
    const idx = items.findIndex(
      (item) =>
        typeof item !== "string" &&
        !("heading" in item) &&
        item.href === pathname,
    );
    return idx >= 0 ? idx : 1;
  }, [items, pathname]);

  return (
    <nav className={cn("text-sm", className)}>
      <BounceSidebar
        items={items}
        value={activeIndex}
        onChange={() => onNavigate?.()}
        dotColor="var(--primary)"
        markerVariant="dot"
        squish
        ripple
      />
    </nav>
  );
}
