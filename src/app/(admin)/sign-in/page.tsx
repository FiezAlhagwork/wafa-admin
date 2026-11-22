import type { Metadata } from "next";
import { SignInScreen } from "@/features/auth/screens/SignInScreen";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function SignInPage() {
  return <SignInScreen />;
}
