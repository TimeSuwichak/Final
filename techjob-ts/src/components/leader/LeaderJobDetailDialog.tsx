// src/components/leader/LeaderJobDetailDialog.tsx (ฉบับแก้ไข Layout)
"use client";

import React, { useState, useEffect } from 'react';

import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// (Import เครื่องมือ 2 ชิ้น)
import { TechSelectMultiDept } from './TechSelectMultiDept';
import { TaskManagement } from './TaskManagement';
import type { Job } from '@/types/index';

interface LeaderJobDetailDialogProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeaderJobDetailDialog({ job, open, onOpenChange }: LeaderJobDetailDialogProps) {
    const { updateJobWithActivity } = useJobs();
    const { user } = useAuth(); 

    const [draftTechs, setDraftTechs] = useState<string[]>([]);
    useEffect(() => {
        if (job) {
            setDraftTechs(job.assignedTechs);
        }
    }, [job]);


    if (!job || !user) return null;

    // --- ฟังก์ชัน "รับทราบงาน" ---
    const handleAcknowledge = () => {
        updateJobWithActivity(
            job.id,
            { status: 'in-progress' },
            'acknowledge',
            "หัวหน้างานรับทราบและยืนยันใบงาน",
            user.fname,
            'leader'
        );
        // (เราจะไม่ปิด Pop-up เพื่อให้ Leader จ่ายงานต่อได้เลย)
    };

    // --- ฟังก์ชัน "บันทึกทีมช่าง" ---
    const handleSaveTeam = () => {
        if (JSON.stringify(draftTechs) === JSON.stringify(job.assignedTechs)) {
            alert("ไม่ได้เปลี่ยนแปลงทีมช่าง");
            return;
        }
        updateJobWithActivity(
            job.id,
            { assignedTechs: draftTechs },
            'tech_assigned',
            `อัปเดต/มอบหมายทีมช่างเทคนิค (${draftTechs.length} คน)`,
            user.fname,
            'leader',
            { techIds: draftTechs }
        );
        alert("บันทึกทีมช่างเรียบร้อย!");
    };

    const isAcknowledged = job.status !== 'new';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* ▼▼▼ (แก้ไข!) ขยาย Pop-up ให้กว้างขึ้น ▼▼▼ */}
            <DialogContent className="sm:max-w-4xl max-h-[90vh]"> 
                <DialogHeader>
                    <DialogTitle>รายละเอียดใบงาน: {job.id}</DialogTitle>
                </DialogHeader>

                {/* ▼▼▼ (แก้ไข!) นี่คือ Layout ที่ถูกต้อง ▼▼▼ */}
                <ScrollArea className="h-[70vh] p-4">
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                                    {job.title}
                                    <Badge variant={isAcknowledged ? "secondary" : "default"}>
                                        {isAcknowledged ? "กำลังดำเนินการ" : "รอรับทราบ"}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    สร้างโดย {job.adminCreator} เมื่อ {format(job.createdAt, "dd/MM/yyyy")}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p><strong>ประเภทงาน:</strong> {job.jobType}</p>
                                        <p><strong>สถานะ:</strong> {job.status}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p>
                                            <strong>ช่วงเวลางาน:</strong> {format(job.startDate, "dd/MM/yyyy")} - {format(job.endDate, "dd/MM/yyyy")}
                                        </p>
                                        <p><strong>จำนวนงานย่อย:</strong> {job.tasks.length} งาน</p>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                                    <p className="font-semibold">รายละเอียดงาน</p>
                                    <p>{job.description || "(ไม่มีรายละเอียดเพิ่มเติม)"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>ข้อมูลลูกค้า</CardTitle>
                                <CardDescription>ช่องทางติดต่อและสถานที่ปฏิบัติงาน</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
                                <div className="space-y-2">
                                    <p><strong>ชื่อลูกค้า:</strong> {job.customerName}</p>
                                    <p><strong>โทร:</strong> {job.customerPhone || "-"}</p>
                                    <p><strong>ติดต่ออื่น:</strong> {job.customerContactOther || "-"}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold">สถานที่</p>
                                    <div className="rounded-md border border-dashed p-3 text-muted-foreground">
                                        {job.location}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>ทีมงานและการมอบหมาย</CardTitle>
                                <CardDescription>กำหนดหัวหน้างานและเลือกทีมช่างที่พร้อมทำงาน</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">หัวหน้างาน</p>
                                        <p className="text-base font-semibold">{user.fname}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">สถานะหัวหน้างาน</p>
                                        <p className="text-base font-semibold">
                                            {isAcknowledged ? "รับทราบแล้ว" : "รอรับทราบ"}
                                        </p>
                                    </div>
                                </div>

                                {isAcknowledged ? (
                                    <>
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold">เลือกทีมช่าง</p>
                                            <TechSelectMultiDept
                                                jobStartDate={job.startDate}
                                                jobEndDate={job.endDate}
                                                selectedTechIds={draftTechs}
                                                onTechsChange={setDraftTechs}
                                            />
                                            <Button size="sm" className="w-full md:w-auto" onClick={handleSaveTeam}>
                                                บันทึกทีมช่าง
                                            </Button>
                                        </div>
                                        <Separator className="my-2" />
                                        <TaskManagement job={job} />
                                    </>
                                ) : (
                                    <div className="rounded-md bg-amber-100/80 p-4 text-center text-sm font-medium text-amber-700">
                                        โปรดกดยืนยันรับทราบงานก่อน เพื่อจัดการทีมและงานย่อย
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
                <DialogFooter className="mt-4 border-t pt-4">
                    <DialogClose asChild><Button variant="outline">ปิด</Button></DialogClose>

                    {/* (ปุ่มรับทราบงาน จะอยู่ที่นี่ที่เดียว) */}
                    {!isAcknowledged && (
                        <Button 
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleAcknowledge}
                        >
                            ยืนยันรับทราบงาน
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}