"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Field, Input, Notice, ReasonDialog, toast } from "@/components/ui";
import { handleActionError } from "@/lib/api/action-errors";
import { getErrorMessage, toApiError } from "@/lib/api/errors";
import type { AdminCustomer } from "@/lib/api/types";
import { todayKey } from "@/lib/format";
import { useUpdateCustomerBirthdate } from "../hooks";
import { birthdateSchema, type BirthdateFormValues } from "../schemas";
import { customerName } from "./CustomerParts";

type BirthdateDialogProps = { customer: AdminCustomer; onClose: () => void };

/** Mounted only while open. The birthday gifts and the age rule depend on it, so it is fixed only after checking who called. */
export function BirthdateDialog({ customer, onClose }: BirthdateDialogProps) {
  const update = useUpdateCustomerBirthdate();
  const form = useForm<BirthdateFormValues>({
    resolver: zodResolver(birthdateSchema),
    defaultValues: { birthdate: customer.birthdate ?? "", reason: "" },
  });
  const reason = useWatch({ control: form.control, name: "reason" });
  const errors = form.formState.errors;
  const pending = update.isPending;

  const submit = form.handleSubmit((values) => {
    if (values.birthdate === customer.birthdate) {
      form.setError("birthdate", { message: "لم يتغيّر التاريخ" });
      return;
    }
    update.mutate(
      { id: customer.id, ...values },
      {
        onSuccess: () => {
          toast.success("تم تعديل تاريخ الميلاد");
          onClose();
        },
        onError: (error) => {
          // Under the minimum age: next to the date, not a toast
          if (toApiError(error).code === "UNDER_AGE") {
            form.setError("birthdate", { message: getErrorMessage(error) });
            return;
          }
          handleActionError(error, { setError: form.setError, onClose });
        },
      },
    );
  });

  return (
    <ReasonDialog
      title="تعديل تاريخ الميلاد"
      description={customerName(customer)}
      confirmLabel="حفظ"
      loading={pending}
      onClose={onClose}
      onSubmit={submit}
      reasonProps={form.register("reason")}
      reasonLength={reason.length}
      reasonError={errors.reason?.message}
    >
      <Notice>عدّله فقط بعد التأكد من هوية الزبون: عليه يعتمد شرط العمر وكل ما يخص عيد ميلاده.</Notice>
      <Field label="تاريخ الميلاد" required disabled={pending} error={errors.birthdate?.message} hint="13 سنة على الأقل.">
        <Input type="date" dir="ltr" max={todayKey()} className="w-48 text-start" {...form.register("birthdate")} />
      </Field>
    </ReasonDialog>
  );
}
