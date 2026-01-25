import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { useStaff } from '@/hooks/useStaff';
import { useSchedules } from '@/hooks/useSchedules';
import { ScheduleMode, ValidationWarning, ValidationError } from '@/types/schedule';
import { Calendar, Loader2, AlertTriangle, XCircle, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Scheduler() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [mode, setMode] = useState<ScheduleMode>('SHIFT');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  const { activeStaff, isLoading: staffLoading } = useStaff();
  const { schedules, isLoading: schedulesLoading, validateSchedule, addSchedule } = useSchedules(year, month);

  const selectedStaff = useMemo(
    () => activeStaff.find(s => s.id === selectedStaffId),
    [activeStaff, selectedStaffId]
  );

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const newSet = new Set(selectedDates);
    
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
    } else {
      newSet.add(dateStr);
    }
    
    setSelectedDates(newSet);
  };

  const handleSave = () => {
    if (!selectedStaffId || selectedDates.size === 0) {
      toast({
        title: '錯誤',
        description: '請選擇人員和日期',
        variant: 'destructive',
      });
      return;
    }

    const dates = Array.from(selectedDates);
    const { errors: validationErrors, warnings: validationWarnings } = validateSchedule(
      selectedStaffId,
      selectedStaff?.name || '',
      dates,
      mode,
      schedules
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      toast({
        title: '無法儲存',
        description: validationErrors[0].message,
        variant: 'destructive',
      });
      return;
    }

    if (validationWarnings.length > 0) {
      setWarnings(validationWarnings);
      setShowWarningDialog(true);
      return;
    }

    performSave();
  };

  const performSave = () => {
    const dates = Array.from(selectedDates);
    addSchedule.mutate(
      { staffId: selectedStaffId, dates, type: mode },
      {
        onSuccess: () => {
          setSelectedDates(new Set());
          setShowWarningDialog(false);
        },
      }
    );
  };

  const clearSelection = () => {
    setSelectedDates(new Set());
  };

  // 計算當前選擇日期的統計
  const selectionStats = useMemo(() => {
    if (selectedDates.size === 0) return null;

    const stats: { date: string; shifts: number; leaves: number }[] = [];
    
    selectedDates.forEach(dateStr => {
      const daySchedules = schedules.filter(s => s.date === dateStr);
      stats.push({
        date: dateStr,
        shifts: daySchedules.filter(s => s.type === 'SHIFT').length + (mode === 'SHIFT' ? 1 : 0),
        leaves: daySchedules.filter(s => s.type === 'LEAVE').length + (mode === 'LEAVE' ? 1 : 0),
      });
    });

    return stats;
  }, [selectedDates, schedules, mode]);

  if (staffLoading || schedulesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        year={year}
        month={month}
        onYearChange={setYear}
        onMonthChange={setMonth}
      />

      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* 月曆 */}
        <CalendarGrid
          year={year}
          month={month}
          schedules={schedules}
          selectedDates={selectedDates}
          onDateClick={handleDateClick}
          selectable={!!selectedStaffId}
        />

        {/* 操作面板 */}
        <Card className="card-elevated h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>排班操作</CardTitle>
                <CardDescription>選擇人員與日期後儲存</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 模式選擇 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">排班模式</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={mode === 'SHIFT' ? 'default' : 'outline'}
                  onClick={() => setMode('SHIFT')}
                  className={mode === 'SHIFT' ? 'btn-gradient-shift' : ''}
                >
                  🔔 值班
                </Button>
                <Button
                  variant={mode === 'LEAVE' ? 'default' : 'outline'}
                  onClick={() => setMode('LEAVE')}
                  className={mode === 'LEAVE' ? 'btn-gradient-leave' : ''}
                >
                  🌴 休假
                </Button>
              </div>
            </div>

            {/* 人員選擇 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">選擇人員</label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇人員" />
                </SelectTrigger>
                <SelectContent>
                  {activeStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 已選日期 */}
            {selectedDates.size > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">已選日期 ({selectedDates.size})</label>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    清除
                  </Button>
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1 p-2 bg-muted/30 rounded-lg">
                  {selectionStats?.map(({ date, shifts, leaves }) => (
                    <div key={date} className="flex justify-between text-sm">
                      <span>{date}</span>
                      <span className="text-muted-foreground">
                        {mode === 'SHIFT' ? `值班: ${shifts}人` : `休假: ${leaves}人`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 儲存按鈕 */}
            <Button
              className="w-full btn-gradient-primary"
              onClick={handleSave}
              disabled={!selectedStaffId || selectedDates.size === 0 || addSchedule.isPending}
            >
              {addSchedule.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  儲存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  儲存排程
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 警告確認對話框 */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              發現以下警告
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>系統偵測到以下可能的問題，確定要繼續儲存嗎？</p>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-warning">{w.message}</li>
                  ))}
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={performSave} className="bg-warning text-warning-foreground">
              確認儲存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
