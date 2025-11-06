// src/pages/user/UserDashboard.tsx
"use client";

import React, { useState, useMemo } from 'react';

import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { isWithinInterval, startOfDay, endOfDay, isSameDay } from 'date-fns';

// --- 1. Import Component ที่เราสร้างไว้ ---
import { JobCalendar } from '@/components/leader/JobCalendar'; // (ใช้ปฏิทินของ Leader)
import { UserJobTable } from '@/components/user/UserJobTable';
import { UserJobDetailDialog } from '@/components/user/UserJobDetailDialog';
import type { Job } from '@/types/index ';

export default function UserDashboard() {
  const { jobs } = useJobs(); // 1. ดึง "งานทั้งหมด" จากสมอง
  const { user } = useAuth(); // 2. ดึง "ข้อมูลช่าง" ที่ Login อยู่

  // --- State ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- "สมอง" กรองงาน ---

  // 3. กรอง "งานของฉัน" (เฉพาะงานที่ฉันถูก Assign)
  const myJobs = useMemo(() => {
    if (!user) return [];
    return jobs
      .filter(job => job.assignedTechs.includes(user.id)) // <-- กรองจาก assignedTechs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // เรียงจากล่าสุด
  }, [jobs, user]);

  // 4. กรอง "งานที่จะแสดง" (ตามวันที่ในปฏิทิน)
  const filteredJobs = useMemo(() => {
    if (!selectedDate) {
      return myJobs; // ถ้าไม่เลือกวัน ให้โชว์ทั้งหมด
    }
    
    // ถ้าเลือกวัน ให้กรอง
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
    if (selectedDate && date && isSameDay(selectedDate, date)) {
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">User Dashboard: {user.fname}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- คอลัมน์ซ้าย: ปฏิทิน --- */}
        <div className="lg:col-span-1">
          <JobCalendar 
            jobs={myJobs} // ส่ง "งานของฉันทั้งหมด" ให้ปฏิทิน
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* --- คอลัมน์ขวา: ตารางงาน --- */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">
              {selectedDate 
                ? `งานในวันที่ ${format(selectedDate, "dd MMM yyyy")}`
                : "งานทั้งหมดของคุณ"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedDate 
                ? "คลิกวันที่เดิมอีกครั้งเพื่อดูทั้งหมด"
                : "คลิกวันที่ในปฏิทินเพื่อกรอง"}
            </p>
          </div>
          <UserJobTable 
            jobs={filteredJobs} // ส่ง "งานที่กรองแล้ว" ให้ตาราง
            onViewJob={handleViewJob}
          />
        </div>
      </div>

      {/* --- Pop-up รายละเอียด (จะ Render เมื่อถูกเรียก) --- */}
      <UserJobDetailDialog
        job={selectedJob}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}