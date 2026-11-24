// The whole Phosphor library (about 1,500 icons), to turn an icon `key` into its component. Heavy, so it is never
// imported statically: `usePhosphor()` loads it with `import()`, and only the lookups screen asks for it.
import * as Phosphor from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { ICON_KEY_PATTERN } from "./icon-key";

/** "fork-knife" → "ForkKnife", the name the library exports the icon under. */
const componentName = (key: string) =>
  key
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const FORWARD_REF = Symbol.for("react.forward_ref");
// Exported next to the icons, but not icons
const notIcons = new Set(["IconBase", "IconContext"]);

/** The icon named by `key`, or null when Phosphor has no icon by that name. */
export function iconByKey(key: string): Icon | null {
  if (!ICON_KEY_PATTERN.test(key)) return null;
  const name = componentName(key);
  if (notIcons.has(name)) return null;
  const candidate: unknown = (Phosphor as Record<string, unknown>)[name];
  const isIcon =
    typeof candidate === "object" && candidate !== null && (candidate as { $$typeof?: symbol }).$$typeof === FORWARD_REF;
  return isIcon ? (candidate as Icon) : null;
}
