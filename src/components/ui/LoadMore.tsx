import { WarningCircle } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

type LoadMoreProps = {
  /** `query.hasNextPage`: `meta.next_cursor` is not null. Renders nothing at the end of the list. */
  hasNextPage: boolean;
  /** `query.isFetchingNextPage`. */
  loading?: boolean;
  /** `query.fetchNextPage`. */
  onLoadMore: () => void;
  /** `query.isFetchNextPageError`: the button stays (it retries) with a message under it. */
  failed?: boolean;
  className?: string;
};

/** Goes under a list or table (cursor pagination: no page numbers). */
export function LoadMore({ hasNextPage, loading = false, onLoadMore, failed = false, className }: LoadMoreProps) {
  if (!hasNextPage) return null;

  return (
    <div className={cn("flex flex-col items-center gap-2 pt-4", className)}>
      <Button variant="secondary" loading={loading} onClick={onLoadMore}>
        {failed && !loading ? "إعادة المحاولة" : "تحميل المزيد"}
      </Button>
      {failed && !loading && (
        <p role="alert" className="flex items-center gap-1 text-sm text-danger">
          <WarningCircle aria-hidden weight="fill" className="size-4 shrink-0" />
          تعذّر تحميل المزيد. تحقّق من الاتصال ثم أعد المحاولة.
        </p>
      )}
    </div>
  );
}
