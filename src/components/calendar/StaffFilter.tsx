import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Staff } from '@/types/schedule';
import { User } from 'lucide-react';

interface StaffFilterProps {
  staff: Staff[];
  selectedStaffId: string | null;
  onStaffChange: (staffId: string | null) => void;
}

export function StaffFilter({ staff, selectedStaffId, onStaffChange }: StaffFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="text-sm font-medium">人員篩選</span>
      </div>
      <Select
        value={selectedStaffId || 'all'}
        onValueChange={(value) => onStaffChange(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="全部人員" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">👥 全部人員</SelectItem>
          {staff.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
