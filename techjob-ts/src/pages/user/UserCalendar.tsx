"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/contexts/JobContext";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isWithinInterval, format } from "date-fns";
import { th } from "date-fns/locale"; // [ใหม่] Import locale ภาษาไทย

// ใช้ jobs จาก JobContext แทน localStorage เพื่อให้เป็น realtime

export default function UserCalendarPage() {
  const { user } = useAuth();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { jobs } = useJobs();

  useEffect(() => {
    if (user) {
      if (!jobs) return setMyJobs([]);
      const userIdString = String(user.id);
      const userJobs = jobs
        .filter((job: any) => Array.isArray(job.assignedTechs) && job.assignedTechs.includes(userIdString))
        .map((job: any) => ({
          ...job,
          dates: {
            start: job.startDate ? new Date(job.startDate) : new Date(),
            end: job.endDate ? new Date(job.endDate) : new Date(job.startDate || Date.now()),
          },
        }));

      setMyJobs(userJobs);
    }
  }, [user, jobs]);

  // หาว่าวันที่เลือกมีงานอะไรบ้าง
  const jobsOnSelectedDate = selectedDate ? myJobs.filter(job => 
    isWithinInterval(selectedDate, { start: job.dates.start, end: job.dates.end })
  ) : [];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">ปฏิทินงาน</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
                locale={th} // [ใหม่] แสดงผลปฏิทินเป็นภาษาไทย
                modifiers={{
                  hasJob: (date) => {
                    return myJobs.some(job =>
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
              <CardTitle>
                {/* [แก้ไข] เพิ่มการตรวจสอบ `selectedDate` ก่อน format */}
                งานในวันที่: {selectedDate ? format(selectedDate, "PPP", { locale: th }) : "กรุณาเลือกวัน"}
              </CardTitle>
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
                <p className="text-sm text-muted-foreground">ไม่มีงานในวันที่เลือก</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}