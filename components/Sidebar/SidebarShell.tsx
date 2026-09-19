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
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { activeComponent, components } from "@/lib/components";
import { docSurfaceClassName } from "@/lib/page-layout";
import { NO_LIFT } from "@/lib/squircle";
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
  "flex cursor-pointer items-center gap-2 border-b-2 pb-2.5 text-[13px] font-medium transition-colors duration-150 ease-out";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMode("preview");
    setSource(null);
    setMobileOpen(false);
    setIsFullscreen(false);
  }, [pathname]);

  // Lock body scroll and listen to Escape when in full screen preview
  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreen]);

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
    // pb-* is the nav's band — the handle floats over the page's bottom-centre
    <div className="flex min-h-screen flex-col bg-background pb-12 sm:pb-14">
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
          <div className="relative z-50 flex h-full w-[min(18rem,85vw)] flex-col overflow-hidden bg-background px-6 pt-5 pb-8 shadow-2xl">
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
        {/* a column, so the sidebar can be the scroller and its edge fade lands
            on the rail rather than at the end of the list */}
        {/* from lg there is no bar above it — the nav is the rail beside it — so
            the column sticks to the top of the viewport rather than under a bar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col overflow-hidden pl-6 sm:top-20 sm:h-[calc(100vh-5rem)] sm:pl-10 md:flex lg:top-0 lg:h-screen">
          <DocSidebar />
        </aside>

        {/*
          the column fills the frame rather than capping at 4xl: the preview panel and
          the code blocks are the widest things on the page and were leaving a band of
          empty space on the right. Prose keeps its own measure instead.
        */}
        <main
          key={pathname}
          /* mx-auto against a max-w-4xl: the column used to run the full width of
             the frame, which left the prose stranded in a very wide measure and
             the preview panel wider than the components in it needed. It is
             centred in what is left beside the rail. */
          className="mx-auto min-w-0 w-full max-w-4xl flex-1 px-6 pt-8 pb-16 sm:px-10 sm:pt-10"
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
                <h1 className="font-runde text-[clamp(1.6rem,3.4vw,2.25rem)] leading-[1.02] font-bold tracking-tight text-foreground">
                  {item.name}
                </h1>
                {item.description && (
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
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

                <div className="mb-2.5 flex items-center gap-3">
                  {mode === "preview" && (
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(true)}
                      className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground sm:inline-flex"
                      title="Full screen preview"
                    >
                      <Maximize2 className="size-3" />
                      <span>Full screen</span>
                    </button>
                  )}
                  {item.source && (
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground sm:inline-flex"
                    >
                      <span>View source</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Content Panel */}
              {mode === "preview" ? (
                <>
                  <div
                    /* the preview panel is no place for a shadow, and its edge would
                       slice one off anyway — every surface inside renders flat */
                    style={NO_LIFT}
                    className={cn(
                      // the shared doc grey, not a white sheet: `--border` is the fill
                      // the liquid components paint themselves with, so previewing
                      // them on it is the surface they were drawn against
                      docSurfaceClassName,
                      "flex items-center justify-center border border-border text-foreground",
                      isFullscreen
                        ? "fixed inset-0 z-50 m-0 h-screen w-screen overflow-y-auto rounded-none border-0 bg-background p-4 sm:p-8"
                        : "relative mt-6 min-h-[280px] w-full overflow-hidden rounded-xl p-4 sm:min-h-[400px] sm:p-7 md:p-10",
                    )}
                  >
                    {/* Fullscreen header chip */}
                    {isFullscreen && (
                      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-lg border border-border/80 bg-border/85 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-md sm:top-6 sm:left-6 dark:bg-card/85">
                        <span className="font-semibold text-foreground">
                          {item.name}
                        </span>
                        <span className="text-muted-foreground/60">/</span>
                        <span>Preview</span>
                      </div>
                    )}

                    {/*
                      The way out, and only that: the way in is the tab row's Full
                      screen button, so the preview itself stays bare until it is
                      covering the page and you need a way back off it.
                    */}
                    {isFullscreen && (
                      <div className="absolute top-4 right-4 z-30 flex items-center gap-2 sm:top-6 sm:right-6">
                        <button
                          type="button"
                          onClick={() => setIsFullscreen(false)}
                          aria-label="Exit full screen"
                          title="Exit full screen (Esc)"
                          className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-border/85 px-2.5 py-1.5 text-xs font-medium text-muted-foreground shadow-2xs backdrop-blur-md transition-all duration-150 hover:border-border hover:bg-border hover:text-foreground hover:shadow-xs active:scale-95 dark:bg-background/85 dark:hover:bg-background"
                        >
                          <Minimize2 className="size-3.5" />
                          <span>Exit full screen</span>
                        </button>
                      </div>
                    )}

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
