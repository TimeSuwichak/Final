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
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
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
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

interface MapControllerProps {
  jobId: string | null;
  jobs: any[];
}

const MapController: React.FC<MapControllerProps> = ({ jobId, jobs }) => {
  const map = useMap();
  const prevJobId = useRef<string | null>(null);

  useEffect(() => {
    if (jobId && jobId !== prevJobId.current) {
      const job = jobs.find((j) => j.id === jobId);
      if (job && job.latitude && job.longitude) {
        map.setView([job.latitude, job.longitude], 16, {
          animate: true,
          duration: 1,
        });
      }
      prevJobId.current = jobId;
    }
  }, [jobId, jobs, map]);

  return null;
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
  const { jobs } = useJobs();
  const { user } = useAuth();

  const [currentJob, setCurrentJob] = useState<any | null>(null);
  const [initialMapCenter, setInitialMapCenter] = useState<[number, number]>([
    13.7563, 100.5018,
  ]);

  useEffect(() => {
    const job = jobs.find((j) => j.id === jobId);
    setCurrentJob(job);
    if (job && job.latitude && job.longitude) {
      setInitialMapCenter([job.latitude, job.longitude]);
    }
  }, [jobId, jobs]);

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

  const createCustomIcon = (status: string) => {
    const color =
      status === "done"
        ? "#22c55e"
        : status === "in-progress"
        ? "#3b82f6"
        : "#f97316";
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  const workAreaRadius = 150;
  const assignedTechs = currentJob.assignedTechs
    .map((techId: string) => ALL_USERS.find((u) => String(u.id) === techId))
    .filter((tech: any) => tech !== undefined);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/user/works")}
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
                <MapPin className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
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
            <div className="h-48 w-full rounded-lg overflow-hidden border">
              {currentJob.latitude && currentJob.longitude ? (
                <MapContainer
                  center={[currentJob.latitude, currentJob.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  zoomControl={false}
                  dragging={false}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Circle
                    center={[currentJob.latitude, currentJob.longitude]}
                    radius={workAreaRadius}
                    pathOptions={{
                      color: "blue",
                      fillColor: "blue",
                      fillOpacity: 0.1,
                    }}
                  />
                  <Marker
                    position={[currentJob.latitude, currentJob.longitude]}
                    icon={createCustomIcon(currentJob.status)}
                  />
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                  ไม่มีพิกัด
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Task Management & Team */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                การจัดการงาน
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {/* Assigned Team (Read Only) */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">
                ทีมช่าง ({assignedTechs.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {assignedTechs.map((tech: any) => (
                  <div
                    key={tech.id}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-muted/50 border"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={tech.avatarUrl} />
                      <AvatarFallback className="text-[10px]">
                        {tech.fname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {tech.fname} {tech.lname}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Task Management Board */}
            <TaskManagement job={currentJob} mode="user" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserWorkOrderDetail;
