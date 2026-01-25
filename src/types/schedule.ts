export interface Staff {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  date: string;
  staff_id: string;
  type: 'SHIFT' | 'LEAVE';
  created_at: string;
  updated_at: string;
  staff?: Staff;
}

export interface DaySchedule {
  date: Date;
  shifts: Schedule[];
  leaves: Schedule[];
}

export interface ValidationWarning {
  type: 'shift_count' | 'leave_quota' | 'exhaustion';
  message: string;
  date: string;
  staffName?: string;
}

export interface ValidationError {
  type: 'conflict';
  message: string;
  date: string;
  staffName: string;
}

export type ScheduleMode = 'SHIFT' | 'LEAVE';
