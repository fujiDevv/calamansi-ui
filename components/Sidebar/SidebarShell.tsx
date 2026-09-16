"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeComponent } from "@/lib/components";
import { pageContentClassName, pagePaddingClassName } from "@/lib/page-layout";
import { cn } from "@/lib/utils";
import { CalamansiMark } from "@/components/ui/calamansi";
import DescriptionContent from "../Description/DescriptionContent";
import PanelCode from "../Description/PanelCode";
import { fetchSource, SOURCE_LOADING } from "../Description/fetchSource";

type ViewMode = "preview" | "code";

const tabs: { id: ViewMode; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "code", label: "Code" },
];

/** The component browser has no site header, so it carries its own way back. */
function Breadcrumb() {
  return (
    <div className="flex items-center gap-4 pb-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
      >
        <CalamansiMark className="size-5 text-primary" />
        <span className="font-runde text-[13px] font-bold tracking-tight">
          Calamansi UI
        </span>
      </Link>

      <Link
        href="/components"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        All components
      </Link>
    </div>
  );
}

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const item = activeComponent(pathname);

  return (
    <SidebarShellContent key={pathname} item={item}>
      {children}
    </SidebarShellContent>
  );
}

function SidebarShellContent({
  children,
  item,
}: {
  children: React.ReactNode;
  item: ReturnType<typeof activeComponent>;
}) {
  const [mode, setMode] = useState<ViewMode>("preview");
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "code" || !item?.registry) return;

    let cancelled = false;

    fetchSource(item.registry).then((value) => {
      if (!cancelled) setSource(value);
    });

    return () => {
      cancelled = true;
    };
  }, [item?.registry, mode]);

  const displayedSource =
    mode === "code" && item?.registry && !source ? SOURCE_LOADING : source;

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-background">
      <main
        className={cn(
          "no-scrollbar h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto",
          pagePaddingClassName,
        )}
      >
        <div className={cn(pageContentClassName, "flex min-w-0 flex-col")}>
          <Breadcrumb />

          {mode === "preview" ? (
            <>
              <div className="h-72 w-full overflow-hidden rounded-xl border border-border bg-card sm:h-80 lg:h-[360px]">
                {children}
              </div>
              <section className="py-8">
                <DescriptionContent
                  item={item}
                  showSourceHint={false}
                  className="gap-10"
                />
              </section>
            </>
          ) : (
            <div className="flex min-w-0 items-start">
              {item?.registry ? (
                <PanelCode
                  code={displayedSource ?? SOURCE_LOADING}
                  showLineNumbers
                  fileName={`${item.registry}.tsx`}
                  copyable={Boolean(
                    displayedSource && displayedSource !== SOURCE_LOADING,
                  )}
                  className="w-full rounded-xl border border-border"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Source is not available for this component.
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <nav
        aria-label="Component view"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-0.5 rounded-full border border-border bg-background/90 p-1 backdrop-blur sm:bottom-5 sm:right-5"
      >
        {tabs.map((tab) => {
          const active = mode === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              aria-pressed={active}
              className={cn(
                "h-8 rounded-full px-3.5 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:px-4 sm:text-xs",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
