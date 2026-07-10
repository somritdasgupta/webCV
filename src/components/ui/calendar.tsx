import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex w-full flex-col gap-4",
        month: "w-full space-y-3",
        caption: "flex justify-center pt-1 relative items-center h-9",
        caption_label: "text-sm font-medium tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-background/60 text-muted-foreground",
          "transition-colors hover:border-foreground/30 hover:text-foreground",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full table-fixed border-collapse",
        head_row: "grid grid-cols-7",
        head_cell: "text-muted-foreground font-mono text-[10px] uppercase tracking-wider h-8 flex items-center justify-center",
        row: "grid grid-cols-7 mt-1",
        cell: "relative h-9 w-full text-center text-sm p-0 focus-within:relative focus-within:z-20",
        day: cn(
          "mx-auto inline-flex h-8 w-8 items-center justify-center rounded-md font-normal text-foreground",
          "transition-colors hover:bg-surface-1 aria-selected:opacity-100",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "!bg-foreground !text-background hover:!bg-foreground focus:!bg-foreground rounded-md shadow-sm",
        day_today:
          "font-semibold text-accent after:absolute after:bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-accent",
        day_outside: "day-outside text-muted-foreground/40",
        day_disabled: "text-muted-foreground/30 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-surface-1 aria-selected:text-foreground rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
