"use client";

import { Highlight, themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import CopyButton from "../CopyButton";

type PanelCodeProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  contentClassName?: string;
  fileName?: string;
  copyable?: boolean;
};

export default function PanelCode({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
  contentClassName,
  fileName,
  copyable = false,
}: PanelCodeProps) {
  return (
    <div className={cn("overflow-hidden bg-popover", className)}>
      {(fileName || copyable) && (
        <div className="flex min-h-10 items-center justify-between border-b border-border/70 px-3">
          <span className="truncate font-mono text-[11px] text-muted-foreground">
            {fileName ?? language}
          </span>
          {copyable && (
            <CopyButton
              value={code}
              label={fileName ? `Copy ${fileName}` : "Copy code"}
              title=""
            />
          )}
        </div>
      )}
      <Highlight theme={themes.oneDark} code={code} language={language}>
        {({ className: prismClassName, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            data-language={language}
            className={cn(
              prismClassName,
              "min-h-0 w-full overflow-auto p-4 font-mono text-xs leading-6",
              contentClassName,
            )}
            style={{ ...style, margin: 0, backgroundColor: "transparent" }}
          >
            {tokens.map((line, index) => (
              <div key={index} {...getLineProps({ line })}>
                {showLineNumbers && (
                  <span className="mr-4 inline-block w-5 select-none text-right text-muted-foreground/60">
                    {index + 1}
                  </span>
                )}
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
