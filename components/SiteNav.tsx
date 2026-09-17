"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
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
  { label: "Docs", href: "/components/introduction" },
];

/** Docs live under /components/*, so that link stays lit for the whole section. */
const isCurrent = (pathname: string, href: string) =>
  href === "/components/introduction"
    ? pathname.startsWith("/components") || pathname.startsWith("/docs")
    : pathname === href;

/** One bare icon button, matching the links either side of it. */
const TOGGLE =
  "size-7 rounded-md border-transparent bg-transparent text-muted-foreground hover:border-transparent hover:text-foreground";

/**
 * The nav cluster shared by the marketing header and the docs header: plain
 * links with a lime rule under the current one, a GitHub link with the live star
 * count, a hairline divider and the theme toggle. Keeping it in one place is what
 * stops the two headers drifting apart.
 */
export default function SiteNav({ className }: { className?: string }) {
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
    <nav
      aria-label="Primary"
      className={cn("flex items-center gap-x-5 sm:gap-x-8", className)}
    >
      {LINKS.map((link) => {
        const current = isCurrent(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={cn(
              "border-b pb-0.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out",
              current
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}

      <a
        href={SITE_REPO}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
      >
        <GithubLogo className="size-4" />
        <span className="hidden sm:inline">GitHub</span>
        {stars != null && (
          <span className="hidden items-center gap-1 text-xs tabular-nums min-[560px]:inline-flex">
            <Star className="size-3 fill-current" aria-hidden="true" />
            {formatStars(stars)}
          </span>
        )}
      </a>

      <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />

      <ThemeToggle className={TOGGLE} />
    </nav>
  );
}
