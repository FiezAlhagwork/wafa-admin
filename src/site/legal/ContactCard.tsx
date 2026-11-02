import type { ReactNode } from "react";
import { Buildings, Envelope, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { Card } from "@/components/ui";
import type { PolicyValues } from "./policy-config";
import { textLink } from "./styles";

type ContactCardProps = {
  values: Pick<PolicyValues, "email" | "phone" | "whatsapp">;
  labels: { email: string; phone: string; party: string };
  partyValue: string;
};

/** Email, WhatsApp and the responsible party, as one card. */
export function ContactCard({ values, labels, partyValue }: ContactCardProps) {
  return (
    <Card className="divide-y divide-border">
      <ContactRow icon={<Envelope />} label={labels.email}>
        <a href={`mailto:${values.email}`} className={textLink}>
          {values.email}
        </a>
      </ContactRow>
      <ContactRow icon={<WhatsappLogo />} label={labels.phone}>
        <a href={`https://wa.me/${values.whatsapp}`} className={textLink} dir="ltr">
          {values.phone}
        </a>
      </ContactRow>
      <ContactRow icon={<Buildings />} label={labels.party}>
        {partyValue}
      </ContactRow>
    </Card>
  );
}

function ContactRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-4 sm:px-5">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand [&>svg]:size-5"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-fg-muted">{label}</span>
        <span className="font-medium wrap-break-word text-fg">{children}</span>
      </div>
    </div>
  );
}
