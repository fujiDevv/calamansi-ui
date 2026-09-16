import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { CalamansiMark } from "@/components/ui/calamansi";
import { components, REGISTRY_REPO } from "@/lib/components";
import { SITE_AUTHOR, SITE_LINKS, SITE_NAME } from "@/lib/site";

const INSTALL = `npx shadcn@latest add ${REGISTRY_REPO}/<component-name>`;

const ELSEWHERE = [
  { label: "GitHub", href: SITE_LINKS.repo, external: true },
  { label: "X", href: SITE_LINKS.x, external: true },
  { label: "LinkedIn", href: SITE_LINKS.linkedin, external: true },
  { label: "Email", href: SITE_LINKS.email, external: false },
] as const;

export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 md:px-8 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-2">
              <CalamansiMark className="size-7 text-primary" />
              <span className="font-runde text-[15px] font-bold tracking-tight">
                {SITE_NAME}
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Animated React components you own after a single command. Built by{" "}
              {SITE_AUTHOR.name}.
            </p>

            <div className="mt-6 flex w-full max-w-sm items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-1.5">
              <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
                npx shadcn@latest add{" "}
                <span className="font-semibold text-foreground">
                  {REGISTRY_REPO}
                </span>
                /&lt;component&gt;
              </code>
              <CopyButton
                value={INSTALL}
                label="Copy install command"
                title=""
              />
            </div>
          </div>

          <nav aria-label="Components" className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-foreground">Components</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {components.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Elsewhere" className="lg:col-span-3">
            <h2 className="text-sm font-semibold text-foreground">Elsewhere</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {ELSEWHERE.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer" : undefined}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
          <p>Next.js, Tailwind CSS and Motion. Free to use and modify.</p>
        </div>
      </div>
    </footer>
  );
}
