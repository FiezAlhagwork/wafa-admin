import { cn } from "@/lib/cn";

type Stamp = { place: string; look: string; delay: string; duration: string; mobile?: boolean };

/** Where each stamp sits and how it looks, per section. Positions use logical edges so they mirror in English. */
const layouts = {
  hero: [
    { place: "start-[3%] top-[8%]", look: "size-14 bg-amber/30", delay: "0s", duration: "7s", mobile: true },
    { place: "start-[2%] bottom-[30%]", look: "size-8 border-2 border-dashed border-amber", delay: "-2s", duration: "6s" },
    { place: "start-[38%] bottom-[10%]", look: "size-10 border-2 border-dashed border-teal/60", delay: "-4s", duration: "8s" },
    { place: "start-[44%] top-[12%]", look: "size-6 bg-teal/25", delay: "-1s", duration: "9s" },
    { place: "end-[38%] top-[6%]", look: "size-8 bg-brand/15", delay: "-3s", duration: "7s", mobile: true },
    { place: "end-[4%] bottom-[12%]", look: "size-12 border-2 border-dashed border-brand/40", delay: "-5s", duration: "8s", mobile: true },
  ],
  about: [
    { place: "start-[6%] top-[14%]", look: "size-10 bg-teal/25", delay: "-1s", duration: "8s", mobile: true },
    { place: "start-[30%] bottom-[12%]", look: "size-12 border-2 border-dashed border-amber", delay: "-3s", duration: "7s" },
    { place: "end-[3%] top-[10%]", look: "size-14 bg-amber/25", delay: "0s", duration: "9s", mobile: true },
    { place: "end-[34%] top-[8%]", look: "size-6 border-2 border-dashed border-brand/40", delay: "-5s", duration: "6s" },
    { place: "end-[10%] bottom-[8%]", look: "size-8 bg-brand/15", delay: "-2s", duration: "8s", mobile: true },
  ],
  features: [
    { place: "start-[2%] top-[4%]", look: "size-12 bg-amber/25", delay: "-2s", duration: "8s", mobile: true },
    { place: "end-[3%] top-[10%]", look: "size-9 border-2 border-dashed border-teal/60", delay: "-4s", duration: "7s" },
    { place: "start-[1%] top-[45%]", look: "size-8 bg-brand/15", delay: "-1s", duration: "9s" },
    { place: "end-[1%] top-[55%]", look: "size-14 border-2 border-dashed border-amber", delay: "0s", duration: "8s", mobile: true },
    { place: "start-[3%] bottom-[6%]", look: "size-10 bg-teal/25", delay: "-3s", duration: "7s" },
    { place: "end-[6%] bottom-[3%]", look: "size-6 bg-amber/30", delay: "-5s", duration: "6s", mobile: true },
  ],
  how: [
    { place: "start-[1%] top-[8%]", look: "size-12 border-2 border-dashed border-brand/40", delay: "-2s", duration: "8s", mobile: true },
    { place: "end-[1%] top-[14%]", look: "size-10 bg-amber/25", delay: "0s", duration: "7s", mobile: true },
    { place: "start-[1%] bottom-[6%]", look: "size-8 bg-teal/25", delay: "-4s", duration: "9s" },
    { place: "end-[2%] bottom-[4%]", look: "size-9 border-2 border-dashed border-teal/60", delay: "-1s", duration: "6s" },
  ],
} satisfies Record<string, Stamp[]>;

/** Faint stamps drifting behind a section, echoing the stamps on the card. Purely decorative. */
export function StampsBackdrop({ variant }: { variant: keyof typeof layouts }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {layouts[variant].map((stamp: Stamp, index) => (
        <span
          key={index}
          className={cn(
            "stamp-float absolute rounded-full",
            stamp.place,
            stamp.look,
            !stamp.mobile && "hidden sm:block",
          )}
          style={{ animationDelay: stamp.delay, animationDuration: stamp.duration }}
        />
      ))}
    </div>
  );
}
