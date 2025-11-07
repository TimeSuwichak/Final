// src/pages/user/UserDashboard.tsx (หรือไฟล์หน้าหลักของช่าง)
"use client";

import React, { useState, useMemo } from "react";

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

// --- Import Component ที่เราสร้างไว้ ---
import { JobCalendar } from "@/components/leader/JobCalendar";
import { UserJobTable } from "@/components/user/UserJobTable";
import { UserJobDetailDialog } from "@/components/user/UserJobDetailDialog";
import type { Job } from "@/types/index";

export default function UserDashboard() {
  // (หรือชื่อ function ที่คุณใช้)
  const { jobs } = useJobs();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // --- "สมอง" กรองงาน (แก้ไข!) ---
  const myJobs = useMemo(() => {
    if (!user) return [];
    return (
      jobs
        // ▼▼▼ (แก้ไขจุดนี้!) ▼▼▼
        // แปลง user.id (Number) เป็น String ก่อนเทียบ
        .filter((job) => job.assignedTechs.includes(String(user.id)))
        // ▲▲▲ (แก้ไขจุดนี้!) ▲▲▲
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  }, [jobs, user]);

  // (กรองวันที่ ... เหมือนเดิม)
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

  // (สมองหา "ใบงานสด" ... เหมือน Leader)
  const liveSelectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  // --- Handlers (อัปเกรดให้ใช้ ID) ---
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
        User Dashboard: {user.fname}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* (ปฏิทิน) */}
        <div className="lg:col-span-1">
          <JobCalendar
            jobs={myJobs}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
        {/* (ตาราง) */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">
              {selectedDate
                ? `งานในวันที่ ${format(selectedDate, "dd MMM yyyy", {
                    locale: th,
                  })}`
                : "งานทั้งหมดของคุณ"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDate
                ? "คลิกวันที่เดิมอีกครั้งเพื่อดูทั้งหมด"
                : "คลิกวันที่ในปฏิทินเพื่อกรอง"}
            </p>
          </div>
          <UserJobTable jobs={filteredJobs} onViewJob={handleViewJob} />
        </div>
      </div>

      {/* (Pop-up ... อัปเกรดให้ใช้ "ใบงานสด") */}
      <UserJobDetailDialog
        job={liveSelectedJob}
        open={isDetailOpen}
        onOpenChange={handleCloseDialog}
      />
    </div>
  );
}
