// src/components/user/UserJobDetailDialog.tsx
"use client";

import React from 'react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserTaskUpdate } from './UserTaskUpdate'; // 1. Import เครื่องมือส่งงาน
import type { Job } from '@/types/index';

interface UserJobDetailDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserJobDetailDialog({ job, open, onOpenChange }: UserJobDetailDialogProps) {

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>ใบงาน: {job.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* --- คอลัมน์ซ้าย: ข้อมูลงาน (อ่านอย่างเดียว) --- */}
            <div className="space-y-4">
              <h4 className="font-semibold">ข้อมูลงาน</h4>
              <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                <p><strong>ประเภท:</strong> {job.jobType}</p>
                <p><strong>รายละเอียด:</strong> {job.description || "ไม่มี"}</p>
              </div>

              <h4 className="font-semibold">ข้อมูลลูกค้า</h4>
              <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                <p><strong>ชื่อ:</strong> {job.customerName}</p>
                <p><strong>โทร:</strong> {job.customerPhone}</p>
              </div>
              
              <h4 className="font-semibold">สถานที่ (รอ Map)</h4>
              <div className="p-3 bg-muted rounded-md text-sm">
                <p>{job.location}</p>
              </div>
            </div>

            {/* --- คอลัมน์ขวา: Task งานย่อย (จุดที่ช่างทำงาน) --- */}
            <div className="space-y-4">
              <h4 className="font-semibold">Task งานย่อยที่ต้องทำ</h4>
              
              {/* 2. วนลูปแสดง "เครื่องมือส่งงาน" สำหรับทุก Task */}
              {job.tasks.length > 0 ? (
                job.tasks.map(task => (
                  <UserTaskUpdate key={task.id} job={job} task={task} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center p-4">
                  หัวหน้ายังไม่ได้สร้าง Task (โปรดติดต่อหัวหน้า)
                </p>
              )}
            </div>

          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">ปิด</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}