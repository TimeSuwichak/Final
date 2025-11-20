"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { user as ALL_USERS } from '@/Data/user';
import { MapPin, Users, Briefcase, Clock, CheckCircle2, AlertCircle, User, Phone, X, Fingerprint, ChevronDown, ChevronRight, TrendingUp, Lock, LockOpen } from 'lucide-react';
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
  selectedJobId: string | null;
  jobs: any[];
}
    
const MapController: React.FC<MapControllerProps> = ({ selectedJobId, jobs }) => {
  const map = useMap();
  const prevSelectedJobId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedJobId && selectedJobId !== prevSelectedJobId.current) {
      const job = jobs.find(j => j.id === selectedJobId);
      if (job && job.latitude && job.longitude) {
        map.setView([job.latitude, job.longitude], 16, {
          animate: true,
          duration: 1,
        });
      }
      prevSelectedJobId.current = selectedJobId;
    }
  }, [selectedJobId, jobs, map]);

  return null;
};

const TechnicianTracking: React.FC = () => {
  const { jobs } = useJobs();
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showMapPopup, setShowMapPopup] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  

  if (!user) return null;

  const myJobs = jobs.filter(
    (job) => String(job.leadId) === String(user.id) && job.status !== 'new'
  );

  const jobsWithLocation = myJobs.filter(
    (job) => job.latitude && job.longitude
  );

  const initialMapCenter: [number, number] = useMemo(() => {
    if (jobsWithLocation.length === 0) {
      return [13.7563, 100.5018];
    }
    const avgLat = jobsWithLocation.reduce((sum, job) => sum + (job.latitude || 0), 0) / jobsWithLocation.length;
    const avgLng = jobsWithLocation.reduce((sum, job) => sum + (job.longitude || 0), 0) / jobsWithLocation.length;
    return [avgLat, avgLng];
  }, [jobsWithLocation.length]);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowMapPopup(true);
  };

  const calculateTaskProgress = (task: any) => {
    if (!task) return 0;
    if (task.status === 'completed') return 100;
    if (task.status === 'in-progress') return 50;
    return 0;
  };

  const selectedJob = myJobs.find(job => job.id === selectedJobId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
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
    const color = status === 'done' ? '#22c55e' : status === 'in-progress' ? '#f97316' : '#3b82f6';
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
                        selectedJobId === job.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleJobSelect(job.id)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm line-clamp-2 flex-1">
                            {job.title}
                          </h4>
                          <Badge className={`text-[10px] h-5 gap-1 shrink-0 ${getStatusColor(job.status)} text-white`}>
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
              <div className="w-full h-full rounded-lg overflow-hidden">
                <MapContainer
                  center={initialMapCenter}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <MapController selectedJobId={selectedJobId} jobs={jobsWithLocation} />
                  
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {jobsWithLocation.map((job) => (
                    <React.Fragment key={job.id}>
                      <Circle
                        center={[job.latitude!, job.longitude!]}
                        radius={workAreaRadius}
                        pathOptions={{
                          color: job.status === 'done' ? '#22c55e' : 
                                 job.status === 'in-progress' ? '#f97316' : '#3b82f6',
                          fillColor: job.status === 'done' ? '#22c55e' : 
                                     job.status === 'in-progress' ? '#f97316' : '#3b82f6',
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
                        <span className="font-medium">{selectedJob.customerName}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{selectedJob.assignedTechs.length} ช่าง</span>
                        <span>•</span>
                        <span>{selectedJob.tasks.filter(t => t.status === 'completed').length} เสร็จสิ้นเเล้ว</span>
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
                  <CardTitle className="text-base">{selectedJob.title}</CardTitle>
                  <Badge className={`text-xs gap-1 ${getStatusColor(selectedJob.status)} text-white`}>
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
                        <span className="font-medium">{selectedJob.customerName}</span>
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
                            ขอบเขตงาน: {workAreaRadius}m
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
                            const tech = ALL_USERS.find((u) => String(u.id) === techId);
                            if (!tech) return null;
                            return (
                              <div
                                key={techId}
                                className="flex items-center gap-2 p-1.5 rounded bg-background"
                              >
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={tech.avatarUrl || '/placeholder.svg'} />
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
                  
                  <TaskDetailsLocked tasks={selectedJob.tasks} />
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




