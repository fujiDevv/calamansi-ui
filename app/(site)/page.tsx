import type { Metadata } from "next";
import { Calamansi, type CalamansiMood } from "@/components/ui/calamansi";
import CopyButton from "@/components/CopyButton";
import BentoGrid from "@/components/BentoGrid";
// import ComponentIndex from "@/components/ComponentIndex";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { components, REGISTRY_REPO } from "@/lib/components";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/site";
import { siteContainerClassName } from "@/lib/page-layout";
import {
  absoluteUrl,
  SITE_FAQS,
  SITE_OG_IMAGE,
  SITE_TWITTER_IMAGE,
} from "@/lib/seo";

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

export default function Home() {
  return (
    <div className={siteContainerClassName}>
      <section className="grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-14 lg:pb-20 lg:pt-24">
        <div className="lg:col-span-6">
          <h1 className="font-runde text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block">Components</span>
            <span className="block text-muted-foreground">
              with a little sour.
            </span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            {components.length} components, one file each. Install with the
            shadcn CLI, then edit the source like it was always yours.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CopyButton
              value={INSTALL_COMMAND}
              label="Copy install command"
              iconClassName="size-4"
              className="h-11 w-full justify-between rounded-full border border-border bg-card pl-4 pr-3 text-foreground transition-colors hover:border-foreground/20 sm:w-auto sm:justify-start sm:gap-3 sm:pl-5 sm:pr-4"
            >
              <code className="min-w-0 truncate font-mono text-xs font-semibold sm:text-[13px]">
                npx shadcn@latest add {REGISTRY_REPO}
                <span className="font-normal text-muted-foreground">
                  /&lt;component&gt;
                </span>
              </code>
            </CopyButton>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="flex min-h-[380px] w-full flex-col items-center justify-center gap-4 rounded-xl p-6 sm:aspect-4/3 sm:min-h-0 sm:p-8">
            <Calamansi
              variant="primary"
              size={168}
              className="shrink-0 drop-shadow-sm"
            />

            <p className="max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
              Move your cursor and it will watch you. Pet it back and forth to
              make it blush. Poke it five times and it goes tart.
            </p>

            <ul className="flex items-end justify-center gap-5">
              {MOODS.map((mood) => (
                <li key={mood} className="flex flex-col items-center gap-1">
                  <Calamansi mood={mood} interactive={false} size={34} />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {mood}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* <section
        aria-label="What you get"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4"
      >
        {FACTS.map((fact) => (
          <div key={fact.value} className="bg-background p-5">
            <p className="font-runde text-base font-bold tracking-tight sm:text-lg">
              {fact.value}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {fact.label}
            </p>
          </div>
        ))}
      </section> */}

      {/* <ComponentIndex /> */}

      <BentoGrid />

      <section
        id="faq"
        aria-labelledby="faq-title"
        className="border-t border-border py-16 sm:py-20 lg:py-24"
      >
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <h2
              id="faq-title"
              className="font-runde text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Frequently asked
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The questions that come up most, answered briefly.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="border-t border-border lg:col-span-8"
          >
            {SITE_FAQS.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={`faq-${index}`}
                className="border-b border-border"
              >
                <AccordionTrigger className="py-5 font-runde text-base font-semibold hover:no-underline hover:text-primary [&>svg]:text-muted-foreground">
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
