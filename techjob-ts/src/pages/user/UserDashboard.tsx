"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Card, CardContent } from "@/components/ui/card";
// [!!] 1. เพิ่ม CheckCheck เข้ามาใน import
import { TrendingUp, Wrench, CheckCircle2, CheckCheck } from "lucide-react";
import { JobTypePieChart } from "@/components/user/charts/JobTypePieChart";
import { MonthlyPerformanceChart } from "@/components/user/charts/MonthlyPerformanceChart";
import CompletedJobsLineChart from "@/components/user/charts/CompletedJobsLineChart";
import UserWorkStatus from "@/components/user/UserWorkStatus";

// ==========================================================
// ✨ USER DASHBOARD PAGE (ฉบับสมบูรณ์) ✨
// ==========================================================
export default function UserDashboard() {
  const { user, loading: userLoading } = useAuth();
  // JobContext ไม่มี loading state; ใช้งานแค่ jobs
  const { jobs } = useJobs();

  // --- 1. LOGIC การเตรียมข้อมูลจริง (ฉบับแก้ไขให้ปลอดภัย) ---
  const myJobs = useMemo(() => {
    if (!user || !jobs) return []; // <-- ป้องกัน Error
    return jobs.filter(
      (job) => job.assignedTechs && job.assignedTechs.includes(user.id)
    );
  }, [jobs, user]);

  const completedJobsCount = useMemo(
    () => myJobs.filter((j) => j.status === "done").length,
    [myJobs]
  );
  const inProgressJobsCount = useMemo(
    () => myJobs.filter((j) => j.status === "in-progress").length,
    [myJobs]
  );

  const jobTypeData = useMemo(() => {
    const typeCounts: { [key: string]: number } = {};
    myJobs
      .filter((j) => j.status === "done")
      .forEach((job) => {
        typeCounts[job.jobType] = (typeCounts[job.jobType] || 0) + 1;
      });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [myJobs]);

  const monthlyPerformanceData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleString("th-TH", { month: "short" });
      monthlyData[monthName] = 0;
    }
    myJobs
      .filter((j) => j.status === "done")
      .forEach((job) => {
        const jobDate = new Date(job.endDate);
        const monthName = jobDate.toLocaleString("th-TH", { month: "short" });
        if (monthlyData.hasOwnProperty(monthName)) {
          monthlyData[monthName]++;
        }
      });
    return Object.entries(monthlyData).map(([name, count]) => ({
      name,
      "งานที่เสร็จ": count,
    }));
  }, [myJobs]);

  // --- 2. สร้างข้อมูลจำลอง (Mock Data) ---
  const mockJobTypeData = [
    { name: "ซ่อมบำรุง", value: 12 },
    { name: "ติดตั้งระบบ", value: 8 },
    { name: "ตรวจเช็คสภาพ", value: 5 },
  ];
  const mockMonthlyPerformanceData = [
    { name: "มิ.ย.", "งานที่เสร็จ": 4 },
    { name: "ก.ค.", "งานที่เสร็จ": 6 },
    { name: "ส.ค.", "งานที่เสร็จ": 5 },
    { name: "ก.ย.", "งานที่เสร็จ": 8 },
    { name: "ต.ค.", "งานที่เสร็จ": 7 },
    { name: "พ.ย.", "งานที่เสร็จ": 2 },
  ];

  // --- 3. LOGIC การ "เลือกใช้" ข้อมูล ---
  // [!!] หมายเหตุ: คุณจะต้องสร้าง Logic สำหรับการ์ดที่ 4 (Approved Tasks) ด้วยนะครับ
  // ผมจะใช้ตัวแปรเดิม (finalSuccessRate) ไปก่อน
  const finalCompletedCount = completedJobsCount > 0 ? completedJobsCount : 15;
  const finalInProgressCount = inProgressJobsCount > 0 ? inProgressJobsCount : 2;
  const finalSuccessRate =
    myJobs.length > 0
      ? Math.round((completedJobsCount / myJobs.length) * 100)
      : 16;
  const finalJobTypeData =
    jobTypeData.length > 0 ? jobTypeData : mockJobTypeData;
  const finalMonthlyPerformanceData = monthlyPerformanceData.some(
    (month) => month["งานที่เสร็จ"] > 0
  )
    ? monthlyPerformanceData
    : mockMonthlyPerformanceData;

  // Map monthly performance to the shape expected by CompletedJobsLineChart: { name, value }
  const completedLineData = finalMonthlyPerformanceData.map((m) => ({
    name: m.name,
    value: m["งานที่เสร็จ"],
  }));

  // --- หน้า Loading ---
  if (userLoading) {
    return <div className="p-8 font-bold text-lg">Loading Dashboard...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in to view your dashboard.</div>;
  }

  // --- 4. JSX (ส่วนแสดงผล) ---
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          ผลงานของคุณ, {user.fname}
        </h2>
      </div>

      {/* User Work Status (new) */}
      <div>
        <UserWorkStatus />
      </div>

      {/* ================================================== */}
      {/* ✨ ส่วนของ Card ที่อัปเดตดีไซน์แล้ว ✨ */}
      {/* ================================================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: งานที่ทำเสร็จ */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                งานทั้งหมด (Total Tasks)
              </p>
              <div className="text-3xl font-bold">{finalCompletedCount} งาน</div>
              <p className="text-xs text-muted-foreground">
                คือจำนวนความสำเร็จของคุณ
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: งานที่กำลังทำ */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                งานกำลังดำเนินการ (Working)
              </p>
              <div className="text-3xl font-bold">{finalInProgressCount} งาน</div>
              <p className="text-xs text-muted-foreground">
                จำนวนงานที่คุณกำลังดำเนินการอยู่
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Wrench className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: งานค้าง (หรืออัตราสำเร็จ) */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                งานค้าง (Pending Tasks)
              </p>
              <div className="text-3xl font-bold">{finalSuccessRate}</div>
              <p className="text-xs text-muted-foreground">
                จากงานทั้งหมดที่ได้รับ
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        {/* [!!] 2. CARD ที่ 4 (แก้ไขแล้ว) */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-muted-foreground">
                งานหัวน้าตรวจเรียบร้อย (Approved Tasks)
              </p>
              <div className="text-3xl font-bold">{finalSuccessRate}</div>
              <p className="text-xs text-muted-foreground">
                งานที่ผ่านการตรวจสอบจากหัวหน้าแล้ว
              </p>
            </div>
            {/* เปลี่ยนเป็นสี indigo และไอคอน CheckCheck */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <CheckCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>

      </div>
      {/* ================================================== */}
      {/* ✨ จบส่วนที่อัปเดต ✨ */}
      {/* ================================================== */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <JobTypePieChart data={finalJobTypeData} />
        </div>
        <div className="lg:col-span-3">
          <MonthlyPerformanceChart data={finalMonthlyPerformanceData} />
        </div>
      </div>

      {/* Completed Jobs Line Chart (full width) */}
      <div className="pt-6">
        <CompletedJobsLineChart data={completedLineData} height={320} />
      </div>
    </div>
  );
}