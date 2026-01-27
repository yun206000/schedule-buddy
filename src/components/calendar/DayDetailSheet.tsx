import { Schedule } from '@/types/schedule';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

interface DayDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  shifts: Schedule[];
  leaves: Schedule[];
}

export function DayDetailSheet({
  open,
  onOpenChange,
  date,
  shifts,
  leaves,
}: DayDetailSheetProps) {
  if (!date) return null;

  const formattedDate = format(date, 'yyyy年M月d日 (EEEE)', { locale: zhTW });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[60vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg">{formattedDate}</SheetTitle>
          <SheetDescription>當日排班詳細資訊</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* 值班區塊 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-shift" />
              值班人員
            </h3>
            {shifts.length > 0 ? (
              <div className="space-y-1">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-shift/10 border border-shift/20"
                  >
                    <span className="text-lg">🔔</span>
                    <span className="font-medium">{shift.staff?.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic p-2">
                尚未安排值班人員
              </p>
            )}
          </div>

          {/* 休假區塊 */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-leave" />
              休假人員
            </h3>
            {leaves.length > 0 ? (
              <div className="space-y-1">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-leave/10 border border-leave/20"
                  >
                    <span className="text-lg">🌴</span>
                    <span className="font-medium">{leave.staff?.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic p-2">
                無人休假
              </p>
            )}
          </div>

          {/* 摘要統計 */}
          <div className="flex gap-4 pt-2 border-t border-border text-sm text-muted-foreground">
            <span>值班: {shifts.length} 人</span>
            <span>休假: {leaves.length} 人</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
