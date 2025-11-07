// src/pages/leader/LeaderWorks.tsx (ฉบับแก้ไข)
"use client";

import React, { useState, useMemo } from "react"; // (ต้อง Import 'useMemo')

import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  isWithinInterval,
  startOfDay,
  endOfDay,
  isSameDay,
  format,
} from "date-fns";
import { th } from "date-fns/locale";

// (Import Components)
import { JobCalendar } from "@/components/leader/JobCalendar";
import { LeaderJobTable } from "@/components/leader/LeaderJobTable";
import { LeaderJobDetailDialog } from "@/components/leader/LeaderJobDetailDialog";
import type { Job } from "@/types/index";

// (ใช้ชื่อฟังก์ชันใหม่ตาม Error Log)
export default function LeaderWorks() {
  const { jobs } = useJobs();
  const { user } = useAuth();

  // (State ที่จำ "ID" ถูกต้องแล้ว)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // ("สมอง" กรองงาน ... เหมือนเดิม)
  const myJobs = useMemo(() => {
    if (!user) return [];
    return jobs
      .filter((job) => String(job.leadId) === String(user.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [jobs, user]);

  const filteredJobs = useMemo(() => {
    if (!selectedDate) return myJobs;
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    return myJobs.filter(
      (job) =>
        isWithinInterval(start, { start: job.startDate, end: job.endDate }) ||
        isWithinInterval(end, { start: job.startDate, end: job.endDate }) ||
        isWithinInterval(job.startDate, { start, end }) ||
        isWithinInterval(job.endDate, { start, end })
    );
  }, [myJobs, selectedDate]);

  // ▼▼▼ (นี่คือ "สมอง" ที่เราลืมใส่!) ▼▼▼
  // (มันจะทำงานทุกครั้งที่ 'jobs' ในสมองเปลี่ยน)
  const liveSelectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || null; // หา "ฉบับสด" จาก 'jobs'
  }, [jobs, selectedJobId]);
  // ▲▲▲ (นี่คือ "สมอง" ที่เราลืมใส่!) ▲▲▲

  // --- Handlers (ถูกต้องแล้ว) ---
  const handleViewJob = (job: Job) => {
    setSelectedJobId(job.id);
    setIsDetailOpen(true);
  };

  const handleCloseDialog = () => {
    setSelectedJobId(null);
    setIsDetailOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (selectedDate && date && isSameDay(selectedDate, date)) {
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">
        Leader Dashboard: {user.fname}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* (ปฏิทิน ... เหมือนเดิม) */}
        <div className="lg:col-span-1">
          <JobCalendar
            jobs={myJobs}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* (ตาราง ... เหมือนเดิม) */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">
              {selectedDate
                ? `ใบงานในวันที่ ${format(selectedDate, "dd MMM yyyy", {
                    locale: th,
                  })}`
                : "ใบงานทั้งหมดของคุณ"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? "คลิกวันที่เดิมอีกครั้งเพื่อดูใบงานทั้งหมด"
                : "คลิกวันที่ในปฏิทินเพื่อกรองใบงาน"}
            </p>
          </div>
          <LeaderJobTable jobs={filteredJobs} onViewJob={handleViewJob} />
        </div>
      </div>

      {/* --- Pop-up รายละเอียด (บรรทัด 131 อยู่แถวนี้) --- */}
      <LeaderJobDetailDialog
        job={liveSelectedJob} // <-- (ตอนนี้ 'liveSelectedJob' หาเจอแล้ว)
        open={isDetailOpen}
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
