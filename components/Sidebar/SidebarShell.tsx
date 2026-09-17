"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Code2,
  ExternalLink,
  Eye,
  X,
} from "lucide-react";
import { activeComponent, components } from "@/lib/components";
import { cn } from "@/lib/utils";
import DescriptionContent from "../Description/DescriptionContent";
import PanelCode from "../Description/PanelCode";
import { fetchSource, SOURCE_LOADING } from "../Description/fetchSource";
import DocSidebar from "./DocSidebar";
import DocsHeader from "./DocsHeader";

type ViewMode = "preview" | "code";

/** The footer's micro-label, reused for every eyebrow and rule label in docs. */
const EYEBROW =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";

/** The header's tab treatment: a lime rule under the active one. */
const TAB =
  "flex cursor-pointer items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition-colors duration-150 ease-out";

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const item = activeComponent(pathname);

  return (
    <SidebarShellContent item={item} pathname={pathname}>
      {children}
    </SidebarShellContent>
  );
}

function SidebarShellContent({
  children,
  item,
  pathname,
}: {
  children: React.ReactNode;
  item: ReturnType<typeof activeComponent>;
  pathname: string;
}) {
  const [mode, setMode] = useState<ViewMode>("preview");
  const [source, setSource] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMode("preview");
    setSource(null);
    setMobileOpen(false);
  }, [pathname]);

  // the drawer covers the page, so lock the page scroll behind it and let Escape dismiss it
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

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

  // Pagination for previous and next component
  const currentIndex = item
    ? components.findIndex((c) => c.href === item.href)
    : -1;
  const prevComponent =
    currentIndex > 0
      ? components[currentIndex - 1]
      : currentIndex === 0
        ? { href: "/components/installation", name: "Installation" }
        : null;
  const nextComponent =
    currentIndex >= 0 && currentIndex < components.length - 1
      ? components[currentIndex + 1]
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DocsHeader mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex md:hidden"
        >
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 flex h-full w-[min(18rem,85vw)] flex-col overflow-y-auto border-r border-border bg-background px-6 pt-5 pb-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <span className={EYEBROW}>Navigation</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="size-4" />
              </button>
            </div>
            <DocSidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Sidebar rail + content column, on the same 96rem gutter as the marketing pages */}
      <div className="mx-auto flex w-full max-w-[96rem] flex-1 items-start">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto border-r border-border pt-8 pb-12 pl-6 sm:top-20 sm:h-[calc(100vh-5rem)] sm:pl-10 md:block">
          <DocSidebar />
        </aside>

        {/*
          the column fills the frame rather than capping at 4xl: the preview panel and
          the code blocks are the widest things on the page and were leaving a band of
          empty space on the right. Prose keeps its own measure instead.
        */}
        <main
          key={pathname}
          className="min-w-0 flex-1 px-6 pt-8 pb-16 sm:px-10 sm:pt-10"
        >
          {item ? (
            <div className="flex min-w-0 flex-col">
              {/* Breadcrumb */}
              <div
                className={cn(
                  "flex flex-wrap items-center gap-x-2 gap-y-1",
                  EYEBROW,
                )}
              >
                <Link
                  href="/components/introduction"
                  className="transition-colors duration-150 ease-out hover:text-foreground"
                >
                  Docs
                </Link>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  /
                </span>
                <span>{item.category}</span>
                <span aria-hidden="true" className="text-muted-foreground/50">
                  /
                </span>
                <span className="min-w-0 truncate text-foreground">
                  {item.name}
                </span>
              </div>

              {/* Title & Description */}
              <div className="mt-5 flex flex-col gap-3">
                <h1 className="font-runde text-[clamp(2rem,5vw,3.25rem)] leading-[0.98] font-bold tracking-tight text-foreground">
                  {item.name}
                </h1>
                {item.description && (
                  <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Tabs: Preview / Code */}
              <div className="mt-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border">
                <div className="flex items-center gap-6">
                  <button
                    type="button"
                    onClick={() => setMode("preview")}
                    aria-pressed={mode === "preview"}
                    className={cn(
                      TAB,
                      "-mb-px",
                      mode === "preview"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Eye className="size-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("code")}
                    aria-pressed={mode === "code"}
                    className={cn(
                      TAB,
                      "-mb-px",
                      mode === "code"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Code2 className="size-3.5" />
                    <span>Code</span>
                  </button>
                </div>

                {item.source && (
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noreferrer"
                    className="mb-2.5 hidden items-center gap-1 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground sm:inline-flex"
                  >
                    <span>View source</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>

              {/* Content Panel */}
              {mode === "preview" ? (
                <>
                  <div className="mt-6 flex min-h-[280px] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-3 sm:min-h-[400px] sm:p-6 md:p-8">
                    {children}
                  </div>
                  <section className="pt-12">
                    <DescriptionContent
                      item={item}
                      showHeading={false}
                      showSourceHint={false}
                      className="gap-10"
                    />
                  </section>
                </>
              ) : (
                <div className="mt-6 flex min-w-0 items-start">
                  {item.registry ? (
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
                      Source code is not available for this component.
                    </p>
                  )}
                </div>
              )}

              {/* Pagination (Previous / Next) */}
              <div className="mt-16 flex items-center justify-between gap-4 border-t border-border pt-6">
                {prevComponent ? (
                  <Link
                    href={prevComponent.href}
                    className="group flex max-w-[48%] items-center gap-2 transition-colors duration-150 ease-out"
                  >
                    <ChevronLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                    <div className="flex min-w-0 flex-col text-left">
                      <span className={cn(EYEBROW, "text-[10px]")}>
                        Previous
                      </span>
                      <span className="truncate text-sm font-medium text-foreground">
                        {prevComponent.name}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div />
                )}

                {nextComponent ? (
                  <Link
                    href={nextComponent.href}
                    className="group flex max-w-[48%] items-center gap-2 text-right transition-colors duration-150 ease-out"
                  >
                    <div className="flex min-w-0 flex-col text-right">
                      <span className={cn(EYEBROW, "text-[10px]")}>Next</span>
                      <span className="truncate text-sm font-medium text-foreground">
                        {nextComponent.name}
                      </span>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col">{children}</div>
          )}
        </main>
      </div>
    </div>
  );
}
