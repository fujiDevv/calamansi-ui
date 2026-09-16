import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonBaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonAsLinkProps = ButtonBaseProps & {
  href: string;
} & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "className" | "children" | "href"
  >;

type ButtonAsButtonProps = ButtonBaseProps & {
  href?: never;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type ButtonProps = ButtonAsLinkProps | ButtonAsButtonProps;

const baseClassName =
  "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0";

const variantClassNames: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground shadow-primary-inset hover:border-primary/90 hover:bg-primary/80",
  secondary:
    "border-border bg-popover text-foreground shadow-sm hover:border-ring hover:bg-muted hover:shadow-md dark:bg-muted dark:hover:bg-popover/10",
  outline:
    "border-border bg-transparent text-foreground shadow-none hover:bg-foreground/[0.045]",
  ghost:
    "border-transparent bg-transparent text-foreground/70 shadow-none hover:bg-foreground/[0.055] hover:text-foreground",
  danger:
    "border-destructive bg-destructive text-destructive-foreground shadow-lg hover:border-destructive/90 hover:bg-destructive/90",
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

export function Button(props: ButtonProps) {
  const classes = cn(
    baseClassName,
    variantClassNames[props.variant ?? "primary"],
    sizeClassNames[props.size ?? "md"],
    props.className,
  );

  if (typeof props.href === "string") {
    const href = props.href;
    const {
      href: _href,
      children,
      className: _className,
      variant: _variant,
      size: _size,
      ...linkProps
    } = props;

    void _className;
    void _variant;
    void _size;
    void _href;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const {
    children: buttonChildren,
    className: _,
    variant: __,
    size: ___,
    type = "button",
    ...buttonProps
  } = props;

  void _;
  void __;
  void ___;

  return (
    <button type={type} className={classes} {...buttonProps}>
      {buttonChildren}
    </button>
  );
}
