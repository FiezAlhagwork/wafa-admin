import { ArrowClockwise, WarningOctagon } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

type ErrorStateProps = {
  title?: string;
  /** Already-translated text (from getErrorMessage). Never error.message. */
  description?: string;
  /** Shows a "retry" button, usually `query.refetch`. */
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
};

export function ErrorState({
  title = "تعذّر تحميل البيانات",
  description,
  onRetry,
  retrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center gap-4 px-6 py-12 text-center", className)}>
      <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <WarningOctagon className="size-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <p className="font-bold text-fg">{title}</p>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={<ArrowClockwise className="size-4" />} loading={retrying} onClick={onRetry}>
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
