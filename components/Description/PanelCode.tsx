"use client";

import { useEffect, useRef, useState } from "react";
import { docSurfaceClassName } from "@/lib/page-layout";
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

/** The highlighter module, once its chunk has landed. */
type PrismModule = typeof import("prism-react-renderer");

/**
 * oneDark's plain ink, mirrored from `themes.oneDark.plain`.
 *
 * The fallback paints the code before the highlighter arrives, and it has to agree
 * with the theme or the block would shift colour the moment the highlighter lands.
 * One constant rather than a literal tucked in the `pre`, so the two can only ever
 * drift together.
 */
const CODE_INK = "hsl(220, 14%, 71%)";

const PRE = "min-h-0 w-full overflow-auto p-4 font-mono text-[11px] leading-5";

/** The gutter, shared by both branches so line numbers hold their width. */
const LINE_NUMBER =
  "mr-4 inline-block w-5 select-none text-right text-muted-foreground/60";

/**
 * prism-react-renderer is ~84 KB, and all it does is paint colour onto text the
 * export has already written out. So it is kept out of the page's own bundle and
 * pulled in as a separate chunk when a block comes near the viewport rather than
 * when the document loads.
 *
 * For the docs' code tab that is exactly "when the panel is opened": the panel is
 * mounted by the click that opens it, so the chunk arrives with the drawer and
 * never touches the page's first paint. For the usage block further down a
 * component page it means the highlighter is fetched as the reader scrolls towards
 * it, not on the way in.
 *
 * Until the chunk lands the block renders every line, unlit but complete: the code
 * is in the HTML, selectable and searchable from the first frame.
 */
export default function PanelCode({
  code,
  language = "tsx",
  showLineNumbers = false,
  className,
  contentClassName,
  fileName,
  copyable = false,
}: PanelCodeProps) {
  /** The element the observer watches — the frame, not the `pre`, since the frame shows first. */
  const frameRef = useRef<HTMLDivElement>(null);
  const [prism, setPrism] = useState<PrismModule | null>(null);

  useEffect(() => {
    if (prism) return;

    const node = frameRef.current;
    if (!node) return;

    let cancelled = false;

    const load = () => {
      import("prism-react-renderer").then((module) => {
        if (!cancelled) setPrism(module);
      });
    };

    /* No observer: take the chunk now rather than never. */
    if (typeof IntersectionObserver === "undefined") {
      load();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      /* a screen either side, so it is lit by the time it is read */
      { rootMargin: "600px 0px" },
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [prism]);

  return (
    <div
      ref={frameRef}
      className={cn("overflow-hidden", docSurfaceClassName, className)}
    >
      {(fileName || copyable) && (
        <div className="flex min-h-10 items-center justify-between border-b border-border px-3">
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

      {prism ? (
        <prism.Highlight
          theme={prism.themes.oneDark}
          code={code}
          language={language}
        >
          {({
            className: prismClassName,
            style,
            tokens,
            getLineProps,
            getTokenProps,
          }) => (
            <pre
              data-language={language}
              className={cn(prismClassName, PRE, contentClassName)}
              style={{ ...style, margin: 0, backgroundColor: "transparent" }}
            >
              {tokens.map((line, index) => (
                <div key={index} {...getLineProps({ line })}>
                  {showLineNumbers && (
                    <span className={LINE_NUMBER}>{index + 1}</span>
                  )}
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </prism.Highlight>
      ) : (
        /*
          The unlit frame. Same lines, same gutter, same metrics as the branch
          above — the only thing missing is the colour, so nothing reflows when the
          highlighter takes over.
        */
        <pre
          data-language={language}
          className={cn(
            "prism-code",
            `language-${language}`,
            PRE,
            contentClassName,
          )}
          style={{ margin: 0, backgroundColor: "transparent", color: CODE_INK }}
        >
          {code.split("\n").map((line, index) => (
            <div key={index}>
              {showLineNumbers && <span className={LINE_NUMBER}>{index + 1}</span>}
              {line}
            </div>
          ))}
        </pre>
      )}
    </div>
  );
}
