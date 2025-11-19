"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isWithinInterval, format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { Job } from "@/types/index";

interface UserJobCalendarProps {
    userId: string | number;
}

// ฟังก์ชันโหลดข้อมูลงานจาก localStorage
const loadJobsFromStorage = (): Job[] => {
    const jobs: Job[] = [];

    // ลองโหลดจาก techJobData_v2 ก่อน (ระบบใหม่)
    try {
        const dataV2 = localStorage.getItem("techJobData_v2");
        if (dataV2) {
            const parsed = JSON.parse(dataV2);
            if (Array.isArray(parsed)) {
                parsed.forEach((job: any) => {
                    jobs.push({
                        ...job,
                        startDate: new Date(job.startDate),
                        endDate: new Date(job.endDate),
                        createdAt: new Date(job.createdAt),
                        completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
                    });
                });
            }
        }
    } catch (e) {
        console.error("Failed to load techJobData_v2", e);
    }

    // ลองโหลดจาก techJobData (ระบบเก่า)
    try {
        const data = localStorage.getItem("techJobData");
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.jobs && Array.isArray(parsed.jobs)) {
                parsed.jobs.forEach((job: any) => {
                    // ตรวจสอบว่า job นี้ยังไม่มีใน jobs array
                    if (!jobs.find(j => j.id === job.id)) {
                        jobs.push({
                            ...job,
                            startDate: job.dates?.start ? new Date(job.dates.start) : new Date(job.startDate),
                            endDate: job.dates?.end ? new Date(job.dates.end) : new Date(job.endDate),
                            createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
                            completedAt: job.completedAt ? new Date(job.completedAt) : undefined,
                        });
                    }
                });
            }
        }
    } catch (e) {
        console.error("Failed to load techJobData", e);
    }

    return jobs;
};

export function UserJobCalendar({ userId }: UserJobCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const allJobs = loadJobsFromStorage();
        setJobs(allJobs);
    }, []);

    // กรองงานที่ user นี้ถูกมอบหมาย
    const userJobs = useMemo(() => {
        return jobs.filter((job) => {
            // ตรวจสอบทั้ง assignedTechs และ assignment.techIds (สำหรับระบบเก่า)
            const assignedTechs = job.assignedTechs || (job as any).assignment?.techIds || [];
            return assignedTechs.some(
                (techId: string | number) => String(techId) === String(userId)
            );
        });
    }, [jobs, userId]);

    // หาวันที่ที่มีงาน
    const hasJobOnDate = (date: Date) => {
        return userJobs.some((job) => {
            const jobStart = new Date(job.startDate);
            const jobEnd = new Date(job.endDate);
            jobStart.setHours(0, 0, 0, 0);
            jobEnd.setHours(23, 59, 59, 999);
            date.setHours(0, 0, 0, 0);
            return isWithinInterval(date, { start: jobStart, end: jobEnd });
        });
    };

    // หางานในวันที่เลือก
    const jobsOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return userJobs.filter((job) => {
            const jobStart = new Date(job.startDate);
            const jobEnd = new Date(job.endDate);
            jobStart.setHours(0, 0, 0, 0);
            jobEnd.setHours(23, 59, 59, 999);
            const date = new Date(selectedDate);
            date.setHours(0, 0, 0, 0);
            return isWithinInterval(date, { start: jobStart, end: jobEnd });
        });
    }, [userJobs, selectedDate]);

    // ตรวจสอบว่ามีงานที่ user นี้ถูกมอบหมายหรือไม่
    const hasAnyJobs = userJobs.length > 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>ปฏิทินงานที่ได้รับมอบหมาย</CardTitle>
            </CardHeader>
            <CardContent>
                {!hasAnyJobs ? (
                    <div className="flex items-center justify-center p-12 bg-muted rounded-lg border-2 border-dashed">
                        <div className="text-center">
                            <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-lg font-medium text-muted-foreground">
                                ยังไม่มีประวัติการทำงาน
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                ยังไม่มีการมอบหมายงานให้กับผู้ใช้รายนี้
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ปฏิทิน */}
                        <div>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border"
                                locale={th}
                                modifiers={{
                                    hasJob: (date) => hasJobOnDate(date),
                                }}
                                modifiersClassNames={{
                                    hasJob: "bg-primary/20 text-primary-foreground rounded-md font-semibold",
                                }}
                            />
                        </div>

                        {/* รายการงานในวันที่เลือก */}
                        <div>
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-2">
                                    {selectedDate
                                        ? `งานในวันที่: ${format(selectedDate, "PPP", { locale: th })}`
                                        : "กรุณาเลือกวัน"}
                                </h3>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {jobsOnSelectedDate.length > 0 ? (
                                    jobsOnSelectedDate.map((job) => (
                                        <div
                                            key={job.id}
                                            className="p-3 bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm mb-1">{job.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {job.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-full ${job.status === "done"
                                                                    ? "bg-green-500/20 text-green-700 dark:text-green-400"
                                                                    : job.status === "in-progress"
                                                                        ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                                                        : "bg-gray-500/20 text-gray-700 dark:text-gray-400"
                                                                }`}
                                                        >
                                                            {job.status === "done"
                                                                ? "เสร็จสิ้น"
                                                                : job.status === "in-progress"
                                                                    ? "กำลังดำเนินการ"
                                                                    : "ใหม่"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(job.startDate), "dd/MM/yyyy", { locale: th })} -{" "}
                                                            {format(new Date(job.endDate), "dd/MM/yyyy", { locale: th })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="text-sm">ไม่มีงานในวันที่เลือก</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

