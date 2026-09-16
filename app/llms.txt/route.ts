import {
  components,
  installCommand,
  REGISTRY_HOMEPAGE,
  REGISTRY_REPO,
} from "@/lib/components";
import { SITE_DESCRIPTION, SITE_NAME, SITE_REPO, SITE_URL } from "@/lib/site";
import { SITE_FAQS } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const componentSections = components.map((item) => {
    const lines = [`### ${item.name}`, "", `- Page: ${SITE_URL}${item.href}`];
    if (item.description) lines.push(`- Description: ${item.description}`);
    const install = installCommand(item);
    if (install) lines.push(`- Install: \`${install}\``);
    if (item.registry)
      lines.push(`- Registry JSON: ${SITE_URL}/r/${item.registry}.json`);
    if (item.preview) lines.push(`- Preview media: ${SITE_URL}${item.preview}`);
    if (item.source) lines.push(`- Source: ${item.source}`);
    if (item.interaction) lines.push(`- Interaction: ${item.interaction}`);
    if (item.dependencies?.length) {
      lines.push(
        `- Dependencies: ${item.dependencies.map((d) => d.name).join(", ")}`,
      );
    }
    return lines.join("\n");
  });

  const faqSections = SITE_FAQS.map(
    (item) => `### ${item.question}\n\n${item.answer}`,
  );

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `Canonical site: ${SITE_URL}`,
    `Source repository: ${SITE_REPO}`,
    `Component registry: ${REGISTRY_HOMEPAGE}`,
    `Components index: ${SITE_URL}/components`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
    "Install any component into a React / Next.js project:",
    "",
    "```",
    `npx shadcn@latest add ${REGISTRY_REPO}/<component-name>`,
    "```",
    "",
    `Source code for all components: ${REGISTRY_HOMEPAGE}`,
    "",
    "## Components",
    "",
    componentSections.join("\n\n") || "No components have been published yet.",
    "",
    "## Common Questions",
    "",
    faqSections.join("\n\n"),
    "",
    "## Notes",
    "",
    "- Components follow shadcn/ui conventions: cn helper, className merging, prop spreading, and data-slot attributes.",
    "- Components are copied into user projects and can be modified after installation.",
    "- Calamansi is free to use and modify in personal and commercial projects.",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
