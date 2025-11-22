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
  Hourglass, // ไอคอนสำหรับ Pending
  BadgeCheck, // ไอคอนสำหรับ Approved
  MessageCircle, // 🚨 แก้ไข: เพิ่ม MessageCircle
} from "lucide-react";
import { JobTypePieChart } from "@/components/user/charts/JobTypePieChart";
import { MonthlyPerformanceChart } from "@/components/user/charts/MonthlyPerformanceChart";
<<<<<<< HEAD
import { collection, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MessageCircle } from "lucide-react";
import { RecentChats } from "@/components/chat/RecentChats";
=======
import UserWorkStatus from "@/components/user/UserWorkStatus";
// 🚨 แก้ไข: สมมติว่าคอมโพเนนต์ RecentChats อยู่ใน path นี้ (โปรดปรับตามโครงสร้างจริงของคุณ)
>>>>>>> 4f86b5c3bff3c64cf9a50a65f504d8d7ceba3990


// ==========================================================
// ✨ USER DASHBOARD PAGE (ฉบับสมบูรณ์) ✨
// ==========================================================
export default function UserDashboard() {
  const { user, loading: userLoading } = useAuth();
  const { jobs } = useJobs();

  // --- 1. LOGIC การเตรียมข้อมูลจริง ---
  const myJobs = useMemo(() => {
    if (!user || !jobs) return [];
    // 🚨 ปรับปรุง: ใช้ user.id เป็น string เพื่อให้เข้ากับ includes() ได้ดี
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
  // [!!] แก้ไข Logic สำหรับงาน Approved: ควรนับสถานะ 'approved' จริงๆ (ถ้ามี)
  // แต่ถ้าไม่มี status 'approved' จริง ให้สมมติว่าเป็นการนับงานที่ทำเสร็จแล้ว (done) ที่รอการตรวจสอบ
  const approvedJobsCount = useMemo(
    // 🚨 ถ้ามี status 'approved' ให้เปลี่ยนเป็น j.status === "approved"
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
    
    // สร้างชื่อเดือนย้อนหลัง 6 เดือน
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = date.toLocaleString("th-TH", { month: "short" });
      monthlyData[monthName] = 0;
    }
    
    myJobs
      .filter((j) => j.status === "done")
      .forEach((job) => {
        // ตรวจสอบว่า job.endDate เป็นค่าที่ถูกต้องก่อนใช้งาน
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

  // --- 3. LOGIC การ "เลือกใช้" ข้อมูล (Mocking Logic) ---
  const finalCompletedCount = completedJobsCount > 0 ? completedJobsCount : 15;
  const finalInProgressCount = inProgressJobsCount > 0 ? inProgressJobsCount : 2;
  const finalPendingCount = pendingJobsCount > 0 ? pendingJobsCount : 5;
  // [!!] เพิ่ม Logic Mock สำหรับ Approved
  const finalApprovedCount = approvedJobsCount > 0 ? approvedJobsCount : 3;

  const finalJobTypeData =
    jobTypeData.length > 0 ? jobTypeData : mockJobTypeData;
  const finalMonthlyPerformanceData = monthlyPerformanceData.some(
    (month) => month["งานที่เสร็จ"] > 0
  )
    ? monthlyPerformanceData
    : mockMonthlyPerformanceData;

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
    <div className="flex-1 space-y-8 p-4 md:p-8">
<<<<<<< HEAD
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ผลงานของคุณ, {user.fname}</h2>
        <button
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <MessageCircle className="w-5 h-5" />
          แชท
        </button>
=======
      {/* 🚨 ปรับปรุง Title ให้ดูดีขึ้น */}
      <div className="flex items-center justify-between">
        <div className="border-l-4 border-primary pl-4">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">
            👋 สวัสดี, {user.fname}
          </h2>
          <p className="text-lg text-muted-foreground mt-1">
            ภาพรวมผลงานและความคืบหน้าของคุณ
          </p>
        </div>
      </div>

      {/* User Work Status (new) */}
      <div>
        <UserWorkStatus />
>>>>>>> 4f86b5c3bff3c64cf9a50a65f504d8d7ceba3990
      </div>

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

        {/* Card 2: งานที่กำลังทำ */}
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
<<<<<<< HEAD
      
=======
      {/* ================================================== */}
      {/* ✨ จบส่วนของ Card Dashboard ✨ */}
      {/* ================================================== */}

      {/* Charts Section */}
>>>>>>> 4f86b5c3bff3c64cf9a50a65f504d8d7ceba3990
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <JobTypePieChart data={finalJobTypeData} />
        </div>
        <div className="lg:col-span-3">
          <MonthlyPerformanceChart data={finalMonthlyPerformanceData} />
        </div>
      </div>

      {/* Recent Chats Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            ✉️ แชทล่าสุด
          </h3>
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:bg-indigo-700 transition font-medium text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            ดูแชททั้งหมด
          </button>
        </div>
        <Card className="p-4 shadow-xl dark:bg-gray-800">
        </Card>
      </div>
    </div>
  );
}