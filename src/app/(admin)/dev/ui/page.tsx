import { notFound } from "next/navigation";
import { UiPreviewScreen } from "@/features/dev/screens/UiPreviewScreen";

// Component preview for development only. Never reachable in production.
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <UiPreviewScreen />;
}
