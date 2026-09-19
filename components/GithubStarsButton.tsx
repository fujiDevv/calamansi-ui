"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GithubLogo } from "@/components/logos";
import {
  formatStars,
  getCachedGithubStars,
  getGithubStars,
} from "@/lib/github-stars-client";
import { SITE_REPO } from "@/lib/site";

/**
 * The repo, with the live star count on it.
 *
 * The count is client-side because it is a moving number that has no business in
 * the build, and it comes from the shared client in `lib/github-stars-client`, so
 * this and the Bento card's own button hit one request between them rather than
 * two. `getCachedGithubStars` seeds the state first, so when one of them has
 * already fetched, this one paints the real number immediately instead of the
 * placeholder.
 *
 * The pill is always rendered, placeholder or not, and held at a fixed minimum
 * width: a count arriving late should not shove the buttons next to it sideways.
 */
export default function GithubStarsButton({
  className,
}: {
  className?: string;
}) {
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
    <Button
      href={SITE_REPO}
      target="_blank"
      rel="noreferrer"
      variant="secondary"
      size="md"
      className={className}
      /*
        Named for the action, not just the place: the nav already has a link to
        this repo announced as "Calamansi UI on GitHub", and two links with the
        same name on one page are two links nobody can tell apart.
      */
      aria-label={
        stars === null
          ? "Star Calamansi UI on GitHub"
          : `Star Calamansi UI on GitHub, ${stars} stars`
      }
    >
      <GithubLogo className="size-4" />
      <span>Star</span>
      <span
        aria-hidden="true"
        className="flex min-w-12 items-center justify-center gap-1 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-medium tabular-nums"
      >
        <Star className="size-3 fill-current" />
        {stars === null ? "—" : formatStars(stars)}
      </span>
    </Button>
  );
}
