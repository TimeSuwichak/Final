"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { user as ALL_USERS } from "@/Data/user";
import {
  MapPin,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  X,
  ChevronLeft,
  ImageIcon,
  FileText,
  Download,
  ExternalLink,
  Save,
} from "lucide-react";
import { TaskDetailsLocked } from "@/components/leader/TaskDetailsLocked";
import { TaskManagement } from "@/components/leader/TaskManagement";
import { TechSelectMultiDept } from "@/components/leader/TechSelectMultiDept";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { JobTeamDisplay } from "@/components/common/JobTeamDisplay";
import { JobCompletionForm } from "@/components/leader/JobCompletionForm";
import { JobSummaryView } from "@/components/leader/JobSummaryView";
import TechnicianTracking from "@/pages/leader/TechnicianTracking";

// Declare missing functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "done":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    default:
      return "bg-orange-500";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4" />;
    case "in-progress":
      return <Clock className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "done":
      return "เสร็จสิ้น";
    case "in-progress":
      return "กำลังดำเนินการ";
    default:
      return "รอดำเนินการ";
  }
};


const PdfViewerSection: React.FC<{ pdfFiles?: string[] }> = ({
  pdfFiles = [],
}) => {
  const [selectedPdfUrl, setSelectedPdfUrl] = React.useState<string | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);

  const handleOpenPdf = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadPdf = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `document-${index + 1}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreviewPdf = (url: string) => {
    setSelectedPdfUrl(url);
    setIsPreviewOpen(true);
  };

  if (!pdfFiles || pdfFiles.length === 0) {
    return null;
  }

  return (
    <>
      {pdfFiles.map((pdfUrl, index) => (
        <div key={index} className="flex items-center  gap-2 p-3  bg-card ">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-red-100 rounded shrink-0">
              <FileText className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">เอกสาร {index + 1}</p>
              <p className="text-[10px] text-muted-foreground truncate">
                {pdfUrl.split("/").pop() || "document.pdf"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => handleOpenPdf(pdfUrl)}
              title="เปิดในแท็บใหม่"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => handleDownloadPdf(pdfUrl, index)}
              title="ดาวน์โหลด"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-4 py-3 border-b shrink-0">
            <DialogTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-red-600" />
              ตัวอย่าง PDF
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-gray-50">
            {selectedPdfUrl && (
              <iframe
                src={`${selectedPdfUrl}#toolbar=0`}
                className="w-full h-full"
                title="PDF Preview"
              />
            )}
          </div>
          <DialogFooter className="px-4 py-3 border-t bg-gray-50 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenPdf(selectedPdfUrl || "")}
              className="gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              เปิดแบบเต็มหน้า
            </Button>
            <DialogClose asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <X className="h-3.5 w-3.5" />
                ปิด
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const WorkOrderDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs, updateJobWithActivity } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [showTechnicianView, setShowTechnicianView] = useState(false);

  const [draftTechs, setDraftTechs] = useState<string[]>([]);
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false);
  const [teamChangeReason, setTeamChangeReason] = useState("");
  const [pendingTeamChanges, setPendingTeamChanges] = useState<{
    added: string[];
    removed: string[];
  } | null>(null);

  const [currentJob, setCurrentJob] = useState<any | null>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  useEffect(() => {
    const job = jobs.find((j) => j.id === jobId);
    setCurrentJob(job);
    if (job) {
      setDraftTechs(job.assignedTechs); // sync draft techs with current job

      // Auto-change status to in-progress when leader views job for the first time
      if (job.status === "new" && user && !hasAutoStarted) {
        updateJobWithActivity(
          job.id,
          { status: "in-progress" },
          "acknowledge",
          `หัวหน้างาน "${user.fname}" เข้าดูงานและรับทราบ`,
          user.fname,
          "leader"
        );
        setHasAutoStarted(true);
      }
    }
  }, [jobId, jobs, user, hasAutoStarted, updateJobWithActivity]);

  if (!user) return null;

  if (!currentJob) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">ไม่พบใบงานนี้</h2>
        <Button
          onClick={() => navigate("/leader/leaderworks")}
          variant="outline"
        >
          กลับไปหน้างาน
        </Button>
      </div>
    );
  }

  const canManageTeam = currentJob.assignmentMode === "leader";

  const handleSaveTeam = () => {
    if (!canManageTeam) {
      alert("งานนี้ถูกกำหนดทีมช่างโดยแอดมิน หัวหน้าไม่สามารถแก้ไขได้");
      return;
    }
    const normalizedDraft = [...draftTechs].sort();
    const normalizedCurrent = [...currentJob.assignedTechs].sort();

    if (JSON.stringify(normalizedDraft) === JSON.stringify(normalizedCurrent)) {
      alert("ไม่ได้เปลี่ยนแปลงทีมช่าง");
      return;
    }

    const added = draftTechs.filter(
      (techId) => !currentJob.assignedTechs.includes(techId)
    );
    const removed = currentJob.assignedTechs.filter(
      (techId) => !draftTechs.includes(techId)
    );

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
      currentJob.id,
      { assignedTechs: draftTechs },
      "tech_assigned",
      `อัปเดตทีมช่าง (${draftTechs.length} คน) - เหตุผล: ${reasonText}`,
      user.fname,
      "leader",
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
        message: `คุณถูกเพิ่มเข้าทีมงาน "${currentJob.title}" โดย ${user.fname}. เหตุผล: ${reasonText}`,
        recipientRole: "user",
        recipientId: techId,
        relatedJobId: currentJob.id,
        metadata: {
          type: "team_assignment_added",
          jobId: currentJob.id,
          leaderId: user?.id ? String(user.id) : undefined,
        },
      });
    });

    pendingTeamChanges.removed.forEach((techId) => {
      addNotification({
        title: "มีการถอดคุณออกจากงาน",
        message: `คุณถูกถอดออกจากทีมงาน "${currentJob.title}" โดย ${user.fname}. เหตุผล: ${reasonText}`,
        recipientRole: "user",
        recipientId: techId,
        relatedJobId: currentJob.id,
        metadata: {
          type: "team_assignment_removed",
          jobId: currentJob.id,
          leaderId: user?.id ? String(user.id) : undefined,
        },
      });
    });

    setIsReasonDialogOpen(false);
    setPendingTeamChanges(null);
    setTeamChangeReason("");
    alert("บันทึกทีมช่างเรียบร้อย!");
  };

  const getTechDisplayName = (techId: string) => {
    const tech = ALL_USERS.find(
      (person) => String(person.id) === String(techId)
    );
    return tech ? `${tech.fname} ${tech.lname}` : `ช่างรหัส ${techId}`;
  };

  const handleFinishJob = () => {
    setCompletionDialogOpen(true);
  };

  const handleSubmitCompletion = (data: {
    summary: string;
    issues: string;
    issueImage: string | null;
    pdfFile: string | null;
  }) => {
    updateJobWithActivity(
      currentJob.id,
      {
        status: "done",
        completionSummary: data.summary,
        completionIssues: data.issues,
        completionIssueImage: data.issueImage || undefined,
        completionPdfUrl: data.pdfFile || undefined,
        completedAt: new Date(),
        leaderCloser: user.fname,
      },
      "status_changed",
      "หัวหน้าสรุปและปิดงานเรียบร้อย",
      user.fname,
      "leader",
      {
        summary: data.summary,
        issues: data.issues,
      }
    );

    addNotification({
      title: "หัวหน้าปิดงานเรียบร้อย",
      message: `งาน ${currentJob.title} ถูกปิดโดย ${user.fname}`,
      recipientRole: "admin",
      relatedJobId: currentJob.id,
      metadata: {
        type: "job_completed",
        jobId: currentJob.id,
      },
    });

    currentJob.assignedTechs.forEach((techId: string) => {
      addNotification({
        title: "งานที่คุณอยู่เสร็จสิ้นแล้ว",
        message: `หัวหน้า ${user.fname} ปิดงาน ${currentJob.title}`,
        recipientRole: "user",
        recipientId: techId,
        relatedJobId: currentJob.id,
        metadata: {
          type: "job_completed",
          jobId: currentJob.id,
        },
      });
    });

    alert("ปิดงานเรียบร้อย!");
  };

  const workAreaRadius = 150;

  return (
    <>
      <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
        {/* Header with navigation buttons */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/leader/leaderworks")}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  กลับ
                </Button>
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {currentJob.title}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {currentJob.id}
                  </CardDescription>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={!showTechnicianView ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTechnicianView(false)}
                  className="gap-1"
                >
                  <Briefcase className="h-4 w-4" />
                  ข้อมูลใบงาน
                </Button>
                <Button
                  variant={showTechnicianView ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowTechnicianView(true)}
                  className="gap-1"
                >
                  <Users className="h-4 w-4" />
                  ติดตามช่าง
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* View 1: Work Order Details */}
        {!showTechnicianView ? (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
            {/* Left: Job Info */}
            <Card className="lg:col-span-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">ข้อมูลใบงาน</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto space-y-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">
                    สถานะ
                  </p>
                  <Badge
                    className={`${getStatusColor(
                      currentJob.status
                    )} text-white`}
                  >
                    {getStatusIcon(currentJob.status)}
                    {getStatusText(currentJob.status)}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">
                    ลูกค้า
                  </p>
                  <p className="font-medium">{currentJob.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentJob.customerPhone}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">
                    สถานที่
                  </p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                    <span className="text-muted-foreground">
                      {currentJob.location}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">
                    วันที่
                  </p>
                  <p>
                    {new Date(currentJob.startDate).toLocaleDateString("th-TH")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ถึง{" "}
                    {new Date(currentJob.endDate).toLocaleDateString("th-TH")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">
                    ประเภทงาน
                  </p>
                  <p>{currentJob.jobType}</p>
                </div>

                {currentJob.description && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      รายละเอียด
                    </p>
                    <p className="text-xs leading-relaxed">
                      {currentJob.description}
                    </p>
                  </div>
                )}

                {currentJob.imageUrl && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      รูปภาพหน้างาน
                    </p>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <img
                        src={currentJob.imageUrl || "/placeholder.svg"}
                        alt="รูปภาพหน้างาน"
                        className="w-full h-auto max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          window.open(currentJob.imageUrl, "_blank")
                        }
                      />
                    </div>
                  </div>
                )}

                {currentJob.pdfFiles && currentJob.pdfFiles.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      ไฟล์ PDF ({currentJob.pdfFiles.length})
                    </p>
                    <PdfViewerSection pdfFiles={currentJob.pdfFiles} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Team user & Tasks */}
            <Card className="lg:col-span-2 flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
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
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {/* Team Management Section */}
                <div className="space-y-3">
                  {/* Leader Badge */}
                  <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 border border-green-200">
                    <div className="p-1 bg-green-100 rounded-full">
                      <Users className="h-3 w-3 text-green-700" />
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

                  {canManageTeam ? null : (
                    <div className="rounded-lg border border-dashed border-yellow-300 bg-yellow-50/60 p-4 text-xs text-yellow-800 space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        โหมดกำหนดทีมโดยแอดมิน
                      </p>
                      <p>
                        แอดมินได้เลือกทีมช่างไว้เรียบร้อยแล้ว
                        หัวหน้าไม่สามารถแก้ไขรายชื่อทีมได้ในงานนี้
                      </p>
                      <p>
                        คุณยังสามารถตรวจสอบความคืบหน้าและอนุมัติแต่ละขั้นตอนได้ตามปกติ
                      </p>
                    </div>
                  )}

                  {currentJob.status === "done" ? (
                    /* Show Summary View for Completed Jobs */
                    <JobSummaryView job={currentJob} />
                  ) : (
                    /* Show Task Management for Active Jobs */
                    <>
                      {/* Task Management */}
                      <div className="pt-4">
                        <TaskManagement
                          job={currentJob}
                          onFinishJob={handleFinishJob}
                        />
                        <br />
                        <TaskDetailsLocked tasks={currentJob.tasks} />
                      </div>

                      <Separator />

                      {/* Assigned Team List (Detailed View) */}
                      <JobTeamDisplay job={currentJob} />
                    </>
                  )}

                  {/* Tech Selection - ย้ายมาด้านล่าง */}
                  {canManageTeam ? (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold">เลือกทีมช่าง</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveTeam}
                            className="h-7 text-xs gap-1 bg-transparent"
                          >
                            <Save className="h-3 w-3" />
                            บันทึก
                          </Button>
                        </div>
                        <TechSelectMultiDept
                          jobStartDate={currentJob.startDate}
                          jobEndDate={currentJob.endDate}
                          selectedTechIds={draftTechs}
                          onTechsChange={setDraftTechs}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* View 2: Technician Tracking */
          <TechnicianTracking
            job={currentJob}
            selectedTechId={selectedTechId}
            onTechSelect={setSelectedTechId}
            workAreaRadius={workAreaRadius}
          />
        )}
      </div>

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
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              ระบุเหตุผลในการปรับทีม
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-1">
              <p>กรุณาแจ้งเหตุผลสำหรับการเพิ่ม/ลบช่าง</p>
              <p className="text-[10px]">
                ข้อมูลจะถูกส่งเป็นการแจ้งเตือนไปยังช่างที่เกี่ยวข้อง
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={teamChangeReason}
            onChange={(e) => setTeamChangeReason(e.target.value)}
            placeholder="ระบุรายละเอียด เช่น ปรับตามความเหมาะสม"
            rows={3}
            className="text-xs resize-none"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">
              ยกเลิก
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmTeamChanges}
              className="h-8 text-xs"
            >
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Completion Form Dialog */}
      <JobCompletionForm
        job={currentJob}
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
        onSubmit={handleSubmitCompletion}
      />
    </>
  );
};

export default WorkOrderDetail;
