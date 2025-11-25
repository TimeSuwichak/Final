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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useNavigate } from "react-router-dom";

// (ใช้ชื่อฟังก์ชันใหม่ตาม Error Log)
export default function LeaderWorks() {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const navigate = useNavigate();

  // (State ที่จำ "ID" ถูกต้องแล้ว)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "in-progress" | "done"
  >("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  // ("สมอง" กรองงาน ... เหมือนเดิม)
  const myJobs = useMemo(() => {
    if (!user) return [];
    return jobs
      .filter((job) => String(job.leadId) === String(user.id))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [jobs, user]);

  const filteredJobs = useMemo(() => {
    return myJobs.filter((job) => {
      // status filter
      if (statusFilter !== "all" && job.status !== statusFilter) return false;

      // date filter (if selectedDate is set)
      if (selectedDate) {
        const start = startOfDay(job.startDate);
        const end = endOfDay(job.endDate);
        if (!isWithinInterval(selectedDate, { start, end })) return false;
      }

      // text search
      const term = (searchTerm || "").trim().toLowerCase();
      if (term) {
        if (
          !job.id.toLowerCase().includes(term) &&
          !(job.title || "").toLowerCase().includes(term)
        )
          return false;
      }

      return true;
    });
  }, [myJobs, searchTerm, statusFilter, selectedDate]);

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
      {/* <div className="flex items-center justify-between"> */}
      <h2 className="text-3xl font-bold tracking-tight">
        ตารางงานของคุณ : {user.fname}
      </h2>
      {/* ------------------ของเดิม------------------------ */}
      {/* <Button 
          onClick={() => navigate('/leader/tracking')}
          className="gap-2"
        >
          <Map className="h-4 w-4" />
          ติดตามช่าง
        </Button>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
        {/* (ปฏิทิน ... เหมือนเดิม) */}
        <div className="lg:col-span-1 order-1 lg:order-1 h-full">
          <JobCalendar
            jobs={myJobs}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* (ตาราง ... เหมือนเดิม) */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-2 flex flex-col h-full">
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
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="ค้นหาโดยรหัสหรือหัวข้อ"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm((e.target as HTMLInputElement).value)
                }
                className="w-full sm:w-72 bg-white border"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">สถานะ:</label>
              <Select
                value={statusFilter}
                onValueChange={(v) =>
                  setStatusFilter(v as "all" | "new" | "in-progress" | "done")
                }
              >
                <SelectTrigger className="w-40 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="new">รอรับทราบ</SelectItem>
                  <SelectItem value="in-progress">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="done">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <LeaderJobTable jobs={filteredJobs} onViewJob={handleViewJob} />
          </div>
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
