import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/ssr";

const backClass =
  "inline-flex items-center gap-1 self-start rounded-md text-sm text-fg-muted transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg outline-none";

type BackLinkProps = {
  /** Where "back" goes: the list the record came from. */
  href: string;
  label: string;
  /** Replaces the link (the dev preview shows the list without navigating). */
  onBack?: () => void;
};

/** "‹ التجار" above a record page. The caret points right, which is "back" in RTL, so it keeps its direction. */
export function BackLink({ href, label, onBack }: BackLinkProps) {
  const content = (
    <>
      <CaretRight aria-hidden className="size-4" />
      {label}
    </>
  );
  if (onBack) {
    return (
      <button type="button" onClick={onBack} className={backClass}>
        {content}
      </button>
    );
  }
  return (
    <Link href={href} className={backClass}>
      {content}
    </Link>
  );
}
