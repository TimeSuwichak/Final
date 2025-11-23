// src/pages/user/UserDashboard.tsx (ฉบับแก้ไข)

"use client";
import { useNavigate } from "react-router-dom";

import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  CheckCircle2,
  Hourglass,
  BadgeCheck,
  MessageCircle,
  UserCircle, // ✅ NEW ICON: เพิ่ม UserCircle
} from "lucide-react";
import { JobTypePieChart } from "@/components/user/charts/JobTypePieChart";
import { MonthlyPerformanceChart } from "@/components/user/charts/MonthlyPerformanceChart";
import { collection, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RecentChats } from "@/components/chat/RecentChats";


// ==========================================================
// ⭐ NEW Component: UserHeaderBanner (ตกแต่งหัวข้อ) ⭐
// ==========================================================
function UserHeaderBanner({ userName, onChatClick }: { userName: string; onChatClick: () => void }) {
  // สไตล์ Card สำหรับหัวข้อ (ใช้สไตล์เดียวกับ Card อื่นๆ)
  const headerCardStyle = "bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-xl dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-[#2A2C40]";
  
  // สไตล์ Icon Wrapper (Glass Sphere Style)
  const iconWrapperStyle = `
    w-12 h-12 md:w-14 md:h-14 flex items-center justify-center 
    rounded-full 
    bg-gradient-to-br from-indigo-500 to-violet-600 
    dark:from-indigo-700 dark:to-violet-800 
    shadow-[
      0_5px_15px_rgba(0,0,0,0.3), 
      0_0_0_1px_rgba(255,255,255,0.1), 
      inset_0_2px_5px_rgba(255,255,255,0.3), 
      inset_0_-2px_5px_rgba(0,0,0,0.2) 
    ]
    dark:shadow-[
      0_5px_15px_rgba(0,0,0,0.6), 
      0_0_0_1px_rgba(255,255,255,0.05),
      inset_0_2px_5px_rgba(255,255,255,0.1),
      inset_0_-2px_5px_rgba(0,0,0,0.3)
    ]
    transform transition-all duration-300 ease-in-out
  `;

  return (
    // ✅ [UPDATED] ห่อหุ้มด้วย Card Style และเพิ่ม Vertical Accent Line
    <div className={`relative overflow-hidden p-5 md:p-6 mb-8 ${headerCardStyle}`}>
      
      {/* 1. Vertical Accent Line */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-2xl"></div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          
          {/* 2. Glass Sphere Icon */}
          <div className={iconWrapperStyle}>
            <UserCircle className="w-8 h-8 text-white drop-shadow-sm" /> 
          </div>
          
          {/* 3. Title */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
              ผลงานของคุณ, {userName}
            </h2>
            {/* ✅ [NEW] เพิ่มคำอธิบายย่อย */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                ภาพรวมประสิทธิภาพและสถานะงานปัจจุบัน
            </p>
          </div>
        </div>

        {/* 4. Chat Button (ปรับให้เข้ากับ Card Style) */}
        <button
          onClick={onChatClick}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700 transition font-semibold shrink-0"
        >
          <MessageCircle className="w-5 h-5" />
          แชท
        </button>
      </div>
    </div>
  );
}
// ==========================================================


// ==========================================================
// ✨ USER DASHBOARD PAGE (ฉบับสมบูรณ์) ✨
// ==========================================================
export default function UserDashboard() {
  const { user, loading: userLoading } = useAuth();
  const { jobs } = useJobs();

  // --- 1. LOGIC การเตรียมข้อมูลจริง ---
  const myJobs = useMemo(() => {
    if (!user || !jobs) return [];
    const userIdString = String(user.id); 
    return jobs.filter(
      (job) => job.assignedTechs && job.assignedTechs.includes(userIdString)
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
  const pendingJobsCount = useMemo(
    () => myJobs.filter((j) => j.status === "new").length,
    [myJobs]
  );
  const approvedJobsCount = useMemo(
    () => myJobs.filter((j) => j.status === "approved" || j.status === "done").length, 
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
        if (job.endDate) { 
            const jobDate = new Date(job.endDate);
            const monthName = jobDate.toLocaleString("th-TH", { month: "short" });
            if (monthlyData.hasOwnProperty(monthName)) {
              monthlyData[monthName]++;
            }
        }
      });
      
    return Object.entries(monthlyData).map(([name, count]) => ({
      name,
      "งานที่เสร็จ": count,
    }));
  }, [myJobs]);


  // --- 3. LOGIC การ "เลือกใช้" ข้อมูล ---
  const finalCompletedCount = completedJobsCount;
  const finalInProgressCount = inProgressJobsCount;
  const finalPendingCount = pendingJobsCount;
  const finalApprovedCount = approvedJobsCount;

  const finalJobTypeData = jobTypeData;
  const finalMonthlyPerformanceData = monthlyPerformanceData;

  const navigate = useNavigate();

  // --- หน้า Loading ---
  if (userLoading) {
    return <div className="p-8 font-bold text-lg">Loading Dashboard...</div>;
  }

  if (!user) {
    return <div className="p-8">Please log in to view your dashboard.</div>;
  }
  
  // --- 4. JSX (ส่วนแสดงผลที่ปรับ Font แล้ว) ---
  return (
    // ✅ [ADJUSTED] p-4 md:p-8 -> p-8 (ใช้ padding ที่เหมาะสมกับ Card Style)
    <div className="flex-1 space-y-8 p-8"> 
      
      {/* ================================================== */}
      {/* ⭐ [UPDATED] ส่วนหัวข้อที่ถูกตกแต่งแล้ว ⭐ */}
      {/* ================================================== */}
      <UserHeaderBanner 
        userName={user.fname || 'ผู้ใช้งาน'} 
        onChatClick={() => navigate("/chat")} 
      />

      {/* ================================================== */}
      {/* ✨ ส่วนของ Card Dashboard (4 Cards) ✨ */}
      {/* ================================================== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: งานที่ทำเสร็จ */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานทั้งหมด (All Tasks)
              </p>
              <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                {finalCompletedCount} งาน
              </div>
              <p className="text-sm text-muted-foreground">จำนวนงานที่คุณทำสำเร็จ</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: งานที่กำลังทำ (New Jobs) */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานใหม่ (New Jobs)
              </p>
              <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">
                {finalInProgressCount} งาน
              </div>
              <p className="text-sm text-muted-foreground">
                งานใหม่ที่รอรับ
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Wrench className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: งานค้าง (Pending) */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานที่เสร็จเเล้ว (Completed Tasks)
              </p>
              <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                {finalPendingCount} งาน
              </div>
              <p className="text-sm text-muted-foreground">
                งานค้างที่ยังไม่ได้เริ่มทำ
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Hourglass className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        {/* CARD ที่ 4: งานที่หัวหน้าตรวจสอบแล้ว (Approved) */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                รอตรวจสอบ/อนุมัติ (Approved Tasks)
              </p>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {finalApprovedCount} งาน
              </div>
              <p className="text-sm text-muted-foreground">งานที่รอการตรวจสอบ/อนุมัติ</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <BadgeCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          {/* ใช้ data จริงหรือ mock data ตาม logic */}
          <JobTypePieChart data={finalJobTypeData.length > 0 ? finalJobTypeData : []} />
        </div>
        <div className="lg:col-span-3">
          <MonthlyPerformanceChart data={finalMonthlyPerformanceData.length > 0 ? finalMonthlyPerformanceData : []} />
        </div>
      </div>

      {/* Recent Chats Section */}
      
    </div>
  );
}