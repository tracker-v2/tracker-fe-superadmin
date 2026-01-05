import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MultiSelect } from "@/components/multi-select";
import { ChevronDown, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface Props {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  selectNoPolice: string[];
  setSelectNoPolice: (value: string[]) => void;
  vehicleData: { label: string; value: string }[];
  selectedReport: string;
  setSelectedReport: (report: string) => void;
  setShowTable: (show: boolean) => void;
  handleSearch: () => void;
}

export default function LaporanHeader({
  date,
  setDate,
  selectNoPolice,
  setSelectNoPolice,
  vehicleData,
  selectedReport,
  setSelectedReport,
  setShowTable,
  handleSearch,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-center">
      {/* Laporan Dropdown */}
      <div className="md:w-1/4 min-w-[284px] w-full max-w-[300px]">
        <p className="mb-2 font-medium">Laporan</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full bg-white text-muted-foreground justify-between"
            >
              {selectedReport}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-[284px] max-w-[300px]"
            align="start"
          >
            {["Bahan Bakar", "Perjalanan", "Idle"].map((report) => (
              <DropdownMenuItem
                key={report}
                onClick={() => {
                  setSelectedReport(report);
                  setShowTable(false);
                }}
              >
                {report}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nomor Polisi MultiSelect */}
      <div className="md:w-1/4 min-w-[310px] w-full max-w-auto">
        <p className="mb-2 font-medium">Nomor Polisi</p>
        <div className="overflow-y-auto max-h-[320px] whitespace-nowrap">
          <MultiSelect
            options={vehicleData}
            onValueChange={setSelectNoPolice}
            value={selectNoPolice}
            placeholder="Nomor Polisi"
            variant="inverted"
            animation={2}
            maxCount={3}
          />
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="md:w-1/4 min-w-[310px] w-full max-w-auto">
        <p className="mb-2 font-medium">Rentang Tanggal</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full bg-white justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pilih Tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Search Button */}
      <div className="md:w-1/4 flex items-end pt-8">
        <Button
          className="w-[104px] bg-blue-900 hover:bg-blue-800"
          type="button"
          onClick={handleSearch}
        >
          Cari
        </Button>
      </div>
    </div>
  );
}
