import { Schedule } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { format, isToday, isSameMonth, isWeekend } from 'date-fns';

interface CalendarCellProps {
  date: Date;
  currentMonth: Date;
  shifts: Schedule[];
  leaves: Schedule[];
  isSelected?: boolean;
  onClick?: () => void;
  selectable?: boolean;
}

export function CalendarCell({
  date,
  currentMonth,
  shifts,
  leaves,
  isSelected = false,
  onClick,
  selectable = false,
}: CalendarCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isTodayDate = isToday(date);
  const isWeekendDay = isWeekend(date);

  return (
    <div
      onClick={selectable ? onClick : undefined}
      className={cn(
        'calendar-cell min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 flex flex-col',
        !isCurrentMonth && 'opacity-40',
        isTodayDate && 'today',
        isWeekendDay && 'weekend',
        isSelected && 'selected',
        selectable && 'cursor-pointer hover:border-primary/50'
      )}
    >
      <div className={cn(
        'text-xs sm:text-sm font-medium mb-1',
        isTodayDate && 'text-primary font-bold'
      )}>
        {format(date, 'd')}
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className="badge-shift text-[10px] sm:text-xs truncate"
            title={shift.staff?.name}
          >
            🔔 {shift.staff?.name}
          </div>
        ))}

        {leaves.map((leave) => (
          <div
            key={leave.id}
            className="badge-leave text-[10px] sm:text-xs truncate"
            title={leave.staff?.name}
          >
            🌴 {leave.staff?.name}
          </div>
        ))}
      </div>
    </div>
  );
}
