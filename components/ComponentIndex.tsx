"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import PreviewFallback from "@/components/gallery/PreviewFallback";
import PreviewVideo from "@/components/gallery/PreviewVideo";
import { CATEGORY_LABELS, components, installCommand } from "@/lib/components";
import { cn } from "@/lib/utils";
import { sectionClassName } from "@/lib/page-layout";

export default function ComponentIndex() {
  const [activeHref, setActiveHref] = useState(components[0]?.href ?? "");
  const active =
    components.find((item) => item.href === activeHref) ?? components[0];

  if (!active) return null;

  const command = installCommand(active);

  return (
    <section
      aria-labelledby="registry-title"
      className={cn("border-t border-border", sectionClassName)}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h2
            id="registry-title"
            className="font-runde text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Everything in the registry
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hover a name to see it move. Everything is copied into your project,
            so you can rewrite any part of it.
          </p>

          <ul className="mt-8 border-t border-border">
            {components.map((item) => {
              const isActive = item.href === active.href;

              return (
                <li key={item.href} className="border-b border-border">
                  <Link
                    href={item.href}
                    onMouseEnter={() => setActiveHref(item.href)}
                    onFocus={() => setActiveHref(item.href)}
                    className="group flex items-center justify-between gap-6 py-4"
                  >
                    <span
                      className={cn(
                        "truncate font-runde text-lg font-semibold tracking-tight transition-colors sm:text-xl",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      {item.name}
                    </span>

                    <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      {CATEGORY_LABELS[item.category]}
                      <ArrowUpRight
                        aria-hidden="true"
                        className={cn(
                          "size-4 transition-opacity",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* the live preview only exists where there is room for a fixed column */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative aspect-4/3 w-full bg-muted">
              {active.preview ? (
                <PreviewVideo
                  key={active.href}
                  src={active.preview}
                  autoPlay
                />
              ) : (
                <PreviewFallback />
              )}
            </div>

            {/* <div className="border-t border-border p-5">
              <p className="text-sm leading-relaxed text-foreground">
                {active.description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link
                  href={active.href}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
                >
                  Open {active.name}
                  <ArrowUpRight className="size-3.5" />
                </Link>

                {command && (
                  <span className="inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-border pl-3.5 pr-1.5">
                    <code
                      title={command}
                      className="min-w-0 truncate font-mono text-[11px] text-muted-foreground"
                    >
                      {command}
                    </code>
                    <CopyButton
                      value={command}
                      label="Copy install command"
                      title=""
                      className="size-7"
                    />
                  </span>
                )}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}
