"use client";

import { DateRangePicker, Field, Select } from "@/components/ui";
import { todayKey } from "@/lib/format";
import { isBackwards, periodRange, presetOptions, type FinanceView, type Period, type PeriodPreset } from "../filters";

type PeriodPickerProps = {
  view: FinanceView;
  value: Period;
  onChange: (period: Period) => void;
  className?: string;
};

/**
 * A preset ("هذا الشهر"…) or two days chosen on a calendar. The calendar only applies a whole period, so the URL never
 * holds half of one; a backwards period typed into the URL by hand is shown as an error and asks the server nothing.
 */
export function PeriodPicker({ view, value, onChange, className }: PeriodPickerProps) {
  const choosePreset = (preset: PeriodPreset) => {
    if (preset !== "custom") return onChange({ preset, from: "", to: "" });
    // "Custom" starts from the days of the preset it replaces, ready to adjust ("كل الفترات" has none)
    const { from = "", to = "" } = periodRange(value);
    onChange({ preset, from, to });
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap items-start gap-3">
        <Field label="الفترة" className="w-44">
          <Select value={value.preset} options={presetOptions(view)} onValueChange={choosePreset} />
        </Field>
        {value.preset === "custom" && (
          <Field
            label="من – إلى"
            className="w-72 max-w-full"
            error={isBackwards(value) ? "تاريخ البداية بعد تاريخ النهاية" : undefined}
          >
            <DateRangePicker
              value={{ from: value.from, to: value.to }}
              max={todayKey()}
              placeholder="اختر يومي البداية والنهاية"
              onChange={(range) => onChange({ preset: "custom", ...range })}
            />
          </Field>
        )}
      </div>
    </div>
  );
}
