// Class strings shared by several components in components/ui.

/** Buttons and other clickable elements. */
export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

/** Menus and other floating panels. */
export const popupSurface = "rounded-xl border border-border bg-surface shadow-popup outline-none";

/** Enter/exit animation driven by Base UI's data-starting-style / data-ending-style. */
export const popupMotion =
  "transition-[opacity,scale] duration-150 ease-out " +
  "data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0";

/**
 * A dialog that is a bottom sheet on small screens: it slides up there, and keeps the popupMotion scale-and-fade from `sm`.
 * Mobile only translates and desktop only scales/fades, so the two sets never fight over one property.
 */
export const sheetMotion =
  "transition-[translate,opacity,scale] duration-200 ease-out " +
  "max-sm:data-starting-style:translate-y-full max-sm:data-ending-style:translate-y-full " +
  "sm:data-starting-style:scale-95 sm:data-starting-style:opacity-0 sm:data-ending-style:scale-95 sm:data-ending-style:opacity-0";

/** Text fields: the border itself turns brand with a soft halo, no offset ring. */
export const controlBase =
  "w-full rounded-xl border bg-surface text-sm text-fg transition-[color,border-color,box-shadow] placeholder:text-fg-subtle " +
  "outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15 " +
  "disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-neutral-50 disabled:text-fg-subtle";

export const controlBorder = (invalid: boolean) =>
  invalid
    ? "border-danger focus-visible:border-danger focus-visible:ring-danger/15"
    : "border-border-input hover:border-neutral-600 disabled:hover:border-border-strong";
