
import React, { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FullDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function FullDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className
}: FullDatePickerProps) {
  const [open, setOpen] = useState(false);

  // Safely parse the date value with better error handling
  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString || dateString.trim() === '') return undefined;
    
    // Handle different date formats
    let parsedDate: Date;
    
    // Try ISO format first (YYYY-MM-DD)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      parsedDate = parseISO(dateString);
    } else if (dateString.match(/^\d{4}-\d{2}$/)) {
      // Handle YYYY-MM format by adding day
      parsedDate = parseISO(`${dateString}-01`);
    } else {
      // Try standard Date constructor as fallback
      parsedDate = new Date(dateString);
    }
    
    return isValid(parsedDate) ? parsedDate : undefined;
  };

  const dateValue = parseDate(value);

  // Format display value safely
  const displayValue = dateValue && isValid(dateValue)
    ? format(dateValue, "MMM dd, yyyy")
    : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      // Extract year, month, and day using UTC methods to avoid timezone shifts
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      
      // Format as YYYY-MM-DD for storage
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-full",
            !displayValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={(date) => date > new Date()}
          initialFocus
          showOutsideDays={false}
          captionLayout="dropdown-buttons"
          fromYear={1950}
          toYear={new Date().getFullYear()}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
