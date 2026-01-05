// lib
import type { DateRange } from "react-day-picker";

// components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SingleSelect } from "@/components/SingleSelect";
import { DatePicker } from "./date-picker";

// icons
import { ChevronDown } from "lucide-react";

interface DetailHeaderProps {
  setSelectedReport: (report: string) => void;
  setSelectedPeriod: (period: string) => void;
  selectedReport: string;
  selectedPeriod: string;
  setShowResults: (show: boolean) => void;
  setDate: (date: Date | undefined) => void;
  setDateRange: (range: DateRange | undefined) => void;
  date: Date | undefined;
  dateRange: DateRange | undefined;
  setSelectedNoPolice: (noPolice: string | null) => void;
  selectedNoPolice: string | null;
  handleSearch: () => void;
  vehicleOptions: { label: string; value: string }[];
}

export function DetailHeader({
  setSelectedReport,
  setSelectedPeriod,
  selectedReport,
  selectedPeriod,
  setShowResults,
  setDate,
  setDateRange,
  date,
  dateRange,
  setSelectedNoPolice,
  selectedNoPolice,
  handleSearch,
  vehicleOptions,
}: DetailHeaderProps) {
  const showPeriodDropdown = selectedReport === "Bahan Bakar";

  return (
    <div className='flex flex-col md:flex-row gap-4 w-full items-center'>
      {/* Report Type Dropdown */}
      <div className='md:w-1/6 min-w-[200px] w-full'>
        <p className='mb-2 font-medium text-sm'>Laporan</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='w-full bg-white text-muted-foreground justify-between text-sm'>
              {selectedReport}
              <ChevronDown className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='min-w-[200px]' align='start'>
            <DropdownMenuItem onClick={() => { setSelectedReport("Bahan Bakar"); setShowResults(false); }}>Bahan Bakar</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedReport("Perjalanan"); setShowResults(false); }}>Perjalanan</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedReport("Idle"); setShowResults(false); }}>Idle</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nomor Polisi - SingleSelect */}
      <div className='md:w-1/6 min-w-[200px] w-full'>
        <p className='mb-2 font-medium text-sm'>Nomor Polisi</p>
        <div className='overflow-x-auto max-h-[320px]  whitespace-nowrap'>
          <SingleSelect
            options={vehicleOptions}
            value={selectedNoPolice}
            onChange={setSelectedNoPolice}
            placeholder='Nomor Polisi'
          />
        </div>
      </div>

      {/* Periode Dropdown - Only for Bahan Bakar */}
      {showPeriodDropdown && (
        <div className='md:w-1/6 min-w-[200px] w-full'>
          <p className='mb-2 font-medium text-sm'>Periode</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='w-full bg-white text-muted-foreground justify-between text-sm'>
                {selectedPeriod}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='min-w-[200px]' align='start'>
              <DropdownMenuItem onClick={() => { setSelectedPeriod("Harian"); setShowResults(false); }}>Harian</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedPeriod("Bulanan"); setShowResults(false); }}>Bulanan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSelectedPeriod("Tahunan"); setShowResults(false); }}>Tahunan</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Date Picker */}
      <DatePicker
        selectedReport={selectedReport}
        selectedPeriod={selectedPeriod}
        date={date}
        setDate={setDate}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Search Button */}
      <div className='md:w-1/4 flex items-end pt-8'>
        <Button className='w-[104px] bg-blue-900 hover:bg-blue-800' type='button' onClick={handleSearch}>
          Cari
        </Button>
      </div>
    </div>
  );
}
