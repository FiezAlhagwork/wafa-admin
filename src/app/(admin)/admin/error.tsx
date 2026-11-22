"use client";

import { Card, ErrorState } from "@/components/ui";

/**
 * A screen of the dashboard crashed while rendering. The boundary sits under the admin layout, so the sidebar and
 * header stay and the admin can go elsewhere. `retry` re-renders the screen. The thrown value is never shown.
 */
export default function AdminError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Card>
      <ErrorState
        title="حدث خطأ في هذه الصفحة"
        description="حاول مرة أخرى. إذا تكرّر الخطأ، انتقل إلى صفحة أخرى من القائمة ثم عُد إليها."
        onRetry={retry}
      />
    </Card>
  );
}
