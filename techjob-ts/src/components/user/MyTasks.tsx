// src/pages/user/MyTasks.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// ฟังก์ชันสำหรับอ่านข้อมูลทั้งหมดจาก LocalStorage
const loadJobsFromStorage = () => {
  try {
    const data = localStorage.getItem("techJobData");
    if (data) {
      const parsed = JSON.parse(data);
      // แปลงวันที่กลับเป็น Date object
      parsed.jobs = parsed.jobs.map((job) => ({
        ...job,
        dates: {
          start: new Date(job.dates.start),
          end: new Date(job.dates.end),
        },
      }));
      return parsed.jobs;
    }
  } catch (e) {
    console.error("Failed to load jobs", e);
  }
  return [];
};

export default function MyTasksPage() {
  const { user } = useAuth(); // ดึงข้อมูลผู้ใช้ที่ Login อยู่
  const [myJobs, setMyJobs] = useState([]);

  useEffect(() => {
    if (user) {
      const allJobs = loadJobsFromStorage();
      // กรองงานทั้งหมด ให้เหลือเฉพาะงานที่มี techIds ของเรา
      const userJobs = allJobs.filter((job) =>
        job.assignment.techIds.includes(user.id)
      );
      setMyJobs(userJobs);
    }
  }, [user]); // ทำงานใหม่เมื่อข้อมูล user พร้อมใช้งาน

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return <Badge variant="default">งานใหม่</Badge>;
      case "in-progress":
        return <Badge variant="secondary">กำลังดำเนินการ</Badge>;
      case "completed":
        return <Badge className="bg-green-600 text-white">เสร็จสิ้น</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">ใบงานของฉัน</h2>
      
      {myJobs.length > 0 ? (
        <div className="space-y-4">
          {myJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{job.title}</span>
                  {getStatusBadge(job.status)}
                </CardTitle>
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p><strong>แผนก:</strong> {job.assignment.department}</p>
                  <p><strong>ระยะเวลา:</strong> {format(job.dates.start, "PPP")} - {format(job.dates.end, "PPP")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">คุณยังไม่ได้รับมอบหมายงาน</p>
      )}
    </div>
  );
}