// src/components/leader/TaskManagement.tsx
"use client";

import React, { useState, useRef } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Plus,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  Paperclip,
  Send,
  Eye,
  Download,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  User
} from 'lucide-react';

interface TaskManagementProps {
  job: Job; // รับ Job ทั้ง Object มาเลย
}

export function TaskManagement({ job }: TaskManagementProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth(); // Leader ที่ Login อยู่

  // State สำหรับฟอร์ม "สร้าง Task ใหม่"
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // State สำหรับการแสดงรูปภาพเต็มจอ
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // State สำหรับการแสดง task detail
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // State สำหรับการอัปเดต task (สำหรับช่าง)
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateImage, setUpdateImage] = useState<File | null>(null);
  const [updateFile, setUpdateFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'in-progress':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-orange-700 bg-orange-50 border-orange-200';
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Task List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-semibold">งานย่อย ({job.tasks.length})</h4>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่ม Task
        </Button>
      </div>

      {/* Task List */}
      {job.tasks.length > 0 ? (
        <div className="grid gap-4">
          {job.tasks.map(task => (
            <Card
              key={task.id}
              className="cursor-pointer  border-l-primary/20"
              onClick={() => handleTaskClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-base truncate">{task.title}</h5>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status === 'pending' && 'รอดำเนินการ'}
                        {task.status === 'in-progress' && 'กำลังทำงาน'}
                        {task.status === 'completed' && 'เสร็จสิ้น'}
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    )}

                    {/* Latest Update Preview */}
                    {task.updates && task.updates.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{task.updates.length} การอัปเดตล่าสุด</span>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {task.updates[task.updates.length - 1].updatedBy[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">{task.updates[task.updates.length - 1].updatedBy}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(task.updates[task.updates.length - 1].updatedAt, 'dd/MM HH:mm', { locale: th })}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2">{task.updates[task.updates.length - 1].message}</p>
                          {task.updates[task.updates.length - 1].imageUrl && (
                            <div className="mt-2 flex gap-2">
                              <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted">
                                <img
                                  src={task.updates[task.updates.length - 1].imageUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageClick(task.updates[task.updates.length - 1].imageUrl!);
                                  }}
                                />
                              </div>
                              {task.updates.length > 1 && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  +{task.updates.length - 1} รูป
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>ยังไม่มีการอัปเดต</span>
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="shrink-0">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-muted-foreground">ยังไม่มี Task งานย่อย</p>
                <p className="text-sm text-muted-foreground">เริ่มสร้าง task แรกเพื่อแบ่งงานให้ทีม</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create New Task Form */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            เพิ่ม Task ใหม่
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">หัวข้อ Task *</Label>
            <Input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="เช่น: ตรวจสอบอุปกรณ์ไฟฟ้า"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">รายละเอียด Task</Label>
            <Textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="อธิบายขั้นตอนการทำงาน หรือสิ่งที่ต้องเตรียมให้ทีมช่าง"
              rows={3}
              className="text-sm resize-none"
            />
          </div>
          <Button onClick={handleAddTask} className="w-full gap-2" disabled={!newTitle.trim()}>
            <Plus className="h-4 w-4" />
            เพิ่ม Task
          </Button>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 z-10 bg-black/20 hover:bg-black/40 text-white"
              onClick={() => setImageDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size"
                className="w-full h-auto max-h-[85vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Task Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedTask.status)}`}>
                      {getStatusIcon(selectedTask.status)}
                      {selectedTask.status === 'pending' && 'รอดำเนินการ'}
                      {selectedTask.status === 'in-progress' && 'กำลังทำงาน'}
                      {selectedTask.status === 'completed' && 'เสร็จสิ้น'}
                    </div>
                  </div>

                  {selectedTask.description && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm leading-relaxed">{selectedTask.description}</p>
                    </div>
                  )}
                </div>

                {/* Updates Timeline */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    ความคืบหน้า ({selectedTask.updates.length})
                  </h4>

                  {selectedTask.updates.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTask.updates.map((update, idx) => (
                        <div key={idx} className="flex gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs">
                              {update.updatedBy[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{update.updatedBy}</span>
                              <span className="text-xs text-muted-foreground">
                                {format(update.updatedAt, 'dd/MM/yyyy HH:mm', { locale: th })}
                              </span>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{update.message}</p>
                              {update.imageUrl && (
                                <div className="mt-3">
                                  <img
                                    src={update.imageUrl}
                                    alt={`จาก ${update.updatedBy}`}
                                    className="max-w-full h-auto rounded-lg border cursor-pointer"
                                    onClick={() => handleImageClick(update.imageUrl!)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">ยังไม่มีการอัปเดตจากทีมช่าง</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}