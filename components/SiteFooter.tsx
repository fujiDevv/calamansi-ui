import { Fragment } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import FluidWave from "@/components/FluidWave";
import CopyButton from "@/components/CopyButton";
import { CalamansiMark } from "@/components/ui/calamansi";
import { GithubLogo, LinkedinLogo, XLogo } from "@/components/logos";
import { components, REGISTRY_REPO } from "@/lib/components";
import {
  SITE_AUTHOR,
  SITE_CONTACT_EMAIL,
  SITE_LINKS,
  SITE_NAME,
} from "@/lib/site";

const INSTALL = `npx shadcn@latest add ${REGISTRY_REPO}/<component-name>`;

type FooterLink = {
  label: string;
  href: string;
  external: boolean;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * The footer nav deliberately stops at the two entry points plus the author's
 * profiles — the full component list lives in the sidebar and on /components,
 * and listing all of it here made the row unreadable.
 */
const LINKS: FooterLink[] = [
  { label: "Home", href: "/", external: false },
  { label: "Docs", href: "/components/introduction", external: false },
  { label: "GitHub", href: SITE_LINKS.repo, external: true, icon: GithubLogo },
  { label: "X", href: SITE_LINKS.x, external: true, icon: XLogo },
  {
    label: "LinkedIn",
    href: SITE_LINKS.linkedin,
    external: true,
    icon: LinkedinLogo,
  },
  { label: "Email", href: SITE_LINKS.email, external: true, icon: Mail },
];

const UTILITY_LINKS = [
  { label: "Sitemap", href: "/sitemap.xml" },
  { label: "robots.txt", href: "/robots.txt" },
  { label: "llms.txt", href: "/llms.txt" },
];

const HOVER = "transition-colors duration-150 ease-out hover:text-foreground";

const MUTED = "text-muted-foreground";

function NavLink({ label, href, external, icon: Icon }: FooterLink) {
  const className = `w-fit ${Icon ? "flex items-center" : "text-lg"} ${MUTED} ${HOVER}`;
  const content = Icon ? <Icon className="size-5 sm:size-[1.375rem]" /> : label;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        aria-label={Icon ? label : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-background text-foreground">
      <FluidWave />
      {/* keeps the waves from touching the seam with the page above */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />

      <div className="relative mx-auto flex min-h-[min(40svh,50rem)] w-full max-w-[96rem] flex-col px-6 pt-10 sm:min-h-[min(85svh,50rem)] sm:px-10 sm:pt-24 md:pt-32">
        <div className="h-px w-full bg-border" />

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-8">
          <Link href="/" className="flex h-fit w-fit items-center gap-2.5">
            <CalamansiMark className="size-8 text-primary" />
            <span className="font-runde text-2xl font-bold tracking-tight">
              {SITE_NAME}
            </span>
          </Link>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-7"
          >
            {LINKS.map((link, index) => (
              <Fragment key={link.label}>
                {link.icon && !LINKS[index - 1]?.icon && (
                  <span aria-hidden="true" className={`-mx-3 text-lg ${MUTED}`}>
                    |
                  </span>
                )}
                <NavLink {...link} />
              </Fragment>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-6 py-14 sm:gap-8 sm:py-16">
          <h2 className="selection-contrast font-runde text-[clamp(2.75rem,12vw,9.5rem)] leading-[0.92] font-bold tracking-tight">
            Components <span className={MUTED}>with a little sour.</span>
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {components.length} animated React components you own after a single
            command. Built by {SITE_AUTHOR.name}.
          </p>

          <div className="flex w-full max-w-sm items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 sm:rounded-full sm:py-1.5 sm:pr-1.5">
            <code className="min-w-0 flex-1 font-mono text-[11px] leading-5 break-words text-muted-foreground whitespace-normal sm:truncate sm:leading-normal">
              npx shadcn@latest add{" "}
              <span className="font-semibold text-foreground">
                {REGISTRY_REPO}
              </span>
              /&lt;component&gt;
            </code>
            <CopyButton value={INSTALL} label="Copy install command" title="" />
          </div>
        </div>

        <div
          className={`selection-contrast flex flex-wrap items-center justify-between gap-3 pb-8 text-xs ${MUTED}`}
        >
          <span className="flex flex-wrap items-center gap-2.5">
            <span>
              {SITE_NAME} &copy; {new Date().getFullYear()}
            </span>
            <span aria-hidden="true" className="text-muted-foreground/60">
              &middot;
            </span>
            <a href={SITE_LINKS.email} className={HOVER}>
              Support: {SITE_CONTACT_EMAIL}
            </a>
          </span>

          <span className="flex flex-wrap items-center gap-2.5">
            {UTILITY_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 && (
                  <span aria-hidden="true" className="text-muted-foreground/60">
                    &middot;
                  </span>
                )}
                <a href={link.href} className={HOVER}>
                  {link.label}
                </a>
              </Fragment>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
