"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { BellSlash, Cake, Calendar, ClockCounterClockwise, Seal, Storefront } from "@phosphor-icons/react";
import { Avatar, Badge, Card, CardHeader, EmptyState } from "@/components/ui";
import type { AdminCustomer, CustomerCycle } from "@/lib/api/types";
import { ageFromBirthdate, formatDate, formatDay, formatYears } from "@/lib/format";
import { customerName, CycleStatusBadge, RegisteredBadge, StampsProgress } from "./CustomerParts";
import { RevealPhone } from "./RevealPhone";

function MetaPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-neutral-50 px-3 text-[13.5px] text-neutral-700 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-muted">
      {icon}
      {children}
    </span>
  );
}

type CustomerHeroProps = {
  customer: AdminCustomer;
  /** The day the page opened (age is counted on it). */
  now: Date;
  actions?: ReactNode;
};

/** Face, name, the phone (masked, revealable) and the facts. */
export function CustomerHero({ customer, now, actions }: CustomerHeroProps) {
  return (
    <Card className="overflow-hidden">
      <div aria-hidden className="h-1.5 bg-teal" />
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <Avatar
          name={customer.name ?? ""}
          seed={customer.id}
          size="xl"
          className="rounded-full shadow-card ring-1 ring-ink/6 max-sm:size-16 max-sm:text-2xl"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="text-2xl font-black text-fg sm:text-[28px]">{customerName(customer)}</h1>
            <RegisteredBadge customer={customer} />
          </div>
          <div className="flex flex-wrap gap-2">
            <RevealPhone customer={customer} />
            <MetaPill icon={<Cake />}>
              {customer.birthdate
                ? `${formatDay(customer.birthdate)} · ${formatYears(ageFromBirthdate(customer.birthdate, now))}`
                : "بدون تاريخ ميلاد"}
            </MetaPill>
            <MetaPill icon={<Calendar />}>
              {customer.registered_at
                ? `مسجّل منذ ${formatDate(customer.registered_at)}`
                : `أول ختم ${formatDate(customer.created_at)}`}
            </MetaPill>
            <MetaPill icon={<ClockCounterClockwise />}>
              {customer.last_activity_at ? `آخر نشاط ${formatDate(customer.last_activity_at)}` : "لا يوجد نشاط"}
            </MetaPill>
            {customer.campaigns_muted && <MetaPill icon={<BellSlash />}>أوقف العروض</MetaPill>}
          </div>
        </div>
        {actions && <div className="shrink-0 sm:self-start">{actions}</div>}
      </div>
    </Card>
  );
}

function CycleCard({ cycle, onOpen }: { cycle: CustomerCycle; onOpen: () => void }) {
  return (
    <li className="relative flex flex-col gap-3 rounded-2xl border border-ink/6 bg-surface p-4 transition-colors has-[button:hover]:bg-neutral-50 has-focus-visible:ring-2 has-focus-visible:ring-focus">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          {/* The whole card opens the cycle; the merchant link sits above that layer */}
          <button
            type="button"
            onClick={onOpen}
            className="cursor-pointer truncate text-start text-[16px] font-black text-fg outline-none after:absolute after:inset-0 after:rounded-2xl"
          >
            {cycle.card.name}
          </button>
          <Link
            href={`/admin/merchants/${cycle.merchant.id}`}
            className="relative z-10 inline-flex items-center gap-1 self-start rounded text-[13px] text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-focus"
          >
            <Storefront aria-hidden className="size-3.5" />
            {cycle.merchant.business_name}
          </Link>
        </div>
        {cycle.card.status === "suspended" && <Badge tone="danger">بطاقة موقوفة</Badge>}
      </div>
      <StampsProgress count={cycle.stamps_count} required={cycle.stamps_required} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CycleStatusBadge cycle={cycle} />
        <span className="text-[13px] text-fg-muted">بدأت {formatDate(cycle.started_at)}</span>
      </div>
    </li>
  );
}

/** Every card the customer collects on, most recent activity first. */
export function CyclesList({ customer, onOpen }: { customer: AdminCustomer; onOpen: (cycle: CustomerCycle) => void }) {
  const cycles = customer.cycles ?? [];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<Seal />}
        iconTone="amber"
        title="الدورات"
        description={cycles.length === 0 ? "الأحدث نشاطاً أولاً" : `${cycles.length} · الأحدث نشاطاً أولاً`}
      />
      {cycles.length === 0 ? (
        <EmptyState className="py-8" icon={<Seal />} title="لا توجد دورات" description="لم يجمع أي ختم بعد." />
      ) : (
        <ul className="grid gap-3.5 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {cycles.map((cycle) => (
            <CycleCard key={cycle.id} cycle={cycle} onOpen={() => onOpen(cycle)} />
          ))}
        </ul>
      )}
    </Card>
  );
}
