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
import { user as ALL_USERS } from '@/data/user';
import { 
    Calendar, 
    MapPin, 
    User, 
    Phone, 
    FileText, 
    Users, 
    CheckCircle2,
    AlertCircle,
    Briefcase,
    Clock,
    Save,
    Trash2,
    X,
    Building2
} from 'lucide-react';

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
                    className="sm:max-w-[95vw] lg:max-w-7xl h-[95vh] flex flex-col p-0 gap-0"
                    onPointerDownOutside={(event) => event.preventDefault()}
                    onEscapeKeyDown={(event) => event.preventDefault()}
                >
                    {/* Compact Header */}
                    <DialogHeader className="px-4 sm:px-6 py-3 border-b bg-gradient-to-r from-primary/5 to-primary/10 shrink-0">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <DialogTitle className="text-lg sm:text-xl font-bold truncate">{job.title}</DialogTitle>
                                    <Badge variant={isAcknowledged ? "default" : "secondary"} className="text-xs shrink-0">
                                        {isAcknowledged ? <><CheckCircle2 className="h-3 w-3 mr-1" /> ดำเนินการ</> : <><AlertCircle className="h-3 w-3 mr-1" /> รอรับทราบ</>}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.id}</span>
                                    <Separator orientation="vertical" className="h-3" />
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(job.createdAt, "dd/MM/yy")}</span>
                                    <Separator orientation="vertical" className="h-3" />
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{job.adminCreator}</span>
                                </div>
                            </div>
                            {!isAcknowledged && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 shrink-0" onClick={handleAcknowledge}>
                                    <CheckCircle2 className="h-3.5 w-3.5 sm:mr-2" />
                                    <span className="hidden sm:inline">ยืนยันรับทราบ</span>
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Main Content with 2 Column Layout */}
                    <ScrollArea className="flex-1 overflow-auto">
                        <div className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                                
                                {/* Left Column */}
                                <div className="space-y-4">
                                    {/* Job Info Card - Compact */}
                                    <Card className="border-primary/20">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                ข้อมูลงาน
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">ประเภท</p>
                                                    <Badge variant="outline" className="text-xs">{job.jobType}</Badge>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">ระยะเวลา</p>
                                                    <p className="text-xs font-medium flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {format(job.startDate, "dd/MM")} - {format(job.endDate, "dd/MM")}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Customer & Location Combined */}
                                    <Card className="border-primary/20">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <User className="h-4 w-4 text-primary" />
                                                ข้อมูลลูกค้าและสถานที่
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3 text-sm">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">ชื่อลูกค้า</p>
                                                    <p className="font-medium">{job.customerName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">เบอร์โทร</p>
                                                    <p className="flex items-center gap-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        {job.customerPhone || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                            {job.customerContactOther && (
                                                <div>
                                                    <p className="text-xs text-muted-foreground mb-0.5">ช่องทางอื่น</p>
                                                    <p className="text-xs">{job.customerContactOther}</p>
                                                </div>
                                            )}
                                            <Separator />
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    สถานที่ปฏิบัติงาน
                                                </p>
                                                <p className="text-xs leading-relaxed mb-2">{job.location}</p>
                                                {job.latitude && job.longitude && (
                                                    <div className="rounded-md overflow-hidden border aspect-video">
                                                        <AdminMap initialPosition={[job.latitude, job.longitude]} readOnly={true} />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Description */}
                                    <Card className="border-primary/20">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-primary" />
                                                รายละเอียดงาน
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
                                                <p>{job.description || "รวมตรวจอัตราการผลิตการยอมรับงานทั่วไปในด้านต่างๆ และยังได้วิเคราะห์ส่วนเสริม"}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    {isAcknowledged ? (
                                        <>
                                            {/* Team Management - Compact */}
                                            <Card className="border-primary/20">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-primary" />
                                                            จัดการทีมงาน
                                                        </CardTitle>
                                                        <Badge variant="secondary" className="text-xs">{draftTechs.length} คน</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    {/* Leader Badge */}
                                                    <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200">
                                                        <div className="p-1 bg-green-100 rounded-full">
                                                            <User className="h-3 w-3 text-green-700" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-green-700 font-medium">หัวหน้า: {user.fname}</p>
                                                        </div>
                                                        <Badge className="bg-green-600 text-xs h-5">รับทราบแล้ว</Badge>
                                                    </div>

                                                    <Separator />

                                                    {/* Tech Selection - Inline Button */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-semibold">เลือกทีมช่าง</p>
                                                            <Button size="sm" variant="outline" onClick={handleSaveTeam} className="h-7 text-xs gap-1">
                                                                <Save className="h-3 w-3" />
                                                                บันทึก
                                                            </Button>
                                                        </div>
                                                        <TechSelectMultiDept
                                                            jobStartDate={job.startDate}
                                                            jobEndDate={job.endDate}
                                                            selectedTechIds={draftTechs}
                                                            onTechsChange={setDraftTechs}
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Assigned Team List - Compact */}
                                            <Card className="border-primary/20">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center justify-between">
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <Users className="h-4 w-4 text-primary" />
                                                            ทีมที่มอบหมาย
                                                        </CardTitle>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Badge variant="outline" className="h-5">{draftTechs.length}</Badge>
                                                            <span className="text-muted-foreground">/</span>
                                                            <Badge variant="outline" className="h-5">{job.tasks.length} งาน</Badge>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    {draftTechs.length > 0 ? (
                                                        <ScrollArea className="max-h-48">
                                                            <div className="space-y-1.5">
                                                                {draftTechs.map(techId => {
                                                                    const tech = ALL_USERS.find(u => String(u.id) === techId);
                                                                    if (!tech) return null;
                                                                    return (
                                                                        <div key={techId} className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                                                                            <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                                                                                <AvatarImage src={tech.avatarUrl || "/placeholder.svg"} />
                                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{tech.fname[0]}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium text-xs truncate">{tech.fname} {tech.lname}</p>
                                                                                <p className="text-[10px] text-muted-foreground truncate">{tech.position}</p>
                                                                            </div>
                                                                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                                                                                {tech.department}
                                                                            </Badge>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </ScrollArea>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                                            <Users className="h-8 w-8 text-muted-foreground/40 mb-2" />
                                                            <p className="text-xs font-medium text-muted-foreground">ยังไม่มีช่าง</p>
                                                            <p className="text-[10px] text-muted-foreground">เลือกจากด้านบน</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Task Management - Full Width on Right */}
                                            <Card className="border-primary/20">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        จัดการงาน (Tasks)
                                                    </CardTitle>
                                                    <CardDescription className="text-xs">สร้างและมอบหมายงานย่อย</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <TaskManagement job={job} />
                                                </CardContent>
                                            </Card>
                                        </>
                                    ) : (
                                        <Card className="border-amber-200 bg-amber-50/50">
                                            <CardContent className="py-8">
                                                <div className="flex flex-col items-center text-center space-y-3">
                                                    <div className="p-3 bg-amber-100 rounded-full">
                                                        <AlertCircle className="h-8 w-8 text-amber-600" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-base">กรุณายืนยันรับทราบงานก่อน</p>
                                                        <p className="text-xs text-muted-foreground max-w-sm">
                                                            คุณจะสามารถจัดการทีมและมอบหมายงานได้หลังจากยืนยัน
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Compact Footer */}
                    <DialogFooter className="border-t bg-muted/30 px-4 sm:px-6 py-2.5 shrink-0">
                        <div className="flex items-center justify-between w-full gap-2">
                            {user.role === 'admin' ? (
                                <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)} className="h-8 text-xs gap-1">
                                    <Trash2 className="h-3 w-3" />
                                    <span className="hidden sm:inline">ลบงาน</span>
                                </Button>
                            ) : <div />}
                            <DialogClose asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                                    <X className="h-3 w-3" />
                                    ปิด
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={(next) => { setIsDeleteDialogOpen(next); if (!next) setDeleteReason(""); }}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            ยืนยันการลบใบงาน
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs space-y-1">
                            <p>การลบจะเป็นการลบถาวรและแจ้งเตือนผู้เกี่ยวข้อง</p>
                            <p className="font-medium">กรุณาระบุเหตุผล:</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={3} placeholder="เหตุผลการลบ" className="text-xs resize-none" />
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90 h-8 text-xs" onClick={() => {
                            if (!deleteReason.trim()) { alert('กรุณาระบุเหตุผลการลบ'); return; }
                            deleteJob(job.id, deleteReason.trim(), user.fname);
                            setIsDeleteDialogOpen(false);
                            setDeleteReason("");
                            onOpenChange(false);
                        }}>ยืนยันลบ</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Team Change Dialog */}
            <AlertDialog open={isReasonDialogOpen} onOpenChange={(nextOpen) => { setIsReasonDialogOpen(nextOpen); if (!nextOpen) { setPendingTeamChanges(null); setTeamChangeReason(""); } }}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            ระบุเหตุผลในการปรับทีม
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs space-y-1">
                            <p>กรุณาแจ้งเหตุผลสำหรับการเพิ่ม/ลบช่าง</p>
                            <p className="text-[10px]">ข้อมูลจะถูกส่งเป็นการแจ้งเตือนไปยังช่างที่เกี่ยวข้อง</p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea value={teamChangeReason} onChange={(e) => setTeamChangeReason(e.target.value)} placeholder="ระบุรายละเอียด เช่น ปรับตามความเหมาะสม" rows={3} className="text-xs resize-none" />
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-8 text-xs">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmTeamChanges} className="h-8 text-xs">ยืนยัน</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}