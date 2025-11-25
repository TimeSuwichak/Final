// src/pages/user/UserWorks.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
import type { Job } from "@/types/index";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function UserWorks() {
  // (หรือชื่อ function ที่คุณใช้)
  const { jobs } = useJobs();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "new" | "in-progress" | "done"
  >("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const filteredJobs = useMemo(() => {
    return myJobs.filter((job) => {
      // status filter
      if (statusFilter !== "all" && job.status !== statusFilter) return false;

      // date filter (if selectedDate is set)
      if (selectedDate) {
        const start = startOfDay(selectedDate);
        const end = endOfDay(selectedDate);
        if (
          !isWithinInterval(selectedDate, {
            start: job.startDate,
            end: job.endDate,
          })
        )
          return false;
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

  // (สมองหา "ใบงานสด" ... เหมือน Leader)
  const liveSelectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => j.id === selectedJobId) || null;
  }, [jobs, selectedJobId]);

  const navigate = useNavigate();

  // --- Handlers ---
  const handleViewJob = (job: Job) => {
    navigate(`/user/works/${job.id}`);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
        {/* (ปฏิทิน) */}
        <div className="lg:col-span-1 order-2 lg:order-1 h-full">
          <JobCalendar
            jobs={myJobs}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
        {/* (ตาราง) */}
        <div className="lg:col-span-2 space-y-4 order-1 lg:order-2 flex flex-col h-full">
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
                  <SelectItem value="new">งานใหม่</SelectItem>
                  <SelectItem value="in-progress">กำลังทำ</SelectItem>
                  <SelectItem value="done">เสร็จสิ้น</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <UserJobTable jobs={filteredJobs} onViewJob={handleViewJob} />
          </div>
        </div>
      </div>
    </div>
  );
}
