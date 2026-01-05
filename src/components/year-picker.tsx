"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface YearPickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function YearPicker({ date, setDate }: YearPickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    date?.getFullYear() ?? null
  );

  const currentYear = new Date().getFullYear();
  const startYear = 1950;
  const endYear = currentYear + 10;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <div className="md:w-1/6 min-w-[200px] w-full">
      <p className="mb-2 font-medium text-sm">Tahun</p>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full bg-white text-muted-foreground justify-between"
          >
            {selectedYear !== null ? selectedYear.toString() : "Pilih tahun"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <Command>
            <CommandInput placeholder="Cari tahun..." />
            <CommandList className="max-h-60">
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {years.map((year) => (
                  <CommandItem
                    key={year}
                    value={year.toString()}
                    onSelect={(value) => {
                      const parsedYear = Number.parseInt(value, 10);
                      setSelectedYear(parsedYear);
                      setDate(new Date(`${parsedYear}-01-01`)); // <- ini penting!
                      setOpen(false);
                    }}
                  >
                    {year}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

