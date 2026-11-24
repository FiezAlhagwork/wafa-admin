/**
 * Phosphor's own naming: lowercase words joined by "-" ("fork-knife"). The server takes the same form. Kept apart from
 * phosphor.ts so the form can check the shape without loading the library.
 */
export const ICON_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
