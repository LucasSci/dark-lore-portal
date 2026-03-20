import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "ornate-frame border border-[hsl(var(--brand)/0.16)] bg-[linear-gradient(180deg,hsl(var(--surface-strong)/0.92),hsl(var(--surface-base)/0.96))] p-3 shadow-panel",
        className,
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 min-h-0 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "w-9 border border-transparent text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
        row: "flex w-full mt-2",
        cell:
          "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected].day-outside)]:bg-[hsl(var(--brand)/0.08)] [&:has([aria-selected])]:bg-[hsl(var(--brand)/0.12)]",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 min-h-0 border border-transparent p-0 font-normal aria-selected:opacity-100 hover:border-[hsl(var(--brand)/0.16)] hover:bg-[hsl(var(--brand)/0.08)]",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "border-[hsl(var(--brand)/0.26)] bg-[linear-gradient(135deg,hsl(47_100%_82%),hsl(var(--primary))_44%,hsl(var(--warning))_100%)] text-primary-foreground hover:bg-[linear-gradient(135deg,hsl(47_100%_82%),hsl(var(--primary))_44%,hsl(var(--warning))_100%)] hover:text-primary-foreground focus:bg-[linear-gradient(135deg,hsl(47_100%_82%),hsl(var(--primary))_44%,hsl(var(--warning))_100%)] focus:text-primary-foreground",
        day_today:
          "border-[hsl(var(--brand)/0.18)] bg-[linear-gradient(180deg,hsl(var(--surface-raised)/0.92),hsl(var(--surface-base)/0.96))] text-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-[hsl(var(--brand)/0.08)] aria-selected:text-muted-foreground aria-selected:opacity-40",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:border-[hsl(var(--brand)/0.14)] aria-selected:bg-[hsl(var(--brand)/0.12)] aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
