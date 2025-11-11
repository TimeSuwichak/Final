import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDateRangeOverlapping = (newStart: Date, newEnd: Date, jobStarts: Date, jobEnds: Date): boolean => {
  if (!newStart || !newEnd || !jobStarts || !jobEnds) return false;
  
  // ตรรกะคือ: งานใหม่จะ "ไม่" ซ้อนทับ ก็ต่อเมื่อ
  // 1. งานใหม่จบ "ก่อน" งานเก่าเริ่ม
  // 2. งานใหม่เริ่ม "หลัง" งานเก่าจบ
  // ถ้าไม่เข้า 2 ข้อนี้ แสดงว่า "ซ้อนทับ"

  const noOverlap = newEnd < jobStarts || newStart > jobEnds;
  
  return !noOverlap; // คืนค่าตรงข้าม (ถ้า "ไม่ซ้อนทับ" = false, แสดงว่า "ซ้อนทับ" = true)
};

// ----- Stats helper -----
/**
 * Job entry: a date and number of completed jobs that day
 */
export type JobEntry = {
  date: string; // ISO date string (e.g. '2025-11-11')
  completedJobs: number;
};

/**
 * Attendance entry: a date and whether the person attended that day
 */
export type AttendanceEntry = {
  date: string; // ISO date string
  attended: boolean;
};

export type PeriodStats = {
  start: string; // ISO date
  end: string; // ISO date
  attendedDays: number;
  completedJobs: number;
};

export type StatsResult = {
  week: PeriodStats; // last 7 days (inclusive)
  month: PeriodStats; // last 30 days (inclusive)
  quarter: PeriodStats; // last 90 days (inclusive)
};

/**
 * computeStats
 * สรุปสถิติการเข้างานและงานที่ทำสำเร็จในช่วง 7 / 30 / 90 วันที่ผ่านมา
 * - jobHistory: [{date, completedJobs}] — จำนวนงานที่ทำสำเร็จต่อวัน
 * - attendanceLog: [{date, attended}] — บันทึกการเข้างานต่อวัน
 * Returns totals for week (7d), month (30d) and quarter (90d) ending at `asOf` (default: now).
 */
export function computeStats(
  jobHistory: JobEntry[] = [],
  attendanceLog: AttendanceEntry[] = [],
  asOf?: Date
): StatsResult {
  const now = asOf ? new Date(asOf) : new Date();

  const makeRange = (days: number) => {
    const end = new Date(now);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    start.setDate(start.getDate() - (days - 1));
    return { start, end };
  };

  const inRange = (dStr: string, start: Date, end: Date) => {
    const d = new Date(dStr);
    return d >= start && d <= end;
  };

  const calc = (days: number): PeriodStats => {
    const { start, end } = makeRange(days);

    const completedJobs = jobHistory
      .filter((j) => inRange(j.date, start, end))
      .reduce((s, j) => s + (j.completedJobs || 0), 0);

    const attendedDays = attendanceLog
      .filter((a) => inRange(a.date, start, end) && a.attended)
      .reduce((s) => s + 1, 0);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      attendedDays,
      completedJobs,
    };
  };

  return {
    week: calc(7),
    month: calc(30),
    quarter: calc(90),
  };
}
