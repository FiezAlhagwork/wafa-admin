"use client";

import { useState, type ReactNode } from "react";
import { Card, ErrorState } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { getErrorMessage } from "@/lib/api/errors";
import type { PaymentMethod } from "@/lib/api/types";
import { PaymentMethodsCard } from "../components/PaymentMethodsCard";
import { SettingsSection, SettingsSectionSkeleton } from "../components/SettingsSection";
import { useAppSettings, useBillingSettings } from "../hooks";
import { appSectionIds, billingSectionIds, sections, type SectionId } from "../sections";

type SettingsQuery = ReturnType<typeof useBillingSettings> | ReturnType<typeof useAppSettings>;
/** What is open for editing: a section, or one payment method. One at a time on the page. */
type Editing = SectionId | `method:${PaymentMethod}`;

/**
 * Everything the apps read live (payment details, trial, stamps, campaigns, the merchant app version, links).
 * Two endpoints, each loading and failing on its own; one section is edited at a time.
 */
export function SettingsScreen() {
  const [editing, setEditing] = useState<Editing | null>(null);
  const billing = useBillingSettings();
  const app = useAppSettings();

  const column = (query: SettingsQuery, ids: readonly SectionId[], after?: ReactNode) => {
    if (query.data === undefined && !query.isError) {
      return ids.map((id) => <SettingsSectionSkeleton key={id} rows={Object.keys(sections[id].fields).length} />);
    }
    if (query.data === undefined) {
      return (
        <Card>
          <ErrorState
            description={getErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
            retrying={query.isFetching}
          />
        </Card>
      );
    }
    const stored = query.data as Record<string, string | number>;
    return (
      <>
        {ids.map((id) => (
          <SettingsSection
            key={id}
            section={sections[id]}
            stored={stored}
            editing={editing === id}
            locked={editing !== null && editing !== id}
            onEdit={() => setEditing(id)}
            onDone={() => setEditing(null)}
          />
        ))}
        {after}
      </>
    );
  };

  const editingMethod = editing?.startsWith("method:") ? (editing.slice("method:".length) as PaymentMethod) : null;
  const methodsCard = billing.data && (
    <PaymentMethodsCard
      // Optional in the contract for now (Notion A11): no list means no methods
      methods={billing.data.payment_methods ?? []}
      editing={editingMethod}
      locked={editing !== null && editingMethod === null}
      onEdit={(method) => setEditing(`method:${method}`)}
      onDone={() => setEditing(null)}
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="إعدادات المنصة"
        description="ما تقرؤه التطبيقات مباشرة، دون إصدار جديد. كل تعديل يُسجَّل في سجل التدقيق."
      />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">{column(billing, billingSectionIds, methodsCard)}</div>
        <div className="flex min-w-0 flex-col gap-5">{column(app, appSectionIds)}</div>
      </div>
    </div>
  );
}
