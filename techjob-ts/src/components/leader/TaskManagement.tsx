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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-base font-semibold">งานย่อย (Tasks)</h4>
        {job.tasks.length > 0 ? (
          <div className="space-y-3">
            {job.tasks.map(task => (
              <Card key={task.id} className="border-muted/60">
                <CardHeader className="space-y-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
                    <Badge variant={task.status === 'completed' ? 'secondary' : task.status === 'in-progress' ? 'outline' : 'default'}>
                      {task.status === 'pending' && 'รอดำเนินการ'}
                      {task.status === 'in-progress' && 'กำลังทำงาน'}
                      {task.status === 'completed' && 'เสร็จสิ้น'}
                    </Badge>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.updates && task.updates.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">ความคืบหน้าจากทีมช่าง</p>
                      <div className="space-y-2">
                        {task.updates.map((update, idx) => (
                          <div key={idx} className="rounded-md border bg-background p-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">{update.updatedBy}</span>
                              <span>{format(update.updatedAt, 'dd/MM/yyyy HH:mm', { locale: th })}</span>
                            </div>
                            <p className="mt-2 leading-relaxed">{update.message}</p>
                            {update.imageUrl && (
                              <div className="mt-3 overflow-hidden rounded-md border">
                                <img
                                  src={update.imageUrl}
                                  alt={`หลักฐานงานจาก ${update.updatedBy}`}
                                  className="h-48 w-full rounded-md object-cover"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">ยังไม่มีการอัปเดตจากทีมช่าง</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            ยังไม่มี Task งานย่อย
          </div>
        )}
      </div>

      <Separator />

      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg">เพิ่ม Task ใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-1 block text-sm font-medium">หัวข้อ Task*</Label>
            <Input 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="เช่น: ตรวจสอบอุปกรณ์"
            />
          </div>
          <div>
            <Label className="mb-1 block text-sm font-medium">รายละเอียด Task</Label>
            <Textarea 
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="อธิบายขั้นตอน หรือสิ่งที่ต้องเตรียมให้ทีม"
              rows={3}
            />
          </div>
          <Button type="button" size="sm" onClick={handleAddTask} className="w-full md:w-auto">
            เพิ่ม Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}