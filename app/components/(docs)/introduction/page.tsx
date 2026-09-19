import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Code2, Terminal, Zap } from "lucide-react";
import { components } from "@/lib/components";
import { cn } from "@/lib/utils";

export const dynamic = "force-static";

export const metadata: Metadata = {
  /* the layout appends the brand through its title template */
  title: "Introduction",
  description:
    "An open-source registry of animated React components designed for Next.js, Tailwind CSS, and the shadcn CLI.",
};

const EYEBROW =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";

const H2 = "font-runde text-2xl font-bold tracking-tight text-foreground";

const FEATURES = [
  {
    icon: Zap,
    tone: "bg-primary/15 text-primary",
    title: "Single-file architecture",
    body: "Zero package lock-in. Every component lives in its own file within your project.",
  },
  {
    icon: Terminal,
    tone: "bg-accent/25 text-accent-foreground",
    title: "shadcn CLI distribution",
    body: "Install any component with npx shadcn@latest add, then own the source.",
  },
  {
    icon: Code2,
    tone: "bg-primary/15 text-primary",
    title: "Tailwind CSS v4, React 19",
    body: "Modern CSS properties, CSS motion paths and native dark mode support.",
  },
  {
    icon: Activity,
    tone: "bg-calamansi-blush/20 text-calamansi-blush",
    title: "Physics-based motion",
    body: "Realistic springs, smooth hover sheens and pointer tracking, powered by Motion and GSAP.",
  },
];

const NEXT_STEPS = [
  {
    href: "/components/installation",
    title: "Installation guide",
    body: "Configure your project and install the utilities",
  },
  {
    href: "/components/calamansi",
    title: "Explore components",
    body: `Browse all ${components.length} components`,
  },
];

export default function IntroductionPage() {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3 border-b border-border pb-10">
        <p className={EYEBROW}>Documentation</p>
        <h1 className="font-runde text-[clamp(2rem,5vw,3.25rem)] leading-[0.98] font-bold tracking-tight text-foreground">
          Introduction
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A free, open-source registry of animated React components with a
          citrus zest, crafted for Next.js, React 19, Tailwind CSS v4, and the
          shadcn CLI.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className={H2}>
          What is <span className="text-muted-foreground">Calamansi UI?</span>
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Calamansi UI is not a monolithic npm dependency. Instead, it is an
          open-source collection of standalone, single-file animated components
          inspired by the tart, energetic personality of the calamansi fruit.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every component is designed to be installed directly into your
          repository with a single command, giving you full control to customize
          colors, spring physics, animation durations, and layout.
        </p>
      </div>

      <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, tone, title, body }) => (
          <div key={title} className="border-t border-border pt-6">
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg",
                tone,
              )}
            >
              <Icon className="size-4" />
            </span>
            <h3 className="mt-4 font-runde text-base font-bold tracking-tight text-foreground">
              {title}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {body}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className={H2}>
          Next <span className="text-muted-foreground">steps.</span>
        </h2>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {NEXT_STEPS.map((step) => (
            <Link
              key={step.href}
              href={step.href}
              className="group flex items-center justify-between gap-4 border-t border-border pt-5 transition-colors duration-150 ease-out hover:border-foreground/40"
            >
              <span className="min-w-0">
                <span className="block font-runde text-base font-bold tracking-tight text-foreground">
                  {step.title}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {step.body}
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
