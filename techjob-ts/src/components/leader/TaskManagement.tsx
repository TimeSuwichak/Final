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
  User,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TaskManagementProps {
  job: Job;
}

export function TaskManagement({ job }: TaskManagementProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth();

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  const handleAddTask = () => {
    if (!newTitle.trim()) {
      alert("กรุณาใส่หัวข้อ Task");
      return;
    }

    const newTask: Task = {
      id: `T-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim(),
      status: 'pending',
      updates: [],
    };

    const updatedTasks = [...job.tasks, newTask];

    updateJobWithActivity(
      job.id, 
      { tasks: updatedTasks },
      'task_created',
      `เพิ่ม Task ใหม่: ${newTitle}`,
      user.fname,
      'leader',
      { taskId: newTask.id, taskTitle: newTitle }
    );

    setNewTitle("");
    setNewDesc("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-3.5 w-3.5 text-blue-600" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-orange-600" />;
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'เสร็จสิ้น';
      case 'in-progress': return 'กำลังทำ';
      default: return 'รอดำเนินการ';
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleDownloadImage = () => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `task-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      </div>

      {/* Task List */}
      {job.tasks.length > 0 ? (
        <div className="grid gap-4">
          {job.tasks.map(task => (
            <Card
              key={task.id}
              className="cursor-pointer hover:shadow-md transition-shadow  border-l-primary/20"
              onClick={() => handleTaskClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h5 className="font-semibold text-base">{task.title}</h5>
                      <Badge className={`text-[10px] h-5 px-1.5 gap-1 shrink-0 ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {getStatusText(task.status)}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                    )}

                    {/* Updates Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <h4 className="text-xs font-semibold">ความคืบหน้า ({task.updates?.length || 0})</h4>
                        </div>
                        {task.updates && task.updates.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsExpanded(!isExpanded);
                            }}
                            className="h-6 px-2 text-xs gap-1"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-3 w-3" />
                                ซ่อน
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-3 w-3" />
                                แสดง
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {task.updates && task.updates.length > 0 ? (
                        isExpanded ? (
                          <ScrollArea>
                            <div className="space-y-2 pr-2">
                              {task.updates.map((update, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <Avatar className="h-7 w-7 shrink-0">
                                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                                      {update.updatedBy[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="font-medium text-xs">{update.updatedBy}</span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {format(update.updatedAt, 'dd/MM HH:mm', { locale: th })}
                                      </span>
                                    </div>
                                    <div className="bg-muted/50 rounded-lg p-2 space-y-2">
                                      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{update.message}</p>
                                      {update.imageUrl && (
                                        <div className="relative group">
                                          <img
                                            src={update.imageUrl}
                                            alt={`จาก ${update.updatedBy}`}
                                            className="w-full h-auto max-h-48 rounded-md border object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleImageClick(update.imageUrl!);
                                            }}
                                          />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
                                            <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <MessageSquare className="h-5 w-5 mx-auto mb-1 opacity-40" />
                            <p className="text-xs">คลิก "แสดง" เพื่อดูความคืบหน้า</p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <MessageSquare className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                          <p className="text-xs">ยังไม่มีการอัปเดต</p>
                          <p className="text-[10px] mt-0.5">เริ่มส่งความคืบหน้าได้เลย</p>
                        </div>
                      )}
                    </div>
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

      {/* Image Preview Dialog - Full Screen */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative flex items-center justify-center min-h-[400px]">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white h-8 px-3 rounded-full gap-1.5"
                onClick={handleDownloadImage}
              >
                <Download className="h-4 w-4" />
                <span className="text-xs">ดาวน์โหลด</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0 rounded-full"
                onClick={() => setImageDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4 pr-6">
              <DialogTitle className="flex items-center gap-2 flex-1">
                <MessageSquare className="h-5 w-5 shrink-0" />
                <span className="break-words">{selectedTask?.title}</span>
              </DialogTitle>
              {selectedTask && (
                <Badge className={`text-[10px] h-5 px-1.5 gap-1 shrink-0 ${getStatusColor(selectedTask.status)}`}>
                  {getStatusIcon(selectedTask.status)}
                  {getStatusText(selectedTask.status)}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedTask && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Task Description */}
                {selectedTask.description && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>
                )}

                <Separator />

                {/* Updates Timeline */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4" />
                    ความคืบหน้า ({selectedTask.updates.length})
                  </h4>

                  {selectedTask.updates.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTask.updates.map((update, idx) => (
                        <div key={idx} className="flex gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
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
                            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{update.message}</p>
                              {update.imageUrl && (
                                <div className="relative w-32 h-32 group overflow-hidden rounded-md border bg-muted shrink-0">
                                  <img
                                    src={update.imageUrl}
                                    alt={`จาก ${update.updatedBy}`}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleImageClick(update.imageUrl!)}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
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