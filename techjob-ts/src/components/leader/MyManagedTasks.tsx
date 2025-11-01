// src/pages/leader/MyManagedTasks.jsx
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ฟังก์ชันสำหรับอ่านข้อมูลทั้งหมดจาก LocalStorage
const loadDataFromStorage = () => {
  try {
    const data = localStorage.getItem("techJobData");
    if (data) {
      const parsed = JSON.parse(data);
      parsed.jobs = parsed.jobs.map((job) => ({
        ...job,
        dates: {
          start: new Date(job.dates.start),
          end: new Date(job.dates.end),
        },
      }));
      return parsed; // คืนค่า object ทั้งหมดที่มี jobs, users, leaders
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return { jobs: [], users: [], leaders: [] };
};

export default function MyManagedTasksPage() {
  const { user: loggedInLeader } = useAuth(); // ดึงข้อมูลหัวหน้าที่ Login อยู่
  const [managedJobs, setManagedJobs] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // State สำหรับเก็บข้อมูลช่างทั้งหมด

  useEffect(() => {
    if (loggedInLeader) {
      const { jobs, users } = loadDataFromStorage();

      // กรองงานทั้งหมด ให้เหลือเฉพาะงานที่มี leadId ของเรา
      const leaderJobs = jobs.filter(
        (job) => job.assignment.leadId === loggedInLeader.id
      );

      setManagedJobs(leaderJobs);
      setAllUsers(users); // เก็บข้อมูลช่างไว้เพื่อใช้แสดงผล
    }
  }, [loggedInLeader]);

  const getStatusBadge = (status) => {
    // ... (โค้ด getStatusBadge เหมือนเดิม) ...
  };

  // ฟังก์ชันสำหรับหาข้อมูลช่างจาก ID
  const findUserById = (id) => allUsers.find((u) => u.id === id);

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
                <CardDescription>{job.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>แผนกที่เกี่ยวข้อง:</strong>{" "}
                    {(
                      job.assignment.departments || [
                        job.assignment.department,
                      ] ||
                      []
                    ).join(", ")}
                  </p>
                  <p>
                    <strong>ระยะเวลา:</strong> {format(job.dates.start, "PPP")}{" "}
                    - {format(job.dates.end, "PPP")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">ทีมช่างในงานนี้:</h4>
                  <div className="flex flex-wrap gap-4">
                    {job.assignment.techIds.map((techId) => {
                      const tech = findUserById(techId);
                      if (!tech) return null;
                      return (
                        <div
                          key={tech.id}
                          className="flex items-center gap-2 p-2 bg-secondary rounded-md"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={tech.avatarUrl} />
                            <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {tech.fname} {tech.lname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tech.position}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          คุณยังไม่ได้รับมอบหมายให้ดูแลงานใดๆ
        </p>
      )}
    </div>
  );
}
