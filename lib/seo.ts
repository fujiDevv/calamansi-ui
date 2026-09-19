import type { Metadata } from "next";
import { components, REGISTRY_REPO } from "@/lib/components";
import {
  SITE_ALT_NAMES,
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_REPO,
  SITE_SOCIAL_LINKS,
  SITE_URL,
} from "@/lib/site";

export const SITE_OG_IMAGE = "/opengraph-image.png";
export const SITE_TWITTER_IMAGE = "/twitter-image.png";
export const SITE_LOGO_IMAGE = "/brand/calamansi-logo.png";
export const SITE_APP_ICON = "/icon-512.png";

export const SITE_KEYWORDS = [
  "calamansi-ui",
  "calamansi ui",
  "calamansi-ui.com",
  "calamansi ui components",
  "calamansi",
  "calamansi components",
  "calamansi react components",
  "calamansi ui kit",
  "citrus ui kit",
  "react components",
  "next.js components",
  "nextjs components",
  "shadcn registry",
  "shadcn components",
  "shadcn ui components",
  "animated ui components",
  "framer motion components",
  "motion react",
  "gsap react components",
  "tailwind css components",
  "free ui components",
  "open source ui components",
  "copy paste components",
  "ui component library",
  "react component library",
  "microinteractions",
];

export const SITE_FAQS = [
  {
    question: `What is ${SITE_NAME}?`,
    answer: `${SITE_NAME} is a free, open-source registry of animated React components with a little sour, installed with the shadcn CLI.`,
  },
  {
    question: `Is ${SITE_NAME} free?`,
    answer: `Yes. ${SITE_NAME} components are free to use and modify in personal and commercial React or Next.js projects.`,
  },
  {
    question: `How do I install a ${SITE_NAME} component?`,
    answer: `Run npx shadcn@latest add ${REGISTRY_REPO}/<component-name>, replacing <component-name> with the component registry name.`,
  },
  {
    question: `What is ${SITE_NAME} built with?`,
    answer: `${SITE_NAME} components are built for React with TypeScript, Tailwind CSS, Motion, GSAP, and shadcn/ui conventions.`,
  },
  {
    question: `Does ${SITE_NAME} work with Next.js?`,
    answer: `Yes. ${SITE_NAME} components are React components and the examples are designed to fit naturally into Next.js projects.`,
  },
  {
    question: `Can I customize ${SITE_NAME} components?`,
    answer:
      "Yes. Components are copied into your project, so you can edit the source, Tailwind classes, props, and behavior after installation.",
  },
] as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function componentPageMetadata(href: string): Metadata {
  const item = components.find((c) => c.href === href);
  if (!item) return {};

  const name = item.name.toLowerCase();
  const title = `${item.name} - Animated React Component`;
  const description =
    item.description ??
    `Install the ${item.name} animated React component from ${SITE_NAME} with the shadcn CLI.`;
  const image = absoluteUrl(SITE_OG_IMAGE);
  const url = absoluteUrl(item.href);

  return {
    title,
    description,
    keywords: [
      name,
      `${name} react`,
      `${name} component`,
      `animated ${name}`,
      `${name} shadcn`,
      `${name} tailwind`,
      `${name} next.js`,
      ...SITE_KEYWORDS,
    ],
    alternates: {
      canonical: item.href,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} animated React component library`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: SITE_AUTHOR.handle,
      images: [image],
    },
  };
}

export function componentJsonLd(href: string) {
  const item = components.find((c) => c.href === href);
  if (!item) return null;

  const url = `${SITE_URL}${item.href}`;
  const registryUrl = item.registry
    ? `${SITE_URL}/r/${item.registry}.json`
    : url;
  const installCommand = item.registry
    ? `npx shadcn@latest add ${REGISTRY_REPO}/${item.registry}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Components",
            item: `${SITE_URL}/components`,
          },
          { "@type": "ListItem", position: 3, name: item.name, item: url },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${url}#component`,
        name: item.name,
        description: item.description,
        url,
        image: absoluteUrl(SITE_OG_IMAGE),
        codeRepository: item.source ?? SITE_REPO,
        downloadUrl: registryUrl,
        programmingLanguage: "TypeScript",
        runtimePlatform: "React",
        codeSampleType: "full",
        keywords: [
          item.name,
          `${item.name} React component`,
          `${item.name} shadcn component`,
          SITE_NAME,
          "Tailwind CSS",
          "Motion",
        ],
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntityOfPage: url,
        license: "https://opensource.org/licenses/MIT",
        author: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What is the ${item.name} component?`,
            acceptedAnswer: {
              "@type": "Answer",
              text:
                item.description ??
                `${item.name} is an animated React component from ${SITE_NAME}.`,
            },
          },
          ...(installCommand
            ? [
                {
                  "@type": "Question",
                  name: `How do I install ${item.name} from ${SITE_NAME}?`,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: `Install it with the shadcn CLI by running: ${installCommand}.`,
                  },
                },
              ]
            : []),
          {
            "@type": "Question",
            name: `Can I customize the ${item.name} component?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes. ${SITE_NAME} components are copied into your project, so you can edit the TypeScript, Tailwind classes, props, and behavior after installation.`,
            },
          },
        ],
      },
    ],
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        logo: absoluteUrl(SITE_LOGO_IMAGE),
        image: absoluteUrl(SITE_OG_IMAGE),
        sameAs: SITE_SOCIAL_LINKS,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "ReadAction",
          target: [`${SITE_URL}/components`],
        },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        image: absoluteUrl(SITE_OG_IMAGE),
        description: SITE_DESCRIPTION,
        softwareVersion: "0.1.0",
        softwareHelp: `${SITE_URL}/components`,
        codeRepository: SITE_REPO,
        programmingLanguage: "TypeScript",
        featureList: [
          "Animated React components",
          "shadcn CLI installation",
          "Tailwind CSS styling",
          "Motion and GSAP interactions",
          "Copy-paste component source",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        applicationSubCategory: "UI component library",
        isAccessibleForFree: true,
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#components`,
        name: `${SITE_NAME} component list`,
        numberOfItems: components.length,
        itemListElement: components.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          description: item.description,
          url: `${SITE_URL}${item.href}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/#faq`,
        mainEntity: SITE_FAQS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function componentsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Components",
            item: `${SITE_URL}/components`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/components#collection`,
        name: `${SITE_NAME} Components`,
        description: `Browse animated React components from ${SITE_NAME} and install each one with the shadcn CLI.`,
        url: `${SITE_URL}/components`,
        image: absoluteUrl(SITE_OG_IMAGE),
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: components.length,
          itemListElement: components.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            description: item.description,
            url: `${SITE_URL}${item.href}`,
          })),
        },
      },
    ],
  };
}
