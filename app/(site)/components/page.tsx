import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import ComponentCard from "@/components/gallery/ComponentCard";
import JsonLd from "@/components/JsonLd";
import { Button } from "@/components/ui/Button";
import { components, gallerySections, REGISTRY_REPO } from "@/lib/components";
import { absoluteUrl, componentsJsonLd, SITE_OG_IMAGE } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THE REGISTRY INDEX
 *
 * The hub every component page hangs off. It is the second-most valuable page on
 * the site after the homepage, so it exists rather than throwing: a 404 at
 * `/components` would leave the breadcrumb trail, the nav's "Components"
 * destination and the CollectionPage JSON-LD all pointing at nothing.
 *
 * `componentsJsonLd()` describes this page as a CollectionPage with an ItemList
 * of every entry, which is the shape Google reads for a gallery like this.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const metadata: Metadata = {
  /* the layout appends the brand through its title template */
  title: "Animated React Components",
  description: `Browse all ${components.length} animated React components in the ${SITE_NAME} registry. Cards, docks, navigation, inputs and AI kit pieces, each installed with the shadcn CLI.`,
  alternates: {
    canonical: "/components",
  },
  openGraph: {
    title: `Animated React Components | ${SITE_NAME}`,
    description: `${components.length} animated React components, free and open source, installed with the shadcn CLI.`,
    url: absoluteUrl("/components"),
    images: [
      {
        url: absoluteUrl(SITE_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} animated React component library`,
      },
    ],
  },
};

const INSTALL_COMMAND = `npx shadcn@latest add ${REGISTRY_REPO}/<component-name>`;

/**
 * The page borrows the homepage's frame: full-width sections on the same 96rem
 * gutter, so the header, the sections and the footer all line up on one rule.
 */
const SHELL = "mx-auto w-full max-w-[96rem] px-6 sm:px-10";

/** The footer's micro-label: small, spaced, uppercase. */
const EYEBROW =
  "text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase";

/**
 * The "New releases" section is deliberately not printed.
 *
 * It is a cross-cutting view rather than a partition: every entry currently
 * carries `isNew`, so the section would list the whole registry a second time
 * under a different heading. It earns its own row at the top once the flag marks
 * a genuine subset of the kit.
 */
const SECTIONS = gallerySections.filter((section) => section.id !== "new");

export default function ComponentsIndexPage() {
  return (
    <div className="w-full">
      <JsonLd data={componentsJsonLd()} />

      <section
        aria-labelledby="registry-heading"
        className={cn(SHELL, "pt-8 pb-12 sm:pt-16 sm:pb-20")}
      >
        <p className={EYEBROW}>The registry</p>

        <h1
          id="registry-heading"
          className="mt-5 font-runde text-[clamp(2.5rem,9vw,7rem)] leading-[0.94] font-bold tracking-tight sm:mt-8"
        >
          Animated React{" "}
          <span className="text-muted-foreground">components.</span>
        </h1>

        <div className="mt-8 grid gap-8 border-t border-border pt-8 sm:mt-14 sm:gap-10 sm:pt-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              {components.length} components, one file each. Hover any card to see
              it move, then install it with the shadcn CLI and edit the source
              like it was always yours.
            </p>

            <div className="mt-8 flex max-w-lg items-center gap-1.5 rounded-2xl border border-border bg-card px-3 py-2.5 sm:rounded-full sm:py-1.5 sm:pr-1.5">
              <code className="min-w-0 flex-1 font-mono text-[11px] leading-5 break-words text-muted-foreground whitespace-normal sm:truncate sm:leading-normal">
                npx shadcn@latest add {REGISTRY_REPO}
                <span className="font-normal text-muted-foreground/70">
                  /&lt;component-name&gt;
                </span>
              </code>
              <CopyButton
                value={INSTALL_COMMAND}
                label="Copy install command"
                title=""
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button href="/components/installation" variant="primary" size="md">
                Installation guide
                <ArrowRight className="size-4" />
              </Button>

              <Button href="/components/introduction" variant="secondary" size="md">
                What is Calamansi UI?
              </Button>
            </div>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              Every component is free to use and modify in personal and commercial
              projects. Attribution is appreciated; reselling them as your own kit
              is not.
            </p>
          </div>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          aria-labelledby={`section-${section.id}`}
          className={cn(SHELL, "border-t border-border py-14 sm:py-20")}
        >
          <div className="flex items-baseline justify-between gap-6">
            <h2
              id={`section-${section.id}`}
              className="font-runde text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {section.label}
            </h2>
            <p className={cn(EYEBROW, "shrink-0")}>
              {section.items.length}{" "}
              {section.items.length === 1 ? "component" : "components"}
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {section.items.map((item) => (
              <li key={item.href} className="min-w-0">
                <ComponentCard item={item} className="h-full" />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
