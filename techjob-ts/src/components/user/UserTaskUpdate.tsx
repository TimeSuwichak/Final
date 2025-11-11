// src/components/user/UserTaskUpdate.tsx
"use client";

import React, { useState } from 'react';
import { type Job, type Task } from '@/types/index';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UserTaskUpdateProps {
  job: Job;
  task: Task;
}

export function UserTaskUpdate({ job, task }: UserTaskUpdateProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth(); // ช่างที่ Login อยู่

  // State สำหรับฟอร์ม "ส่งอัปเดต"
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  // (State สำหรับ File Upload)
  // const [imageFile, setImageFile] = useState<File | null>(null);

  if (!user) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreview(null);
      setImageName("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = () => {
    if (!message) {
      alert("กรุณากรอกข้อความอัปเดต");
      return;
    }

    // 1. สร้าง "Update" object ใหม่
    const newUpdate = {
      message: message,
      imageUrl: imagePreview || undefined,
      updatedBy: user.fname, // ชื่อช่าง
      updatedAt: new Date(),
    };

    // 2. สร้าง "Task" object ที่อัปเดตแล้ว
    const updatedTask: Task = {
      ...task,
      updates: [...(task.updates || []), newUpdate], // เพิ่ม "Update" ใหม่เข้าไป
      status: 'in-progress', // (อาจจะเปลี่ยน status ด้วยก็ได้)
    };

    // 3. สร้าง Array "Tasks" ชุดใหม่ (แทนที่ Task เก่าด้วย Task ที่อัปเดตแล้ว)
    const updatedTasks = job.tasks.map(t => 
      t.id === task.id ? updatedTask : t
    );

    // 4. เรียก "สมอง" ให้อัปเดตใบงานพร้อม Activity Log
    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks }, // สิ่งที่อัปเดต
      'task_updated', // activity type
      `อัปเดต Task: ${task.title} - ${message}`, // ข้อความ
      user.fname, // ชื่อช่าง
      'tech', // บทบาท
      { taskId: task.id, taskTitle: task.title }
    );

    // 5. เคลียร์ฟอร์ม
    setMessage("");
    setImagePreview(null);
    setImageName("");
  };

  return (
    <Card className="border-muted/70 shadow-sm">
      <CardHeader className="space-y-2">
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h5 className="text-sm font-semibold">ประวัติการอัปเดต</h5>
          <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
            {task.updates && task.updates.length > 0 ? (
              task.updates.map((update, index) => (
                <div key={index} className="rounded-md border bg-background p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{update.updatedBy}</span>
                    <span>{format(update.updatedAt, 'dd/MM/yyyy HH:mm', { locale: th })}</span>
                  </div>
                  <p className="mt-2 leading-relaxed">{update.message}</p>
                  {update.imageUrl && (
                    <div className="mt-3 overflow-hidden rounded-md border">
                      <img
                        src={update.imageUrl}
                        alt={`รูปภาพที่อัปเดตโดย ${update.updatedBy}`}
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">(ยังไม่มีการอัปเดต)</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-semibold">ส่งอัปเดตความคืบหน้า</Label>
          <Textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="อธิบายงานที่ทำ ความคืบหน้า หรือปัญหาที่พบ..."
            rows={3}
          />
          <div className="space-y-2 rounded-md border border-dashed p-3">
            <Label className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
              แนบรูปภาพ (ถ้ามี)
              {imageName && <span className="text-[10px] text-primary">{imageName}</span>}
            </Label>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {imagePreview && (
              <div className="overflow-hidden rounded-md border">
                <img src={imagePreview} alt="ตัวอย่างรูปภาพ" className="h-48 w-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={handleUpdate}>
              ส่งอัปเดต
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}