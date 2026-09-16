"use client";

import { type ComponentItem, PANEL_INFO } from "@/lib/components";
import { SITE_AUTHOR } from "@/lib/site";
import { cn } from "@/lib/utils";
import CopyButton from "../CopyButton";
import Tooltip from "../Tooltip";
import PanelCode from "./PanelCode";
import InstallCommand from "./InstallCommand";
import DependencyPill from "./DependencyPill";
import PropsTable from "./PropsTable";
import { MailIcon, XIcon } from "./icons";

type DescriptionContentProps = {
  item?: ComponentItem;
  showSourceHint?: boolean;
  className?: string;
};

function SectionLabel({
  as: Tag = "p",
  children,
}: {
  as?: "p" | "h1" | "h2";
  children: React.ReactNode;
}) {
  return (
    <Tag className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
      {children}
    </Tag>
  );
}

export default function DescriptionContent({
  item,
  showSourceHint = true,
  className,
}: DescriptionContentProps) {
  return (
    <div className={cn("flex flex-col gap-12 text-left", className)}>
      <div className="flex flex-col gap-4">
        <SectionLabel as="h1">{item?.name ?? "Component"}</SectionLabel>
        <p className="font-sans text-2xl font-semibold leading-relaxed text-foreground">
          {item?.description ?? "This component is not available yet."}
        </p>
      </div>

      {item?.registry && (
        <div className="flex flex-col gap-3">
          <SectionLabel as="h2">Installation</SectionLabel>
          <InstallCommand item={item} />
        </div>
      )}

      {item?.usage && (
        <div className="flex flex-col gap-3">
          <SectionLabel as="h2">How to use</SectionLabel>
          <PanelCode
            code={item.usage}
            fileName="demo.tsx"
            copyable
            className="rounded-lg ring-1 ring-foreground/[0.04]"
          />
        </div>
      )}

      {item?.props && item.props.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel as="h2">Props</SectionLabel>
          <p className="-mt-1 text-sm leading-relaxed text-foreground">
            Options you can pass to customize this component.
          </p>
          <PropsTable props={item.props} />
        </div>
      )}

      {item?.dependencies && item.dependencies.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel as="h2">Dependencies</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {item.dependencies.map((dep) => (
              <DependencyPill key={dep.name} name={dep.name} icon={dep.icon} />
            ))}
          </div>
        </div>
      )}

      {item?.registry && showSourceHint && (
        <div className="flex flex-col gap-3">
          <SectionLabel as="h2">Source Code</SectionLabel>
          <p className="text-sm leading-relaxed text-foreground">
            {PANEL_INFO.sourceHint}
          </p>
        </div>
      )}

      {item?.credits && item.credits.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionLabel as="h2">Credits</SectionLabel>

          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
            {item.credits.map((credit) => (
              <li key={credit} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{credit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <SectionLabel as="h2">Contact</SectionLabel>
        <p className="text-sm leading-relaxed text-foreground">
          Found a bug or issue?{" "}
          <a
            href={PANEL_INFO.issuesUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            Open an issue
          </a>{" "}
          or send a note.
        </p>
        <div className="flex items-center gap-2">
          <Tooltip label={PANEL_INFO.contactEmail} align="start">
            <CopyButton
              value={PANEL_INFO.contactEmail}
              label={`Copy email (${PANEL_INFO.contactEmail})`}
              title=""
              idleIcon={<MailIcon />}
              iconClassName="size-5"
              className="size-8 hover:text-foreground"
            />
          </Tooltip>
          <Tooltip label={SITE_AUTHOR.handle}>
            <a
              href={`https://x.com/${SITE_AUTHOR.handle.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`X - ${SITE_AUTHOR.handle}`}
              className="inline-flex size-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <XIcon className="size-5" />
            </a>
          </Tooltip>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionLabel as="h2">License &amp; Usage</SectionLabel>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-foreground">
          {PANEL_INFO.license.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="text-foreground/40">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
