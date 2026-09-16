import type { MetadataRoute } from "next";
import { components } from "@/lib/components";
import { SITE_URL } from "@/lib/site";

const lastModified = new Date("2026-09-09");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/components`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...components.map((component) => ({
      url: `${SITE_URL}${component.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
