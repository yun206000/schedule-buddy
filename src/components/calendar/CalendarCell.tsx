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

      <div className="flex-1 space-y-1 overflow-hidden">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            onClick={(e) => handleScheduleClick(e, shift)}
            className={cn(
              "badge-shift text-[10px] sm:text-xs truncate flex items-center gap-0.5",
              editable && "cursor-pointer hover:opacity-80 group"
            )}
            title={editable ? `點擊刪除 ${shift.staff?.name} 的值班` : shift.staff?.name}
          >
            <span className="truncate sm:hidden">🔔{shift.staff?.display_name}</span>
            <span className="truncate hidden sm:inline">🔔 {shift.staff?.name}</span>
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
              "badge-leave text-[10px] sm:text-xs truncate flex items-center gap-0.5",
              editable && "cursor-pointer hover:opacity-80 group"
            )}
            title={editable ? `點擊刪除 ${leave.staff?.name} 的休假` : leave.staff?.name}
          >
            <span className="truncate sm:hidden">🌴{leave.staff?.display_name}</span>
            <span className="truncate hidden sm:inline">🌴 {leave.staff?.name}</span>
            {editable && (
              <X className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
