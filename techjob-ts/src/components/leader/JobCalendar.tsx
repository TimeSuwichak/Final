// src/components/leader/JobCalendar.tsx
"use client";

import React, { useMemo } from "react";

import { Calendar } from "@/components/ui/calendar";
import { eachDayOfInterval } from "date-fns";
import type { Job } from "@/types/index";
import { th } from "date-fns/locale";

interface JobCalendarProps {
  jobs: Job[]; // รับงาน "ทั้งหมด" ของ Leader คนนี้
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export function JobCalendar({
  jobs,
  selectedDate,
  onDateSelect,
}: JobCalendarProps) {
  const { activeJobDays, completedJobDays } = useMemo(() => {
    const activeDates = new Set<string>();
    const completedDates = new Set<string>();

    jobs.forEach((job) => {
      // ป้องกันกรณีวันที่ไม่ถูกต้อง
      if (!job.startDate || !job.endDate) return;

      try {
        const daysInJob = eachDayOfInterval({
          start: job.startDate,
          end: job.endDate,
        });

        daysInJob.forEach((day) => {
          // Use ISO string date part as key to avoid time issues
          const dateKey = day.toISOString().split("T")[0];

          if (job.status === "done") {
            completedDates.add(dateKey);
          } else {
            activeDates.add(dateKey);
          }
        });
      } catch (error) {
        console.error("Error calculating job days:", error);
      }
    });

    // Convert back to Date objects
    const activeResult: Date[] = [];
    const completedResult: Date[] = [];

    activeDates.forEach((dateStr) => activeResult.push(new Date(dateStr)));

    // Only add to completed if NOT in active (Active takes precedence)
    completedDates.forEach((dateStr) => {
      if (!activeDates.has(dateStr)) {
        completedResult.push(new Date(dateStr));
      }
    });

    return { activeJobDays: activeResult, completedJobDays: completedResult };
  }, [jobs]);

  // --- "ตัวไฮไลท์" สำหรับปฏิทิน ---
  const modifiers = {
    activeJobDay: activeJobDays,
    completedJobDay: completedJobDays,
  };

  // --- "สไตล์" ของตัวไฮไลท์ ---
  const modifiersStyles = {
    activeJobDay: {
      color: "var(--foreground)",
      backgroundColor: "var(--primary-foreground)",
      border: "1px solid var(--primary)",
      borderRadius: "0.375rem",
    },
    completedJobDay: {
      color: "#14532d", // green-900
      backgroundColor: "#dcfce7", // green-100
      border: "1px solid #16a34a", // green-600
      borderRadius: "0.375rem",
    },
  };

  return (
    <div className="rounded-md border bg-white dark:bg-card overflow-hidden">
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
