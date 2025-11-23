"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { leader as leadersData } from "@/Data/leader";
import { user as usersData } from "@/Data/user";
// [สำคัญ] Import Button และ CardFooter เข้ามา
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JobDetailsDialog } from "@/components/common/JobDetailsDialog";

export default function MyManagedTasks() {
  const { user: loggedInLeader } = useAuth();
  const { jobs } = useJobs();
  const [managedJobs, setManagedJobs] = useState<any[]>([]);
  const [viewingJob, setViewingJob] = useState<any | null>(null);

  useEffect(() => {
    if (!loggedInLeader || !jobs) return setManagedJobs([]);
    const leaderJobs = jobs.filter((job: any) => String(job.leadId || job.assignment?.leadId) === String(loggedInLeader.id));
    setManagedJobs(leaderJobs);
  }, [loggedInLeader, jobs]);
  
  const findLeaderById = (id: number) => leadersData.find(l => l.id === id);
  const findUserById = (id: number) => usersData.find(u => u.id === id);

  const getStatusBadge = (status: string) => {
    switch (status) {
        case "new": return <Badge variant="default">งานใหม่</Badge>;
        case "in-progress": return <Badge variant="secondary">กำลังดำเนินการ</Badge>;
        case "completed": return <Badge className="bg-green-600 text-white">เสร็จสิ้น</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">ใบงานที่ฉันดูแล</h2>
      
      {managedJobs.length > 0 ? (
        <div className="space-y-4">
          {managedJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{job.title}</span>
                  {getStatusBadge(job.status)}
                </CardTitle>
                <CardDescription>{job.description || "ไม่มีรายละเอียดเพิ่มเติม"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  <p><strong>ลูกค้า:</strong> {job.client?.name || 'N/A'}</p>
                  <p><strong>ระยะเวลา:</strong> {format(new Date(job.startDate || job.dates?.start || Date.now()), "PPP", { locale: th })} - {format(new Date(job.endDate || job.dates?.end || job.startDate || Date.now()), "PPP", { locale: th })}</p>
                </div>
              </CardContent>
              {/* เพิ่ม CardFooter และ Button กลับมา */}
              <CardFooter className="flex justify-end">
                <Button onClick={() => setViewingJob(job)}>ดูรายละเอียด</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">คุณยังไม่ได้รับมอบหมายให้ดูแลงานใดๆ</p>
      )}

      {/* ส่วน Dialog แสดงรายละเอียด */}
      <JobDetailsDialog
          job={viewingJob}
          lead={viewingJob ? findLeaderById(viewingJob.leadId || viewingJob.assignment?.leadId) : null}
          techs={viewingJob ? (viewingJob.assignment?.techIds || viewingJob.techIds || []).map(findUserById) : []}
          isOpen={!!viewingJob}
          onClose={() => setViewingJob(null)}
      />
    </div>
  );
}