// src/components/user/UserTaskUpdate.tsx
"use client";

import React, { useState } from 'react';
import {   type Job, type Task } from '@/types/index';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserTaskUpdateProps {
  job: Job;
  task: Task;
}

export function UserTaskUpdate({ job, task }: UserTaskUpdateProps) {
  const { updateJob } = useJobs();
  const { user } = useAuth(); // ช่างที่ Login อยู่

  // State สำหรับฟอร์ม "ส่งอัปเดต"
  const [message, setMessage] = useState("");
  // (State สำหรับ File Upload)
  // const [imageFile, setImageFile] = useState<File | null>(null);

  if (!user) return null;

  const handleUpdate = () => {
    if (!message) {
      alert("กรุณากรอกข้อความอัปเดต");
      return;
    }

    // 1. สร้าง "Update" object ใหม่
    const newUpdate = {
      message: message,
      // imageUrl: (รอ xử lý file upload)
      updatedBy: user.fname, // ชื่อช่าง
      updatedAt: new Date(),
    };

    // 2. สร้าง "Task" object ที่อัปเดตแล้ว
    const updatedTask: Task = {
      ...task,
      updates: [...task.updates, newUpdate], // เพิ่ม "Update" ใหม่เข้าไป
      status: 'in-progress', // (อาจจะเปลี่ยน status ด้วยก็ได้)
    };

    // 3. สร้าง Array "Tasks" ชุดใหม่ (แทนที่ Task เก่าด้วย Task ที่อัปเดตแล้ว)
    const updatedTasks = job.tasks.map(t => 
      t.id === task.id ? updatedTask : t
    );

    // 4. เรียก "สมอง" ให้อัปเดตใบงาน
    updateJob(
      job.id,
      { tasks: updatedTasks }, // สิ่งที่อัปเดต
      `ช่าง (${user.fname}) อัปเดต Task: ${task.title}`, // เหตุผลการแก้ไข (สำหรับ Admin)
      user.fname
    );

    // 5. เคลียร์ฟอร์ม
    setMessage("");
  };

  return (
    <div className="p-4 border rounded-lg space-y-3">
      {/* --- 1. รายละเอียด Task (จาก Leader) --- */}
      <div className="p-3 bg-muted rounded-md">
        <p className="font-semibold">{task.title}</p>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </div>

      {/* --- 2. ประวัติการอัปเดต (จากช่าง) --- */}
      <div className="space-y-2 max-h-[150px] overflow-auto pr-2">
        {task.updates.length > 0 ? (
          task.updates.map((update, index) => (
            <div key={index} className="text-xs p-2 bg-background rounded-md border">
              <p><strong>{update.updatedBy}</strong> ({format(update.updatedAt, "dd/MM/yy HH:mm")}):</p>
              <p>{update.message}</p>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground text-center">(ยังไม่มีการอัปเดต)</p>
        )}
      </div>

      {/* --- 3. ฟอร์มส่งอัปเดต --- */}
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-xs font-semibold">ส่งอัปเดตความคืบหน้า</Label>
        <Textarea 
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="รายงานสิ่งที่คุณทำ..."
          rows={2}
          className="text-sm"
        />
        <div className="flex justify-between items-center gap-2">
          <Input type="file" className="text-xs h-9" /> {/* (รอ Logic Upload) */}
          <Button size="sm" onClick={handleUpdate}>ส่ง</Button>
        </div>
      </div>
    </div>
  );
}