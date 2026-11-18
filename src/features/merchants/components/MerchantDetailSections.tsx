import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowsOut,
  Calendar,
  ClockCounterClockwise,
  Envelope,
  Gift,
  IdentificationCard,
  ImageSquare,
  MapPin,
  Package,
  Phone,
  Receipt,
  Seal,
  SignIn,
  Storefront,
  User,
  WarningCircle,
} from "@phosphor-icons/react/ssr";
import { Avatar, Card, CardHeader, EmptyState, Latin, StatusBadge } from "@/components/ui";
import { formatDuration, methodLabels } from "@/features/payments/labels";
import type { AdminMerchantDetail } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, formatDayCount, formatNumber, formatRelativeDays, formatSyp, formatUsd } from "@/lib/format";
import { periodTypeLabels, registrationStepLabels } from "../labels";

// The sections of the merchant page. All read-only: the actions (suspend, edit, extend) come in the next stage.

type MerchantProps = { merchant: AdminMerchantDetail };

const dash = <span className="text-fg-muted">—</span>;

/** A fact about the merchant under its name: an icon and a short text on a soft pill. */
function MetaPill({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-neutral-50 px-3 text-[13.5px] text-neutral-700 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-muted">
      {icon}
      {children}
    </span>
  );
}

/** Logo, name, state, the facts and the headline numbers: the top of the page. The cover lives on the identity card. */
export function MerchantHero({ merchant }: MerchantProps) {
  const { stats } = merchant;
  const figures: { label: string; value: number; hint?: string }[] = [
    { label: "الزبائن", value: stats.customers_total },
    { label: "الأختام", value: stats.stamps_total, hint: `${formatNumber(stats.stamps_via_phone_total)} برقم الهاتف` },
    { label: "هدايا جاهزة", value: stats.rewards_ready, hint: "لم تُسلَّم بعد" },
    { label: "هدايا مُسلَّمة", value: stats.rewards_redeemed_total },
    { label: "الحملات", value: stats.campaigns_total },
  ];

  return (
    <Card className="overflow-hidden">
      {/* A thin brand line gives the page its identity without a heavy banner */}
      <div aria-hidden className="h-1.5 bg-brand" />

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <Avatar
          name={merchant.business_name}
          src={merchant.logo_url}
          seed={merchant.id}
          size="xl"
          className="shadow-card ring-1 ring-ink/6 max-sm:size-16 max-sm:rounded-2xl max-sm:text-2xl"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className="text-2xl font-black text-fg sm:text-[28px]">{merchant.business_name}</h1>
            <StatusBadge status={merchant.status} />
            {merchant.status === null && (
              <span className="text-[13px] text-fg-muted">{registrationStepLabels[merchant.registration_step]}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <MetaPill icon={<Storefront />}>{merchant.business_type.name}</MetaPill>
            <MetaPill icon={<MapPin />}>{merchant.governorate.name}</MetaPill>
            <MetaPill icon={<User />}>{merchant.owner_name ?? "—"}</MetaPill>
            <MetaPill icon={<Calendar />}>مسجّل منذ {formatDate(merchant.registered_at)}</MetaPill>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-divider sm:grid-cols-3 lg:grid-cols-5">
        {figures.map(({ label, value, hint }) => (
          <div
            key={label}
            className="flex flex-col gap-1 border-divider px-5 py-4 not-last:border-b sm:border-e sm:px-6 lg:border-b-0 lg:last:border-e-0"
          >
            <dt className="text-[13px] text-fg-muted">{label}</dt>
            <dd className="text-[26px] leading-tight font-black text-fg tabular-nums">{formatNumber(value)}</dd>
            {hint && <dd className="text-xs text-fg-muted">{hint}</dd>}
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Alert({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-2xl border border-danger/25 bg-danger-soft p-4 text-danger">
      <WarningCircle aria-hidden weight="fill" className="mt-0.5 size-5.5 shrink-0" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-bold">{title}</p>
        <div className="text-sm text-fg">{children}</div>
      </div>
    </div>
  );
}

/** A suspended merchant and a pending deletion: the two states that change what anyone should do next. */
export function MerchantAlerts({ merchant }: MerchantProps) {
  const { suspended_at, suspension_reason, deletion, stats } = merchant;
  if (!suspended_at && !deletion) return null;

  return (
    <div className="flex flex-col gap-3">
      {suspended_at && (
        <Alert title="التاجر موقوف">
          منذ {formatDate(suspended_at)}.{suspension_reason ? ` السبب: ${suspension_reason}` : ""}
        </Alert>
      )}
      {deletion && (
        <Alert title="طلب حذف بانتظار التنفيذ">
          طُلب في {formatDate(deletion.requested_at)}، ويُنفَّذ {formatRelativeDays(deletion.executes_at)} (
          {formatDate(deletion.executes_at)}). الهدايا الجاهزة غير المُسلَّمة: {formatNumber(stats.rewards_ready)}.
        </Alert>
      )}
    </div>
  );
}

/** How far into the current period we are, 0–100, from its own dates. `null` when there is no current period. */
function periodProgress(period: AdminMerchantDetail["periods"][number] | undefined, now = Date.now()): number | null {
  if (!period) return null;
  const start = Date.parse(period.starts_at);
  const end = Date.parse(period.ends_at);
  if (!(end > start) || now < start || now > end) return null;
  return ((now - start) * 100) / (end - start);
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[13px] text-fg-muted">{label}</dt>
      <dd className="font-bold text-fg">{children}</dd>
    </div>
  );
}

export function SubscriptionCard({ merchant }: MerchantProps) {
  const { subscription, periods } = merchant;
  const progress = periodProgress(periods[0]);

  return (
    <Card className="overflow-hidden">
      <CardHeader icon={<Package />} title="الاشتراك" />
      {subscription === null ? (
        <EmptyState
          className="py-8"
          icon={<Receipt />}
          title="لم يختر باقة بعد"
          description={`المرحلة التي وقف عندها: ${registrationStepLabels[merchant.registration_step]}.`}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-5 p-5">
            <div className="flex min-w-0 flex-1 basis-64 flex-col gap-3 rounded-xl bg-neutral-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xl font-black text-fg">{subscription.package.name}</span>
                <StatusBadge status={subscription.status} />
              </div>
              {progress !== null && (
                <span
                  role="progressbar"
                  aria-label="مضى من الفترة الحالية"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="block h-2 overflow-hidden rounded-full bg-neutral-100"
                >
                  <span className="block h-full rounded-full bg-success" style={{ width: `${progress}%` }} />
                </span>
              )}
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span>
                  {subscription.days_remaining === null ? (
                    dash
                  ) : (
                    <>
                      <b className="text-base font-black">{formatDayCount(subscription.days_remaining)}</b>{" "}
                      <span className="text-fg-muted">متبقية</span>
                    </>
                  )}
                </span>
                {merchant.subscription_ends_at && (
                  <span className="text-fg-muted">ينتهي {formatDate(merchant.subscription_ends_at)}</span>
                )}
              </div>
            </div>

            <dl className="grid min-w-0 flex-1 basis-56 grid-cols-2 content-start gap-4">
              <Fact label="حدود البطاقات">{formatNumber(subscription.package.cards_limit)}</Fact>
              <Fact label="حملات أسبوعية">{formatNumber(subscription.package.weekly_campaigns_limit)}</Fact>
              <Fact label="التجربة">{subscription.trial_used ? "مستعملة" : "غير مستعملة"}</Fact>
              <Fact label="دفعة معلّقة">
                {subscription.pending_payment ? formatDate(subscription.pending_payment.created_at) : "لا يوجد"}
              </Fact>
            </dl>
          </div>

          <div className="border-t border-divider px-5 pt-4 pb-1">
            <h3 className="mb-3 text-[13px] text-fg-muted">سجل الفترات (الأحدث أولاً)</h3>
            {periods.length === 0 ? (
              <p className="pb-4 text-sm text-fg-muted">لا توجد فترات.</p>
            ) : (
              <ol>
                {periods.map((period) => (
                  <li key={period.id} className="flex gap-3.5">
                    <span aria-hidden className="flex flex-col items-center">
                      <span
                        className={cn(
                          "mt-1 size-3 shrink-0 rounded-full ring-4",
                          period.type === "trial" ? "bg-info ring-info-soft" : "bg-success ring-success-soft",
                        )}
                      />
                      <span className="w-0.5 flex-1 bg-divider" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 pb-4">
                      <span className="font-bold text-fg">
                        {periodTypeLabels[period.type]} · {period.package.name}
                        {period.duration_months !== null && (
                          <span className="font-normal text-fg-muted"> · {formatDuration(period.duration_months)}</span>
                        )}
                      </span>
                      <span className="flex flex-col text-[13px] text-fg-muted sm:items-end">
                        <span>
                          {formatDate(period.starts_at)} ← {formatDate(period.ends_at)}
                        </span>
                        {period.grace_ends_at && <span>مهلة السماح حتى {formatDate(period.grace_ends_at)}</span>}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

/** One row of the identity list: an icon tile, the label, the value. */
function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-t border-divider py-3 first:border-t-0">
      <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-700 [&>svg]:size-4.5">
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <dt className="text-xs text-fg-muted">{label}</dt>
        <dd className="text-[14.5px] font-medium break-words text-fg">{children}</dd>
      </div>
    </div>
  );
}

/**
 * The cover at its real shape. The server always stores it as 2:1 (up to 1200×600), so a 2:1 frame shows the whole
 * picture: nothing cropped or stretched. It opens full size in a new tab (an admin may need a closer look).
 */
function CoverImage({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="m-4 mb-0 flex aspect-2/1 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-neutral-50 text-fg-muted">
        <ImageSquare aria-hidden className="size-7 text-fg-subtle" />
        <span className="text-sm">لا يوجد غلاف</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="عرض الغلاف بالحجم الكامل"
      className="group/cover relative m-4 mb-0 block aspect-2/1 overflow-hidden rounded-xl ring-1 ring-ink/8 outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <Image src={url} alt="" fill unoptimized sizes="(min-width: 1024px) 22rem, 100vw" className="object-cover" />
      <span className="absolute end-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-neutral-0 opacity-0 backdrop-blur-sm transition-opacity group-hover/cover:opacity-100 group-focus-visible/cover:opacity-100">
        <ArrowsOut aria-hidden className="size-3.5" />
        عرض بالحجم الكامل
      </span>
    </a>
  );
}

export function IdentityCard({ merchant }: MerchantProps) {
  return (
    <Card className="overflow-hidden">
      <CoverImage url={merchant.cover_url} />
      <CardHeader icon={<IdentificationCard />} iconTone="neutral" title="بيانات النشاط" />
      <dl className="px-5 py-1">
        <InfoRow icon={<Storefront />} label="النوع">
          {merchant.business_type.name}
        </InfoRow>
        <InfoRow icon={<MapPin />} label="المحافظة والعنوان">
          {merchant.governorate.name}
          {merchant.address && <span className="block text-[13px] font-normal text-fg-muted">{merchant.address}</span>}
        </InfoRow>
        <InfoRow icon={<User />} label="المالك">
          {merchant.owner_name ?? dash}
        </InfoRow>
        <InfoRow icon={<Envelope />} label="البريد">
          {merchant.email ? <Latin>{merchant.email}</Latin> : dash}
        </InfoRow>
        <InfoRow icon={<Phone />} label="الهاتف">
          {merchant.phone ? <Latin>{merchant.phone}</Latin> : dash}
        </InfoRow>
        <InfoRow icon={<Phone />} label="هاتف التواصل">
          {merchant.contact_phone ? <Latin>{merchant.contact_phone}</Latin> : dash}
        </InfoRow>
        <InfoRow icon={<Calendar />} label="تاريخ التسجيل">
          {formatDateTime(merchant.registered_at)}
        </InfoRow>
        <InfoRow icon={<SignIn />} label="آخر دخول">
          {merchant.last_login_at ? formatDateTime(merchant.last_login_at) : "لم يدخل بعد"}
        </InfoRow>
      </dl>
    </Card>
  );
}

// Card faces take turns between the dark brand colors (white text passes on all three); a paused card is gray.
const cardFaces = ["bg-brand", "bg-ink", "bg-success"];
const MAX_DOTS = 12;

export function CardsList({ merchant }: MerchantProps) {
  const { cards } = merchant;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<Seal />}
        iconTone="amber"
        title="بطاقات الولاء"
        description={`العدد: ${formatNumber(cards.length)}`}
      />
      {cards.length === 0 ? (
        <EmptyState className="py-8" icon={<Seal />} title="لا توجد بطاقات" />
      ) : (
        <ul className="grid gap-3.5 p-5 sm:grid-cols-2">
          {cards.map((card, index) => {
            const suspended = card.status !== "active";
            // The stamps a customer must collect, drawn as empty slots; the last one is the gift
            const dots = Math.min(card.stamps_required, MAX_DOTS);
            return (
              <li
                key={card.id}
                className={cn(
                  "flex flex-col gap-3.5 rounded-2xl p-4 text-neutral-0",
                  suspended ? "bg-neutral-600" : cardFaces[index % cardFaces.length],
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[17px] font-black">{card.name}</span>
                  <span className="shrink-0 rounded-full bg-neutral-0/15 px-2.5 py-0.5 text-xs font-bold">
                    {suspended ? "موقوفة" : "فعّالة"}
                  </span>
                </div>
                <div aria-hidden className="flex flex-wrap gap-1.5">
                  {Array.from({ length: dots }, (_, dot) =>
                    dot === dots - 1 ? (
                      <span key={dot} className="flex size-6 items-center justify-center rounded-full bg-amber text-ink">
                        <Gift weight="fill" className="size-3.5" />
                      </span>
                    ) : (
                      <span key={dot} className="size-6 rounded-full border-2 border-neutral-0/45" />
                    ),
                  )}
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[13.5px] text-neutral-0/85">
                  <span>
                    {formatNumber(card.stamps_required)} أختام ← {card.reward_description}
                  </span>
                  <span>الزبائن: {formatNumber(card.customers_count)}</span>
                </div>
                {card.suspended_at && (
                  <span className="text-xs text-neutral-0/85">موقوفة منذ {formatDate(card.suspended_at)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export function RecentPayments({ merchant }: MerchantProps) {
  const { payments } = merchant;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        icon={<ClockCounterClockwise />}
        iconTone="teal"
        title="آخر الدفعات"
        description="آخر 10 دفعات، والباقي في سجل المالية."
      />
      {payments.length === 0 ? (
        <EmptyState className="py-8" icon={<Receipt />} title="لا توجد دفعات" />
      ) : (
        <ul className="divide-y divide-divider">
          {payments.map((payment) => (
            <li key={payment.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-3.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-bold text-fg">
                  {payment.package.name} · {formatDuration(payment.duration_months)}
                </span>
                <span className="text-[13px] text-fg-muted">
                  {methodLabels[payment.method]} · {formatDateTime(payment.created_at)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex flex-col items-end tabular-nums">
                  <span className="font-bold whitespace-nowrap text-fg">{formatSyp(payment.amount_syp)}</span>
                  <span className="text-xs text-fg-muted">{formatUsd(payment.price_usd)}</span>
                </span>
                <StatusBadge status={payment.status} className="min-w-20 justify-center" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
