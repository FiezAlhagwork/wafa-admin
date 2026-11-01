import type { Metadata } from "next";
import { SignInScreen } from "@/features/auth/screens/SignInScreen";

export const metadata: Metadata = { title: "تسجيل الدخول — لوحة وفاء" };

export default function SignInPage() {
  return <SignInScreen />;
}
