"use client";

import { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthPickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function MonthPicker({ date, setDate }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Generate all 12 months for the current year
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, i, 1);
    return month;
  });

  const handlePreviousYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  const handleSelectMonth = (selectedDate: Date) => {
    setDate(selectedDate);
    setOpen(false);
  };

  return (
    <div className="md:w-1/6 min-w-[200px] w-full">
      <p className="mb-2 font-medium text-sm">Bulan</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left bg-white text-muted-foreground font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMMM yyyy") : <span>Select month</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousYear}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous Year</span>
            </Button>
            <div className="font-medium">{currentYear}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextYear}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next Year</span>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => {
              const isSelected =
                date &&
                date.getMonth() === month.getMonth() &&
                date.getFullYear() === month.getFullYear();

              return (
                <Button
                  key={month.toISOString()}
                  variant={isSelected ? "default" : "ghost"}
                  className="h-9"
                  onClick={() => handleSelectMonth(month)}
                >
                  {format(month, "MMM")}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
