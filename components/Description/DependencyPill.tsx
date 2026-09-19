import type { ReactNode } from "react";
import { docSurfaceMutedClassName } from "@/lib/page-layout";

type DependencyPillProps = {
  name: string;
  icon?: ReactNode;
};

export default function DependencyPill({ name, icon }: DependencyPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl ${docSurfaceMutedClassName} px-3 py-1.5 text-[13px] font-medium text-foreground/90`}
    >
      {icon != null && icon !== "" && (
        <span className="flex h-5 w-5 items-center justify-center">
          {typeof icon === "string" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={icon} alt="" className="h-5 w-5" />
          ) : (
            icon
          )}
        </span>
      )}
      {name}
    </span>
  );
}
