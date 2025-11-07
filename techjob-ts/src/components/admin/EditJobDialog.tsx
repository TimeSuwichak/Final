// src/components/admin/EditJobDialog.tsx (ฉบับแก้ไข Footer)
"use client";

import React, { useState, useEffect, useMemo } from 'react';

import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from '@/components/common/DatePicker';
import { LeaderSelect } from './LeaderSelect';
import { isDateRangeOverlapping } from '@/lib/utils';
import { leader as ALL_LEADERS } from '@/data/leader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Job } from '@/types/index';

const JOB_TYPES = [
  "ซ่อมบำรุง", "รื้อถอน", "ติดตั้งระบบ", "ตรวจสอบประจำปี", "อื่นๆ"
];

interface EditJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode: 'view' | 'edit' | null; 
}

export function EditJobDialog({ job, open, onOpenChange, initialMode }: EditJobDialogProps) {
  const { jobs, updateJob } = useJobs();
  const { user } = useAuth();
  
  const [mode, setMode] = useState(initialMode);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [pendingChanges, setPendingChanges] = useState<Partial<Job>>({});

  // (State ของ "ฟอร์มแก้ไข")
  const [title, setTitle] = useState(job?.title || "");
  const [description, setDescription] = useState(job?.description || "");
  const [jobType, setJobType] = useState(job?.jobType || "");
  const [customerName, setCustomerName] = useState(job?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(job?.customerPhone || "");
  const [customerContactOther, setCustomerContactOther] = useState(job?.customerContactOther || "");
  const [startDate, setStartDate] = useState<Date | undefined>(job?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(job?.endDate);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(String(job?.leadId || null));

  // ("รีเซ็ต" โหมดและข้อมูลทั้งหมด)
  useEffect(() => {
    if (open && job) {
      setMode(initialMode);
      setTitle(job.title);
      setDescription(job.description || "");
      setJobType(job.jobType);
      setCustomerName(job.customerName);
      setCustomerPhone(job.customerPhone);
      setCustomerContactOther(job.customerContactOther || "");
      setStartDate(job.startDate);
      setEndDate(job.endDate);
      setSelectedLeadId(String(job.leadId));
    }
  }, [open, initialMode, job]);

  // (Logic กรอง Leader ... เหมือนเดิม)
  const availableLeads = useMemo(() => {
    if (!startDate || !endDate || !job) return [];
    const busyLeadIds = new Set(
      jobs
        .filter(j => 
          j.id !== job.id && 
          isDateRangeOverlapping(startDate, endDate, j.startDate, j.endDate) && 
          j.leadId
        )
        .map(j => j.leadId)
    );
    return ALL_LEADERS
      .filter(lead => !busyLeadIds.has(String(lead.id)))
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
  }, [startDate, endDate, jobs, job]);

  // (Logic การบันทึก ... เหมือนเดิม)
  const handleSave = () => {
    if (!job) return; 
    const changes: Partial<Job> = {};
    if (title !== job.title) changes.title = title;
    if (description !== (job.description || "")) changes.description = description;
    if (jobType !== job.jobType) changes.jobType = jobType;
    if (customerName !== job.customerName) changes.customerName = customerName;
    if (customerPhone !== job.customerPhone) changes.customerPhone = customerPhone;
    if (customerContactOther !== (job.customerContactOther || "")) changes.customerContactOther = customerContactOther;
    if (startDate?.getTime() !== job.startDate.getTime()) changes.startDate = startDate;
    if (endDate?.getTime() !== job.endDate.getTime()) changes.endDate = endDate;
    if (String(selectedLeadId) !== String(job.leadId)) changes.leadId = selectedLeadId;

    if (Object.keys(changes).length === 0) {
      alert("ไม่มีอะไรเปลี่ยนแปลง");
      onOpenChange(false); 
      return;
    }
    
    setPendingChanges(changes); 
    setIsAlertOpen(true); 
  };

  const handleConfirmSave = () => {
    if (!job || !user) return; 
    if (!editReason) {
      alert("กรุณากรอกเหตุผลการแก้ไข");
      return;
    }
    
    updateJob(job.id, pendingChanges, editReason, user.fname);

    setEditReason("");
    setIsAlertOpen(false);
    onOpenChange(false); 
  };
  
  if (!job || !user) return null;

  return (
    <>
      {/* --- (1) Pop-up หลัก (Dialog) --- */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{job.title}</DialogTitle>
          </DialogHeader>
          
          {mode === 'view' ? (
            // --- 🚀 โหมด "ดูรายละเอียด" ---
            <>
              <ScrollArea className="h-[70vh] p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* (คอลัมน์ซ้าย: ข้อมูลหลัก) */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">ข้อมูลใบงาน (อ่านอย่างเดียว)</h4>
                    <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                      <p><strong>หัวข้อ:</strong> {job.title}</p>
                      <p><strong>ประเภท:</strong> {job.jobType}</p>
                      <p><strong>รายละเอียด:</strong> {job.description || "ไม่มี"}</p>
                      <p><strong>ผู้สร้าง:</strong> {job.adminCreator} (เมื่อ {format(job.createdAt, "P", { locale: th })})</p>
                    </div>
                    <h4 className="font-semibold">ข้อมูลลูกค้า</h4>
                    <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                      <p><strong>ชื่อ:</strong> {job.customerName}</p>
                      <p><strong>โทร:</strong> {job.customerPhone}</p>
                      <p><strong>สถานที่:</strong> {job.location}</p>
                    </div>
                  </div>
                  {/* (คอลัมน์ขวา: สถานะ & ประวัติ) */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">สถานะหัวหน้างาน (Leader)</h4>
                    {job.status === 'new' ? (
                      <div className="p-3 bg-muted rounded-md text-sm text-amber-600"><p><strong>สถานะ:</strong> ยังอยู่ในระหว่างรอการยืนยันจากหัวหน้างาน</p></div>
                    ) : (
                      <div className="p-3 bg-muted rounded-md text-sm text-green-600"><p><strong>สถานะ:</strong> หัวหน้างานรับทราบงานแล้ว (สถานะ: {job.status})</p></div>
                    )}
                    <Tabs defaultValue="leader" className="w-full">
                      <TabsList>
                        <TabsTrigger value="leader">ความคืบหน้า (Leader/Tech)</TabsTrigger>
                        <TabsTrigger value="admin">ประวัติแก้ไข (Admin)</TabsTrigger>
                      </TabsList>
                      <TabsContent value="leader" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                        {job.tasks.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">หัวหน้ายังไม่สร้าง Task</p>}
                        {job.tasks.map(task => (
                          <div key={task.id} className="p-3 border rounded-md">
                            <p className="font-semibold">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.description}</p>
                            {task.updates.map((update, idx) => (
                              <div key={idx} className="mt-2 p-2 bg-background rounded-md text-xs border">
                                <p><strong>{update.updatedBy}</strong> (เมื่อ {format(update.updatedAt, "PPpp", { locale: th })}):</p>
                                <p>{update.message}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="admin" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                        {job.editHistory.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">ยังไม่มีการแก้ไขโดย Admin</p>}
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
                <Button onClick={() => setMode('edit')}> 
                  ไปที่โหมดแก้ไข
                </Button>
              </DialogFooter>
            </>
          ) : (
            // --- 🚀 โหมด "แก้ไข" ---
            <>
              <ScrollArea className="h-[70vh] p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* (คอลัมน์ซ้าย: รายละเอียดงาน) */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">1. รายละเอียดงาน (โหมดแก้ไข)</h4>
                    <div><Label>หัวข้องาน*</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                    <div><Label>ประเภทงาน*</Label>
                      <Select onValueChange={setJobType} value={jobType}>
                        <SelectTrigger><SelectValue placeholder="เลือกประเภทงาน..." /></SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>รายละเอียดงาน</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} /></div>
                    <div><Label>รูปภาพหน้างาน (แก้ไข)</Label><Input type="file" /></div>
                    <div><Label>ไฟล์แนบ (PDF, .doc) (แก้ไข)</Label><Input type="file" /></div>
                  </div>
                  {/* (คอลัมน์ขวา: ลูกค้าและทีม) */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">2. ข้อมูลลูกค้า</h4>
                    <div><Label>ชื่อลูกค้า*</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                    <div><Label>เบอร์โทร*</Label><Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
                    <div><Label>ติดต่ออื่นๆ</Label><Input value={customerContactOther} onChange={e => setCustomerContactOther(e.target.value)} /></div>
                    <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">(พื้นที่สำหรับ Map)</div>
                    <h4 className="font-semibold pt-4">3. มอบหมายงาน</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>วันเริ่มงาน*</Label><DatePicker date={startDate} setDate={setStartDate} /></div>
                      <div><Label>วันจบงาน*</Label><DatePicker date={endDate} setDate={setEndDate} /></div>
                    </div>
                    <div>
                      <Label>หัวหน้างาน* (จะแสดงเฉพาะคนที่ว่าง)</Label>
                      <LeaderSelect
                        leaders={availableLeads} 
                        onSelect={setSelectedLeadId}
                        disabled={!startDate || !endDate} 
                        selectedValue={selectedLeadId} 
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMode('view')}>กลับไปโหมดดู</Button>
                <Button onClick={handleSave}>บันทึกการแก้ไข</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- (2) Pop-up ถามเหตุผล (อยู่ที่นี่ ถูกต้องแล้ว!) --- */}
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
                onChange={e => setEditReason(e.target.value)}
                placeholder="เช่น: แก้ไขคำผิด, อัปเดตเบอร์โทรลูกค้า..."
              />
            </div>
            
            {/* ▼▼▼ (แก้ไขจุดนี้!) ▼▼▼ */}
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmSave}>
                ยืนยัน
              </AlertDialogAction>
            </AlertDialogFooter>
            {/* ▲▲▲ (แก้ไขจุดนี้!) ▲▲▲ */}
          
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}