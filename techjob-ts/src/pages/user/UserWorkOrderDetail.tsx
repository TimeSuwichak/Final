"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminMap } from "@/components/admin/AdminMap";
import { user as ALL_USERS } from "@/Data/user";
import {
  MapPin,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  FileText,
  Download,
  ExternalLink,
  ChevronLeft,
  Phone,
  X,
} from "lucide-react";
import { TaskManagement } from "@/components/leader/TaskManagement";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { JobTeamDisplay } from "@/components/common/JobTeamDisplay";

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

  if (!pdfFiles || pdfFiles.length === 0) {
    return null;
  }

  return (
    <>
      {pdfFiles.map((pdfUrl, index) => (
        <div key={index} className="flex items-center gap-2 p-3 bg-card">
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
    </>
  );
};

const UserWorkOrderDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs, updateJobWithActivity } = useJobs();
  const { user } = useAuth();

  const [currentJob, setCurrentJob] = useState<any | null>(null);
  const [initialMapCenter, setInitialMapCenter] = useState<[number, number]>([
    13.7563, 100.5018,
  ]);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  useEffect(() => {
    const job = jobs.find((j) => j.id === jobId);
    setCurrentJob(job);
    if (job && job.latitude && job.longitude) {
      setInitialMapCenter([job.latitude, job.longitude]);
    }

    // Auto-change status to in-progress when user views job for the first time
    if (job && job.status === "new" && user && !hasAutoStarted) {
      updateJobWithActivity(
        job.id,
        { status: "in-progress" },
        "status_changed",
        `ช่าง "${user.fname}" เข้าดูงานและเริ่มดำเนินการ`,
        user.fname,
        "tech"
      );
      setHasAutoStarted(true);
    }
  }, [jobId, jobs, user, hasAutoStarted, updateJobWithActivity]);

  if (!user) return null;

  if (!currentJob) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">ไม่พบใบงานนี้</h2>
        <Button onClick={() => navigate("/user/works")} variant="outline">
          กลับไปหน้างาน
        </Button>
      </div>
    );
  }

  const assignedTechs = currentJob.assignedTechs
    .map((techId: string) => ALL_USERS.find((u) => String(u.id) === techId))
    .filter((tech: any) => tech !== undefined);

  return (
    <div className="min-h-[calc(100vh-4rem)] h-auto lg:h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/user/userworks")}
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
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-4 min-h-0">
        {/* Left: Job Info */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden h-auto lg:h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">ข้อมูลใบงาน</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 lg:overflow-y-auto space-y-3 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold">
                สถานะ
              </p>
              <Badge
                className={`${getStatusColor(currentJob.status)} text-white`}
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
                ถึง {new Date(currentJob.endDate).toLocaleDateString("th-TH")}
              </p>
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
                    onClick={() => window.open(currentJob.imageUrl, "_blank")}
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

            <Separator />

            {/* Map */}
            {currentJob.latitude && currentJob.longitude ? (
              <AdminMap
                initialAddress={currentJob.location}
                initialPosition={[currentJob.latitude, currentJob.longitude]}
                readOnly={true}
                useSimpleMarker={true}
                height="192px"
              />
            ) : (
              <div className="h-48 w-full flex items-center justify-center rounded-lg border bg-muted text-muted-foreground text-xs">
                ไม่มีพิกัด
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Task Management & Team */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden h-auto lg:h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                การจัดการงาน
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 lg:overflow-y-auto space-y-4">
            {/* Task Management Board */}
            <TaskManagement job={currentJob} mode="user" />

            <Separator />

            {/* Assigned Team (Detailed View) */}
            <JobTeamDisplay job={currentJob} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserWorkOrderDetail;
