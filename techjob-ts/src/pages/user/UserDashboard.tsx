"use client";

import React, { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  CheckCircle2,
  Hourglass, // ไอคอนสำหรับ Pending
  BadgeCheck, // [!!] ไอคอนใหม่สำหรับ Approved
} from "lucide-react";
import { JobTypePieChart } from "@/components/user/charts/JobTypePieChart";
import { MonthlyPerformanceChart } from "@/components/user/charts/MonthlyPerformanceChart";
<<<<<<< HEAD
import { collection, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";

=======
import UserWorkStatus from "@/components/user/UserWorkStatus";
>>>>>>> 19eff251d53fd181d0e55585bcfac9d767ad023f

// ==========================================================
// ✨ USER DASHBOARD PAGE (ฉบับสมบูรณ์) ✨
// ==========================================================
export default function UserDashboard() {
  const { user, loading: userLoading } = useAuth();
  const { jobs } = useJobs();

  // --- 1. LOGIC การเตรียมข้อมูลจริง ---
  const myJobs = useMemo(() => {
    if (!user || !jobs) return [];
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
  const pendingJobsCount = useMemo(
    () => myJobs.filter((j) => j.status === "pending").length,
    [myJobs]
  );
  // [!!] เพิ่ม Logic สำหรับงาน Approved (สมมติว่ามี status 'approved')
  const approvedJobsCount = useMemo(
    () => myJobs.filter((j) => j.status === "approved").length,
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

  const openChat = async () => {
  if (!user) return;

  // 1) ตรวจสอบว่า chat doc ที่มี id = user.id มีอยู่หรือยัง
  const chatRef = doc(db, "chats", String(user.id));
  const chatSnap = await getDoc(chatRef);

  if (chatSnap.exists()) {
    // ถ้ามีแล้ว ให้ไปหน้าแชท (ผู้ใช้ใช้ auth user id ใน ChatPage)
    navigate(`/chat`);
    return;
  }

  // 2) ถ้ายังไม่มี ให้สร้าง doc โดยใช้ user.id เป็น doc id (เพื่อให้ AdminChatList หา user ได้)
  await setDoc(chatRef, {
    userId: user.id,
    userName: `${user.fname} ${user.lname}`,
    lastMessage: "",
    lastSender: "user",
    updatedAt: serverTimestamp(),
    adminSeen: true,
    userSeen: true,
  }, { merge: true });

  navigate(`/chat`);
};


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
    onClick={openChat}
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
  >
    <MessageCircle className="w-5 h-5" />
    แชทกับแอดมิน
  </button>
=======
  <div className="flex items-center justify-between">
    <div className="border-l-4 border-primary pl-4">
      <h2 className="text-4xl font-bold tracking-tight">
        ผลงานของคุณ , {user.fname}
      </h2>
    </div>
  </div>

      {/* User Work Status (new) */}
      <div>
        <UserWorkStatus />
>>>>>>> 19eff251d53fd181d0e55585bcfac9d767ad023f
      </div>

      {/* ================================================== */}
      {/* ✨ ส่วนของ Card ที่อัปเดตดีไซน์และ Font แล้ว ✨ */}
      {/* ================================================== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: งานที่ทำเสร็จ (คงเดิม) */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานทั้งหมด (Total Tasks)
              </p>
              <div className="text-3xl font-bold">{finalCompletedCount} งาน</div>
              <p className="text-sm text-muted-foreground">
                จำนวนงานที่คุณทำสำเร็จ
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: งานที่กำลังทำ (คงเดิม) */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานที่กำลังดำเนินการ (Working)
              </p>
              <div className="text-3xl font-bold">{finalInProgressCount} งาน</div>
              <p className="text-sm text-muted-foreground">
                จำนวนงานที่คุณกำลังดำเนินการอยู่
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <Wrench className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        {/* [!!] Card 3: (แก้ไขเป็น Pending) */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานค้าง (Pending Tasks)
              </p>
              {/* [!!] 1. ใช้ตัวแปรที่ถูกต้อง */}
              <div className="text-3xl font-bold">{finalPendingCount} งาน</div>
              <p className="text-sm text-muted-foreground">
                งานค้างที่ยังไม่ได้เริ่มทำ
              </p>
            </div>
            {/* [!!] 2. เปลี่ยนไอคอนและสี */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Hourglass className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        {/* [!!] CARD ที่ 4 (แก้ไขเป็น Approved) */}
        <Card>
          <CardContent className="flex flex-row items-center justify-between p-6">
            <div className="space-y-1.5">
              <p className="text-base font-medium text-muted-foreground">
                งานที่หัวหน้าตรวจสอบแล้ว (Approved Tasks)
              </p>
              {/* [!!] 3. ใช้ตัวแปรที่ถูกต้อง */}
              <div className="text-3xl font-bold">{finalApprovedCount} งาน</div>
              <p className="text-sm text-muted-foreground">
                งานที่ตรวจสอบแล้ว
              </p>
            </div>
            {/* [!!] 4. เปลี่ยนไอคอนและสี */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
              <BadgeCheck className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>
<<<<<<< HEAD
      
=======
      {/* ================================================== */}
      {/* ✨ จบส่วนที่อัปเดต ✨ */}
      {/* ================================================== */}

>>>>>>> 19eff251d53fd181d0e55585bcfac9d767ad023f
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <JobTypePieChart data={finalJobTypeData} />
        </div>
        <div className="lg:col-span-3">
          <MonthlyPerformanceChart data={finalMonthlyPerformanceData} />
        </div>
      </div>

      {/* CompletedJobsLineChart removed from this page */}
    </div>
  );
}