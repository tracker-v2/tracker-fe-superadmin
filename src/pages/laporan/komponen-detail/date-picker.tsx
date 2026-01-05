import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";

// Added import for DateRange type
import type { DateRange } from "react-day-picker";

import { YearPicker } from "@/components/year-picker";
import { MonthPicker } from "@/components/month-picker";

interface DatePickerProps {
  selectedReport: string;
  selectedPeriod: string;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

export function DatePicker({ selectedReport, selectedPeriod, date, setDate, dateRange, setDateRange }: DatePickerProps) {
  if (selectedReport === "Perjalanan" || selectedReport === "Idle") {
    return (
      <div className='md:w-1/4 min-w-[300px] w-full'>
        <p className='mb-2 font-medium text-sm'>Rentang Tanggal</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='w-full bg-white text-muted-foreground justify-between text-sm'>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
                  </>
                ) : (
                  format(dateRange.from, "PPP")
                )
              ) : (
                "Pilih rentang tanggal"
              )}
              <CalendarIcon className='ml-2 h-4 w-4' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar mode='range' selected={dateRange} onSelect={setDateRange} initialFocus numberOfMonths={2} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  switch (selectedPeriod) {
    case "Harian":
      return (
        <div className='md:w-1/6 min-w-[200px] w-full'>
          <p className='mb-2 font-medium text-sm'>Tanggal</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className='w-full bg-white text-muted-foreground justify-between text-sm'>
                {date ? format(date, "PPP") : "Pilih tanggal"}
                <CalendarIcon className='ml-2 h-4 w-4' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      );
    case "Bulanan":
     return <MonthPicker date={date} setDate={setDate} />;
    case "Tahunan":
      return <YearPicker date={date} setDate={setDate} />;
    default:
      return null;
  }
}
