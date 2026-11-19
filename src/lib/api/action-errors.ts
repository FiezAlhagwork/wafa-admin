import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "@/components/ui";
import { applyFieldErrors, getErrorMessage, toApiError } from "./errors";
import type { ErrorCode } from "./types";

/**
 * The failure of an action dialog (a form with a reason). A 422 goes next to its field and the dialog stays open.
 * 403 and 429 are shown once by the query client. Anything else is a toast. The dialog also closes when there is
 * nothing left to do in it: the item is gone, the role can't, or one of `conflicts` (someone else changed the item
 * first; the hook refetches it).
 */
export function handleActionError<T extends FieldValues>(
  error: unknown,
  { setError, onClose, conflicts = [] }: { setError: UseFormSetError<T>; onClose: () => void; conflicts?: ErrorCode[] },
) {
  if (applyFieldErrors(error, setError)) return;
  const { code } = toApiError(error);
  if (code !== "FORBIDDEN" && code !== "RATE_LIMITED") toast.error(getErrorMessage(error));
  if (code === "NOT_FOUND" || code === "FORBIDDEN" || (conflicts as string[]).includes(code)) onClose();
}
