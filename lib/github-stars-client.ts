"use client";

import { SITE_REPO } from "./site";

let cachedStars: number | null = null;
let starsRequest: Promise<number | null> | null = null;

const REPO_PATH = SITE_REPO.replace("https://github.com/", "");
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_PATH}`;

export function formatStars(stars: number): string {
  if (stars < 1000) return String(stars);
  return `${(stars / 1000).toFixed(stars < 10000 ? 1 : 0)}k`;
}

/**
 * Fetches the live GitHub star count for the Calamansi UI repository.
 *
 * Checks the edge endpoint (/api/github-stars). If running in local development
 * (where worker.ts does not run), or if the edge response is stale/unavailable,
 * it seamlessly falls back to the public GitHub API.
 */
export async function getGithubStars(): Promise<number | null> {
  if (cachedStars !== null) {
    return cachedStars;
  }

  if (starsRequest) {
    return starsRequest;
  }

  starsRequest = (async () => {
    // 1. Try edge endpoint with standard revalidation (bypasses stale browser force-cache)
    try {
      const res = await fetch("/api/github-stars", {
        cache: "no-cache",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const data = (await res.json()) as { stars?: number | null };
        if (typeof data?.stars === "number" && data.stars > 0) {
          cachedStars = data.stars;
          return cachedStars;
        }
      }
    } catch {
      // In local development or network failure, fall through to direct API
    }

    // 2. Direct GitHub API fallback (works locally and ensures fresh count)
    try {
      const res = await fetch(GITHUB_API_URL, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });

      if (res.ok) {
        const data = (await res.json()) as { stargazers_count?: number };
        if (typeof data?.stargazers_count === "number") {
          cachedStars = data.stargazers_count;
          return cachedStars;
        }
      }
    } catch {
      // Fallback failed, retain cached value or null
    }

    return cachedStars;
  })();

  return starsRequest;
}

export function getCachedGithubStars(): number | null {
  return cachedStars;
}
