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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TechSelectMultiDept } from './TechSelectMultiDept';
import { TaskManagement } from './TaskManagement';
import { AdminMap } from "../admin/AdminMap"
import type { Job } from '@/types/index';
import { useNotifications } from '@/contexts/NotificationContext';
import { user as ALL_USERS } from '@/data/user'; // Import user data for displaying applicants

interface LeaderJobDetailDialogProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeaderJobDetailDialog({ job, open, onOpenChange }: LeaderJobDetailDialogProps) {
    const { updateJobWithActivity, deleteJob } = useJobs();
    const { user } = useAuth(); 
    const { addNotification } = useNotifications();

    const [draftTechs, setDraftTechs] = useState<string[]>([]);
    const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
    const [teamChangeReason, setTeamChangeReason] = useState("");
    const [pendingTeamChanges, setPendingTeamChanges] = useState<{ added: string[]; removed: string[] } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteReason, setDeleteReason] = useState("");

    useEffect(() => {
        if (job) {
            setDraftTechs(job.assignedTechs);
        }
    }, [job]);


    if (!job || !user) return null;

    const handleAcknowledge = () => {
        updateJobWithActivity(
            job.id,
            { status: 'in-progress' },
            'acknowledge',
            "หัวหน้างานรับทราบและยืนยันใบงาน",
            user.fname,
            'leader'
        );
    };

    const handleSaveTeam = () => {
        const normalizedDraft = [...draftTechs].sort();
        const normalizedCurrent = [...job.assignedTechs].sort();

        if (JSON.stringify(normalizedDraft) === JSON.stringify(normalizedCurrent)) {
            alert("ไม่ได้เปลี่ยนแปลงทีมช่าง");
            return;
        }
        const added = draftTechs.filter((techId) => !job.assignedTechs.includes(techId));
        const removed = job.assignedTechs.filter((techId) => !draftTechs.includes(techId));

        setPendingTeamChanges({ added, removed });
        setTeamChangeReason("");
        setIsReasonDialogOpen(true);
    };

    const handleConfirmTeamChanges = () => {
        if (!pendingTeamChanges) return;
        if (!teamChangeReason.trim()) {
            alert("กรุณาระบุเหตุผลในการเปลี่ยนแปลงทีมช่าง");
            return;
        }

        const reasonText = teamChangeReason.trim();

        updateJobWithActivity(
            job.id,
            { assignedTechs: draftTechs },
            'tech_assigned',
            `อัปเดตทีมช่าง (${draftTechs.length} คน) - เหตุผล: ${reasonText}`,
            user.fname,
            'leader',
            {
                techIds: draftTechs,
                added: pendingTeamChanges.added,
                removed: pendingTeamChanges.removed,
                reason: reasonText,
            }
        );

        pendingTeamChanges.added.forEach((techId) => {
            addNotification({
                title: "ได้รับมอบหมายงานใหม่",
                message: `คุณถูกเพิ่มเข้าทีมงาน "${job.title}" โดย ${user.fname}. เหตุผล: ${reasonText}`,
                recipientRole: "user",
                recipientId: techId,
                relatedJobId: job.id,
                metadata: {
                    type: "team_assignment_added",
                    jobId: job.id,
                    leaderId: user?.id ? String(user.id) : undefined,
                },
            });
        });

        pendingTeamChanges.removed.forEach((techId) => {
            addNotification({
                title: "มีการถอดคุณออกจากงาน",
                message: `คุณถูกถอดออกจากทีมงาน "${job.title}" โดย ${user.fname}. เหตุผล: ${reasonText}`,
                recipientRole: "user",
                recipientId: techId,
                relatedJobId: job.id,
                metadata: {
                    type: "team_assignment_removed",
                    jobId: job.id,
                    leaderId: user?.id ? String(user.id) : undefined,
                },
            });
        });

        setIsReasonDialogOpen(false);
        setPendingTeamChanges(null);
        setTeamChangeReason("");
        alert("บันทึกทีมช่างเรียบร้อย!");
    };

    const isAcknowledged = job.status !== 'new';

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-6xl max-h-[90vh] flex flex-col"
                onPointerDownOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
            > 
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl">{job.id}</DialogTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant={isAcknowledged ? "secondary" : "default"}>
                                    {isAcknowledged ? "กำลังดำเนินการ" : "รอรับทราบ"}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    สร้างเมื่อ {format(job.createdAt, "dd/MM/yyyy")}
                                </span>
                            </div>
                        </div>
                        {!isAcknowledged && (
                            <Button 
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={handleAcknowledge}
                            >
                                ยืนยันรับทราบงาน
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-auto">
                    <div className="p-6 space-y-6">
                        
                       

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            <Card className="lg:col-span-1">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <CardTitle className="text-lg">ข้อมูลงาน</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">หัวข้องาน</p>
                                            <p className="font-medium">{job.title}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">ประเภทงาน</p>
                                            <p className="font-medium">{job.jobType}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">วันที่เริ่มต้น-สิ้นสุด</p>
                                            <p className="font-medium">{format(job.startDate, "dd/MM/yyyy")} - {format(job.endDate, "dd/MM/yyyy")}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">ผู้สร้าง</p>
                                            <p className="font-medium">โดย {job.adminCreator} เมื่อ {format(job.createdAt, "dd/MM/yyyy")}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-1">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <CardTitle className="text-lg">ข้อมูลลูกค้า</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">ชื่อลูกค้า</p>
                                            <p className="font-medium">{job.customerName}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                                            <p className="font-medium">{job.customerPhone || "-"}</p>
                                        </div>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">ช่องทางติดต่ออื่น</p>
                                            <p className="font-medium">{job.customerContactOther || "ไม่มีข้อมูล"}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-1">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2 text-primary">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <CardTitle className="text-lg">สถานที่ปฏิบัติงาน</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{job.location}</p>
                                    </div>
                                    {job.latitude && job.longitude && (
                                        <div className="rounded-lg overflow-hidden border">
                                            <AdminMap
                                                
                                                initialPosition={[job.latitude, job.longitude]}
                                                readOnly={true}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                    </svg>
                                    <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
                                    <p>{job.description || "รวมตรวจอัตราการผลิตการยอมรับงานทั่วไปในด้านต่างๆ และยังได้วิเคราะห์ส่วนเสริม"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {isAcknowledged ? (
                            <>
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center gap-2 text-primary">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <CardTitle className="text-lg">ทีมงานและการมอบหมาย</CardTitle>
                                        </div>
                                        <CardDescription>กำหนดหัวหน้างานและเลือกทีมช่างที่พร้อมทำงาน</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <p className="text-xs uppercase text-muted-foreground mb-1">หัวหน้างาน</p>
                                                <p className="text-base font-semibold">{user.fname}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase text-muted-foreground mb-1">สถานะหัวหน้างาน</p>
                                                <p className="text-base font-semibold">รับทราบแล้ว</p>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-3">
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
                                        <Separator />
                                        <TaskManagement job={job} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-primary">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <CardTitle className="text-lg">ผู้ที่ได้รับมอบหมาย({draftTechs.length} คน)</CardTitle>
                                            </div>
                                            <Badge variant="outline">{draftTechs.length} คน / {job.tasks.length} งาน</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {draftTechs.length > 0 ? (
                                            <div className="space-y-2">
                                                {draftTechs.map(techId => {
                                                    const tech = ALL_USERS.find(u => String(u.id) === techId);
                                                    if (!tech) return null;
                                                    return (
                                                        <div key={techId} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={tech.avatarUrl || "/placeholder.svg"} />
                                                                <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{tech.fname} {tech.lname}</p>
                                                                <p className="text-xs text-muted-foreground">{tech.position}</p>
                                                            </div>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {tech.department}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <svg className="h-16 w-16 text-muted-foreground/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <p className="text-sm font-medium text-muted-foreground">ยังไม่มีการมอบหมายงาน</p>
                                                <p className="text-xs text-muted-foreground mt-1">กรุณาเลือกทีมช่างจากด้านบน</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <Card>
                                <CardContent className="py-12">
                                    <div className="flex flex-col items-center justify-center text-center space-y-3">
                                        <div className="rounded-full bg-amber-100 p-3">
                                            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">กรุณายืนยันรับทราบงานก่อน</p>
                                            <p className="text-sm text-muted-foreground mt-1">คุณจะสามารถจัดการทีมและมอบหมายงานได้หลังจากยืนยัน</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </ScrollArea>
                
                <DialogFooter className="border-t bg-background p-4">
                    <DialogClose asChild><Button variant="outline">ปิด</Button></DialogClose>
                    {user.role === 'admin' && (
                        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                            ลบงาน
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={(next) => {
                setIsDeleteDialogOpen(next);
                if (!next) setDeleteReason("");
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ยืนยันการลบใบงาน</AlertDialogTitle>
                    <AlertDialogDescription>
                        การลบใบงานจะเป็นการลบถาวรและแจ้งเตือนไปยังหัวหน้าและช่างที่เกี่ยวข้อง
                        กรุณาระบุเหตุผลสั้น ๆ
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={4} placeholder="เหตุผลการลบ เช่น งานยกเลิก ลูกค้าขอเลื่อน" />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            if (!deleteReason.trim()) {
                                alert('กรุณาระบุเหตุผลการลบ');
                                return;
                            }
                            deleteJob(job.id, deleteReason.trim(), user.fname);
                            setIsDeleteDialogOpen(false);
                            setDeleteReason("");
                            onOpenChange(false);
                        }}
                    >
                        ยืนยันลบ
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <AlertDialog
            open={isReasonDialogOpen}
            onOpenChange={(nextOpen) => {
                setIsReasonDialogOpen(nextOpen);
                if (!nextOpen) {
                    setPendingTeamChanges(null);
                    setTeamChangeReason("");
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>ระบุเหตุผลในการปรับทีมช่าง</AlertDialogTitle>
                    <AlertDialogDescription>
                        กรุณาแจ้งเหตุผลสำหรับการเพิ่ม/ลบช่างออกจากงานนี้ ข้อมูลนี้จะถูกส่งเป็นการแจ้งเตือนไปยังช่างที่เกี่ยวข้อง
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3 py-2">
                    <Textarea
                        value={teamChangeReason}
                        onChange={(event) => setTeamChangeReason(event.target.value)}
                        placeholder="ระบุรายละเอียด เช่น ปรับตามความเหมาะสม หรือมีการเปลี่ยนแปลงตารางงาน"
                        rows={4}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmTeamChanges}>
                        ยืนยันและแจ้งเตือน
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
