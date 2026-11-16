import { notFound } from "next/navigation";
import { ShellPreviewScreen } from "@/features/dev/screens/ShellPreviewScreen";

// The Shell and the home page with fake data, for checking the design without Clerk or the backend.
// Development only. Never reachable in production.
export default function DevShellPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ShellPreviewScreen />;
}
