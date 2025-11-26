"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
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
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
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
  Fingerprint,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Lock,
  LockOpen,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TaskManagement } from "@/components/leader/TaskManagement";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapControllerProps {
  selectedJobId: string | null;
  jobs: any[];
  selectedTechId?: string | null;
  techLocations?: Map<string, [number, number]>;
}

const MapController: React.FC<MapControllerProps> = ({
  selectedJobId,
  jobs,
  selectedTechId,
  techLocations,
}) => {
  const map = useMap();
  const prevSelectedJobId = useRef<string | null>(null);
  const prevSelectedTechId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedJobId && selectedJobId !== prevSelectedJobId.current) {
      const job = jobs.find((j) => j.id === selectedJobId);
      if (job && job.latitude && job.longitude) {
        map.setView([job.latitude, job.longitude], 16, {
          animate: true,
          duration: 1,
        });
      }
      prevSelectedJobId.current = selectedJobId;
    }
  }, [selectedJobId, jobs, map]);

  useEffect(() => {
    if (
      selectedTechId &&
      selectedTechId !== prevSelectedTechId.current &&
      techLocations
    ) {
      const techLocation = techLocations.get(selectedTechId);
      if (techLocation) {
        map.setView(techLocation, 17, {
          animate: true,
          duration: 1,
        });
      }
      prevSelectedTechId.current = selectedTechId;
    }
  }, [selectedTechId, techLocations, map]);

  return null;
};

// ฟังก์ชันจำลองตำแหน่งช่าง (สุ่มตำแหน่งรอบๆ งานภายในขอบเขต)
const simulateTechLocation = (
  jobLat: number,
  jobLng: number,
  techId: string,
  radiusMeters: number = 200
): [number, number] => {
  // ใช้ techId เป็น seed เพื่อให้ตำแหน่งคงที่สำหรับช่างแต่ละคน
  const seed = techId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
  const random2 = (((seed * 9301 + 49297) * 9301 + 49297) % 233280) / 233280;

  // แปลงระยะทางจากเมตรเป็นองศา (ประมาณ)
  const radiusInDegrees = radiusMeters / 111000;

  // สุ่มมุมและระยะทาง
  const angle = random1 * 2 * Math.PI;
  const distance = random2 * radiusInDegrees;

  // คำนวณตำแหน่งใหม่
  const lat = jobLat + distance * Math.cos(angle);
  const lng =
    jobLng + (distance * Math.sin(angle)) / Math.cos((jobLat * Math.PI) / 180);

  return [lat, lng];
};

interface TechnicianTrackingProps {
  job?: any;
  selectedTechId?: string | null;
  onTechSelect?: (techId: string | null) => void;
  workAreaRadius?: number;
}

const TechnicianTracking: React.FC<TechnicianTrackingProps> = ({
  job: propJob,
  selectedTechId: propSelectedTechId,
  onTechSelect: propOnTechSelect,
  workAreaRadius: propWorkAreaRadius = 150,
}) => {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [internalSelectedTechId, setInternalSelectedTechId] = useState<
    string | null
  >(null);

  // ใช้ props หรือ state ภายใน
  const isStandaloneMode = !propJob;
  const selectedTechId =
    propSelectedTechId !== undefined
      ? propSelectedTechId
      : internalSelectedTechId;
  const handleTechSelect = propOnTechSelect || setInternalSelectedTechId;
  const workAreaRadius = propWorkAreaRadius;

  if (!user) return null;

  // ถ้าเป็น standalone mode แสดงหลายงาน, ถ้าเป็น component mode แสดงงานเดียว
  const myJobs = isStandaloneMode
    ? jobs.filter(
        (job) => String(job.leadId) === String(user.id) && job.status !== "new"
      )
    : propJob
    ? [propJob]
    : [];

  const currentJob = isStandaloneMode
    ? myJobs.find((j) => j.id === selectedJobId)
    : propJob;

  const jobsWithLocation = myJobs.filter(
    (job) => job.latitude && job.longitude
  );

  // คำนวณตำแหน่งช่างจำลอง
  const techLocations = useMemo(() => {
    const locations = new Map<string, [number, number]>();
    if (currentJob && currentJob.latitude && currentJob.longitude) {
      currentJob.assignedTechs.forEach((techId: string) => {
        const location = simulateTechLocation(
          currentJob.latitude!,
          currentJob.longitude!,
          techId,
          workAreaRadius
        );
        locations.set(techId, location);
      });
    }
    return locations;
  }, [currentJob, workAreaRadius]);

  const initialMapCenter: [number, number] = useMemo(() => {
    if (currentJob && currentJob.latitude && currentJob.longitude) {
      return [currentJob.latitude, currentJob.longitude];
    }
    if (jobsWithLocation.length === 0) {
      return [13.7563, 100.5018];
    }
    const avgLat =
      jobsWithLocation.reduce((sum, job) => sum + (job.latitude || 0), 0) /
      jobsWithLocation.length;
    const avgLng =
      jobsWithLocation.reduce((sum, job) => sum + (job.longitude || 0), 0) /
      jobsWithLocation.length;
    return [avgLat, avgLng];
  }, [currentJob, jobsWithLocation]);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowMapPopup(true);
  };

  const calculateTaskProgress = (task: any) => {
    if (!task) return 0;
    if (task.status === "completed") return 100;
    if (task.status === "in-progress") return 50;
    return 0;
  };

  const selectedJob = currentJob;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500";
      case "in-progress":
        return "bg-orange-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "in-progress":
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
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

  const createCustomIcon = (status: string) => {
    const color =
      status === "done"
        ? "#22c55e"
        : status === "in-progress"
        ? "#3b82f6"
        : "#3b82f6";
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

  const createTechIcon = (isSelected: boolean = false) => {
    const color = isSelected ? "#8b5cf6" : "#6366f1";
    return L.divIcon({
      className: "tech-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  };

  // ดึงข้อมูลช่างที่มอบหมาย
  const assignedTechs = currentJob
    ? currentJob.assignedTechs
        .map((techId: string) => ALL_USERS.find((u) => String(u.id) === techId))
        .filter((tech: any) => tech !== undefined)
    : [];

  // Component mode: แสดงรายชื่อช่างและแผนที่
  if (!isStandaloneMode) {
    return (
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-4 gap-4 min-h-0">
        {/* Technician List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden h-auto lg:h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              ช่างทีม ({assignedTechs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-48 lg:h-full px-4 pb-4">
              <div className="space-y-2">
                {assignedTechs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">ยังไม่มีช่างที่มอบหมาย</p>
                  </div>
                ) : (
                  assignedTechs.map((tech) => (
                    <Card
                      key={tech?.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTechId === tech?.id.toString()
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() =>
                        handleTechSelect(tech?.id.toString() || null)
                      }
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={tech?.avatarUrl || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {tech?.fname[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm line-clamp-1">
                              {tech?.fname} {tech?.lname}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tech?.position}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1 px-10">
                          <p>📱 {tech?.phone}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Map View */}
        <Card className="lg:col-span-3 flex flex-col overflow-hidden h-[400px] lg:h-full">
          <CardContent className="p-4 h-full flex-1">
            <div
              className="w-full h-full rounded-lg overflow-hidden relative"
              style={{ zIndex: 0, isolation: "isolate" }}
            >
              {currentJob && currentJob.latitude && currentJob.longitude ? (
                <MapContainer
                  center={initialMapCenter}
                  zoom={16}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  className="z-0"
                >
                  <MapController
                    selectedJobId={currentJob.id}
                    jobs={[currentJob]}
                    selectedTechId={selectedTechId}
                    techLocations={techLocations}
                  />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Work Area Circle */}
                  <Circle
                    center={[currentJob.latitude, currentJob.longitude]}
                    radius={workAreaRadius}
                    pathOptions={{
                      color:
                        currentJob.status === "done"
                          ? "#22c55e"
                          : currentJob.status === "in-progress"
                          ? "#3b82f6"
                          : "#f97316",
                      fillColor:
                        currentJob.status === "done"
                          ? "#22c55e"
                          : currentJob.status === "in-progress"
                          ? "#3b82f6"
                          : "#f97316",
                      fillOpacity: 0.1,
                      weight: 2,
                      opacity: 0.5,
                    }}
                  />

                  {/* Job Marker */}
                  <Marker
                    position={[currentJob.latitude, currentJob.longitude]}
                    icon={createCustomIcon(currentJob.status)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-semibold">{currentJob.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentJob.location}
                        </p>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Technician Markers */}
                  {Array.from(techLocations.entries()).map(
                    ([techId, location]) => {
                      const tech = ALL_USERS.find(
                        (u) => String(u.id) === techId
                      );
                      const isSelected = selectedTechId === techId;
                      return (
                        <Marker
                          key={techId}
                          position={location}
                          icon={createTechIcon(isSelected)}
                          eventHandlers={{
                            click: () => handleTechSelect(techId),
                          }}
                        >
                          <Popup>
                            <div className="text-sm">
                              <p className="font-semibold">
                                {tech?.fname} {tech?.lname}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {tech?.position}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                📱 {tech?.phone}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    }
                  )}
                </MapContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
                  <MapPin className="h-8 w-8" />
                  <p className="text-sm">ไม่มีพิกัดสำหรับแผนที่</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Standalone mode: แสดงหลายงาน
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                ติดตามช่าง
              </CardTitle>
              <CardDescription className="mt-1">
                แสดงตำแหน่งงานและขอบเขตการทำงานของช่างทั้งหมด
              </CardDescription>
            </div>
            <Badge variant="secondary" className="h-8 gap-1.5 px-3">
              <Briefcase className="h-4 w-4" />
              {myJobs.length} งาน
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              รายการงาน ({myJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 p-0">
            <ScrollArea className="h-full px-4 pb-4">
              <div className="space-y-2">
                {myJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">ยังไม่มีงานที่รับทราบ</p>
                  </div>
                ) : (
                  myJobs.map((job) => (
                    <Card
                      key={job.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedJobId === job.id ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleJobSelect(job.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                            {job.title}
                          </h4>
                          <Badge
                            className={`text-[10px] h-5 gap-1 shrink-0 ${getStatusColor(
                              job.status
                            )} text-white`}
                          >
                            {getStatusIcon(job.status)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{job.assignedTechs.length} ช่าง</span>
                            <span className="mx-1">•</span>
                            <span>{job.tasks.length} งานย่อย</span>
                          </div>
                        </div>

                        {!job.latitude || !job.longitude ? (
                          <Badge variant="outline" className="text-[10px] h-5">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            ไม่มีพิกัด
                          </Badge>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 flex flex-col gap-4 relative">
          <Card className="h-200 overflow-hidden">
            <CardContent className="p-0 h-full relative">
              <div
                className="w-full h-full rounded-lg overflow-hidden relative"
                style={{ zIndex: 0, isolation: "isolate" }}
              >
                <MapContainer
                  center={initialMapCenter}
                  zoom={12}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                  className="z-0"
                >
                  <MapController
                    selectedJobId={selectedJobId}
                    jobs={jobsWithLocation}
                  />

                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {jobsWithLocation.map((job) => (
                    <React.Fragment key={job.id}>
                      <Circle
                        center={[job.latitude!, job.longitude!]}
                        radius={500}
                        pathOptions={{
                          color:
                            job.status === "done"
                              ? "#22c55e"
                              : job.status === "in-progress"
                              ? "#f97316"
                              : "#3b82f6",
                          fillColor:
                            job.status === "done"
                              ? "#22c55e"
                              : job.status === "in-progress"
                              ? "#f97316"
                              : "#3b82f6",
                          fillOpacity: 0.1,
                          weight: 2,
                          opacity: 0.5,
                        }}
                      />

                      <Marker
                        position={[job.latitude!, job.longitude!]}
                        icon={createCustomIcon(job.status)}
                        eventHandlers={{
                          click: () => handleJobSelect(job.id),
                        }}
                      />
                    </React.Fragment>
                  ))}
                </MapContainer>
              </div>

              {showMapPopup && selectedJob && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
                  <Card className="shadow-2xl border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">
                            {selectedJob.title}
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => setShowMapPopup(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">
                            {selectedJob.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {selectedJob.customerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{selectedJob.assignedTechs.length} ช่าง</span>
                        <span>•</span>
                        <span>
                          {
                            selectedJob.tasks.filter(
                              (t) => t.status === "completed"
                            ).length
                          }{" "}
                          เสร็จสิ้นเเล้ว
                        </span>
                        <span>•</span>
                        <span>{selectedJob.tasks.length} งานย่อย</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedJob && (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">
                    {selectedJob.title}
                  </CardTitle>
                  <Badge
                    className={`text-xs gap-1 ${getStatusColor(
                      selectedJob.status
                    )} text-white`}
                  >
                    {getStatusIcon(selectedJob.status)}
                    {getStatusText(selectedJob.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      ข้อมูลสถานที่
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3" />
                        <span className="font-medium">
                          {selectedJob.customerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        <span>{selectedJob.customerPhone}</span>
                      </div>
                      <div className="flex items-start gap-1.5 mt-2">
                        <MapPin className="h-3 w-3 mt-0.5" />
                        <span className="text-muted-foreground leading-relaxed">
                          {selectedJob.location}
                        </span>
                      </div>
                      {selectedJob.latitude && selectedJob.longitude && (
                        <div className="pt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Badge variant="outline" className="h-5">
                            ขอบเขตงาน: 500m
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-primary" />
                      ทีมช่างที่มอบหมาย ({selectedJob.assignedTechs.length})
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      {selectedJob.assignedTechs.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedJob.assignedTechs.map((techId) => {
                            const tech = ALL_USERS.find(
                              (u) => String(u.id) === techId
                            );
                            if (!tech) return null;
                            return (
                              <div
                                key={techId}
                                className="flex items-center gap-2 p-1.5 rounded bg-background"
                              >
                                <Avatar className="h-7 w-7">
                                  <AvatarImage
                                    src={tech.avatarUrl || "/placeholder.svg"}
                                  />
                                  <AvatarFallback className="text-[10px]">
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
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <Users className="h-6 w-6 mx-auto mb-1 opacity-40" />
                          <p className="text-xs">ยังไม่มีช่างที่มอบหมาย</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-primary" />
                    รายละเอียดงานย่อย ({selectedJob.tasks.length})
                  </h4>

                  <TaskManagement job={selectedJob} mode="admin" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianTracking;
export { TechnicianTracking };
