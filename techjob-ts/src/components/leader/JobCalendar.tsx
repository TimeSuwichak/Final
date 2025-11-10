// src/components/leader/JobCalendar.tsx
"use client";

import React, { useMemo } from 'react';

import { Calendar } from "@/components/ui/calendar";
import { eachDayOfInterval, isSameDay } from 'date-fns';
import type { Job } from '@/types/index';
import { th } from 'date-fns/locale';

interface JobCalendarProps {
  jobs: Job[]; // รับงาน "ทั้งหมด" ของ Leader คนนี้
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function JobCalendar({ jobs, selectedDate, onDateSelect }: JobCalendarProps) {

  // --- "สมอง" ของปฏิทิน ---
  // สร้าง Set ของ "วันที่มีงาน" ทั้งหมด
  const jobDays = useMemo(() => {
    const dates = new Set<Date>();
    
    jobs.forEach(job => {
      // หาวันทั้งหมดใน "ระหว่าง" วันเริ่มและวันจบ
      const daysInJob = eachDayOfInterval({
        start: job.startDate,
        end: job.endDate
      });
      
      // เพิ่มวันทั้งหมดลงใน Set
      daysInJob.forEach(day => dates.add(day));
    });
    
    return Array.from(dates);
  }, [jobs]);

  // --- "ตัวไฮไลท์" สำหรับปฏิทิน ---
  // บอก react-day-picker ว่าวันไหนคือ "วันทำงาน"
  const modifiers = {
    jobDay: jobDays, // "jobDay" คือชื่อ class ที่เราจะใช้
  };

  // --- "สไตล์" ของตัวไฮไลท์ ---
  // เราจะใข้ Tailwind/CSS เพื่อทำให้วันนั้นๆ มี "จุด" หรือ "สี"
  // shadcn/ui ใช้ CSS variables เราจะใช้มัน
  const modifiersStyles = {
    jobDay: {
      color: 'var(--foreground)', // สีตัวอักษร
      backgroundColor: 'var(--primary-foreground)', // สีพื้นหลัง
      border: '1px solid var(--primary)', // เพิ่มเส้นขอบสี primary
      borderRadius: '0.375rem',
    },
  };

  return (
    <div className="rounded-md border bg-card">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        className="w-full"
        modifiers={modifiers}
        locale={th}
        modifiersStyles={modifiersStyles}
      />
    </div>
  );
}