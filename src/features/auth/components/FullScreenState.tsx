import type { ReactNode } from "react";
import { Card } from "@/components/ui";

/** Centered card on an empty page: loading, errors and "no access" before the Shell exists. */
export function FullScreenState({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <Card className="w-full max-w-md">{children}</Card>
    </main>
  );
}
