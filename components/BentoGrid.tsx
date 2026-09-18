"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Citrus,
  Eye,
  Heart,
  Mail,
  MousePointer2,
  Star,
} from "lucide-react";
import CopyButton from "@/components/CopyButton";
import { GithubLogo, LinkedinLogo, XLogo } from "@/components/logos";
import { components, REGISTRY_REPO } from "@/lib/components";
import {
  formatStars,
  getCachedGithubStars,
  getGithubStars,
} from "@/lib/github-stars-client";
import { SITE_AUTHOR, SITE_LINKS, SITE_REPO } from "@/lib/site";
import { Squircle } from "@/lib/squircle";

const ARTWORK = "/brand/calamansi-orchard1.png";

/**
 * The brand shape, straight from the component kit. It replaces `rounded-xl`,
 * because a squircle is a path and not a border radius: `Squircle` paints the
 * surface on its own layer and the content sits in a layer above it. The cards
 * sit flat on the page — no lift.
 */
const CARD_PAINT = "bg-card";
const CARD_BORDER = "text-border";
const DARK_PAINT = "bg-foreground";
/** Content layer — the surface is absolutely positioned, so it needs one. */
const CARD_CONTENT = "relative flex h-full min-h-0 flex-col";

/**
 * Records an anonymous page view against the stats endpoint.
 *
 * Nothing on the site displays visitor or view counts yet — this only keeps the
 * counter running so there is history to look back on once a database is
 * connected. Delete this component to stop collecting.
 */
function AnalyticsPing() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
    }).catch(() => {});
  }, []);

  return null;
}

function ArtworkCard() {
  return (
    <div className="group relative aspect-4/3 min-w-0 md:col-span-7">
      {/* the artwork lives inside the surface so the squircle clips it */}
      <Squircle className={CARD_PAINT} border={CARD_BORDER} lift={false}>
        <Image
          src={ARTWORK}
          alt="A calamansi painting a picture of itself under the trees in an orchard"
          fill
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </Squircle>
    </div>
  );
}

function RegistryCard() {
  const command = `npx shadcn@latest add ${REGISTRY_REPO}/calamansi`;

  return (
    <div className="relative min-w-0">
      <Squircle className={DARK_PAINT} lift={false} />

      <div
        className={`${CARD_CONTENT} justify-between gap-4 p-4 text-background sm:p-5`}
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-background/45">
            THE REGISTRY
          </p>
          <p className="mt-2 font-runde text-xl font-semibold tracking-tight sm:text-2xl">
            {components.length} components. Free, forever.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-background/55">
            Built for React and Next.js. Copy the source into your project and
            make it yours.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-2xl bg-background/10 px-3 py-2.5 ring-1 ring-background/10 sm:rounded-full sm:py-1.5 sm:pr-1.5">
          <code className="min-w-0 flex-1 font-mono text-[11px] leading-5 break-words text-background/50 whitespace-normal sm:leading-normal sm:truncate">
            npx shadcn@latest add{" "}
            <span className="font-semibold text-background">
              {REGISTRY_REPO}
            </span>
            /calamansi
          </code>
          <CopyButton
            value={command}
            label="Copy install command"
            title=""
            className="text-background/55 hover:text-background"
          />
        </div>
      </div>
    </div>
  );
}

const BEHAVIORS = [
  {
    label: "Blinks",
    detail: "all on its own, unprompted",
    icon: <Eye className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />,
  },
  {
    label: "Follows",
    detail: "its eyes track your cursor",
    icon: (
      <MousePointer2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
    ),
  },
  {
    label: "Blushes",
    detail: "when you pet it back and forth",
    icon: <Heart className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />,
  },
  {
    label: "Goes tart",
    detail: "after five quick pokes",
    icon: <Citrus className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />,
  },
] as const;

function BehaviorsCard() {
  return (
    <div className="relative min-w-0">
      <Squircle className={CARD_PAINT} border={CARD_BORDER} lift={false} />

      <div className={`${CARD_CONTENT} justify-between gap-4 p-4 sm:p-5`}>
        <p className="min-w-0 font-runde text-lg font-semibold tracking-tight">
          A fruit with opinions
        </p>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-x-3">
          {BEHAVIORS.map(({ label, detail, icon }) => (
            <div key={label} className="flex min-w-0 items-start gap-2">
              {icon}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{label}</p>
                <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                  {detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityCard() {
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
    <div className="relative min-w-0 md:col-span-7">
      <Squircle className={CARD_PAINT} border={CARD_BORDER} lift={false} />

      <div className={`${CARD_CONTENT} justify-between gap-6 p-4 sm:p-6`}>
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span>Open Source</span>
          </div>
          <p className="mt-2 font-runde text-2xl font-semibold tracking-tight sm:text-3xl">
            Built in public, free forever.
          </p>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Every component is open source and yours to customize. Star the repo
            on GitHub, submit feature requests, or contribute new animated
            components.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={SITE_REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GithubLogo className="size-4" />
            <span>Star on GitHub</span>
            {stars !== null && (
              <span className="flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-medium">
                <Star className="size-3 fill-current" />
                {formatStars(stars)}
              </span>
            )}
          </a>

          <a
            href={`${SITE_REPO}/issues/new?title=Component+Request`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>Request a component</span>
            <ArrowUpRight className="size-3.5 text-muted-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
}

const CONNECT = [
  {
    label: "GitHub",
    value: REGISTRY_REPO,
    href: SITE_LINKS.repo,
    icon: <GithubLogo className="size-3.5 shrink-0" />,
  },
  {
    label: "X",
    value: SITE_AUTHOR.handle,
    href: SITE_LINKS.x,
    icon: <XLogo className="size-3.5 shrink-0" />,
  },
  {
    label: "LinkedIn",
    value: "in/joshuasarmiento",
    href: SITE_LINKS.linkedin,
    icon: <LinkedinLogo className="size-3.5 shrink-0" />,
  },
  {
    label: "Email",
    value: SITE_LINKS.email.replace(/^mailto:/, ""),
    href: SITE_LINKS.email,
    icon: <Mail className="size-3.5 shrink-0" />,
  },
] as const;

function ConnectCard() {
  return (
    <div className="relative min-w-0 md:col-span-5">
      <Squircle className={CARD_PAINT} border={CARD_BORDER} lift={false} />

      <div className={`${CARD_CONTENT} justify-between gap-3 p-4 sm:p-5`}>
        <div className="min-w-0">
          <p className="font-runde text-lg font-semibold tracking-tight">
            Made by {SITE_AUTHOR.name}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Say hi, report a bug, or send a component request.
          </p>
        </div>

        <ul className="flex flex-col gap-0.5">
          {CONNECT.map(({ label, value, href, icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-muted-foreground transition-colors group-hover:text-foreground">
                  {icon}
                </span>
                <span className="w-14 shrink-0 text-xs font-semibold">
                  {label}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {value}
                </span>
                <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground/45 transition-colors group-hover:text-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function BentoGrid() {
  return (
    // the page owns this section's hairline and vertical rhythm
    <section aria-label="Calamansi UI highlights" className="w-full">
      <AnalyticsPing />

      <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-12">
        <ArtworkCard />

        <div className="grid min-w-0 gap-3 sm:gap-4 md:col-span-5 md:grid-rows-2">
          <RegistryCard />
          <BehaviorsCard />
        </div>

        <CommunityCard />
        <ConnectCard />
      </div>
    </section>
  );
}
