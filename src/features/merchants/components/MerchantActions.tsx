"use client";

import type { ReactNode } from "react";
import { CalendarPlus, DotsThreeVertical, PauseCircle, PencilSimple, PlayCircle } from "@phosphor-icons/react";
import { Button, Menu, MenuItem } from "@/components/ui";
import type { AdminMerchantDetail } from "@/lib/api/types";
import { usePermission } from "@/lib/auth/can";
import { cn } from "@/lib/cn";
import type { MerchantAction } from "./MerchantActionDialogs";

type Item = { action: MerchantAction; label: string; icon: ReactNode; danger?: boolean };

// The status decides which buttons show, for display only: the server decides, and its refusal is shown if it says no
const unsuspendable = new Set(["SUSPENDED", "PENDING_DELETION", "DELETED"]);

/** The actions this admin may take on this merchant now, by permission and status. */
function useMerchantActions(merchant: AdminMerchantDetail): Item[] {
  const canEdit = usePermission("edit-business-identity");
  const canExtend = usePermission("grant-extensions");
  const canSuspend = usePermission("suspend-merchants");
  // DELETED is in the backend guide but not in the generated status type (A07)
  const status: string | null = merchant.status;

  const items: Item[] = [];
  if (canEdit && status !== "DELETED") {
    items.push({ action: { type: "edit" }, label: "تعديل البيانات", icon: <PencilSimple /> });
  }
  if (canExtend && (status === "TRIAL" || status === "EXPIRED")) {
    items.push({ action: { type: "extend" }, label: "تمديد التجربة", icon: <CalendarPlus /> });
  }
  if (canSuspend && status === "SUSPENDED") {
    items.push({ action: { type: "reactivate" }, label: "إعادة التفعيل", icon: <PlayCircle /> });
  } else if (canSuspend && (status === null || !unsuspendable.has(status))) {
    items.push({ action: { type: "suspend" }, label: "إيقاف التاجر", icon: <PauseCircle />, danger: true });
  }
  return items;
}

type MerchantActionsProps = {
  merchant: AdminMerchantDetail;
  onAction: (action: MerchantAction) => void;
  className?: string;
};

/** Buttons from `sm` up; one «إجراءات» menu on a phone. Nothing when the role has no action here. */
export function MerchantActions({ merchant, onAction, className }: MerchantActionsProps) {
  const items = useMerchantActions(merchant);
  if (items.length === 0) return null;

  return (
    <div className={className}>
      <div className="hidden flex-wrap gap-2 sm:flex">
        {items.map((item) => (
          <Button
            key={item.action.type}
            variant="secondary"
            icon={item.icon}
            className={cn("[&_svg]:size-4.5", item.danger && "text-danger")}
            onClick={() => onAction(item.action)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="sm:hidden">
        <Menu
          align="start"
          trigger={
            <Button variant="secondary" icon={<DotsThreeVertical className="size-4.5" />}>
              إجراءات
            </Button>
          }
        >
          {items.map((item) => (
            <MenuItem
              key={item.action.type}
              icon={item.icon}
              tone={item.danger ? "danger" : "default"}
              onClick={() => onAction(item.action)}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </div>
  );
}
