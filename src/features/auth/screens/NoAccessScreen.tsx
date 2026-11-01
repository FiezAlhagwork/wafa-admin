"use client";

import { useUser } from "@clerk/nextjs";
import { LockKey, SignOut } from "@phosphor-icons/react";
import { Button } from "@/components/ui";
import { FullScreenState } from "../components/FullScreenState";
import { useSignOut } from "../hooks";

/** /admin/auth/me returned 403 FORBIDDEN: signed in with Clerk, but not an active admin account. */
export function NoAccessScreen() {
  const { user } = useUser();
  const { signOut, pending } = useSignOut();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <FullScreenState>
      <div className="flex flex-col items-center gap-5 px-8 py-10 text-center">
        <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <LockKey className="size-7" weight="duotone" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-fg">لا تملك صلاحية الدخول</h1>
          <p className="text-sm leading-relaxed text-fg-muted">
            {email ? (
              <>
                الحساب{" "}
                <bdi dir="ltr" className="font-medium text-fg">
                  {email}
                </bdi>{" "}
                ليس حساب إدارة مفعّلاً.
              </>
            ) : (
              "هذا الحساب ليس حساب إدارة مفعّلاً."
            )}{" "}
            تواصل مع مسؤول المنصة إذا كنت تعتقد أن هذا خطأ.
          </p>
        </div>
        <Button
          variant="secondary"
          icon={<SignOut className="size-4 rtl:-scale-x-100" />}
          loading={pending}
          onClick={signOut}
        >
          تسجيل الخروج
        </Button>
      </div>
    </FullScreenState>
  );
}
