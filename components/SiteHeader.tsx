"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { CalamansiMark } from "@/components/ui/calamansi";
import { GithubLogo } from "@/components/logos";
import ThemeToggle from "@/components/ThemeToggle";
import {
  formatStars,
  getCachedGithubStars,
  getGithubStars,
} from "@/lib/github-stars-client";
import { SITE_REPO } from "@/lib/site";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "Components", href: "/components" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [stars, setStars] = useState<number | null>(getCachedGithubStars());

  useEffect(() => {
    let cancelled = false;

    getGithubStars().then((value) => {
      if (!cancelled) setStars(value);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 sm:gap-6 sm:px-6 md:px-8">
        <Link
          href="/"
          aria-label="Calamansi UI home"
          className="flex shrink-0 items-center gap-2"
        >
          <CalamansiMark className="size-7 text-primary" />
          <span className="font-runde text-[15px] font-bold tracking-tight">
            Calamansi UI
          </span>
        </Link>

        <nav aria-label="Primary" className="flex min-w-0 items-center">
          {LINKS.map((link) => {
            const active =
              link.href === "/components"
                ? pathname === "/components" ||
                  pathname.startsWith("/components/")
                : pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-16 items-center px-3 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 origin-left bg-primary transition-transform duration-200 ease-out motion-reduce:transition-none",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={SITE_REPO}
            target="_blank"
            rel="noreferrer"
            className="hidden h-9 items-center gap-2 rounded-full border border-border px-3 text-xs font-semibold text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground sm:inline-flex"
          >
            <GithubLogo className="size-4" />
            {stars != null ? (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Star className="size-3 fill-current" aria-hidden="true" />
                {formatStars(stars)}
              </span>
            ) : (
              <span>Source</span>
            )}
          </a>

          <ThemeToggle className="size-9" />
        </div>
      </div>
    </header>
  );
}
