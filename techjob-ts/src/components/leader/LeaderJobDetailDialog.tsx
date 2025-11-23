"use client";

import React, { useState, useEffect } from "react";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TechSelectMultiDept } from "./TechSelectMultiDept";
import { TaskManagement } from "./TaskManagement";
import { AdminMap } from "../admin/AdminMap";
import type { Job } from "@/types/index";
import { useNotifications } from "@/contexts/NotificationContext";
import { user as ALL_USERS } from "@/Data/user";
import { generateCompletionReportPdf } from "@/utils/jobReport";
import { useNavigate } from "react-router-dom";
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
   Building2, 
   MessageSquare, 
   Map, 
   ClipboardList, 
   ExternalLink,
    ImageIcon
  } from "lucide-react";
  import { PdfViewer } from "@/components/common/PdfViewer";

interface LeaderJobDetailDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaderJobDetailDialog({
  job,
  open,
  onOpenChange,
}: LeaderJobDetailDialogProps) {
  const { updateJobWithActivity, deleteJob } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const [draftTechs, setDraftTechs] = useState<string[]>([]);
  const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isCompletionSuccessOpen, setIsCompletionSuccessOpen] = useState(false);
  const [completionSummary, setCompletionSummary] = useState("");
  const [completionIssues, setCompletionIssues] = useState("");
  const [completionIssueImage, setCompletionIssueImage] = useState<string | null>(null);
  const [completionIssueImageName, setCompletionIssueImageName] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (job) {
      setDraftTechs(job.assignedTechs);
    }
  }, [job]);

  if (!job || !user) return null;

  const getTechDisplayName = (techId: string) => {
    const tech = ALL_USERS.find(
      (person) => String(person.id) === String(techId)
    );
    return tech ? `${tech.fname} ${tech.lname}` : `ช่างรหัส ${techId}`;
  };

  const handleAcknowledge = () => {
    updateJobWithActivity(
      job.id,
      { status: "in-progress" },
      "acknowledge",
      "หัวหน้างานรับทราบและยืนยันใบงาน",
      user.fname,
      "leader"
    );
  };

  const handleSaveTeam = () => {
    const normalizedDraft = [...draftTechs].sort();
    const normalizedCurrent = [...job.assignedTechs].sort();

    if (JSON.stringify(normalizedDraft) === JSON.stringify(normalizedCurrent)) {
      return;
    }
    
    const added = draftTechs.filter(
      (techId) => !job.assignedTechs.includes(techId)
    );
    const removed = job.assignedTechs.filter(
      (techId) => !draftTechs.includes(techId)
    );

    updateJobWithActivity(
      job.id,
      { assignedTechs: draftTechs },
      "tech_assigned",
      `อัปเดตทีมช่าง (${draftTechs.length} คน)`,
      user.fname,
      "leader",
      {
        techIds: draftTechs,
        added: added,
        removed: removed,
      }
    );

    added.forEach((techId) => {
      addNotification({
        title: "ได้รับมอบหมายงานใหม่",
        message: `คุณถูกเพิ่มเข้าทีมงาน "${job.title}" โดย ${user.fname}`,
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

    removed.forEach((techId) => {
      addNotification({
        title: "มีการถอดคุณออกจากงาน",
        message: `คุณถูกถอดออกจากทีมงาน "${job.title}" โดย ${user.fname}`,
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

    setIsSaveSuccessOpen(true);
  };

  const handleCompleteJobClick = () => {
    setIsCompleteConfirmOpen(true);
  };

  const handleConfirmCompleteAndOpenSummary = () => {
    setIsCompleteConfirmOpen(false);
    setCompletionSummary("");
    setCompletionIssues("");
    setCompletionIssueImage(null);
    setCompletionIssueImageName("");
    setIsCompletionDialogOpen(true);
  };

  const handleCompletionImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCompletionIssueImage(null);
      setCompletionIssueImageName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCompletionIssueImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    setCompletionIssueImageName(file.name);
  };

  const handleSubmitCompletion = () => {
    if (!completionSummary.trim()) {
      alert("กรุณากรอกสรุปผลการทำงาน");
      return;
    }
    setIsGeneratingReport(true);

    updateJobWithActivity(
      job.id,
      {
        status: "done",
        completionSummary: completionSummary.trim(),
        completionIssues: completionIssues.trim(),
        completionIssueImage: completionIssueImage || undefined,
        completedAt: new Date(),
        leaderCloser: user.fname,
      },
      "status_changed",
      "หัวหน้าสรุปและปิดงานเรียบร้อย",
      user.fname,
      "leader",
      {
        summary: completionSummary.trim(),
        issues: completionIssues.trim(),
      }
    );

    addNotification({
      title: "หัวหน้าปิดงานเรียบร้อย",
      message: `งาน ${job.title} ถูกปิดโดย ${user.fname}`,
      recipientRole: "admin",
      relatedJobId: job.id,
      metadata: {
        type: "job_completed",
        jobId: job.id,
      },
    });

    job.assignedTechs.forEach((techId) => {
      addNotification({
        title: "งานที่คุณอยู่เสร็จสิ้นแล้ว",
        message: `หัวหน้า ${user.fname} ปิดงาน ${job.title}`,
        recipientRole: "user",
        recipientId: techId,
        relatedJobId: job.id,
        metadata: {
          type: "job_completed",
          jobId: job.id,
        },
      });
    });

    setIsGeneratingReport(false);
    setIsCompletionDialogOpen(false);
    setIsCompletionSuccessOpen(true);
  };

  const handleDownloadReport = () => {
    generateCompletionReportPdf(job);
  };

  // const handleGoToTracking = () => {
  //   onOpenChange(false);
  //   navigate('/leader/tracking');
  // };

  const handleGoToWorkOrderDetail = () => {
    onOpenChange(false);
    navigate(`/leader/workorder/${job.id}`);
  };

  const isAcknowledged = job.status !== "new";
  const isCompleted = job.status === "done";
  const statusLabel = isCompleted
    ? "เสร็จสิ้น"
    : isAcknowledged
    ? "กำลังดำเนินการ"
    : "รอรับทราบ";
  const statusBadgeClass = isCompleted
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : isAcknowledged
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-[95vw] lg:max-w-7xl h-[95vh] flex flex-col p-0 gap-0"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          {/* Compact Header */}
          <DialogHeader className="px-4 sm:px-6 py-3 border-b bg-linear-to-r from-primary/5 to-primary/10 shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-lg sm:text-xl font-bold truncate">
                    {job.title}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 border ${statusBadgeClass} gap-1`}
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {job.id}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(job.createdAt, "dd/MM/yy")}
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {job.adminCreator}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={handleGoToWorkOrderDetail}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">ดูรายละเอียดแบบเต็ม</span>
                </Button>
    {/*------------------------------------- เเบบเก่า  -----------------------------------------   */}
                {/* {isAcknowledged && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={handleGoToTracking}
                  >
                    <Map className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">ติดตามช่าง</span>
                  </Button>
                )} */}
              {!isAcknowledged && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 shrink-0"
                  onClick={handleAcknowledge}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 sm:mr-2" />
                  <span className="hidden sm:inline">ยืนยันรับทราบ</span>
                </Button>
              )}
              </div>
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
                          <p className="text-xs text-muted-foreground mb-0.5">
                            ประเภท
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {job.jobType}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            ระยะเวลา
                          </p>
                          <p className="text-xs font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(job.startDate, "dd/MM")} -{" "}
                            {format(job.endDate, "dd/MM")}
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
                          <p className="text-xs text-muted-foreground mb-0.5">
                            ชื่อลูกค้า
                          </p>
                          <p className="font-medium">{job.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            เบอร์โทร
                          </p>
                          <p className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {job.customerPhone || "-"}
                          </p>
                        </div>
                      </div>
                      {job.customerContactOther && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">
                            ช่องทางอื่น
                          </p>
                          <p className="text-xs">{job.customerContactOther}</p>
                        </div>
                      )}
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          สถานที่ปฏิบัติงาน
                        </p>
                        <p className="text-xs leading-relaxed mb-2">
                          {job.location}
                        </p>
                        {job.latitude && job.longitude && (
                          <div className="rounded-md overflow-hidden border aspect-video">
                            <AdminMap
                              initialPosition={[job.latitude, job.longitude]}
                              readOnly={true}
                            />
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
                        <p>
                          {job.description ||
                            "รวมตรวจอัตราการผลิตการยอมรับงานทั่วไปในด้านต่างๆ และยังได้วิเคราะห์ส่วนเสริม"}
                        </p>
                      </div>
                        {job.imageUrl && (
                        <div className="pt-2">
                          <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            รูปภาพหน้างาน
                          </p>
                          <div className="rounded-md overflow-hidden border border-border">
                            <img
                              src={job.imageUrl || "/placeholder.svg"}
                              alt="รูปภาพหน้างาน"
                              className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(job.imageUrl, '_blank')}
                            />
                          </div>
                        </div>
                      )}
                      
                      
                      
                    </CardContent>
                  </Card>

                  {job.pdfFiles && job.pdfFiles.length > 0 && (
                    <PdfViewer pdfFiles={job.pdfFiles} />
                  )}

                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {isCompleted ? (
                    <>
                      <Card className="border-emerald-200 bg-emerald-50/40">
                        <CardHeader className="pb-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                                <CheckCircle2 className="h-4 w-4" />
                                สรุปผลการปิดงาน
                              </CardTitle>
                              <CardDescription className="text-xs">
                                ตรวจสอบสรุปงานและดาวน์โหลดเอกสารได้ที่นี่
                              </CardDescription>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadReport}
                              className="h-8 text-xs gap-1"
                            >
                              <FileText className="h-3 w-3" />
                              ดาวน์โหลดเอกสาร
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              สรุปผลการทำงาน
                            </p>
                            <p className="mt-1">
                              {job.completionSummary || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              ปัญหาที่พบ
                            </p>
                            <p className="mt-1">
                              {job.completionIssues || "-"}
                            </p>
                          </div>
                          {job.completionIssueImage && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                รูปภาพประกอบ
                              </p>
                              <div className="rounded-md border overflow-hidden max-h-60 bg-white">
                                <img
                                  src={job.completionIssueImage}
                                  alt="หลักฐานการปิดงาน"
                                  className="w-full object-contain max-h-60"
                                />
                              </div>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            ปิดงานโดย{" "}
                            <span className="font-medium text-foreground">
                              {job.leaderCloser || user.fname}
                            </span>{" "}
                            เมื่อ{" "}
                            {job.completedAt
                              ? format(
                                  new Date(job.completedAt),
                                  "dd MMM yyyy HH:mm",
                                  { locale: th }
                                )
                              : "-"}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-emerald-200">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-emerald-700" />
                              รายการงานย่อย
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                              {job.tasks.length} งาน
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {job.tasks.length > 0 ? (
                            <div className="space-y-2">
                              {job.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="rounded-md border p-3 bg-white/80"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium text-sm">
                                      {task.title}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className={
                                        task.status === "completed"
                                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                          : task.status === "in-progress"
                                          ? "bg-amber-100 text-amber-800 border-amber-200"
                                          : "bg-blue-100 text-blue-800 border-blue-200"
                                      }
                                    >
                                      {task.status === "completed"
                                        ? "เสร็จสิ้น"
                                        : task.status === "in-progress"
                                        ? "กำลังทำ"
                                        : "รอดำเนินการ"}
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                  {task.updates.length > 0 && (
                                    <div className="mt-2 rounded-md bg-muted/40 p-2 text-xs space-y-1">
                                      {task.updates.map((update, index) => (
                                        <div key={index}>
                                          <p className="font-medium text-foreground">
                                            {update.updatedBy}{" "}
                                            <span className="text-[10px] text-muted-foreground">
                                              {format(
                                                update.updatedAt,
                                                "dd/MM HH:mm"
                                              )}
                                            </span>
                                          </p>
                                          <p className="text-muted-foreground">
                                            {update.message}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground py-6">
                              ยังไม่มีงานย่อย
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  ) : isAcknowledged ? (
                    <>
                      {/* Team Management - Compact */}
                      <Card className="border-primary/20">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              จัดการทีมงาน
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {draftTechs.length} คน
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Leader Badge */}
                          <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200">
                            <div className="p-1 bg-green-100 rounded-full">
                              <User className="h-3 w-3 text-green-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-green-700 font-medium">
                                หัวหน้า: {user.fname}
                              </p>
                            </div>
                            <Badge className="bg-green-600 text-xs h-5">
                              รับทราบแล้ว
                            </Badge>
                          </div>

                          <Separator />

                          {/* Tech Selection - Inline Button */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold">
                                เลือกทีมช่าง
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSaveTeam}
                                className="h-7 text-xs gap-1"
                              >
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
                              <Badge variant="outline" className="h-5">
                                {draftTechs.length}
                              </Badge>
                              <span className="text-muted-foreground">/</span>
                              <Badge variant="outline" className="h-5">
                                {job.tasks.length} งาน
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {draftTechs.length > 0 ? (
                            <ScrollArea className="max-h-48">
                              <div className="space-y-1.5">
                                {draftTechs.map((techId) => {
                                  const tech = ALL_USERS.find(
                                    (u) => String(u.id) === techId
                                  );
                                  if (!tech) return null;
                                  return (
                                    <div
                                      key={techId}
                                      className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                      <Avatar className="h-8 w-8 ring-1 ring-primary/10">
                                        <AvatarImage
                                          src={
                                            tech.avatarUrl || "/placeholder.svg"
                                          }
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                          {tech.fname[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-xs truncate">
                                          {tech.fname} {tech.lname}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground truncate">
                                          {tech.position}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] h-4 px-1.5 shrink-0"
                                      >
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
                              <p className="text-xs font-medium text-muted-foreground">
                                ยังไม่มีช่าง
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                เลือกจากด้านบน
                              </p>
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
                          <CardDescription className="text-xs">
                            สร้างและมอบหมายงานย่อย
                          </CardDescription>
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
                            <p className="font-semibold text-base">
                              กรุณายืนยันรับทราบงานก่อน
                            </p>
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
              {user.role === "admin" ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 text-xs gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="hidden sm:inline">ลบงาน</span>
                </Button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                  >
                    <X className="h-3 w-3" />
                    ปิด
                  </Button>
                </DialogClose>
                {job.status !== "done" && (
                  <Button
                    size="sm"
                    className="h-8 text-xs gap-1 bg-blue-600 hover:bg-blue-700"
                    onClick={handleCompleteJobClick}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    จบงาน
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(next) => {
          setIsDeleteDialogOpen(next);
          if (!next) setDeleteReason("");
        }}
      >
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
          <Textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="เหตุผลการลบ"
            className="text-xs resize-none"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 h-8 text-xs"
              onClick={() => {
                if (!deleteReason.trim()) {
                  alert("กรุณาระบุเหตุผลการลบ");
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

      {/* Save Success Dialog */}
      <AlertDialog
        open={isSaveSuccessOpen}
        onOpenChange={setIsSaveSuccessOpen}
      >
        <AlertDialogContent className="max-w-sm text-center space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2 justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              บันทึกเสร็จสิ้น
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogAction
              className="h-8 text-xs"
              onClick={() => setIsSaveSuccessOpen(false)}
            >
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Job Confirmation */}
      <AlertDialog
        open={isCompleteConfirmOpen}
        onOpenChange={setIsCompleteConfirmOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              ยืนยันการปิดงาน?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-1">
              <p>เมื่อปิดงานแล้วจะไม่สามารถแก้ไขข้อมูลได้</p>
              <p>ระบบจะให้คุณสรุปผลการทำงานและดาวน์โหลดรายงาน PDF</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 text-xs"
              onClick={handleConfirmCompleteAndOpenSummary}
            >
              ดำเนินการต่อ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Completion Summary Dialog */}
      <Dialog
        open={isCompletionDialogOpen}
        onOpenChange={(next) => {
          setIsCompletionDialogOpen(next);
          if (!next) {
            setCompletionSummary("");
            setCompletionIssues("");
            setCompletionIssueImage(null);
            setCompletionIssueImageName("");
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">สรุปและปิดงาน</DialogTitle>
            <DialogDescription className="text-xs">
              ตรวจสอบข้อมูลทีมและสรุปผลก่อนยืนยันการปิดงาน
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border rounded-md p-3 bg-muted/30">
              <div>
                <p className="text-xs text-muted-foreground">ชื่องาน</p>
                <p className="font-semibold">{job.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">หัวหน้างาน</p>
                <p className="font-semibold">{user.fname}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">ทีมช่าง</p>
                <p className="font-medium">
                  {job.assignedTechs.length > 0
                    ? job.assignedTechs
                        .map((techId) => getTechDisplayName(techId))
                        .join(", ")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">
                สรุปผลการทำงาน <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={completionSummary}
                onChange={(e) => setCompletionSummary(e.target.value)}
                placeholder="อธิบายผลงาน ขั้นตอนสำคัญ และผลลัพธ์"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">ปัญหาที่พบ (ถ้ามี)</label>
              <Textarea
                value={completionIssues}
                onChange={(e) => setCompletionIssues(e.target.value)}
                placeholder="แจ้งปัญหาที่พบและวิธีแก้ไข"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">
                แนบรูปภาพประกอบ (ถ้ามี)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleCompletionImageChange}
              />
              {completionIssueImage && (
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img
                    src={completionIssueImage}
                    alt="หลักฐาน"
                    className="max-h-60 object-contain w-full bg-black/5"
                  />
                  <p className="text-[10px] p-2 text-muted-foreground">
                    {completionIssueImageName}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">รายการงานย่อย</label>
              <div className="rounded-md border bg-muted/20 max-h-40 overflow-auto">
                {job.tasks.length > 0 ? (
                  <ul className="text-xs divide-y">
                    {job.tasks.map((task) => (
                      <li key={task.id} className="p-2">
                        {task.title}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground p-3">
                    ยังไม่มีการสร้าง Task
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompletionDialogOpen(false)}
              disabled={isGeneratingReport}
            >
              ยกเลิก
            </Button>
            <Button onClick={handleSubmitCompletion} disabled={isGeneratingReport}>
              {isGeneratingReport ? "กำลังบันทึก..." : "ยืนยันปิดงาน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Success */}
      <AlertDialog
        open={isCompletionSuccessOpen}
        onOpenChange={setIsCompletionSuccessOpen}
      >
        <AlertDialogContent className="max-w-sm text-center space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2 justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              จบงานเรียบร้อยแล้ว
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              สามารถกลับเข้ามาดูสรุปงานและดาวน์โหลดเอกสารได้ทุกเมื่อ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogAction
              className="h-8 text-xs"
              onClick={() => setIsCompletionSuccessOpen(false)}
            >
              รับทราบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-4 py-2 border-b">
            <DialogTitle className="text-sm">รูปภาพจากอัปเดตงาน</DialogTitle>
          </DialogHeader>
          <div className="p-4 flex justify-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="อัปเดตจากช่าง"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            )}
          </div>
          <DialogFooter className="px-4 py-2 border-t">
            <DialogClose asChild>
              <Button variant="outline" size="sm">
                ปิด
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

