import { cn } from "@/lib/cn";
import { Button } from "./Button";

type LoadMoreProps = {
  /** `query.hasNextPage`: `meta.next_cursor` is not null. Renders nothing at the end of the list. */
  hasNextPage: boolean;
  /** `query.isFetchingNextPage`. */
  loading?: boolean;
  /** `query.fetchNextPage`. */
  onLoadMore: () => void;
  className?: string;
};

/** Goes under a list or table (cursor pagination: no page numbers). */
export function LoadMore({ hasNextPage, loading = false, onLoadMore, className }: LoadMoreProps) {
  if (!hasNextPage) return null;

  return (
    <div className={cn("flex justify-center pt-4", className)}>
      <Button variant="secondary" loading={loading} onClick={onLoadMore}>
        تحميل المزيد
      </Button>
    </div>
  );
}
