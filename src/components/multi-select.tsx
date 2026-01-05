// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, XIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva("m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300", {
  variants: {
    variant: {
      default: "border-foreground/10 text-primary-foreground text-xs font-normal bg-blue-500 hover:bg-card/80",
      secondary: "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];

  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  modalPopover?: boolean;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, onValueChange, variant, defaultValue = [], placeholder = "Select options", animation = 0, maxCount = 3, modalPopover = false, className, ...props }, ref) => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const toggleOption = (option: string) => {
      if (selectedValues.includes(option)) {
        const newValues = selectedValues.filter((v) => v !== option);
        setSelectedValues(newValues);
        onValueChange(newValues);
        setErrorMessage(null); // clear error
      } else {
        if (selectedValues.length >= maxCount) {
          setErrorMessage(`Maksimal ${maxCount} plat.`);
          return;
        }

        const newValues = [...selectedValues, option];
        setSelectedValues(newValues);
        onValueChange(newValues);
        setErrorMessage(null); // clear error
      }
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setErrorMessage(null);
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    return (
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
        <PopoverTrigger asChild>
          <Button ref={ref} {...props} onClick={handleTogglePopover} className={cn("flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto", className)}>
            {selectedValues.length > 0 ? (
              <div className='flex justify-between items-center w-full'>
                <div className='flex flex-wrap items-center'>
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    return (
                      <Badge key={value} className={cn(multiSelectVariants({ variant }), "bg-blue-900 hover:bg-blue-800")} style={{ animationDuration: `${animation}s` }}>
                        {IconComponent && <IconComponent className='h-4 w-4 mr-2' />}
                        {option?.label}
                        <X
                          className='ml-1 h-4 w-4 cursor-pointer'
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <Badge className={cn("bg-transparent text-foreground border-foreground/1 hover:bg-transparent", multiSelectVariants({ variant }))} style={{ animationDuration: `${animation}s` }}>
                      {`+ ${selectedValues.length - maxCount}`}
                      <X
                        className='ml-1 h-4 w-4 cursor-pointer'
                        onClick={(event) => {
                          event.stopPropagation();
                          clearExtraOptions();
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className='flex items-center justify-between'>
                  <XIcon
                    className='h-4 mx-2 cursor-pointer text-muted-foreground'
                    onClick={(event) => {
                      event.stopPropagation();
                      handleClear();
                    }}
                  />
                  <Separator orientation='vertical' className='flex min-h-6 h-full' />
                  <ChevronDown className='h-4 mx-2 cursor-pointer text-muted-foreground' />
                </div>
              </div>
            ) : (
              <div className='flex items-center justify-between w-full mx-auto'>
                <span className='text-sm text-muted-foreground mx-3'>{placeholder}</span>
                <ChevronDown className='h-4 cursor-pointer text-muted-foreground mx-2' />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 max-h-64 overflow-y-auto' align='start' onEscapeKeyDown={() => setIsPopoverOpen(false)}>
          <div className='w-[284px] p-2 space-y-2'>
            {options.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              const IconComponent = option?.icon;
              return (
                <div key={option.value}>
                  <label className='cursor-pointer flex items-center space-x-2'>
                    <input type='checkbox' checked={isSelected} onChange={() => toggleOption(option.value)} className='rounded border-foreground accent-black' />
                    {IconComponent && <IconComponent className='h-4 w-4 text-foreground' />}
                    <span className='text-foreground font-medium text-sm'>{option.label}</span>
                  </label>
                </div>
              );
            })}
            <Separator />
            <div className='flex items-center justify-between '>
              {selectedValues.length > 0 && (
                <Button variant='default' onClick={handleClear}>
                  Clear
                </Button>
              )}
              <Button variant='secondary' className='ml-auto' onClick={() => setIsPopoverOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </PopoverContent>
        {errorMessage && (
  <p className="text-red-500 text-sm mt-1 ml-1">{errorMessage}</p>
)}
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
