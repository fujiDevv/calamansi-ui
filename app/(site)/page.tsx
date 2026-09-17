import type { Metadata } from "next";
import { Calamansi, type CalamansiMood } from "@/components/ui/calamansi";
import CopyButton from "@/components/CopyButton";
import BentoGrid from "@/components/BentoGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { components, REGISTRY_REPO } from "@/lib/components";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site";
import {
  absoluteUrl,
  SITE_FAQS,
  SITE_OG_IMAGE,
  SITE_TWITTER_IMAGE,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: SITE_TAGLINE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl(SITE_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: "Calamansi UI animated React components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(SITE_TWITTER_IMAGE)],
  },
};

const INSTALL_COMMAND = `npx shadcn@latest add ${REGISTRY_REPO}/<component-name>`;

const MOODS: CalamansiMood[] = ["happy", "love", "sleepy", "tart"];

const FACTS = [
  {
    value: `${components.length} components`,
    label: "One file each, nothing to keep in sync",
  },
  { value: "One command", label: "Installed with the shadcn CLI" },
  { value: "React 19", label: "TypeScript and Tailwind CSS v4" },
  { value: "Motion + GSAP", label: "What drives the animation" },
];

/**
 * The page borrows the footer's frame: every section is full width and carries
 * its own 96rem gutter and hairline, so the header, the sections and the footer
 * all line up on the same rules.
 */
const SHELL = "mx-auto w-full max-w-[96rem] px-6 sm:px-10";

/** The footer's micro-label: small, spaced, uppercase. */
const EYEBROW =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";

export default function Home() {
  return (
    <div className="w-full">
      <section
        aria-labelledby="hero-title"
        className={cn(SHELL, "pt-10 pb-14 sm:pt-16 sm:pb-20")}
      >
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {FACTS.map((fact, index) => (
            <span key={fact.value} className="flex items-center gap-3">
              {index > 0 && (
                <span aria-hidden="true" className="text-muted-foreground/50">
                  &middot;
                </span>
              )}
              <span className={EYEBROW}>{fact.value}</span>
            </span>
          ))}
        </p>

        <h1
          id="hero-title"
          className="mt-6 font-runde text-[clamp(2.75rem,12vw,9.5rem)] leading-[0.92] font-bold tracking-tight sm:mt-8"
        >
          Components{" "}
          <span className="text-muted-foreground">with a little sour.</span>
        </h1>

        <div className="mt-10 grid gap-10 border-t border-border pt-10 sm:mt-14 sm:pt-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              {components.length} components, one file each. Install with the
              shadcn CLI, then edit the source like it was always yours.
            </p>

            <CopyButton
              value={INSTALL_COMMAND}
              label="Copy install command"
              iconClassName="size-4"
              className="mt-8 flex h-auto min-h-11 w-full max-w-sm justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-2.5 text-foreground transition-colors hover:border-foreground/20 sm:h-11 sm:rounded-full sm:justify-start sm:py-0 sm:pr-4 sm:pl-5"
            >
              {/* phones wrap the command instead of cutting the component name off */}
              <code className="min-w-0 flex-1 font-mono text-[11px] leading-5 font-semibold break-words whitespace-normal sm:text-[13px] sm:truncate sm:leading-normal">
                npx shadcn@latest add {REGISTRY_REPO}
                <span className="font-normal text-muted-foreground">
                  /&lt;component&gt;
                </span>
              </code>
            </CopyButton>
          </div>

          <div className="lg:col-span-7">
            <div className="flex min-h-[280px] w-full flex-col items-center justify-center gap-4 sm:min-h-[340px] sm:gap-5">
              <Calamansi
                variant="primary"
                size={132}
                className="shrink-0 drop-shadow-sm sm:hidden"
              />
              <Calamansi
                variant="primary"
                size={168}
                className="hidden shrink-0 drop-shadow-sm sm:block"
              />

              <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
                Move your cursor and it will watch you. Pet it back and forth to
                make it blush. Poke it five times and it goes tart.
              </p>

              <ul className="flex flex-wrap items-end justify-center gap-2.5 sm:gap-6">
                {MOODS.map((mood) => (
                  <li key={mood} className="flex flex-col items-center gap-1.5">
                    <Calamansi
                      mood={mood}
                      interactive={false}
                      size={28}
                      className="sm:hidden"
                    />
                    <Calamansi
                      mood={mood}
                      interactive={false}
                      size={34}
                      className="hidden sm:block"
                    />
                    <span
                      className={cn(EYEBROW, "text-[9px] tracking-[0.16em]")}
                    >
                      {mood}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className={cn(SHELL, "border-t border-border py-16 sm:py-24")}>
        <BentoGrid />
      </div>

      <section
        id="faq"
        aria-labelledby="faq-title"
        className={cn(SHELL, "border-t border-border py-16 sm:py-24")}
      >
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className={EYEBROW}>Questions</p>
            <h2
              id="faq-title"
              className="mt-4 font-runde text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.98] font-bold tracking-tight"
            >
              Frequently <span className="text-muted-foreground">asked.</span>
            </h2>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The questions that come up most, answered briefly.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="border-t border-border lg:col-span-7"
          >
            {SITE_FAQS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="py-5 font-runde text-base font-semibold hover:text-primary hover:no-underline [&>svg]:text-muted-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pr-6 pb-5 text-sm leading-6 text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
