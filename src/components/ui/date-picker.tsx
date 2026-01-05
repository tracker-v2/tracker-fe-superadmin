import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

// fungsi date picker untuk chose tanggal
export type DatePickerProps = Omit<
  React.ComponentProps<typeof Calendar>,
  'mode' | 'selected' | 'onSelect' | 'captionLayout'
> & {
  value?: Date
  onChange?: (date?: Date) => void
  placeholder?: string
}
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full pl-3 text-left font-normal bg-inherit',
            !value && 'text-muted-foreground'
          )}
        >
          {value ? value.toLocaleDateString() : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-background border shadow-md"
        align="start"
        onPointerDownOutside={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <Calendar
          {...props}
          mode="single"
          selected={value}
          onSelect={(newValue) => {
            onChange?.(newValue)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
