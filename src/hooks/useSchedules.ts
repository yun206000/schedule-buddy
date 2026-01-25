import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Schedule, ScheduleMode, ValidationWarning, ValidationError } from '@/types/schedule';
import { toast } from '@/hooks/use-toast';
import { format, addDays, getDay } from 'date-fns';

export function useSchedules(year: number, month: number) {
  const queryClient = useQueryClient();

  const startDate = format(new Date(year, month, 1), 'yyyy-MM-dd');
  const endDate = format(new Date(year, month + 1, 0), 'yyyy-MM-dd');

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules', year, month],
    queryFn: async (): Promise<Schedule[]> => {
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          *,
          staff:staff_id (*)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');
      
      if (error) throw error;
      return data as Schedule[];
    },
  });

  const getSchedulesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedules.filter(s => s.date === dateStr);
  };

  const getShiftsForDate = (date: Date) => {
    return getSchedulesForDate(date).filter(s => s.type === 'SHIFT');
  };

  const getLeavesForDate = (date: Date) => {
    return getSchedulesForDate(date).filter(s => s.type === 'LEAVE');
  };

  const validateSchedule = (
    staffId: string,
    staffName: string,
    dates: string[],
    mode: ScheduleMode,
    existingSchedules: Schedule[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    dates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayOfWeek = getDay(date);
      
      // 檢查硬性限制：同一天不能同時值班和休假
      const existingForStaff = existingSchedules.filter(
        s => s.date === dateStr && s.staff_id === staffId
      );
      
      if (existingForStaff.length > 0) {
        const hasConflict = existingForStaff.some(s => 
          (mode === 'SHIFT' && s.type === 'LEAVE') ||
          (mode === 'LEAVE' && s.type === 'SHIFT')
        );
        
        if (hasConflict) {
          errors.push({
            type: 'conflict',
            message: `${staffName} 在 ${dateStr} 已有${mode === 'SHIFT' ? '休假' : '值班'}安排`,
            date: dateStr,
            staffName,
          });
        }
      }

      // 計算該日期的排程統計
      const schedulesForDate = existingSchedules.filter(s => s.date === dateStr);
      const shiftsCount = schedulesForDate.filter(s => s.type === 'SHIFT').length + (mode === 'SHIFT' ? 1 : 0);
      const leavesCount = schedulesForDate.filter(s => s.type === 'LEAVE').length + (mode === 'LEAVE' ? 1 : 0);

      // 軟性警告：值班人數
      if (mode === 'SHIFT' && shiftsCount !== 1) {
        warnings.push({
          type: 'shift_count',
          message: `${dateStr} 值班人數為 ${shiftsCount} 人（建議為 1 人）`,
          date: dateStr,
        });
      }

      // 軟性警告：休假上限
      if (mode === 'LEAVE') {
        let quota = 2;
        if (dayOfWeek === 0) quota = 3; // 週日
        
        if (leavesCount > quota) {
          const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][dayOfWeek];
          warnings.push({
            type: 'leave_quota',
            message: `${dateStr} (${dayName}) 休假人數 ${leavesCount} 人，超過上限 ${quota} 人`,
            date: dateStr,
          });
        }
      }

      // 軟性警告：體力透支（值班後接休假）
      const prevDateStr = format(addDays(date, -1), 'yyyy-MM-dd');
      const nextDateStr = format(addDays(date, 1), 'yyyy-MM-dd');

      if (mode === 'SHIFT') {
        // 檢查隔天是否有休假
        const nextDayLeave = existingSchedules.find(
          s => s.date === nextDateStr && s.staff_id === staffId && s.type === 'LEAVE'
        );
        if (nextDayLeave) {
          warnings.push({
            type: 'exhaustion',
            message: `警告：${staffName} 於 ${dateStr} 值班，卻在 ${nextDateStr} 排休`,
            date: dateStr,
            staffName,
          });
        }
      }

      if (mode === 'LEAVE') {
        // 檢查前一天是否有值班
        const prevDayShift = existingSchedules.find(
          s => s.date === prevDateStr && s.staff_id === staffId && s.type === 'SHIFT'
        );
        if (prevDayShift) {
          warnings.push({
            type: 'exhaustion',
            message: `警告：${staffName} 於 ${prevDateStr} 值班，卻在 ${dateStr} 排休`,
            date: dateStr,
            staffName,
          });
        }
      }
    });

    return { errors, warnings };
  };

  const addSchedule = useMutation({
    mutationFn: async ({ staffId, dates, type }: { staffId: string; dates: string[]; type: ScheduleMode }) => {
      const records = dates.map(date => ({
        staff_id: staffId,
        date,
        type,
      }));

      const { data, error } = await supabase
        .from('schedules')
        .upsert(records, { onConflict: 'date,staff_id' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: '成功', description: '排程已儲存' });
    },
    onError: (error) => {
      toast({ title: '錯誤', description: error.message, variant: 'destructive' });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({ title: '成功', description: '排程已刪除' });
    },
    onError: (error) => {
      toast({ title: '錯誤', description: error.message, variant: 'destructive' });
    },
  });

  return {
    schedules,
    isLoading,
    error,
    getSchedulesForDate,
    getShiftsForDate,
    getLeavesForDate,
    validateSchedule,
    addSchedule,
    deleteSchedule,
  };
}
