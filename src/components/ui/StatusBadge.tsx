import { Badge, type BadgeTone } from "./Badge";

// Colors follow the StatusBadge table in CLAUDE.md.
const statuses = {
  // Merchant
  TRIAL: { label: "تجربة", tone: "info" },
  ACTIVE: { label: "فعّال", tone: "success" },
  GRACE: { label: "فترة سماح", tone: "warning" },
  EXPIRED: { label: "منتهي", tone: "neutral" },
  SUSPENDED: { label: "موقوف", tone: "danger" },
  PENDING_DELETION: { label: "بانتظار الحذف", tone: "danger" },
  DELETED: { label: "محذوف", tone: "danger" },
  // Payment
  PENDING: { label: "بانتظار المراجعة", tone: "neutral" },
  APPROVED: { label: "مقبولة", tone: "success" },
  REJECTED: { label: "مرفوضة", tone: "danger" },
  // Deletion request
  pending: { label: "بانتظار التنفيذ", tone: "neutral" },
  executed: { label: "منفّذ", tone: "success" },
  cancelled: { label: "ملغى", tone: "neutral" },
  // Alerts
  overdue: { label: "متأخر", tone: "warning" },
  duplicate_reference: { label: "مرجع مكرر", tone: "warning" },
} satisfies Record<string, { label: string; tone: BadgeTone }>;

export type Status = keyof typeof statuses;

type StatusBadgeProps = {
  /** `null` = merchant still registering (no package chosen yet). */
  status: Status | null;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, tone } = status === null ? { label: "قيد التسجيل", tone: "neutral" as const } : statuses[status];

  return (
    <Badge tone={tone} dot className={className}>
      {label}
    </Badge>
  );
}
