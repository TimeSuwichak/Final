"use client";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  FaRegFileAlt,
  FaSyncAlt,
  FaCheckCircle,
  FaUserCheck,
  FaUserClock,
  FaUserTimes,
  FaPlusSquare,
  FaExclamationTriangle,
  FaChartBar,
} from "react-icons/fa";
import { CreateJobForm } from "@/components/admin/CreateJobForm";
import ShowCard from "@/components/admin/ShowCard";
import { user } from "@/data/user";
import InteractiveMap from "@/components/common/InteractiveMap";

// ======================= DATA จำลอง =======================
// ปกติข้อมูลนี้จะมาจาก Database แต่เราจะจำลองขึ้นมาก่อน
const initialJobs = [
  {
    id: "JOB-001",
    title: "ซ่อมหลังคารั่วซึม อาคาร C",
    teamLead: "คุณสมศักดิ์ ดีพร้อม",
    members: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=500&q=80",
    description:
      "ซ่อมแซมหลังคาบริเวณดาดฟ้าอาคาร C เนื่องจากมีรอยรั่วซึมหลังฝนตกหนัก ต้องตรวจสอบและอุดรอยรั่วทั้งหมด",
  },
];

// ==========================================================

export default function AdminDashboard() {
  const [position, setPosition] = React.useState("bottom");
  // ▼▼▼ ส่วนที่เพิ่มเข้ามา ▼▼▼

  // 1. State สำหรับเก็บ "รายการงานทั้งหมด"
  // เราใส่ initialJobs เข้าไปเพื่อให้มีข้อมูลเริ่มต้น 1 งาน
  // เปลี่ยนจากการกำหนดค่าเริ่มต้นตรงๆ เป็นการใช้ฟังก์ชัน
  const [jobs, setJobs] = useState(() => {
    // ลองดึงข้อมูลจาก localStorage ที่เราตั้งชื่อว่า 'myJobs'
    const savedJobs = localStorage.getItem("myJobs");
    // ถ้ามีข้อมูลที่เคยเซฟไว้
    if (savedJobs) {
      // ให้แปลงข้อมูลจาก string กลับเป็น array/object แล้วใช้เป็นค่าเริ่มต้น
      return JSON.parse(savedJobs);
    } else {
      // ถ้าไม่มีข้อมูลเก่า ก็ให้ใช้ initialJobs เป็นค่าเริ่มต้น
      return initialJobs;
    }
  });

  // useEffect จะทำงานทุกครั้งที่ค่าใน [ ] เปลี่ยนไป
  useEffect(() => {
    // ทุกครั้งที่ 'jobs' state เปลี่ยน (มีงานเพิ่ม)
    // ให้เอาข้อมูล jobs ล่าสุดไปเซฟลง localStorage
    localStorage.setItem("myJobs", JSON.stringify(jobs));
  }, [jobs]); // <-- บอกให้ useEffect ทำงานเมื่อ `jobs` เปลี่ยนแปลงเท่านั้น
  // 2. State สำหรับเก็บ "ตัวเลขสรุปบนแดชบอร์ด"

  const [stats, setStats] = useState({
    new: jobs.length,
    inProgress: 12,
    completed: 89,
  });

  // เราต้องใช้ useEffect อีกตัวเพื่ออัปเดตตัวเลขบนแดชบอร์ด
  // เมื่อ jobs มีการเปลี่ยนแปลง (เช่น เพิ่มงานใหม่)
  useEffect(() => {
    setStats((prevStats) => ({
      ...prevStats,
      new: jobs.length,
    }));
  }, [jobs]);

  // 3. State สำหรับควบคุมการเปิด/ปิด Dialog โดยเฉพาะ
  // ทำให้เราสามารถสั่งปิด Dialog จากโค้ดได้
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 4. ฟังก์ชันสำหรับ "เพิ่มงานใหม่" (นี่คือหัวใจของระบบ)
  const handleCreateJob = (newJobData) => {
    // สร้าง ID ใหม่ที่ไม่ซ้ำใคร (แบบง่ายที่สุดคือใช้วันที่และเวลาปัจจุบัน)
    const newJob = {
      ...newJobData,
      id: `JOB-${Date.now()}`,
    };

    // อัปเดต State รายการงานทั้งหมด
    // โดยเอางานใหม่มาใส่ไว้บนสุดของ list
    setJobs((prevJobs) => [newJob, ...prevJobs]);

    // อัปเดต State ตัวเลขบนแดชบอร์ด
    setStats((prevStats) => ({
      ...prevStats,
      new: prevStats.new + 1, // บวกจำนวนงานใหม่เพิ่ม 1
    }));

    // สั่งปิด Dialog หลังจากสร้างงานเสร็จเรียบร้อย
    setIsDialogOpen(false);
    console.log("New Job Created!", newJob);
  };

  // ▲▲▲ สิ้นสุดส่วนที่เพิ่มเข้ามา ▲▲▲
  return (
    <div className="flex-1 p-4 md:p-8 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">ข้อมูลภาพรวม</h2>

        {/* ▼▼▼ แก้ไขปุ่ม ให้กลายเป็นตัวเปิด Dialog ▼▼▼ */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>+ CREATE JOB</Button>
          </DialogTrigger>

          {/* ▼▼▼ เพิ่ม 2 prop นี้เข้าไป ▼▼▼ */}
          <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="sm:max-w-4xl"
          >
            <DialogHeader>
              <DialogTitle>สร้างใบงานใหม่</DialogTitle>
            </DialogHeader>
            <CreateJobForm onSubmit={handleCreateJob} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card shadow-sm rounded-xl p-4 md:p-6">
        {/* โครงสร้าง Grid 4 ช่องของคุณ (ไม่ต้องแก้) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ==================== ช่องที่ 1: สถานะงาน (โครงสร้างเดิม) ==================== */}
          <div className="border border-border rounded-lg p-4 flex flex-col justify-center">
            <div className="flex justify-around items-center text-center">
              {/* 1.1 งานใหม่ */}
              <div className="flex flex-col items-center gap-2">
                <FaRegFileAlt className="h-6 w-6 text-blue-500" />

                <p className="text-sm text-muted-foreground">งานใหม่</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
              {/* 1.2 กำลังดำเนินงาน */}
              <div className="flex flex-col items-center gap-2">
                <FaSyncAlt
                  className="h-6 w-6 text-amber-500 animate-spin"
                  style={{ animationDuration: "2s" }}
                />

                <p className="text-sm text-muted-foreground">กำลังทำ</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
              {/* 1.3 เสร็จสิ้น */}
              <div className="flex flex-col items-center gap-2">
                <FaCheckCircle className="h-6 w-6 text-green-500" />

                <p className="text-sm text-muted-foreground">เสร็จสิ้น</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </div>

          {/* ==================== ช่องที่ 2: สถานะช่าง (โครงสร้างเดิม) ==================== */}
          <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
            <h3 className="font-semibold text-center text-foreground">
              สถานะของช่าง
            </h3>
            <div className="flex justify-around items-center text-center">
              {/* 2.1 ออนไลน์ */}
              <div className="flex flex-col items-center gap-2">
                <FaUserCheck className="h-6 w-6 text-green-500" />
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">ออนไลน์</p>
              </div>
              {/* 2.2 กำลังทำงาน */}
              <div className="flex flex-col items-center gap-2">
                <FaUserClock className="h-6 w-6 text-amber-500" />
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">กำลังทำงาน</p>
              </div>
              {/* 2.3 ออฟไลน์ */}
              <div className="flex flex-col items-center gap-2">
                <FaUserTimes className="h-6 w-6 text-slate-400" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">ออฟไลน์</p>
              </div>
            </div>
          </div>

          {/* ==================== ช่องที่ 3: วัสดุ (โครงสร้างเดิม) ==================== */}
          <div className="border border-border rounded-lg p-4 flex flex-col justify-center">
            <div className="flex justify-around items-center text-center">
              {/* 3.1 วัสดุที่เพิ่มเข้ามา */}
              <div className="flex flex-col items-center gap-2">
                <FaPlusSquare className="h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">เพิ่มล่าสุด</p>
              </div>
              {/* 3.2 วัสดุใกล้หมด */}
              <div className="flex flex-col items-center gap-2">
                <FaExclamationTriangle className="h-6 w-6 text-destructive" />
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">ใกล้หมด</p>
              </div>
            </div>
          </div>

          {/* ==================== ช่องที่ 4: กราฟ (โครงสร้างเดิม) ==================== */}
          <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <FaChartBar className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">
                สถิติงาน (7 วันล่าสุด)
              </h3>
            </div>
            {/* ส่วนจำลองกราฟแท่ง */}
            <div className="flex-1 flex items-end justify-between gap-2 text-center">
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-border rounded-t-sm h-16"></div>
                <p className="text-xs text-muted-foreground">จ</p>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-border rounded-t-sm h-24"></div>
                <p className="text-xs text-muted-foreground">อ</p>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-primary/50 rounded-t-sm h-32"></div>
                <p className="text-xs text-muted-foreground">พ</p>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-border rounded-t-sm h-20"></div>
                <p className="text-xs text-muted-foreground">พฤ</p>
              </div>
              <div className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-border rounded-t-sm h-28"></div>
                <p className="text-xs text-muted-foreground">ศ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ShowCard jobs={jobs} />
    </div>
  );
}
