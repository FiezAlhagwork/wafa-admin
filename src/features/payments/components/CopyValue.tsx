"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { IconButton, toast } from "@/components/ui";

type CopyValueProps = {
  value: string;
  /** What is being copied, for the button's name ("نسخ رقم المرجع"). */
  label: string;
};

/** A code shown left-to-right with a button that copies it (the reviewer matches it against the account). */
export function CopyValue({ value, label }: CopyValueProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard needs a secure page and the user's permission: say so instead of failing silently
      toast.error("تعذّر النسخ", { description: "انسخ الرقم يدوياً." });
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <bdi dir="ltr" className="font-mono text-sm tracking-tight">
        {value}
      </bdi>
      <IconButton
        label={copied ? "تم النسخ" : label}
        icon={copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        size="sm"
        className="-my-1"
        onClick={() => void copy()}
      />
    </span>
  );
}
