"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    subMonths,
    subWeeks,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isWithinInterval,
    format
} from "date-fns";
import { th } from "date-fns/locale";
import { CheckCircle2, Calendar, TrendingUp } from "lucide-react";
import type { Job } from "@/types/index";

interface JobStatsProps {
    userId: string | number;
}

type TimeRange = "week" | "month" | "3months";

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

export function JobStats({ userId }: JobStatsProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>("month");
    const [jobs, setJobs] = useState<Job[]>([]);

    useEffect(() => {
        const allJobs = loadJobsFromStorage();
        setJobs(allJobs);
    }, []);

    // ตรวจสอบว่ามีงานที่ user นี้ถูกมอบหมายหรือไม่
    const hasAnyAssignedJobs = useMemo(() => {
        return jobs.some((job) => {
            const assignedTechs = job.assignedTechs || (job as any).assignment?.techIds || [];
            return assignedTechs.some(
                (techId: string | number) => String(techId) === String(userId)
            );
        });
    }, [jobs, userId]);

    // กรองงานที่ user นี้ทำได้จริง (status = 'done' และมี completedAt)
    const completedJobs = useMemo(() => {
        const userJobs = jobs.filter((job) => {
            // ตรวจสอบทั้ง assignedTechs และ assignment.techIds (สำหรับระบบเก่า)
            const assignedTechs = job.assignedTechs || (job as any).assignment?.techIds || [];
            const isAssigned = assignedTechs.some(
                (techId: string | number) => String(techId) === String(userId)
            );
            return isAssigned && job.status === "done" && job.completedAt;
        });

        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (timeRange) {
            case "week":
                startDate = startOfWeek(now, { locale: th });
                endDate = endOfWeek(now, { locale: th });
                break;
            case "month":
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case "3months":
                startDate = subMonths(now, 3);
                break;
        }

        return userJobs.filter((job) => {
            if (!job.completedAt) return false;
            return isWithinInterval(job.completedAt, { start: startDate, end: endDate });
        });
    }, [jobs, userId, timeRange]);

    const count = completedJobs.length;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    สถิติงานที่ทำได้จริง
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* ปุ่มเลือกช่วงเวลา */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={timeRange === "week" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("week")}
                        className="flex-1 min-w-[100px]"
                    >
                        สัปดาห์นี้
                    </Button>
                    <Button
                        variant={timeRange === "month" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("month")}
                        className="flex-1 min-w-[100px]"
                    >
                        เดือนนี้
                    </Button>
                    <Button
                        variant={timeRange === "3months" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTimeRange("3months")}
                        className="flex-1 min-w-[100px]"
                    >
                        3 เดือนนี้
                    </Button>
                </div>

                {/* แสดงจำนวนงาน หรือข้อความเมื่อไม่มีประวัติ */}
                {!hasAnyAssignedJobs ? (
                    <div className="flex items-center justify-center p-6 bg-muted rounded-lg border-2 border-dashed">
                        <div className="text-center">
                            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-lg font-medium text-muted-foreground">
                                ยังไม่มีประวัติการทำงาน
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                ยังไม่มีการมอบหมายงานให้กับผู้ใช้รายนี้
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                                    <span className="text-5xl font-bold text-green-700 dark:text-green-300">
                                        {count}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {timeRange === "week" && "งานที่ทำได้จริงในสัปดาห์นี้"}
                                    {timeRange === "month" && "งานที่ทำได้จริงในเดือนนี้"}
                                    {timeRange === "3months" && "งานที่ทำได้จริงใน 3 เดือนล่าสุด"}
                                </p>
                            </div>
                        </div>

                        {/* ข้อมูลเพิ่มเติม */}
                        {count > 0 && (
                            <div className="text-xs text-muted-foreground text-center">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                งานล่าสุด: {format(completedJobs[0]?.completedAt || new Date(), "dd MMM yyyy", { locale: th })}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

