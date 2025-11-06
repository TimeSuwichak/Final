// src/pages/leader/LeaderDashboard.tsx
"use client";

import React, { useState, useMemo } from 'react';

import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobCalendar } from '@/components/leader/JobCalendar';
import { LeaderJobTable } from '@/components/leader/LeaderJobTable';
// import { LeaderJobDetailDialog } from '@/components/leader/LeaderJobDetailDialog'; // (จะสร้างใน Step 5.4)
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { LeaderJobDetailDialog } from '@/components/leader/LeaderJobDetailDialog';
import type { Job } from '@/types/index';
import { format } from 'date-fns'; // (ต้อง import format)

export default function LeaderDashboard() {
  const { jobs } = useJobs(); // 1. ดึง "งานทั้งหมด" จากสมอง
  const { user } = useAuth(); // 2. ดึง "ข้อมูล Leader" ที่ Login อยู่

  // --- State ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- "สมอง" กรองงาน ---

  // 3. กรอง "งานของฉัน" (เฉพาะงานที่ Admin โยนมาให้)
  const myJobs = useMemo(() => {
    if (!user) return [];
    return jobs
      .filter(job => String(job.leadId) === String(user.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // เรียงจากล่าสุดไปเก่า
  }, [jobs, user]);

  // 4. กรอง "งานที่จะแสดง" (ตามวันที่ในปฏิทิน)
  const filteredJobs = useMemo(() => {
    // "กฎข้อที่ 1: ถ้าไม่ได้เลือกวัน ให้โชว์ 'งานของฉัน' ทั้งหมด"
    if (!selectedDate) {
      return myJobs;
    }
    
    // "กฎข้อที่ 2: ถ้าเลือกวัน ให้กรองเฉพาะงานที่อยู่ในวันนั้น"
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);

    return myJobs.filter(job => 
      isWithinInterval(start, { start: job.startDate, end: job.endDate }) ||
      isWithinInterval(end, { start: job.startDate, end: job.endDate }) ||
      isWithinInterval(job.startDate, { start, end }) ||
      isWithinInterval(job.endDate, { start, end })
    );
  }, [myJobs, selectedDate]);

  // --- Handlers ---
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };
  
  const handleDateSelect = (date: Date | undefined) => {
    // ถ้าคลิกวันที่เดิมซ้ำ ให้ "ยกเลิกการเลือก"
    if (selectedDate && date && isSameDay(selectedDate, date)) {
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
    }
  };

  if (!user) return <div>Loading...</div>; // (รอ AuthContext)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Leader Dashboard: {user.fname}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- คอลัมน์ซ้าย: ปฏิทิน --- */}
        <div className="lg:col-span-1">
          <JobCalendar 
            jobs={myJobs} // ส่ง "งานของฉันทั้งหมด" ให้ปฏิทินเพื่อไฮไลท์
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* --- คอลัมน์ขวา: ตารางงาน --- */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">
              {selectedDate 
                ? `ใบงานในวันที่ ${format(selectedDate, "dd MMM yyyy")}`
                : "ใบงานทั้งหมดของคุณ"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDate 
                ? "คลิกวันที่เดิมอีกครั้งเพื่อดูใบงานทั้งหมด"
                : "คลิกวันที่ในปฏิทินเพื่อกรองใบงาน"}
            </p>
          </div>
          <LeaderJobTable 
            jobs={filteredJobs} // ส่ง "งานที่กรองแล้ว" ให้ตาราง
            onViewJob={handleViewJob}
          />
        </div>
      </div>

      
      <LeaderJobDetailDialog
        job={selectedJob}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
      
      <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg h-60">
        <p className="text-center text-gray-400">
          (พื้นที่สำหรับ LeaderJobDetailDialog จะมาใน Step 5.4)
        </p>
      </div>
    </div>
  );
}