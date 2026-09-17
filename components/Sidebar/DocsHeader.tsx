"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { CalamansiMark } from "@/components/ui/calamansi";
import SiteNav from "@/components/SiteNav";

/**
 * The docs header is the marketing header plus a drawer toggle: same hairline,
 * same 96rem gutter, same wordmark, same nav cluster. h-16 / sm:h-20 is
 * load-bearing — the sidebar rail sticks below it.
 */
export default function DocsHeader({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-4 px-6 sm:h-20 sm:gap-10 sm:px-10">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
          className="flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:hidden"
        >
          {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>

        <Link
          href="/"
          aria-label="Calamansi UI home"
          className="flex shrink-0 items-center gap-2.5"
        >
          <CalamansiMark className="size-7 text-primary sm:size-8" />
          <span className="font-runde hidden text-xl font-bold tracking-tight whitespace-nowrap min-[420px]:inline sm:text-2xl">
            Calamansi UI
          </span>
        </Link>

        <SiteNav className="ml-auto" />
      </div>
    </header>
  );
}
