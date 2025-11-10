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