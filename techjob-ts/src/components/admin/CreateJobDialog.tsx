// src/components/admin/CreateJobDialog.tsx
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateJobForm } from './CreateJobForm';

interface CreateJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>+ สร้างใบงานใหม่</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>สร้างใบงานใหม่</DialogTitle>
          <DialogDescription>
            กรอกรายละเอียดทั้งหมดของงาน และมอบหมายหัวหน้างาน
          </DialogDescription>
        </DialogHeader>
        
        {/* ฟอร์มจะถูก Render ที่นี่ */}
        <CreateJobForm onFinished={() => onOpenChange(false)} />

      </DialogContent>
    </Dialog>
  );
}