import { Schedule } from '@/types/schedule';
import { cn } from '@/lib/utils';
import { format, isToday, isSameMonth, isWeekend } from 'date-fns';
import { X } from 'lucide-react';

interface CalendarCellProps {
  date: Date;
  currentMonth: Date;
  shifts: Schedule[];
  leaves: Schedule[];
  isSelected?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  onScheduleDelete?: (schedule: Schedule) => void;
  editable?: boolean;
}

export function CalendarCell({
  date,
  currentMonth,
  shifts,
  leaves,
  isSelected = false,
  onClick,
  selectable = false,
  onScheduleDelete,
  editable = false,
}: CalendarCellProps) {
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isTodayDate = isToday(date);
  const isWeekendDay = isWeekend(date);

  const handleScheduleClick = (e: React.MouseEvent, schedule: Schedule) => {
    if (editable && onScheduleDelete) {
      e.stopPropagation();
      onScheduleDelete(schedule);
    }
  };

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

      <div className="flex-1 space-y-0.5 overflow-hidden">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            onClick={(e) => handleScheduleClick(e, shift)}
            className={cn(
              "badge-shift text-[9px] sm:text-xs py-0.5 px-1 sm:px-2.5 sm:py-1 truncate flex items-center gap-0.5",
              editable && "cursor-pointer hover:opacity-80 group"
            )}
            title={shift.staff?.name}
          >
            <span className="hidden sm:inline truncate">🔔 {shift.staff?.name}</span>
            <span className="sm:hidden truncate">🔔{shift.staff?.name?.charAt(0)}</span>
            {editable && (
              <X className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        ))}

        {leaves.map((leave) => (
          <div
            key={leave.id}
            onClick={(e) => handleScheduleClick(e, leave)}
            className={cn(
              "badge-leave text-[9px] sm:text-xs py-0.5 px-1 sm:px-2.5 sm:py-1 truncate flex items-center gap-0.5",
              editable && "cursor-pointer hover:opacity-80 group"
            )}
            title={leave.staff?.name}
          >
            <span className="hidden sm:inline truncate">🌴 {leave.staff?.name}</span>
            <span className="sm:hidden truncate">🌴{leave.staff?.name?.charAt(0)}</span>
            {editable && (
              <X className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
