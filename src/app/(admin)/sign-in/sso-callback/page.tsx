import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Spinner } from "@/components/ui";

// Google comes back here. Clerk finishes the sign-in (or transfers a first-time account to sign-up,
// which needs the captcha element) and redirects to /admin.
export default function SsoCallbackPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Spinner size="lg" label="جارٍ تسجيل الدخول" className="text-brand" />
      <p className="text-sm text-fg-muted">جارٍ تسجيل الدخول…</p>
      <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/admin" signUpFallbackRedirectUrl="/admin" />
      <div id="clerk-captcha" />
    </main>
  );
}
