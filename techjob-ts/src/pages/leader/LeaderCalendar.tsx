// src/pages/leader/LeaderCalendar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { isWithinInterval, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";


// ฟังก์ชันสำหรับอ่านข้อมูลจาก LocalStorage
const loadJobsFromStorage = () => {
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
      return parsed.jobs;
    }
  } catch (e) { console.error("Failed to load jobs", e); }
  return [];
};

export default function LeaderCalendar() {
  const { user: loggedInLeader } = useAuth();
  const [managedJobs, setManagedJobs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (loggedInLeader) {
      const allJobs = loadJobsFromStorage();
      const leaderJobs = allJobs.filter(
        (job) => job.assignment.leadId === loggedInLeader.id
      );
      setManagedJobs(leaderJobs);
    }
  }, [loggedInLeader]);

  // หาว่าวันที่เลือกมีงานอะไรบ้าง
  const jobsOnSelectedDate = managedJobs.filter(job => 
    isWithinInterval(selectedDate, { start: job.dates.start, end: job.dates.end })
  );

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">ปฏิทินงานที่ดูแล</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                modifiers={{
                  hasJob: (date) => {
                    return managedJobs.some(job =>
                      isWithinInterval(date, { start: job.dates.start, end: job.dates.end })
                    );
                  },
                }}
                modifiersClassNames={{
                  hasJob: "bg-primary/20 text-primary-foreground rounded-md",
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>งานในวันที่: {format(selectedDate, "PPP")}</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsOnSelectedDate.length > 0 ? (
                <ul className="space-y-2">
                  {jobsOnSelectedDate.map(job => (
                    <li key={job.id} className="text-sm p-2 bg-secondary rounded-md">
                      {job.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">ไม่มีงานที่ดูแลในวันที่เลือก</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}