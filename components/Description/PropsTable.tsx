import { Fragment } from "react";
import type { ComponentProp } from "@/lib/components";
import {
  docSurfaceClassName,
  docSurfaceMutedClassName,
} from "@/lib/page-layout";

type PropsTableProps = {
  props: ComponentProp[];
};

// "a" | "b" unions read better as one option per line,
// but leave object/generic types alone — their | isn't top-level
function typeLines(prop: ComponentProp) {
  if (prop.options) return prop.options;
  if (/[{<(]/.test(prop.type)) return [prop.type];
  return prop.type.split(/\s\|\s/);
}

function PropName({ prop }: { prop: ComponentProp }) {
  return (
    <code
      className={`inline-flex items-center whitespace-nowrap rounded-md ${docSurfaceMutedClassName} px-2 py-1 font-mono text-xs text-foreground`}
    >
      {prop.name}
      {prop.required && <span className="text-primary">*</span>}
    </code>
  );
}

function PropTypes({ prop }: { prop: ComponentProp }) {
  return (
    <>
      {typeLines(prop).map((value) => (
        <code
          key={value}
          className="font-mono text-xs leading-relaxed text-muted-foreground"
        >
          {value}
        </code>
      ))}
    </>
  );
}

export default function PropsTable({ props }: PropsTableProps) {
  return (
    <>
      {/* phones get one card per prop, so a long description never needs a sideways scroll */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {props.map((prop) => (
          <li
            key={prop.name}
            className={`rounded-lg border border-border p-3.5 ${docSurfaceClassName}`}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <PropName prop={prop} />
              <span className="text-[11px] text-muted-foreground">
                {prop.required ? "required" : "optional"}
              </span>
            </div>

            <div className="mt-2 flex flex-col gap-1">
              <PropTypes prop={prop} />
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-foreground">
              {prop.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden w-full overflow-x-auto -mx-1 px-1 [scrollbar-width:thin] sm:block">
        <div className="grid min-w-[520px] grid-cols-[max-content_fit-content(10rem)_1fr]">
          {["Prop", "Type", "Description"].map((label) => (
            <div
              key={label}
              className="border-b border-border px-1 pr-4 pb-2.5 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
            >
              {label}
            </div>
          ))}

          {props.map((prop) => (
            <Fragment key={prop.name}>
              <div className="border-b border-border py-4 pr-4 pl-1">
                <PropName prop={prop} />
              </div>

              <div className="flex flex-col gap-1 border-b border-border py-4 pt-5 pr-4">
                <PropTypes prop={prop} />
              </div>

              <div className="border-b border-border px-1 py-4">
                <p className="pt-0.5 text-[13px] leading-relaxed text-foreground">
                  {prop.description}
                </p>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
