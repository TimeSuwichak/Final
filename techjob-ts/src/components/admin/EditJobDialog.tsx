// src/components/admin/EditJobDialog.tsx (ฉบับสมบูรณ์)
"use client";

// --- IMPORTS ---
import React, { useState, useEffect, useMemo } from "react";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { th } from "date-fns/locale";

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
          className="sm:max-w-4xl max-h-[90vh] flex flex-col"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{job.title}</DialogTitle>
          </DialogHeader>

          {mode === "view" ? (
            // --- โหมด "ดูรายละเอียด" ---
            <>
              <ScrollArea className="flex-1 p-4 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* (คอลัมน์ซ้าย: ข้อมูลหลัก) */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">ข้อมูลใบงาน (อ่านอย่างเดียว)</h4>
                    <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                      <p><strong>หัวข้อ:</strong> {job.title}</p>
                      <p><strong>ประเภท:</strong> {job.jobType}</p>
                      <p><strong>รายละเอียด:</strong> {job.description || "ไม่มี"}</p>
                      <p>
                        <strong>ผู้สร้าง:</strong> {job.adminCreator} (เมื่อ{" "}
                        {format(job.createdAt, "P", { locale: th })})
                      </p>
                    </div>
                    <h4 className="font-semibold">ข้อมูลลูกค้า</h4>
                    <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                      <p><strong>ชื่อ:</strong> {job.customerName}</p>
                      <p><strong>โทร:</strong> {job.customerPhone || "ไม่มี"}</p>
                      <p><strong>ติดต่ออื่นๆ:</strong> {job.customerContactOther || "ไม่มี"}</p>
                    </div>
                    <h4 className="font-semibold">สถานที่ปฏิบัติงาน</h4>
                    <div className="p-3 bg-muted rounded-md space-y-3 text-sm">
                      {mapPosition && (
                        <div>
                          <AdminMap initialAddress={location} initialPosition={mapPosition} readOnly={true} />
                        </div>
                      )}
                      {!location && !mapPosition && <p className="text-muted-foreground">ไม่มีข้อมูลสถานที่</p>}
                    </div>
                  </div>
                  {/* (คอลัมน์ขวา: สถานะ & ประวัติ) */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">สถานะหัวหน้างาน (Leader)</h4>
                    {job.status === "new" ? (
                      <div className="p-3 bg-muted rounded-md text-sm text-amber-600">
                        <p><strong>สถานะ:</strong> ยังอยู่ในระหว่างรอการยืนยันจากหัวหน้างาน</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-muted rounded-md text-sm text-green-600">
                        <p><strong>สถานะ:</strong> หัวหน้างานรับทราบงานแล้ว (สถานะ: {job.status})</p>
                      </div>
                    )}
                    <Tabs defaultValue="leader" className="w-full">
                      <TabsList>
                        <TabsTrigger value="leader">ความคืบหน้า (Leader/Tech)</TabsTrigger>
                        <TabsTrigger value="admin">ประวัติแก้ไข (Admin)</TabsTrigger>
                      </TabsList>
                      <TabsContent value="leader" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                        {/* แสดง Activity Log */}
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
                        {/* แสดง Tasks */}
                        {job.tasks.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <h5 className="font-semibold text-sm">งานย่อย (Tasks)</h5>
                            {job.tasks.map((task) => (
                              <div key={task.id} className="p-3 border rounded-md">
                                <p className="font-semibold text-sm">{task.title}</p>
                                <p className="text-xs text-muted-foreground">{task.description}</p>
                                {task.updates && task.updates.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {task.updates.map((update, idx) => (
                                      <div key={idx} className="p-2 bg-background rounded-md text-xs border">
                                        <p>
                                          <strong>{update.updatedBy}</strong> (เมื่อ{" "}
                                          {format(update.updatedAt, "PPpp", { locale: th })}):
                                        </p>
                                        <p>{update.message}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
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
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">ปิด</Button></DialogClose>
                <Button onClick={() => onModeChange("edit")}>ไปที่โหมดแก้ไข</Button>
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