"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
// import classNames from "react-day-picker/style.module.css";

// console.log(classNames);

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-white relative z-10", className)}
      style={{ pointerEvents: 'auto' }}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2 relative",
        month: "flex flex-col gap-4",
        weekday: "font-normal text-sm text-muted-foreground",
        caption_label: "text-sm font-medium flex justify-center pt-1 relative items-center w-full",
        button_previous: "absolute top-2 left-2 [&_svg]:size-4 border-1 border-border size-7 inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground",
        button_next: "absolute top-2 right-2 [&_svg]:size-4 border-1 border-border size-7 inline-flex items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground",
        chevron: "stroke-1 fill-foreground",
        day_button: "rounded-md text-sm font-medium size-8 font-normal aria-selected:opacity-100 hover:bg-blue-50 hover:text-[#253A8B] focus:bg-blue-50 focus:text-[#253A8B] cursor-pointer inline-flex items-center justify-center transition-colors bg-white border-0",
        disabled: "text-muted-foreground opacity-50 pointer-events-none",
        today: "bg-blue-50 text-[#253A8B] rounded-md font-semibold",
        selected: "bg-[#253A8B] text-[#253A8B] hover:bg-[#253A8B] hover:text-[#253A8B] focus:bg-[#253A8B] focus:text-[#253A8B]",
        range_end: "bg-[#253A8B] text-[#253A8B] rounded-md",
        range_middle: "aria-selected:bg-[#253A8B] aria-selected:text-[#253A8B]",
        range_start: "bg-[#253A8B] text-[#253A8B] rounded-md",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";
export { Calendar };
