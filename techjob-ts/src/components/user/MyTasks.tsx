"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { leader as LEADERS } from "@/Data/leader";
import { user as USERS } from "@/Data/user";
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
// Use JobContext for realtime jobs and Data files for users/leaders lookups

export default function MyAssignedTasksPage() {
  // ✨ เปลี่ยนชื่อตัวแปรให้สื่อความหมายว่าเป็น user ทั่วไป
  const { user: loggedInUser } = useAuth(); 
  
  // ✨ เปลี่ยนชื่อ state ให้สอดคล้องกัน
  const { jobs } = useJobs();
  const [assignedJobs, setAssignedJobs] = useState<any[]>([]);
  const [viewingJob, setViewingJob] = useState<any | null>(null);

  useEffect(() => {
    if (!loggedInUser || !jobs) return setAssignedJobs([]);
    const userIdString = String(loggedInUser.id);
    const userJobs = jobs.filter((job: any) => {
      const assigned = job.assignedTechs || (job as any).assignment?.techIds || [];
      return assigned.some((t: any) => String(t) === userIdString);
    });
    setAssignedJobs(userJobs);
  }, [loggedInUser, jobs]);

  // ฟังก์ชัน helpers ยังคงเหมือนเดิม
  const findLeaderById = (id: number) => LEADERS.find((l) => l.id === id);
  const findUserById = (id: number) => USERS.find((u) => u.id === id);
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