// src/components/admin/EditJobDialog.tsx
"use client";

import React, { useState } from 'react';

import { useJobs } from '@/contexts/JobContext';
// import { useAuth } from '@/contexts/AuthContext'; // (สมมติว่ามี AuthContext)
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Job } from '@/types/index';

interface EditJobDialogProps {
  job: Job | null; // งานที่ถูกเลือก
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJobDialog({ job, open, onOpenChange }: EditJobDialogProps) {
  const { updateJob } = useJobs();
  // const { currentUser } = useAuth(); // (สมมติว่าได้ชื่อ Admin ที่ Login อยู่)

  // State สำหรับเก็บข้อมูลที่กำลังแก้ไข
  const [title, setTitle] = useState(job?.title || "");
  const [description, setDescription] = useState(job?.description || "");
  
  // State สำหรับ Pop-up "เหตุผลการแก้ไข"
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editReason, setEditReason] = useState("");

  // อัปเดต State ภายใน เมื่อ 'job' prop เปลี่ยน (เช่น ผู้ใช้คลิกงานใหม่)
  React.useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description);
    }
  }, [job]);

  if (!job) return null; // ไม่ต้อง Render อะไรเลยถ้าไม่มีงานที่ถูกเลือก

  // ฟังก์ชันเมื่อกด "บันทึกการแก้ไข"
  const handleSave = () => {
    // 1. ตรวจสอบว่ามีอะไรเปลี่ยนแปลงไหม
    const changes: Partial<Job> = {};
    if (title !== job.title) changes.title = title;
    if (description !== job.description) changes.description = description;
    
    if (Object.keys(changes).length === 0) {
      onOpenChange(false); // ถ้าไม่แก้ ก็ปิดไปเลย
      return;
    }
    
    // 2. ถ้ามีการเปลี่ยนแปลง ให้เปิด Pop-up ถามเหตุผล
    setIsAlertOpen(true);
  };

  // ฟังก์ชันเมื่อ "ยืนยัน" การแก้ไข (จาก Pop-up เหตุผล)
  const handleConfirmSave = () => {
    if (!editReason) {
      alert("กรุณากรอกเหตุผลการแก้ไข");
      return;
    }
    
    // (สมมติว่า adminName มาจาก AuthContext)
    const adminName = "Admin แก้ไข"; 
    
    const changes: Partial<Job> = {};
    if (title !== job.title) changes.title = title;
    if (description !== job.description) changes.description = description;

    // 3. เรียก "สมอง" ให้อัปเดต
    updateJob(job.id, changes, editReason, adminName);

    // 4. ปิด Pop-up ทั้งหมด
    setEditReason("");
    setIsAlertOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      {/* === Dialog หลักสำหรับแก้ไข === */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>รายละเอียดใบงาน: {job.id}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[70vh] p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* --- คอลัมน์ซ้าย: ฟอร์มแก้ไข --- */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-semibold">ข้อมูลงาน (แก้ไขได้)</h4>
                <div><Label>หัวข้องาน*</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><Label>รายละเอียดงาน</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} /></div>
                
                {/* (คุณสามารถเพิ่มฟอร์มแก้ไขส่วนอื่นๆ ที่นี่ได้) */}
                
                <Separator className="my-6" />
                
                {/* --- ส่วนแสดงประวัติการแก้ไข --- */}
                <h4 className="font-semibold">ประวัติการแก้ไข</h4>
                <div className="space-y-3">
                  {job.editHistory.length > 0 ? (
                    job.editHistory.map((entry, index) => (
                      <div key={index} className="text-sm p-3 bg-muted rounded-md">
                        <p><strong>ผู้แก้ไข:</strong> {entry.adminName}</p>
                        <p><strong>เวลา:</strong> {format(entry.editedAt, "dd/MM/yy HH:mm")}</p>
                        <p><strong>เหตุผล:</strong> {entry.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">ยังไม่มีการแก้ไข</p>
                  )}
                </div>
              </div>
              
              {/* --- คอลัมน์ขวา: ข้อมูล Meta (ดูได้อย่างเดียว) --- */}
              <div className="md:col-span-1 space-y-3">
                <h4 className="font-semibold">ข้อมูลระบบ</h4>
                <div className="text-sm p-3 bg-muted/50 rounded-md">
                  <p><strong>สถานะ:</strong> {job.status}</p>
                  <p><strong>ผู้สร้าง:</strong> {job.adminCreator}</p>
                  <p><strong>วันที่สร้าง:</strong> {format(job.createdAt, "dd/MM/yy HH:mm")}</p>
                  <p><strong>หัวหน้างาน:</strong> {job.leadId || "ยังไม่มอบหมาย"}</p>
                </div>
                {/* (แสดงข้อมูลลูกค้า ฯลฯ) */}
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">ยกเลิก</Button></DialogClose>
            <Button onClick={handleSave}>บันทึกการแก้ไข</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* === Alert Dialog สำหรับถามเหตุผล === */}
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
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>ยืนยัน</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}