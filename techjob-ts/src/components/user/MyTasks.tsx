"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
// [สำคัญ] เพิ่ม Button และ CardFooter เข้ามาใน import
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JobDetailsDialog } from "@/components/common/JobDetailsDialog";

const loadDataFromStorage = () => {
  try {
    const data = localStorage.getItem("techJobData");
    if (data) {
      const parsed = JSON.parse(data);
      parsed.jobs = parsed.jobs.map((job: any) => ({
        ...job,
        dates: {
          start: new Date(job.dates.start),
          end: new Date(job.dates.end),
        },
      }));
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return { jobs: [], users: [], leaders: [] };
};

export default function MyManagedTasksPage() {
  const { user: loggedInLeader } = useAuth();
  const [managedJobs, setManagedJobs] = useState<any[]>([]);
  const [viewingJob, setViewingJob] = useState<any | null>(null);
  const [allData, setAllData] = useState<{ users: any[]; leaders: any[] }>({
    users: [],
    leaders: [],
  });

  useEffect(() => {
    if (loggedInLeader) {
      const { jobs, users, leaders } = loadDataFromStorage();
      const leaderJobs = jobs.filter(
        (job: any) => job.assignment.leadId === loggedInLeader.id
      );
      setManagedJobs(leaderJobs);
      setAllData({ users, leaders });
    }
  }, [loggedInLeader]);

  const findLeaderById = (id: number) =>
    allData.leaders.find((l) => l.id === id);
  const findUserById = (id: number) => allData.users.find((u) => u.id === id);

  const getStatusBadge = (status: string) => {
    /* ... โค้ดเหมือนเดิม ... */
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">ใบงานที่ฉันดูแล</h2>

      {managedJobs.length > 0 ? (
        <div className="space-y-4">
          {managedJobs.map((job) => (
            // เราจะไม่ทำให้ Card คลิกได้ แต่จะใช้ปุ่มแทน
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
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>ลูกค้า:</strong> {job.client?.name || "N/A"}
                  </p>
                  <p>
                    <strong>ระยะเวลา:</strong>{" "}
                    {format(job.dates.start, "PPP", { locale: th })} -{" "}
                    {format(job.dates.end, "PPP", { locale: th })}
                  </p>
                </div>
              </CardContent>
              {/* ========================================================== */}
              {/* === ✨ จุดที่แก้ไข: เพิ่ม CardFooter และ Button กลับมา ✨ === */}
              {/* ========================================================== */}
              <CardFooter className="flex justify-end">
                <Button onClick={() => setViewingJob(job)}>ดูรายละเอียด</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          คุณยังไม่ได้รับมอบหมายให้ดูแลงานใดๆ
        </p>
      )}

      {/* ส่วน Dialog ไม่มีการเปลี่ยนแปลง */}
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
