import { cn } from "@/lib/cn";

type SpinnerSize = "sm" | "md" | "lg";

const sizes: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-5",
  lg: "size-8",
};

type SpinnerProps = {
  size?: SpinnerSize;
  /** Announced to screen readers. Leave empty when the parent already says it is loading (e.g. a Button). */
  label?: string;
  className?: string;
};

export function Spinner({ size = "md", label, className }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0 animate-spin", sizes[size], className)}
      {...(label ? { role: "status", "aria-label": label } : { "aria-hidden": true })}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
