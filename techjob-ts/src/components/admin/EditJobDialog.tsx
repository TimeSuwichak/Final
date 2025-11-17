"use client";

// --- IMPORTS ---
import React, { useState, useEffect, useMemo } from "react";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// --- SHADCN/UI & CUSTOM COMPONENTS ---
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/common/DatePicker";
import { LeaderSelect } from "./LeaderSelect"; // (สำคัญ)
import { isDateRangeOverlapping } from "@/lib/utils";
import { leader as ALL_LEADERS } from "@/data/leader";
import { user as ALL_USERS } from "@/data/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,  
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Job } from "@/types/index";
import { AdminMap } from "./AdminMap"
import { TaskDetailsLocked } from "../leader/TaskDetailsLocked";
import { Briefcase, Users, UserCheck, Download } from "lucide-react";
import { generateCompletionReportPdf } from "@/utils/jobReport";

// --- CONSTANTS ---
const JOB_TYPES = [
  "ซ่อมบำรุง",
  "รื้อถอน",
  "ติดตั้งระบบ",
  "ตรวจสอบประจำปี",
  "อื่นๆ",
];

// --- INTERFACE ---
interface EditJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "view" | "edit" | null;
  onModeChange: (mode: "view" | "edit") => void;
}

// ==========================================================
// ✨ EDIT JOB DIALOG COMPONENT (ฉบับสมบูรณ์) ✨
// ==========================================================
export function EditJobDialog({ 
  job, 
  open, 
  onOpenChange, 
  mode, 
  onModeChange,
}: EditJobDialogProps) {
  // --- CONTEXT & STATES ---
  const { jobs, updateJob, deleteJob } = useJobs();
  const { user } = useAuth();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Partial<Job>>({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  // State ของฟอร์มแก้ไข
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerContactOther, setCustomerContactOther] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [location, setLocation] = useState("")
  const [mapPosition, setMapPosition] = useState<[number, number] | undefined>()

  // (ใช้ ID ที่เป็น string ตลอดการทำงานในฟอร์ม)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // --- EFFECT: "ซิงค์" ข้อมูลจาก prop `job` เข้ามาใน State ของฟอร์ม ---
  useEffect(() => {
    if (open && job) {
      setTitle(job.title || "");
      setDescription(job.description || "");
      setJobType(job.jobType || "");
      setCustomerName(job.customerName || "");
      setCustomerPhone(job.customerPhone || "");
      setCustomerContactOther(job.customerContactOther || "");
      setStartDate(job.startDate ? new Date(job.startDate) : undefined);
      setEndDate(job.endDate ? new Date(job.endDate) : undefined);
      setSelectedLeadId(job.leadId ? String(job.leadId) : null);

      setLocation(job.location || "")
      if (job.latitude && job.longitude) {
        setMapPosition([job.latitude, job.longitude])
      } else {
        setMapPosition(undefined)
      }
    }
  }, [open, job])

  // --- LOGIC: กรองหา Leader ที่ว่าง ---
  const availableLeads = useMemo(() => {
    if (!startDate || !endDate || !job) return [];

    // (รวบรวม ID ของหัวหน้าที่ "ไม่ว่าง" โดยเทียบเป็น string)
    const busyLeadIds = new Set(
      jobs
        .filter(
          (j) =>
            // ไม่เช็ค Job ID ปัจจุบัน
            j.id !== job.id &&
            // เช็ควันซ้อน
            isDateRangeOverlapping(startDate, endDate, j.startDate, j.endDate) &&
            j.leadId
        )
        .map((j) => String(j.leadId)) // (แปลง ID เป็น string)
    );

    // (กรองจาก ALL_LEADERS โดยเทียบ ID เป็น string)
    return ALL_LEADERS
    .filter((lead) => !busyLeadIds.has(String(lead.id))) // (เทียบ string กับ string)
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0)
    );
  }, [startDate, endDate, jobs, job]);

  // --- HANDLERS ---
  const handleSave = () => {
    console.log("--- 'บันทึกการแก้ไข' button clicked! ---");
    if (!job) return;

    const changes: Partial<Job> = {};

    // (ตรวจจับการเปลี่ยนแปลง)
    if (title !== job.title) changes.title = title;
    if (description !== (job.description || "")) changes.description = description;
    if (jobType !== job.jobType) changes.jobType = jobType;
    if (customerName !== job.customerName) changes.customerName = customerName;
    if (customerPhone !== (job.customerPhone || "")) changes.customerPhone = customerPhone;
    if (customerContactOther !== (job.customerContactOther || "")) changes.customerContactOther = customerContactOther;
    if (startDate?.getTime() !== new Date(job.startDate).getTime()) changes.startDate = startDate;
    if (endDate?.getTime() !== new Date(job.endDate).getTime()) changes.endDate = endDate;

    // ▼▼▼ [แก้ไขข้อ 1] เปรียบเทียบ ID เป็น string ▼▼▼
    if (selectedLeadId !== String(job.leadId || null)) {
      // (แปลงกลับเป็น number ตอนจะบันทึก)
      changes.leadId = selectedLeadId ? Number(selectedLeadId) : null;
    }
    if (location !== (job.location || "")) changes.location = location

    if (mapPosition) {
      if (mapPosition[0] !== job.latitude || mapPosition[1] !== job.longitude) {
        changes.latitude = mapPosition[0]
        changes.longitude = mapPosition[1]
      }
    }

    if (Object.keys(changes).length === 0) {
      alert("ไม่มีข้อมูลเปลี่ยนแปลง");
      onOpenChange(false); // ปิด Dialog
      return;
    }

    setPendingChanges(changes);
    setIsAlertOpen(true);
  };

  const handleConfirmSave = () => {
    if (!job || !user || !editReason) {
      alert("เกิดข้อผิดพลาด หรือยังไม่ได้กรอกเหตุผล");
      return;
    }
    updateJob(job.id, pendingChanges, editReason, user.fname);
    setEditReason("");
    setIsAlertOpen(false);
    onOpenChange(false);
  };

  if (!job || !user) return null;

  // --- JSX (ส่วนแสดงผล) ---
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-6xl max-h-[90vh] flex flex-col"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{job.title}</DialogTitle>
          </DialogHeader>

          {mode === "view" ? (
            // --- โหมด "ดูรายละเอียด" ---
            <>
              <ScrollArea className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Job Information Card */}
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
                            <p className="text-xs text-muted-foreground mb-1">หัวหน้างาน</p>
                            {job.leadId ? (
                              (() => {
                                const assignedLeader = ALL_LEADERS.find(l => String(l.id) === String(job.leadId));
                                return assignedLeader ? (
                                  <p className="font-medium flex items-center gap-1.5">
                                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                                    {assignedLeader.fname} {assignedLeader.lname}
                                  </p>
                                ) : (
                                  <p className="text-xs text-muted-foreground">ไม่พบข้อมูล</p>
                                );
                              })()
                            ) : (
                              <p className="text-xs text-muted-foreground">ยังไม่ได้มอบหมาย</p>
                            )}
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">ทีมช่าง</p>
                            {job.assignedTechs && job.assignedTechs.length > 0 ? (
                              <div className="space-y-1.5">
                                {job.assignedTechs.map((techId) => {
                                  const tech = ALL_USERS.find(u => String(u.id) === String(techId));
                                  return tech ? (
                                    <p key={techId} className="font-medium flex items-center gap-1.5 text-xs">
                                      <Users className="h-3 w-3 text-primary" />
                                      {tech.fname} {tech.lname}
                                    </p>
                                  ) : null;
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">ยังไม่มีช่างที่มอบหมาย</p>
                            )}
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">ผู้สร้าง</p>
                            <p className="font-medium">{job.adminCreator}</p>
                            <p className="text-xs text-muted-foreground">เมื่อ {format(job.createdAt, "dd/MM/yyyy HH:mm", { locale: th })}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Customer Information Card */}
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

                    {/* Work Location Card */}
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
                          <p className="text-sm text-muted-foreground leading-relaxed">{job.location || "ไม่ระบุ"}</p>
                        </div>
                        {mapPosition && (
                          <div className="rounded-lg overflow-hidden border">
                            <AdminMap initialAddress={location} initialPosition={mapPosition} readOnly={true} />
                          </div>
                        )}
                        {!location && !mapPosition && <p className="text-sm text-muted-foreground">ไม่มีข้อมูลสถานที่</p>}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Job Description Card */}
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
                        <p>{job.description || "ไม่มีรายละเอียด"}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Leader Status & Progress Card *                 <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <CardTitle className="text-lg">สถานะและความคืบหน้า</CardTitle>
                        </div>
                        <Badge variant={job.status === "new" ? "default" : job.status === "in-progress" ? "secondary" : "outline"}>
                          {job.status === "new" ? "รอยืนยัน" : job.status === "in-progress" ? "กำลังดำเนินการ" : "เสร็จสิ้น"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {job.status === "new" ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                          <p><strong>สถานะ:</strong> ยังอยู่ในระหว่างรอการยืนยันจากหัวหน้างาน</p>
                        </div>
                      ) : job.status === "done" ? (
                        // สำหรับงานที่เสร็จแล้ว แสดงสรุปผลและปัญหา
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-primary mb-2">สรุปผลการทำงาน</h4>
                            <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                              <p>{job.completionSummary || "ไม่มีข้อมูลสรุปผล"}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-primary mb-2">ปัญหาที่พบ</h4>
                            <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                              <p>{job.completionIssues || "ไม่มีปัญหาที่พบ"}</p>
                            </div>
                          </div>
                          {job.completionIssueImage && (
                            <div>
                              <h4 className="text-sm font-semibold text-primary mb-2">หลักฐานรูปภาพ</h4>
                              <div className="rounded-lg overflow-hidden border">
                                <img
                                  src={job.completionIssueImage}
                                  alt="Completion issue"
                                  className="w-full h-auto max-h-48 object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Tabs defaultValue="leader" className="w-full">
                          <TabsList>
                            <TabsTrigger value="leader">ความคืบหน้า (Leader/Tech)</TabsTrigger>
                            <TabsTrigger value="admin">ประวัติแก้ไข (Admin)</TabsTrigger>
                          </TabsList>
                          <TabsContent value="leader" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                            {(!job.activityLog || job.activityLog.length === 0) && job.tasks.length === 0 && (
                              <p className="text-sm text-muted-foreground p-4 text-center">ยังไม่มีความคืบหน้า</p>
                            )}
                            {job.activityLog && job.activityLog.length > 0 && (
                              <div className="space-y-2">
                                {job.activityLog.map((activity, idx) => (
                                  <div key={idx} className="p-3 bg-muted rounded-md text-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold">{activity.actorName}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({activity.actorRole === 'leader' ? 'หัวหน้า' : 'ช่าง'})
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        - {format(activity.timestamp, "PPpp", { locale: th })}
                                      </span>
                                    </div>
                                    <p className="text-sm">{activity.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                          </TabsContent>
                          <TabsContent value="admin" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                            {job.editHistory.length === 0 && (
                              <p className="text-sm text-muted-foreground p-4 text-center">ยังไม่มีการแก้ไขโดย Admin</p>
                            )}
                            {job.editHistory.map((entry, index) => (
                              <div key={index} className="text-sm p-3 bg-muted rounded-md">
                                <p><strong>ผู้แก้ไข:</strong> {entry.adminName}</p>
                                <p><strong>เวลา:</strong> {format(entry.editedAt, "PPpp", { locale: th })}</p>
                                <p><strong>เหตุผล:</strong> {entry.reason}</p>
                              </div>
                            ))}

                          </TabsContent>
                        </Tabs>
                      )}
                    </CardContent>

                  </Card>
                   {/* รายละเอียดงานย่อย-  */}
                   {job.tasks && job.tasks.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Briefcase className="h-5 w-5" />
                          <CardTitle className="text-lg">รายละเอียดงานย่อย ({job.tasks.length})</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <TaskDetailsLocked tasks={job.tasks} />
                      </CardContent>
                    </Card>
                  )}

                </div>
              </ScrollArea>              
              <DialogFooter className="border-t bg-background">
                <DialogClose asChild><Button variant="outline">ปิด</Button></DialogClose>
                {job.status === "done" ? (
                  <Button onClick={() => generateCompletionReportPdf(job)} variant="default">
                    <Download className="h-4 w-4 mr-2" />
                    โหลด PDF รายงาน
                  </Button>
                ) : (
                  <Button onClick={() => onModeChange("edit")}>ไปที่โหมดแก้ไข</Button>
                )}
              </DialogFooter>
            </>
          ) : (
            // --- โหมด "แก้ไข" ---
            <>
              <ScrollArea className="flex-1 p-4 overflow-auto">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                      <CardDescription>อัปเดตหัวข้องานและประเภทงาน</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label className="mb-1 block text-sm font-medium">หัวข้องาน*</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium">ประเภทงาน*</Label>
                        <Select onValueChange={setJobType} value={jobType}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกประเภทงาน..." />
                          </SelectTrigger>
                          <SelectContent>
                            {JOB_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="mb-1 block text-sm font-medium">รายละเอียดงาน</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={6}
                          placeholder="รายละเอียด, ขอบเขตงาน, หรือหมายเหตุ"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>ข้อมูลลูกค้า</CardTitle>
                      <CardDescription>ตรวจสอบและแก้ไขข้อมูลการติดต่อของลูกค้า</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label className="mb-1 block text-sm font-medium">ชื่อลูกค้า*</Label>
                        <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium">เบอร์โทร</Label>
                        <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium">ช่องทางติดต่ออื่น</Label>
                        <Input
                          value={customerContactOther}
                          onChange={(e) => setCustomerContactOther(e.target.value)}
                          placeholder="Line, Email เป็นต้น"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>สถานที่ปฏิบัติงาน</CardTitle>
                      <CardDescription>ระบุตำแหน่งและที่อยู่สำหรับปฏิบัติงาน</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AdminMap
                        initialAddress={location}
                        initialPosition={mapPosition}
                        onAddressChange={setLocation}
                        onPositionChange={setMapPosition}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>กำหนดการและหัวหน้างาน</CardTitle>
                      <CardDescription>อัปเดตช่วงเวลางาน และเลือกหัวหน้างานใหม่หากจำเป็น</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="mb-1 block text-sm font-medium">วันเริ่มงาน*</Label>
                        <DatePicker date={startDate} setDate={setStartDate} />
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium">วันจบงาน*</Label>
                        <DatePicker date={endDate} setDate={setEndDate} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm font-medium">
                          หัวหน้างาน* <span className="text-xs text-muted-foreground">(จะแสดงเฉพาะคนที่ว่าง)</span>
                        </Label>
                        <LeaderSelect
                          leaders={availableLeads}
                          selectedValue={selectedLeadId}
                          onValueChange={setSelectedLeadId}
                          disabled={!startDate || !endDate}
                        />
                        {(!startDate || !endDate) && (
                          <p className="text-xs text-muted-foreground">
                            กรุณาเลือกวันเริ่มและวันจบก่อน เพื่อกรองหัวหน้างานที่พร้อม
                            </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
              <DialogFooter className="border-t bg-background">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => onModeChange("view")}>
                      กลับไปโหมดดู
                    </Button>
                    {user.role === 'admin' && (
                      <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                        ลบงาน
                      </Button>
                    )}
                  </div>
                  <Button onClick={handleSave}>บันทึกการแก้ไข</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Pop-up ถามเหตุผล --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการแก้ไข</AlertDialogTitle>
            <AlertDialogDescription>
              กรุณาระบุเหตุผลสำหรับการแก้ไขในครั้งนี้
              </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="reason">เหตุผลการแก้ไข*</Label>
            <Textarea
              id="reason"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="เช่น: แก้ไขคำผิด, อัปเดตเบอร์โทรลูกค้า..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={!editReason}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* --- AlertDialog ลบงาน (Admin) --- */}
      <AlertDialog open={isDeleteOpen} onOpenChange={(next) => { setIsDeleteOpen(next); if (!next) setDeleteReason(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบใบงาน</AlertDialogTitle>
            <AlertDialogDescription>
              การลบใบงานจะเป็นการลบถาวรและแจ้งเตือนไปยังหัวหน้าและช่างที่เกี่ยวข้อง
              กรุณาระบุเหตุผลสั้น ๆ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="delete-reason">เหตุผลการลบ*</Label>
            <Textarea id="delete-reason" value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} rows={4} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (!deleteReason.trim()) {
                alert('กรุณาระบุเหตุผลการลบ');
                return;
              }
              if (!job || !user) return;
              deleteJob(job.id, deleteReason.trim(), user.fname);
              setIsDeleteOpen(false);
              setDeleteReason("");
              onOpenChange(false);
            }}>
              ยืนยันลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
