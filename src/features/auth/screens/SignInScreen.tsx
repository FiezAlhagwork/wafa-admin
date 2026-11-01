"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, GoogleLogo } from "@phosphor-icons/react";
import { Button, Card, Field, Input, OtpField } from "@/components/ui";
import { clerkErrorMessage, FALLBACK_SIGN_IN_ERROR } from "../clerk-errors";
import { signInEmailSchema, type SignInEmailValues } from "../schemas";

const AFTER_SIGN_IN = "/admin";
const RESEND_SECONDS = 30;

type Pending = "google" | "send" | "verify" | "resend" | null;

/** Custom Clerk sign-in: Google, or email + one-time code. Every text is ours (Clerk's messages are English). */
export function SignInScreen() {
  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [resendIn, setResendIn] = useState(0);

  const form = useForm<SignInEmailValues>({ resolver: zodResolver(signInEmailSchema), defaultValues: { email: "" } });

  const busy = pending !== null;

  useEffect(() => {
    if (isSignedIn) router.replace(AFTER_SIGN_IN);
  }, [isSignedIn, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const signInWithGoogle = async () => {
    setFormError(null);
    setPending("google");
    const { error } = await signIn.sso({
      strategy: "oauth_google",
      redirectUrl: AFTER_SIGN_IN,
      redirectCallbackUrl: "/sign-in/sso-callback",
    });
    // On success the browser leaves for Google, so only failures come back here
    if (error) {
      setFormError(clerkErrorMessage(error));
      setPending(null);
    }
  };

  const sendCode = form.handleSubmit(async (values) => {
    setFormError(null);
    setPending("send");
    const created = await signIn.create({ identifier: values.email });
    const { error } = created.error ? created : await signIn.emailCode.sendCode();
    setPending(null);

    if (error) {
      form.setError("email", { message: clerkErrorMessage(error) ?? FALLBACK_SIGN_IN_ERROR });
      return;
    }
    setEmail(values.email);
    setCode("");
    setCodeError(null);
    setResendIn(RESEND_SECONDS);
    setStep("code");
  });

  const verify = async (value: string) => {
    if (busy) return;
    setCodeError(null);
    setPending("verify");

    const { error } = await signIn.emailCode.verifyCode({ code: value });
    if (error) {
      setCodeError(clerkErrorMessage(error));
      setCode("");
      setPending(null);
      return;
    }
    if (signIn.status !== "complete") {
      // e.g. a second factor is required: not supported for admin accounts
      setCodeError("تعذّر إكمال تسجيل الدخول. تواصل مع مسؤول المنصة.");
      setPending(null);
      return;
    }

    // Stays "verify" until the page changes, so the button doesn't flash back to idle
    const finalized = await signIn.finalize({
      navigate: ({ decorateUrl }) => {
        const url = decorateUrl(AFTER_SIGN_IN);
        if (url.startsWith("http")) window.location.href = url;
        else router.push(url);
      },
    });
    if (finalized.error) {
      setCodeError(clerkErrorMessage(finalized.error));
      setPending(null);
    }
  };

  const resend = async () => {
    setCodeError(null);
    setPending("resend");
    const { error } = await signIn.emailCode.sendCode();
    setPending(null);
    if (error) {
      setCodeError(clerkErrorMessage(error));
      return;
    }
    setCode("");
    setResendIn(RESEND_SECONDS);
  };

  const changeEmail = async () => {
    await signIn.reset();
    setStep("email");
    setCode("");
    setCodeError(null);
    setResendIn(0);
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className="flex size-14 items-center justify-center rounded-2xl bg-brand text-3xl font-black text-brand-on"
          >
            و
          </span>
          <span aria-hidden className="h-1 w-10 rounded-full bg-amber" />
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-fg">لوحة وفاء</h1>
            <p className="text-sm text-fg-muted">لوحة إدارة المنصة للفريق الداخلي</p>
          </div>
        </header>

        <Card className="flex flex-col gap-5 p-6">
          {formError && (
            <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {formError}
            </p>
          )}

          {step === "email" ? (
            <>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                icon={<GoogleLogo weight="bold" className="size-5" />}
                loading={pending === "google"}
                disabled={busy}
                onClick={signInWithGoogle}
              >
                الدخول بحساب Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-fg-muted">
                <span aria-hidden className="h-px flex-1 bg-border" />
                أو بالبريد الإلكتروني
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={sendCode} noValidate className="flex flex-col gap-4">
                <Field label="البريد الإلكتروني" error={form.formState.errors.email?.message}>
                  <Input
                    type="email"
                    dir="ltr"
                    autoComplete="email"
                    placeholder="name@example.com"
                    autoFocus
                    {...form.register("email")}
                  />
                </Field>
                <Button type="submit" variant="accent" size="lg" fullWidth loading={pending === "send"} disabled={busy}>
                  إرسال رمز التحقق
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-fg">أدخل رمز التحقق</h2>
                <p className="text-sm text-fg-muted">
                  أرسلنا رمزاً من 6 أرقام إلى{" "}
                  <bdi dir="ltr" className="font-medium text-fg">
                    {email}
                  </bdi>
                </p>
              </div>

              <Field label="رمز التحقق" error={codeError ?? undefined}>
                <OtpField
                  value={code}
                  onValueChange={(value) => {
                    setCode(value);
                    setCodeError(null);
                  }}
                  onComplete={verify}
                  disabled={busy}
                  autoFocus
                  className="justify-between"
                />
              </Field>

              <Button
                variant="accent"
                size="lg"
                fullWidth
                loading={pending === "verify"}
                disabled={busy || code.length < 6}
                onClick={() => verify(code)}
              >
                تأكيد
              </Button>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<ArrowLeft className="size-4 rtl:-scale-x-100" />}
                  disabled={busy}
                  onClick={changeEmail}
                >
                  تغيير البريد
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={pending === "resend"}
                  disabled={busy || resendIn > 0}
                  onClick={resend}
                >
                  {resendIn > 0 ? `إعادة الإرسال بعد ${resendIn} ث` : "إعادة إرسال الرمز"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
