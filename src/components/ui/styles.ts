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

/** Text fields: the border itself turns brand with a soft halo, no offset ring. */
export const controlBase =
  "w-full rounded-lg border bg-surface text-sm text-fg transition-[color,border-color,box-shadow] placeholder:text-fg-subtle " +
  "outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/15 " +
  "disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-neutral-50 disabled:text-fg-subtle";

export const controlBorder = (invalid: boolean) =>
  invalid
    ? "border-danger focus-visible:border-danger focus-visible:ring-danger/15"
    : "border-border-input hover:border-neutral-600 disabled:hover:border-border-strong";
