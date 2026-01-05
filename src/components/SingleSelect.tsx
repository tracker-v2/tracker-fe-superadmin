import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface SingleSelectOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SingleSelectProps {
  options: SingleSelectOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  modalPopover?: boolean;
}

export const SingleSelect: React.FC<SingleSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi",
  className,
  modalPopover = false,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}
      modal={modalPopover}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          onClick={() => setIsPopoverOpen((prev) => !prev)}
          className={cn(
            "flex w-full min-h-10 justify-between items-center text-sm bg-white hover:bg-accent border p-2",
            className
          )}
        >
          {selectedOption ? (
            <div className="flex items-center justify-between w-full">
              <Badge className="bg-blue-900 hover:bg-blue-800 text-white">
                {selectedOption.icon && (
                  <selectedOption.icon className="w-4 h-4 mr-2" />
                )}
                {selectedOption.label}
              </Badge>
              <div className="flex items-center gap-2 ml-4">
                <X
                  className="w-4 h-4 cursor-pointer text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                />
                <Separator orientation="vertical" className="h-5" />
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full px-1">
              <span className="text-muted-foreground">{placeholder}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[250px] p-0">
        <div className="max-h-60 overflow-y-auto p-2 space-y-2">
          {options.map((option) => {
            const IconComponent = option.icon;
            return (
              <label
                key={option.value}
                className="cursor-pointer flex items-center space-x-2 p-1 rounded hover:bg-accent"
                onClick={() => {
                  onChange(option.value);
                  setIsPopoverOpen(false);
                }}
              >
                {IconComponent && (
                  <IconComponent className="h-4 w-4 text-foreground" />
                )}
                <span className="text-sm text-foreground">{option.label}</span>
              </label>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
