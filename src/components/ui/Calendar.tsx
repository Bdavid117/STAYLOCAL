"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/Button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={`p-3 ${className}`}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-8",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-ink-soft rounded-md w-9 font-normal text-[0.8rem] uppercase font-mono",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-bone-2/50 [&:has([aria-selected])]:bg-bone-2 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-bone-2 rounded-md transition-colors",
        day_range_end: "day-range-end",
        day_selected: "bg-ink text-paper hover:bg-ink hover:text-paper focus:bg-ink focus:text-paper",
        day_today: "bg-bone-2 text-ink",
        day_outside: "day-outside text-ink-soft opacity-50 aria-selected:bg-bone-2/50 aria-selected:text-ink-soft aria-selected:opacity-30",
        day_disabled: "text-ink-soft opacity-50",
        day_range_middle: "aria-selected:bg-bone-2 aria-selected:text-ink",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <span className="material-symbols-outlined text-sm">chevron_left</span>,
        IconRight: ({ ...props }) => <span className="material-symbols-outlined text-sm">chevron_right</span>,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
