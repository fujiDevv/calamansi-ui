import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PanelCode from "@/components/Description/PanelCode";
import { REGISTRY_REPO } from "@/lib/components";

export const dynamic = "force-static";

export const metadata: Metadata = {
  /* the layout appends the brand through its title template */
  title: "Installation",
  description:
    "Learn how to set up your project and install Calamansi UI components with the shadcn CLI.",
};

const UTILS_CODE = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`;

const EYEBROW =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";

const H2 = "font-runde text-2xl font-bold tracking-tight text-foreground";

const STEPS = [
  {
    title: "Create project",
    body: "Start with a Next.js application configured with Tailwind CSS:",
    code: "npx create-next-app@latest my-app --typescript --tailwind --app",
    fileName: "Terminal",
    numberLines: false,
  },
  {
    title: "Install dependencies",
    body: "Install the utility libraries for class merging and the animation runtime:",
    code: "npm install clsx tailwind-merge motion",
    fileName: "Terminal",
    numberLines: false,
  },
  {
    title: "Add utility helper",
    body: "Create lib/utils.ts to merge Tailwind classes cleanly:",
    code: UTILS_CODE,
    fileName: "lib/utils.ts",
    numberLines: true,
  },
  {
    title: "Install components",
    body: "Use the shadcn CLI to copy any component directly into your project:",
    code: `npx shadcn@latest add ${REGISTRY_REPO}/calamansi`,
    fileName: "Terminal",
    numberLines: false,
  },
];

export default function InstallationPage() {
  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3 border-b border-border pb-10">
        <p className={EYEBROW}>Getting started</p>
        <h1 className="font-runde text-[clamp(2rem,5vw,3.25rem)] leading-[0.98] font-bold tracking-tight text-foreground">
          Installation
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Configure your React or Next.js project and install Calamansi UI
          components.
        </p>
      </div>

      {STEPS.map((step, index) => (
        <section key={step.title} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
              Step {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className={H2}>{step.title}</h2>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {step.body}
          </p>

          <PanelCode
            code={step.code}
            fileName={step.fileName}
            copyable
            showLineNumbers={step.numberLines}
            className="rounded-xl border border-border"
          />

          {index === STEPS.length - 1 && (
            <p className="text-xs text-muted-foreground">
              You can also use bun:{" "}
              <code>
                bunx --bun shadcn@latest add {REGISTRY_REPO}/calamansi
              </code>
            </p>
          )}
        </section>
      ))}

      <div className="flex items-center justify-between gap-4 border-t border-border pt-6">
        <Link
          href="/components/introduction"
          className="text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
        >
          &larr; Introduction
        </Link>
        <Link
          href="/components/calamansi"
          className="flex max-w-[48%] items-center gap-1.5 text-right text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:text-primary"
        >
          <span className="truncate">Calamansi Mascot</span>
          <ArrowRight className="size-4 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
