import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const YEAR_PAGE_SIZE = 20;

function Calendar({ className, classNames, showOutsideDays = true, month, defaultMonth, onMonthChange, ...props }: CalendarProps) {
  const isControlled = month !== undefined;
  const [internalMonth, setInternalMonth] = React.useState<Date>(() => {
    const from = defaultMonth ?? month ?? new Date();
    return new Date(from.getFullYear(), from.getMonth(), 1);
  });
  const [view, setView] = React.useState<"days" | "years">("days");
  const [yearPageStart, setYearPageStart] = React.useState(() =>
    Math.floor((defaultMonth ?? month ?? new Date()).getFullYear() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE
  );

  const displayedMonth = isControlled ? month! : internalMonth;

  React.useEffect(() => {
    if (isControlled && month) {
      const m = new Date(month.getFullYear(), month.getMonth(), 1);
      setInternalMonth(m);
    }
  }, [isControlled, month?.getTime()]);

  const handleMonthChange = React.useCallback(
    (m: Date) => {
      if (!isControlled) setInternalMonth(m);
      onMonthChange?.(m);
    },
    [isControlled, onMonthChange]
  );

  const handleCaptionClick = React.useCallback(() => {
    setYearPageStart(Math.floor(displayedMonth.getFullYear() / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE);
    setView("years");
  }, [displayedMonth.getFullYear()]);

  const handleYearSelect = React.useCallback(
    (year: number) => {
      const newMonth = new Date(year, displayedMonth.getMonth(), 1);
      if (!isControlled) setInternalMonth(newMonth);
      onMonthChange?.(newMonth);
      setView("days");
    },
    [displayedMonth.getMonth(), isControlled, onMonthChange]
  );


  const CaptionLabelWithYearClick = React.useCallback(
    (props: { id?: string; displayMonth: Date; displayIndex?: number }) => (
      <button
        type="button"
        id={props.id}
        className="rdp-caption_label text-sm font-medium text-foreground cursor-pointer hover:text-primary hover:underline transition-colors"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCaptionClick();
        }}
        aria-label="Seleccionar año"
      >
        {format(props.displayMonth, "MMMM yyyy", { locale: es })}
      </button>
    ),
    [handleCaptionClick]
  );

  if (view === "years") {
    return (
      <div className={cn("p-4 pointer-events-auto", className)}>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setYearPageStart((s) => s - YEAR_PAGE_SIZE)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-8 w-8 p-0 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {yearPageStart} – {yearPageStart + YEAR_PAGE_SIZE - 1}
          </span>
          <button
            type="button"
            onClick={() => setYearPageStart((s) => s + YEAR_PAGE_SIZE)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-8 w-8 p-0 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: YEAR_PAGE_SIZE }, (_, i) => yearPageStart + i).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handleYearSelect(y)}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-10 text-sm font-normal rounded-lg hover:bg-primary/10 hover:text-primary",
                displayedMonth.getFullYear() === y && "bg-primary/20 text-primary font-medium"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      month={displayedMonth}
      onMonthChange={handleMonthChange}
      className={cn("p-4 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-primary/30 transition-colors",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] tracking-wide",
        row: "flex w-full mt-1",
        cell: cn(
          "h-10 w-10 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-primary/10",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal text-foreground aria-selected:opacity-100 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)] rounded-lg",
        day_today: "bg-accent/60 text-accent-foreground font-medium border border-primary/20",
        day_outside:
          "day-outside text-muted-foreground/40 opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-30",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        CaptionLabel: CaptionLabelWithYearClick,
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      defaultMonth={defaultMonth}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
