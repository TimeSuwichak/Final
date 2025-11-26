// src/components/user/UserJobDetailDialog.tsx
"use client";

import React from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
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
import { UserTaskUpdate } from './UserTaskUpdate';
import { AdminMap } from "../admin/AdminMap"
import type { Job } from '@/types/index';
import { leader } from '@/data/leader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  MapPin,
  User,
  Phone,
  FileText,
  Briefcase,
  Clock,
  X,
  ClipboardList,
  CheckCircle2,
   ImageIcon
} from 'lucide-react';
import { generateCompletionReportPdf } from "@/utils/jobReport";
import { PdfViewer } from "@/components/common/PdfViewer";

interface UserJobDetailDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserJobDetailDialog({ job, open, onOpenChange }: UserJobDetailDialogProps) {

  if (!job) return null;

  const assignedLeader = leader.find(l => l.id === job.leadId);
  const isCompleted = job.status === 'done';
  const statusLabel = isCompleted
    ? "งานเสร็จสิ้น"
    : job.status === 'in-progress'
    ? "กำลังทำ"
    : "งานใหม่";
  const statusBadgeClass = isCompleted
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : job.status === 'in-progress'
    ? "bg-amber-100 text-amber-800 border-amber-200"
    : "bg-blue-100 text-blue-800 border-blue-200";

  const handleDownloadReport = () => {
    generateCompletionReportPdf(job);
  };

  const renderTaskStatusBadge = (status: 'pending' | 'in-progress' | 'completed') => {
    const className =
      status === 'completed'
        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
        : status === 'in-progress'
        ? "bg-amber-100 text-amber-800 border-amber-200"
        : "bg-blue-100 text-blue-800 border-blue-200";
    const label =
      status === 'completed'
        ? "เสร็จสิ้น"
        : status === 'in-progress'
        ? "กำลังทำ"
        : "รอดำเนินการ";
    return (
      <Badge variant="outline" className={`text-xs border ${className}`}>
        {label}
      </Badge>
    );
  };

  return (
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
                <DialogTitle className="text-lg sm:text-xl font-bold truncate">{job.title}</DialogTitle>
                <Badge variant="secondary" className="text-xs shrink-0">
                  <ClipboardList className="h-3 w-3 mr-1" />
                  งานของฉัน
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs shrink-0 border ${statusBadgeClass}`}
                >
                  {statusLabel}
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
          </div>
        </DialogHeader>

        {/* Main Content with 2 Column Layout */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              
              {/* Left Column - Job Information */}
              <div className="space-y-4">

                {/* Leader Information */}
                {assignedLeader && (
                  <Card className="border-primary/20 ">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        หัวหน้างาน
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={assignedLeader.avatarUrl} alt={assignedLeader.fname} />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {assignedLeader.fname[0]}{assignedLeader.lname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{assignedLeader.fname} {assignedLeader.lname}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {assignedLeader.phone}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {isCompleted && (
                  <Card className="border-primary/20  ">
                    <CardHeader className="pb-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="text-sm flex items-center gap-2 text-emerald-800">
                            <CheckCircle2 className="h-4 w-4" />
                            สรุปผลการปิดงาน
                          </CardTitle>
                          <CardDescription className="text-xs">
                            ดูข้อมูลสรุปและดาวน์โหลดเอกสารได้ที่นี่
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
                          {job.leaderCloser || assignedLeader?.fname || "-"}
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
                )}

                {/* Job Info Card */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
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
                      <User className="h-4 w-4 text-blue-600" />
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

                      {job.latitude && job.longitude && (
                        <div className="rounded-md overflow-hidden">
                          <AdminMap
                            initialAddress={job.location}
                            initialPosition={[job.latitude, job.longitude]}
                            readOnly={true}
                            useSimpleMarker={true}
                            height="300px"
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
                      <FileText className="h-4 w-4 text-blue-600" />
                      รายละเอียดงาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
                      <p>{job.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
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
                {/* PDF Viewer Card */}
                {job.pdfFiles && job.pdfFiles.length > 0 && (
                  <PdfViewer pdfFiles={job.pdfFiles} />
                )}

              </div>

              {/* Right Column - Tasks */}
              <div className="space-y-4">
                
                <Card className="border-blue-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-blue-600" />
                          งานย่อยที่ต้องทำ
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {isCompleted
                            ? "ดูรายการงานที่ดำเนินการไปแล้ว"
                            : "อัพเดทความคืบหน้า แจ้งปัญหา และขอเบิกวัสดุ"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {job.tasks.length} งาน
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.tasks.length > 0 ? (
                      isCompleted ? (
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
                                {renderTaskStatusBadge(task.status)}
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
                        <div className="space-y-3">
                          {job.tasks.map((task) => (
                            <UserTaskUpdate key={task.id} job={job} task={task} />
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-muted rounded-full mb-4">
                          <ClipboardList className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          ยังไม่มีงานย่อย
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isCompleted
                            ? "งานนี้ไม่มีการสร้างงานย่อย"
                            : "หัวหน้างานจะสร้างงานย่อยให้ในภายหลัง"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Action Tips */}
                {!isCompleted && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        คำแนะนำ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">อัพเดทความคืบหน้า:</strong> แจ้งสถานะงานให้หัวหน้าทราบอย่างสม่ำเสมอ
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">แจ้งปัญหา:</strong> พบอุปสรรคหรือปัญหา? แจ้งทันทีเพื่อหาทางแก้ไข
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">ขอเบิกวัสดุ:</strong> ต้องการอุปกรณ์เพิ่ม? ส่งคำขอผ่านระบบ
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">อัพโหลดรูปภาพ:</strong> ถ่ายรูปความคืบหน้างานเพื่อบันทึก
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
          <div className="flex items-center justify-end w-full">
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
  );
}