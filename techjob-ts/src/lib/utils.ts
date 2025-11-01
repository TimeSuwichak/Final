import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDateRangeOverlapping = (startA: Date, endA: Date, startB: Date, endB: Date): boolean => {
  if (!startA || !endA || !startB || !endB) return false;
  return startA <= endB && endA >= startB;
};