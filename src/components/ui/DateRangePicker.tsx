"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { todayKey } from "@/lib/format";
import { Button } from "./Button";
import { useFieldControl } from "./Field";
import { controlBase, controlBorder, focusRing, popupMotion, popupSurface } from "./styles";

/** Two "YYYY-MM-DD" days; "" when not chosen. */
export type DateRange = { from: string; to: string };

type DateRangePickerProps = {
  value: DateRange;
  /** Called once, with both days, when "تطبيق" is pressed. */
  onChange: (range: DateRange) => void;
  /** The last day that can be chosen (usually today), "YYYY-MM-DD". */
  max?: string;
  placeholder?: string;
  /** Set automatically inside a Field with an error. */
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
};

// Calendar days are plain "YYYY-MM-DD" strings, built and read in UTC so no time zone can move them
const LOCALE = "ar-u-nu-latn";
const monthTitle = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", month: "long", year: "numeric" });
const dayLong = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const dayShort = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", day: "numeric", month: "long" });
const dayFull = new Intl.DateTimeFormat(LOCALE, { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

const pad = (value: number) => String(value).padStart(2, "0");
const toKey = (date: Date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
const toDate = (key: string) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
const addDays = (key: string, days: number) => {
  const date = toDate(key);
  date.setUTCDate(date.getUTCDate() + days);
  return toKey(date);
};
/** The first day of the month `offset` months from `key`'s month. */
const monthOf = (key: string, offset = 0) => {
  const date = toDate(key);
  return toKey(new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1)));
};

// The week starts on Saturday, as in Syria
const weekdays = [
  { short: "س", name: "السبت" },
  { short: "ح", name: "الأحد" },
  { short: "ن", name: "الاثنين" },
  { short: "ث", name: "الثلاثاء" },
  { short: "ر", name: "الأربعاء" },
  { short: "خ", name: "الخميس" },
  { short: "ج", name: "الجمعة" },
];
/** Column of a day in a Saturday-first week (JS counts from Sunday). */
const column = (key: string) => (toDate(key).getUTCDay() + 1) % 7;

/** "10 – 24 نوفمبر 2026", "28 أكتوبر – 3 نوفمبر 2026", or across years with both years. */
export function formatDateRange({ from, to }: DateRange): string {
  if (!from && !to) return "";
  if (!to || from === to) return dayFull.format(toDate(from || to));
  if (!from) return `حتى ${dayFull.format(toDate(to))}`;
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const start = sameMonth ? String(Number(from.slice(8))) : sameYear ? dayShort.format(toDate(from)) : dayFull.format(toDate(from));
  return `${start} – ${dayFull.format(toDate(to))}`;
}

/**
 * Two days chosen on a calendar: the first tap sets the start, the second the end (tapping before the start moves the
 * start instead). Nothing changes until "تطبيق", so a half-chosen period never reaches the server. Two months side by
 * side from `sm`, one on a phone. Arrow keys move between days.
 */
export function DateRangePicker({
  value,
  onChange,
  max,
  placeholder = "اختر الفترة",
  invalid,
  disabled,
  className,
}: DateRangePickerProps) {
  const field = useFieldControl();
  const isInvalid = invalid ?? field?.invalid ?? false;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange>(value);
  const [hovered, setHovered] = useState("");
  // The later of the two months on screen
  const [month, setMonth] = useState(() => monthOf(value.to || value.from || max || todayKey()));
  const [focusDay, setFocusDay] = useState(value.to || value.from || max || todayKey());
  const gridRef = useRef<HTMLDivElement>(null);

  const openChange = (next: boolean) => {
    if (next) {
      // Every opening starts from the applied period, not from an abandoned draft
      const anchor = value.to || value.from || max || todayKey();
      setDraft(value);
      setMonth(monthOf(anchor));
      setFocusDay(anchor);
      setHovered("");
    }
    setOpen(next);
  };

  const pick = (day: string) => {
    setFocusDay(day);
    if (!draft.from || draft.to) return setDraft({ from: day, to: "" });
    if (day < draft.from) return setDraft({ from: day, to: "" });
    setDraft({ from: draft.from, to: day });
  };

  const apply = () => {
    onChange(draft);
    setOpen(false);
  };

  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    // RTL: the left arrow goes forward in time
    const steps: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1, ArrowDown: 7, ArrowUp: -7 };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    let next = addDays(focusDay, step);
    if (max && next > max) next = max;
    setFocusDay(next);
    // Keep the day on screen: the visible months are (month - 1, month)
    if (next < monthOf(month, -1)) setMonth(monthOf(next, 1));
    else if (next >= monthOf(month, 1)) setMonth(monthOf(next));
    requestAnimationFrame(() => gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus());
  };

  // The band while choosing the end: from the start to the hovered day
  const end = draft.to || (draft.from && hovered > draft.from ? hovered : "");
  const canGoNext = !max || monthOf(month, 1) <= max;
  const label = formatDateRange(value);

  return (
    <Popover.Root open={open} onOpenChange={openChange}>
      <Popover.Trigger
        id={field?.id}
        disabled={disabled ?? field?.disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          controlBase,
          controlBorder(isInvalid),
          "flex h-10.5 cursor-pointer items-center gap-2 px-3 text-start data-popup-open:border-brand data-popup-open:ring-3 data-popup-open:ring-brand/15",
          className,
        )}
      >
        <CalendarBlank aria-hidden className="size-4.5 shrink-0 text-brand" />
        <span className={cn("truncate", !label && "text-fg-subtle")}>{label || placeholder}</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start" className="z-50 outline-none">
          <Popover.Popup className={cn(popupSurface, popupMotion, "origin-(--transform-origin) p-4")}>
            <Popover.Title className="sr-only">اختر الفترة</Popover.Title>

            <div className="relative">
              {/* Month arrows sit over the month titles: previous on the start side, next on the end side */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between">
                <NavButton label="الشهر السابق" onClick={() => setMonth(monthOf(month, -1))}>
                  <CaretRight aria-hidden className="size-4" />
                </NavButton>
                <NavButton label="الشهر التالي" disabled={!canGoNext} onClick={() => setMonth(monthOf(month, 1))}>
                  <CaretLeft aria-hidden className="size-4" />
                </NavButton>
              </div>

              <div ref={gridRef} onKeyDown={moveFocus} className="flex gap-6">
                {[monthOf(month, -1), month].map((first, index) => (
                  <Month
                    key={first}
                    first={first}
                    // One month on a phone: the earlier one is hidden there
                    className={index === 0 ? "max-sm:hidden" : undefined}
                    draft={draft}
                    end={end}
                    max={max}
                    today={todayKey()}
                    focusDay={focusDay}
                    onPick={pick}
                    onHover={setHovered}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-3">
              <p className="text-sm text-fg-muted" aria-live="polite">
                {draft.from && draft.to ? (
                  <span className="font-bold text-fg">{formatDateRange(draft)}</span>
                ) : draft.from ? (
                  "اختر يوم النهاية"
                ) : (
                  "اختر يوم البداية"
                )}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setDraft({ from: "", to: "" })} disabled={!draft.from}>
                  مسح
                </Button>
                <Button size="sm" onClick={apply} disabled={!draft.from || !draft.to}>
                  تطبيق
                </Button>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function NavButton({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "pointer-events-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-fg-muted hover:bg-neutral-100 hover:text-fg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}

type MonthProps = {
  /** "YYYY-MM-01". */
  first: string;
  draft: DateRange;
  /** The end of the band: the chosen end, or the hovered day while choosing it. */
  end: string;
  max?: string;
  today: string;
  focusDay: string;
  onPick: (day: string) => void;
  onHover: (day: string) => void;
  className?: string;
};

function Month({ first, draft, end, max, today, focusDay, onPick, onHover, className }: MonthProps) {
  const next = monthOf(first, 1);
  const days: string[] = [];
  for (let day = first; day < next; day = addDays(day, 1)) days.push(day);
  // The tab stop of the grid: the focused day if it is in this month, otherwise none here
  const tabDay = days.includes(focusDay) ? focusDay : "";

  return (
    <div className={cn("w-70", className)}>
      <p className="flex h-8 items-center justify-center text-sm font-bold text-fg">{monthTitle.format(toDate(first))}</p>
      <div className="mt-2" onMouseLeave={() => onHover("")}>
        <div aria-hidden className="grid grid-cols-7">
          {weekdays.map((weekday) => (
            <abbr key={weekday.name} title={weekday.name} className="flex h-8 items-center justify-center text-xs font-medium text-fg-muted no-underline">
              {weekday.short}
            </abbr>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day, index) => {
            const col = column(day);
            const start = day === draft.from;
            const finish = !!end && day === end;
            const inBand = !!draft.from && !!end && day > draft.from && day < end;
            const banded = !!draft.from && !!end && end !== draft.from && (start || finish || inBand);
            const off = !!max && day > max;
            return (
              <div
                key={day}
                style={index === 0 ? { gridColumnStart: col + 1 } : undefined}
                className={cn(
                  "flex h-10 items-center justify-center",
                  banded && "bg-brand-soft",
                  // The band is rounded where it starts and ends, and at the edges of each week row
                  banded && (start || col === 0) && "rounded-s-full",
                  banded && (finish || col === 6) && "rounded-e-full",
                )}
              >
                <button
                  type="button"
                  data-day={day}
                  tabIndex={day === tabDay ? 0 : -1}
                  disabled={off}
                  aria-label={dayLong.format(toDate(day))}
                  aria-current={day === today ? "date" : undefined}
                  aria-pressed={start || finish}
                  onClick={() => onPick(day)}
                  onMouseEnter={() => onHover(day)}
                  className={cn(
                    "relative flex size-10 cursor-pointer items-center justify-center rounded-full text-sm tabular-nums transition-colors",
                    "outline-none focus-visible:ring-2 focus-visible:ring-focus",
                    start || finish
                      ? "bg-brand font-bold text-brand-on"
                      : inBand
                        ? "text-brand hover:bg-brand/10"
                        : "text-fg hover:bg-neutral-100",
                    off && "cursor-not-allowed text-fg-subtle/60 hover:bg-transparent",
                  )}
                >
                  {Number(day.slice(8))}
                  {/* Today: an amber dot under the number */}
                  {day === today && !start && !finish && (
                    <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-amber" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
