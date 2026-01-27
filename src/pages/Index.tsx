import { useState } from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { StaffFilter } from '@/components/calendar/StaffFilter';
import { Legend } from '@/components/calendar/Legend';
import { DayDetailSheet } from '@/components/calendar/DayDetailSheet';
import { useStaff } from '@/hooks/useStaff';
import { useSchedules } from '@/hooks/useSchedules';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Schedule } from '@/types/schedule';
const Index = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [filterStaffId, setFilterStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { activeStaff, isLoading: staffLoading } = useStaff();
  const { schedules, isLoading: schedulesLoading } = useSchedules(year, month);

  const isLoading = staffLoading || schedulesLoading;

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const getSchedulesForSelectedDate = (): { shifts: Schedule[]; leaves: Schedule[] } => {
    if (!selectedDate) return { shifts: [], leaves: [] };
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let filtered = schedules.filter(s => s.date === dateStr);
    
    if (filterStaffId) {
      filtered = filtered.filter(s => s.staff_id === filterStaffId);
    }

    return {
      shifts: filtered.filter(s => s.type === 'SHIFT'),
      leaves: filtered.filter(s => s.type === 'LEAVE'),
    };
  };

  const { shifts: selectedShifts, leaves: selectedLeaves } = getSchedulesForSelectedDate();

  return (
    <div className="min-h-screen bg-background">
      {/* 頂部導航 */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-primary">排班管理系統</h1>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <Lock className="h-4 w-4 mr-1" />
                管理登入
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 主要內容 */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* 標題與控制 */}
            <CalendarHeader
              year={year}
              month={month}
              onYearChange={setYear}
              onMonthChange={setMonth}
            />

            {/* 篩選與圖例 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <StaffFilter
                staff={activeStaff}
                selectedStaffId={filterStaffId}
                onStaffChange={setFilterStaffId}
              />
              <Legend />
            </div>

            {/* 月曆 */}
            <CalendarGrid
              year={year}
              month={month}
              schedules={schedules}
              filterStaffId={filterStaffId}
              selectable={true}
              onDateClick={handleDateClick}
            />

            {/* 日期詳細資訊彈出視窗 */}
            <DayDetailSheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              date={selectedDate}
              shifts={selectedShifts}
              leaves={selectedLeaves}
            />

            {/* 頁尾說明 */}
            <div className="text-center text-sm text-muted-foreground py-4">
              <p>🔔 值班 = 當日負責人員 &nbsp;|&nbsp; 🌴 休假 = 當日請假人員</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
