import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

export function DatePicker() {
  const [firstDate, setFirstDate] = useState<Date>();
  const [lastDate, setLastDate] = useState<Date>();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={'outline'} className={cn('w-[284px] justify-start text-left font-normal bg-white')}>
          <CalendarIcon className="text-muted-foreground" />
          {firstDate && lastDate ? `${format(firstDate, 'dd/MM/yyyy')} - ${format(lastDate, 'dd/MM/yyyy')} ` : <span className="text-muted-foreground">Masukkan Rentang Tanggal</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 flex" align="start">
        <Calendar mode="single" selected={firstDate} onSelect={setFirstDate} initialFocus />

        <Calendar mode="single" selected={lastDate} onSelect={setLastDate} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
