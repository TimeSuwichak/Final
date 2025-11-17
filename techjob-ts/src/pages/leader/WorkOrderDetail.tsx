"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { user as ALL_USERS } from '@/Data/user';
import { MapPin, Users, Briefcase, Clock, CheckCircle2, AlertCircle, User, Phone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { TaskDetailsLocked } from '@/components/leader/TaskDetailsLocked';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapControllerProps {
  jobId: string | null;
  jobs: any[];
}

const MapController: React.FC<MapControllerProps> = ({ jobId, jobs }) => {
  const map = useMap();
  const prevJobId = useRef<string | null>(null);

  useEffect(() => {
    if (jobId && jobId !== prevJobId.current) {
      const job = jobs.find(j => j.id === jobId);
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

const WorkOrderDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobs } = useJobs();
  const { user } = useAuth();
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [showTechnicianView, setShowTechnicianView] = useState(false);

  if (!user) return null;

  const currentJob = jobs.find(j => j.id === jobId);

  // ถ้าไม่พบงาน ให้กลับไปหน้า LeaderWorks
  if (!currentJob) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 p-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">ไม่พบใบงานนี้</h2>
        <Button onClick={() => navigate('/leader/leaderworks')} variant="outline">
          กลับไปหน้างาน
        </Button>
      </div>
    );
  }

  const jobsWithLocation = [currentJob].filter(
    (job) => job.latitude && job.longitude
  );

  const initialMapCenter: [number, number] = useMemo(() => {
    if (currentJob.latitude && currentJob.longitude) {
      return [currentJob.latitude, currentJob.longitude];
    }
    return [13.7563, 100.5018]; // Default Bangkok center
  }, [currentJob.latitude, currentJob.longitude]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-orange-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'in-progress':
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'done': return 'เสร็จสิ้น';
      case 'in-progress': return 'กำลังดำเนินการ';
      default: return 'รอดำเนินการ';
    }
  };

  const createCustomIcon = (status: string) => {
    const color = status === 'done' ? '#22c55e' : status === 'in-progress' ? '#3b82f6' : '#f97316';
    return L.divIcon({
      className: 'custom-marker',
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

  const workAreaRadius = 500;

  const assignedTechs = currentJob.assignedTechs
    .map(techId => ALL_USERS.find(u => String(u.id) === techId))
    .filter(tech => tech !== undefined);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
      {/* Header with navigation buttons */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/leader/leaderworks')}
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
                <p className="text-xs text-muted-foreground font-semibold">สถานะ</p>
                <Badge className={`${getStatusColor(currentJob.status)} text-white`}>
                  {getStatusIcon(currentJob.status)}
                  {getStatusText(currentJob.status)}
                </Badge>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">ลูกค้า</p>
                <p className="font-medium">{currentJob.customerName}</p>
                <p className="text-xs text-muted-foreground">{currentJob.customerPhone}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">สถานที่</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{currentJob.location}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">วันที่</p>
                <p>{new Date(currentJob.startDate).toLocaleDateString('th-TH')}</p>
                <p className="text-xs text-muted-foreground">ถึง {new Date(currentJob.endDate).toLocaleDateString('th-TH')}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">ประเภทงาน</p>
                <p>{currentJob.jobType}</p>
              </div>

              {currentJob.description && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold">รายละเอียด</p>
                  <p className="text-xs leading-relaxed">{currentJob.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right: Assigned Technicians & Tasks */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">ช่างที่มอบหมาย ({currentJob.assignedTechs.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {assignedTechs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {assignedTechs.map((tech) => (
                    <div
                      key={tech?.id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedTechId(tech?.id.toString() || null);
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={tech?.avatarUrl || '/placeholder.svg'} />
                        <AvatarFallback className="text-xs">
                          {tech?.fname[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {tech?.fname} {tech?.lname}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {tech?.position}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="h-6 w-6 mx-auto mb-1 opacity-40" />
                  <p className="text-xs">ยังไม่มีช่างที่มอบหมาย</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  งานย่อย ({currentJob.tasks.length})
                </h4>
                <TaskDetailsLocked tasks={currentJob.tasks} />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* View 2: Technician Tracking */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Technician List */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                ช่างทีม ({assignedTechs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-4 pb-4">
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
                          selectedTechId === tech?.id.toString() ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedTechId(tech?.id.toString() || null)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={tech?.avatarUrl || '/placeholder.svg'} />
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
                            <Badge variant="outline" className="text-xs gap-1">
                              {tech?.status === 'available' ? '✓ ว่าง' : '⚠ 바쁜'}
                            </Badge>
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
          <Card className="lg:col-span-3 flex flex-col overflow-hidden">
            <CardContent className="p-0 h-full flex-1">
              <div className="w-full h-full rounded-lg overflow-hidden">
                {jobsWithLocation.length > 0 ? (
                  <MapContainer
                    center={initialMapCenter}
                    zoom={16}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <MapController jobId={jobId || null} jobs={[currentJob]} />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Circle
                      center={[currentJob.latitude!, currentJob.longitude!]}
                      radius={workAreaRadius}
                      pathOptions={{
                        color: currentJob.status === 'done' ? '#22c55e' : 
                               currentJob.status === 'in-progress' ? '#3b82f6' : '#f97316',
                        fillColor: currentJob.status === 'done' ? '#22c55e' : 
                                   currentJob.status === 'in-progress' ? '#3b82f6' : '#f97316',
                        fillOpacity: 0.1,
                        weight: 2,
                        opacity: 0.5,
                      }}
                    />
                    <Marker
                      position={[currentJob.latitude!, currentJob.longitude!]}
                      icon={createCustomIcon(currentJob.status)}
                    />
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
      )}
    </div>
  );
};

export default WorkOrderDetail;
