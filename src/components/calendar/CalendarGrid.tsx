import { useMemo } from 'react';
import { CalendarCell } from './CalendarCell';
import { Schedule } from '@/types/schedule';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  format 
} from 'date-fns';

interface CalendarGridProps {
  year: number;
  month: number;
  schedules: Schedule[];
  selectedDates?: Set<string>;
  onDateClick?: (date: Date) => void;
  selectable?: boolean;
  filterStaffId?: string | null;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function CalendarGrid({
  year,
  month,
  schedules,
  selectedDates = new Set(),
  onDateClick,
  selectable = false,
  filterStaffId = null,
}: CalendarGridProps) {
  const currentMonth = new Date(year, month);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [year, month]);

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let filtered = schedules.filter(s => s.date === dateStr);
    
    if (filterStaffId) {
      filtered = filtered.filter(s => s.staff_id === filterStaffId);
    }

    return {
      shifts: filtered.filter(s => s.type === 'SHIFT'),
      leaves: filtered.filter(s => s.type === 'LEAVE'),
    };
  };

  return (
    <div className="card-elevated overflow-hidden animate-fade-in">
      {/* 週標題 */}
      <div className="grid grid-cols-7 bg-muted/50">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'py-2 sm:py-3 text-center text-xs sm:text-sm font-medium',
              (index === 0 || index === 6) ? 'text-destructive/80' : 'text-muted-foreground'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-px bg-border p-px">
        {days.map((date) => {
          const { shifts, leaves } = getSchedulesForDate(date);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          return (
            <CalendarCell
              key={dateStr}
              date={date}
              currentMonth={currentMonth}
              shifts={shifts}
              leaves={leaves}
              isSelected={selectedDates.has(dateStr)}
              onClick={() => onDateClick?.(date)}
              selectable={selectable}
            />
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
