/** Horizontal rhythm shared by every marketing page. */
export const siteContainerClassName =
  "mx-auto w-full max-w-6xl px-5 sm:px-6 md:px-8";

/** Vertical rhythm between marketing sections. */
export const sectionClassName = "py-16 sm:py-20 lg:py-24";

/**
 * Padding for the docs canvas. The top padding clears the sidebar toggle,
 * which floats over the canvas in the app shell.
 */
export const pagePaddingClassName = "px-5 pt-28 sm:px-6 md:px-8 md:pt-32";

export const pageContentClassName = "mx-auto w-full max-w-4xl";

/**
 * The surfaces the docs are painted on, in one place.
 *
 * In light mode every panel, table and chip takes the same grey the liquid
 * components use as their own fill (`--border`). That is deliberate: components
 * that paint themselves with `--border` were being previewed on a near-white
 * sheet where their edges disappeared, and it also means the code panel, the
 * props table and the install table read as one material rather than three
 * slightly different whites.
 *
 * Dark mode keeps whatever token each surface already had — those greys are
 * already distinct from each other and from the page, so nothing is gained by
 * flattening them too.
 */
export const docSurfaceClassName = "bg-border dark:bg-card";
export const docSurfaceMutedClassName = "bg-border dark:bg-muted";
export const docSurfacePopoverClassName = "bg-border dark:bg-popover";
