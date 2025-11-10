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
import { Separator } from '@/components/ui/separator';

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* --- คอลัมน์ซ้าย: ข้อมูลงาน & TASKS --- */}
                        <div className="space-y-4">
                            <h4 className="font-semibold">ข้อมูลงาน</h4>
                            <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                                <p><strong>หัวข้อ:</strong> {job.title}</p>
                                <p><strong>ประเภท:</strong> {job.jobType}</p>
                                <p><strong>รายละเอียด:</strong> {job.description || "ไม่มี"}</p>
                            </div>

                            <h4 className="font-semibold">ข้อมูลลูกค้า</h4>
                            <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                                <p><strong>ชื่อ:</strong> {job.customerName}</p>
                                <p><strong>โทร:</strong> {job.customerPhone}</p>
                            </div>
                            
                            <h4 className="font-semibold">สถานที่ (รอ Map)</h4>
                            <div className="p-3 bg-muted rounded-md text-sm">
                                <p>{job.location}</p>
                            </div>

                            <Separator className="my-4" />

                            {/* (เครื่องมือสร้าง Task จะอยู่คอลัมน์ซ้าย) */}
                            {isAcknowledged ? (
                                <TaskManagement job={job} />
                            ) : (
                                <p className="text-center text-amber-600 font-semibold p-6">
                                    โปรดกดยืนยันรับทราบงาน (ปุ่มสีเขียวด้านล่าง)
                                    <br />
                                    เพื่อเริ่มการมอบหมายงาน
                                </p>
                            )}
                        </div>

                        {/* --- คอลัมน์ขวา: ข้อมูลระบบ & เลือกช่าง --- */}
                        <div className="space-y-4">
                            <h4 className="font-semibold">ข้อมูลระบบ</h4>
                            <div className="p-3 bg-muted/50 rounded-md text-sm">
                                <p><strong>สถานะ:</strong> {job.status}</p>
                                <p><strong>Admin ผู้สร้าง:</strong> {job.adminCreator}</p>
                                <p><strong>วันที่:</strong> {format(job.startDate, "dd/MM/yy")} - {format(job.endDate, "dd/MM/yy")}</p>
                            </div>
                            
                            <Separator className="my-4" />

                            {/* (เครื่องมือเลือกช่าง จะอยู่คอลัมน์ขวา) */}
                            {isAcknowledged ? (
                                <div className="space-y-4">
                                    <h4 className="font-semibold">มอบหมายทีมช่าง</h4>
                                    <TechSelectMultiDept
                                        jobStartDate={job.startDate}
                                        jobEndDate={job.endDate}
                                        selectedTechIds={draftTechs}
                                        onTechsChange={setDraftTechs}
                                    />
                                    <Button size="sm" className="w-full" onClick={handleSaveTeam}>
                                        บันทึกทีมช่าง
                                    </Button>
                                </div>
                            ) : (
                                null // (ซ่อนไว้ถ้ายังไม่รับงาน)
                            )}
                        </div>

                    </div>
                </ScrollArea>
                {/* ▲▲▲ (แก้ไข!) จบพื้นที่เลื่อน ▲▲▲ */}


                {/* ▼▼▼ (แก้ไข!) Footer จะเหลือแค่ปุ่ม ▼▼▼ */}
                <DialogFooter>
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