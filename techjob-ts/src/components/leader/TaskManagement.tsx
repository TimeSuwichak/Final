// src/components/leader/TaskManagement.tsx
"use client";

import React, { useState } from 'react';
import { type Job, type Task } from '@/types/index';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface TaskManagementProps {
  job: Job; // รับ Job ทั้ง Object มาเลย
}

export function TaskManagement({ job }: TaskManagementProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth(); // Leader ที่ Login อยู่

  // State สำหรับฟอร์ม "สร้าง Task ใหม่"
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  if (!user) return null;

  const handleAddTask = () => {
    if (!newTitle) {
      alert("กรุณาใส่หัวข้อ Task");
      return;
    }

    // 1. สร้าง "Task" object ใหม่
    const newTask: Task = {
      id: `T-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      status: 'pending', // สถานะเริ่มต้น
      updates: [], // ยังไม่มีการอัปเดตจากช่าง
    };

    // 2. สร้าง Array "Tasks" ชุดใหม่ (ของเก่า + ของใหม่)
    const updatedTasks = [...job.tasks, newTask];

    // 3. เรียก "สมอง" ให้อัปเดตใบงานพร้อม Activity Log
    updateJobWithActivity(
      job.id, 
      { tasks: updatedTasks }, // สิ่งที่อัปเดต
      'task_created', // activity type
      `เพิ่ม Task ใหม่: ${newTitle}`, // ข้อความ
      user.fname, // ชื่อคนทำ
      'leader', // บทบาท
      { taskId: newTask.id, taskTitle: newTitle } // metadata
    );

    // 4. เคลียร์ฟอร์ม
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="space-y-4">
      {/* --- ส่วนที่ 1: แสดง Task ที่มีอยู่ --- */}
      <h4 className="font-semibold">งานย่อย (Tasks)</h4>
      <div className="space-y-3 max-h-[200px] overflow-auto pr-2">
        {job.tasks.length > 0 ? (
          job.tasks.map(task => (
            <div key={task.id} className="p-3 bg-muted rounded-md">
              <p className="font-semibold">{task.title}</p>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              {/* (ในอนาคต: จะแสดง updates จากช่างที่นี่) */}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">ยังไม่มี Task งานย่อย</p>
        )}
      </div>

      <Separator />

      {/* --- ส่วนที่ 2: ฟอร์มสร้าง Task ใหม่ --- */}
      <div className="space-y-3">
        <h4 className="font-semibold">เพิ่ม Task ใหม่</h4>
        <div>
          <Label>หัวข้อ Task*</Label>
          <Input 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="เช่น: 1. เบิกวัสดุ"
          />
        </div>
        <div>
          <Label>รายละเอียด Task</Label>
          <Textarea 
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            placeholder="เช่น: เบิกสาย LAN Cat6 100 เมตร..."
            rows={3}
          />
        </div>
        {/* (ในอนาคต: สามารถเพิ่ม Input type="file" สำหรับแนบรูปได้ที่นี่) */}
        <Button type="button" size="sm" onClick={handleAddTask}>
          เพิ่ม Task
        </Button>
      </div>
    </div>
  );
}