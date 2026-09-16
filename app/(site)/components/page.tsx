import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import ComponentCard from "@/components/gallery/ComponentCard";
import { components } from "@/lib/components";
import { siteContainerClassName } from "@/lib/page-layout";
import {
  absoluteUrl,
  componentsJsonLd,
  SITE_KEYWORDS,
  SITE_OG_IMAGE,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Components",
  description:
    "Browse every Calamansi UI component in action. Components are built with Tailwind CSS, Motion and GSAP, then installed with the shadcn CLI.",
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: "/components",
  },
  openGraph: {
    title: "Calamansi UI Components",
    description:
      "Browse animated React components built with Tailwind CSS, Motion, GSAP and the shadcn CLI.",
    url: absoluteUrl("/components"),
    images: [
      {
        url: absoluteUrl(SITE_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: "Calamansi UI components gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calamansi UI Components",
    description:
      "Browse animated React components built with Tailwind CSS, Motion, GSAP and the shadcn CLI.",
    images: [absoluteUrl(SITE_OG_IMAGE)],
  },
};

export default function ComponentsIndexPage() {
  return (
    <div className={siteContainerClassName}>
      <JsonLd data={componentsJsonLd()} />

      <header className="max-w-2xl pt-14 sm:pt-20">
        <h1 className="font-runde text-3xl font-bold tracking-tight sm:text-4xl">
          All components
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Every component in the registry, each one a single file. Install any of
          them with the shadcn CLI, then edit the source inside your own
          project.
        </p>
      </header>

      {components.length === 0 ? (
        <div className="flex min-h-[40vh] max-w-lg flex-col justify-center">
          <h2 className="font-runde text-xl font-semibold">
            Nothing published yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The first component is on its way. Watch the repository in the
            meantime.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((item) => (
            <ComponentCard key={item.href} item={item} autoPlay />
          ))}
        </div>
      )}
    </div>
  );
}
