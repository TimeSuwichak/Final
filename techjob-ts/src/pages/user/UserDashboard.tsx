"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wrench, CheckCircle2 } from "lucide-react";
import { JobTypePieChart } from "@/components/user/charts/JobTypePieChart";
import { MonthlyPerformanceChart } from "@/components/user/charts/MonthlyPerformanceChart";


// ==========================================================
// ✨ USER DASHBOARD PAGE (ฉบับสมบูรณ์) ✨
// ==========================================================
export default function UserDashboard() {
  const { user, loading: userLoading } = useAuth();
  // สมมติว่า JobContext มี loading state ด้วย (ถ้าไม่มี ให้ใช้แค่ `const { jobs } = useJobs();`)
  const { jobs, loading: jobsLoading } = useJobs();

  // --- 1. LOGIC การเตรียมข้อมูลจริง (ฉบับแก้ไขให้ปลอดภัย) ---
  const myJobs = useMemo(() => {
    if (!user || !jobs) return []; // <-- ป้องกัน Error
    return jobs.filter(job => job.assignedTechs && job.assignedTechs.includes(user.id));
  }, [jobs, user]);

  const completedJobsCount = useMemo(() => myJobs.filter(j => j.status === 'done').length, [myJobs]);
  const inProgressJobsCount = useMemo(() => myJobs.filter(j => j.status === 'in-progress').length, [myJobs]);
  
  const jobTypeData = useMemo(() => {
    const typeCounts: { [key: string]: number } = {};
    myJobs.filter(j => j.status === 'done').forEach(job => {
      typeCounts[job.jobType] = (typeCounts[job.jobType] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [myJobs]);

  const monthlyPerformanceData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleString('th-TH', { month: 'short' });
      monthlyData[monthName] = 0;
    }
    myJobs.filter(j => j.status === 'done').forEach(job => {
      const jobDate = new Date(job.endDate);
      const monthName = jobDate.toLocaleString('th-TH', { month: 'short' });
      if (monthlyData.hasOwnProperty(monthName)) {
        monthlyData[monthName]++;
      }
    });
    return Object.entries(monthlyData).map(([name, count]) => ({ name, "งานที่เสร็จ": count }));
  }, [myJobs]);

  // --- 2. สร้างข้อมูลจำลอง (Mock Data) ---
  const mockJobTypeData = [{ name: 'ซ่อมบำรุง', value: 12 }, { name: 'ติดตั้งระบบ', value: 8 }, { name: 'ตรวจเช็คสภาพ', value: 5 }];
  const mockMonthlyPerformanceData = [{ name: 'มิ.ย.', "งานที่เสร็จ": 4 }, { name: 'ก.ค.', "งานที่เสร็จ": 6 }, { name: 'ส.ค.', "งานที่เสร็จ": 5 }, { name: 'ก.ย.', "งานที่เสร็จ": 8 }, { name: 'ต.ค.', "งานที่เสร็จ": 7 }, { name: 'พ.ย.', "งานที่เสร็จ": 2 }];

  // --- 3. LOGIC การ "เลือกใช้" ข้อมูล ---
  const finalCompletedCount = completedJobsCount > 0 ? completedJobsCount : 15;
  const finalInProgressCount = inProgressJobsCount > 0 ? inProgressJobsCount : 2;
  const finalSuccessRate = myJobs.length > 0 ? Math.round((completedJobsCount / myJobs.length) * 100) : 85;
  const finalJobTypeData = jobTypeData.length > 0 ? jobTypeData : mockJobTypeData;
  const finalMonthlyPerformanceData = monthlyPerformanceData.some(month => month["งานที่เสร็จ"] > 0) ? monthlyPerformanceData : mockMonthlyPerformanceData;

  // --- หน้า Loading ---
  if (userLoading || jobsLoading) {
    return <div className="p-8 font-bold text-lg">Loading Dashboard...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in to view your dashboard.</div>;
  }
  
  // --- 4. JSX (ส่วนแสดงผล) ---
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ผลงานของคุณ, {user.fname}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่ทำเสร็จทั้งหมด</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalCompletedCount} งาน</div>
            <p className="text-xs text-muted-foreground">คือจำนวนความสำเร็จของคุณ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">งานที่กำลังทำ</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalInProgressCount} งาน</div>
            <p className="text-xs text-muted-foreground">สู้ๆ อีกนิดเดียว!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">อัตราความสำเร็จ (จำลอง)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">จากงานทั้งหมดที่ได้รับ</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
           <JobTypePieChart data={finalJobTypeData} />
        </div>
        <div className="lg:col-span-3">
           <MonthlyPerformanceChart data={finalMonthlyPerformanceData} />
        </div>
      </div>
    </div>
  );
}