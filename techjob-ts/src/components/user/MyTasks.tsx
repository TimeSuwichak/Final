"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { JobDetailsDialog } from "../common/JobDetailsDialog";


// ฟังก์ชัน loadDataFromStorage ยังคงเหมือนเดิม
const loadDataFromStorage = () => {
  // [สำคัญ] ฟังก์ชันอ่านข้อมูลจาก LocalStorage
  try {
    const data = localStorage.getItem("techJobData")
    if (data) {
      const parsed = JSON.parse(data)
      parsed.jobs = parsed.jobs.map((job) => ({
        ...job,
        dates: job.dates ? { start: new Date(job.dates.start), end: new Date(job.dates.end) } : null,
      }))
      return parsed
    }
  } catch (e) {
    console.error("Failed to load data", e)
  }
  return { jobs: initialJobs, users: initialUsers, leaders: initialLeaders }
}

export default function MyAssignedTasksPage() {
  // ✨ เปลี่ยนชื่อตัวแปรให้สื่อความหมายว่าเป็น user ทั่วไป
  const { user: loggedInUser } = useAuth(); 
  
  // ✨ เปลี่ยนชื่อ state ให้สอดคล้องกัน
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]); 
  
  const [viewingJob, setViewingJob] = useState<any | null>(null);
  const [allData, setAllData] = useState<{ users: any[]; leaders: any[] }>({
    users: [],
    leaders: [],
  });

  useEffect(() => {
    // ✨ เช็ค user ที่ล็อกอินเข้ามา
    if (loggedInUser) {
      const { jobs, users, leaders } = loadDataFromStorage();

      // ==========================================================
      // === ✨ จุดแก้ไขสำคัญ: เปลี่ยนเงื่อนไขการกรองข้อมูล ✨ ===
      // ==========================================================
      const userJobs = jobs.filter(
        // เช็คว่า ID ของ user ที่ล็อกอินอยู่, อยู่ใน array 'techIds' ของใบงานหรือไม่
        (job: any) => job.assignment.techIds.includes(loggedInUser.id)
      );

      // ✨ อัปเดต state ด้วยงานที่ user ได้รับมอบหมาย
      setAssignedJobs(userJobs); 
      setAllData({ users, leaders });
    }
  }, [loggedInUser]); // ✨ เปลี่ยน dependency เป็น loggedInUser

  // ฟังก์ชัน helpers ยังคงเหมือนเดิม
  const findLeaderById = (id: number) => allData.leaders.find((l) => l.id === id);
  const findUserById = (id: number) => allData.users.find((u) => u.id === id);
  const getStatusBadge = (status: string) => { /* ... โค้ดเหมือนเดิม ... */ };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      {/* ✨ เปลี่ยนหัวข้อเพจ */}
      <h2 className="text-3xl font-bold tracking-tight">ใบงานของฉัน</h2>

      {/* ✨ เปลี่ยนการเช็คความยาวของ array */}
      {assignedJobs.length > 0 ? (
        <div className="space-y-4">
          {/* ✨ วนลูปจาก assignedJobs */}
          {assignedJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{job.title}</span>
                  {getStatusBadge(job.status)}
                </CardTitle>
                <CardDescription>
                  {job.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* ... เนื้อหา Card เหมือนเดิม ... */}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => setViewingJob(job)}>ดูรายละเอียด</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // ✨ เปลี่ยนข้อความเมื่อไม่พบงาน
        <p className="text-muted-foreground">
          คุณยังไม่ได้รับมอบหมายงานใดๆ
        </p>
      )}

      {/* Dialog เหมือนเดิม */}
      <JobDetailsDialog
        job={viewingJob}
        lead={viewingJob ? findLeaderById(viewingJob.assignment.leadId) : null}
        techs={
          viewingJob ? viewingJob.assignment.techIds.map(findUserById) : []
        }
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
      />
    </div>
  );
}