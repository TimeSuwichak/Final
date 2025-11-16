// src/components/user/UserTaskUpdate.tsx
"use client";

import React, { useState, useRef } from 'react';
import { type Job, type Task } from '@/types/index';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  MessageSquare,
  Image as ImageIcon,
  Send,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Maximize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UserTaskUpdateProps {
  job: Job;
  task: Task;
}

export function UserTaskUpdate({ job, task }: UserTaskUpdateProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

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
    if (!message.trim()) {
      alert("กรุณากรอกข้อความอัปเดต");
      return;
    }

    const newUpdate = {
      message: message.trim(),
      imageUrl: imagePreview || undefined,
      updatedBy: user.fname,
      updatedAt: new Date(),
    };

    const updatedTask: Task = {
      ...task,
      updates: [...(task.updates || []), newUpdate],
      status: 'in-progress',
    };

    const updatedTasks = job.tasks.map(t =>
      t.id === task.id ? updatedTask : t
    );

    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      'task_updated',
      `อัปเดต Task: ${task.title} - ${message}`,
      user.fname,
      'tech',
      { taskId: task.id, taskTitle: task.title }
    );

    // Send notification to leader when tech updates task
    if (job.leadId) {
      addNotification({
        title: "ช่างอัปเดตงาน",
        message: `${user.fname} มีการอัปเดตในงาน "${job.title}" - "${task.title}"`,
        recipientRole: "leader",
        recipientId: String(job.leadId),
        relatedJobId: job.id,
        metadata: {
          type: "task_update_from_tech",
          taskId: task.id,
          taskTitle: task.title,
          jobTitle: job.title,
          techName: user.fname
        }
      });
    }

    setMessage("");
    setImagePreview(null);
    setImageName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <Card className="border-blue-200 shadow-sm hover:shadow transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold flex-1 min-w-0">
              {task.title}
            </CardTitle>
            <Badge className={`text-[10px] h-5 px-1.5 gap-1 shrink-0 ${getStatusColor(task.status)}`}>
              {getStatusIcon(task.status)}
              {getStatusText(task.status)}
            </Badge>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Updates Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                <h4 className="text-xs font-semibold">ความคืบหน้า ({task.updates?.length || 0})</h4>
              </div>
              {task.updates && task.updates.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
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
                                  onClick={() => handleImageClick(update.imageUrl!)}
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

          <Separator />

          {/* Update Form */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-blue-600" />
              <h4 className="text-xs font-semibold">ส่งอัปเดตความคืบหน้า</h4>
            </div>

            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="อธิบายงานที่ทำ ความคืบหน้า หรือปัญหาที่พบ..."
              rows={3}
              className="resize-none text-xs"
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  แนบรูปภาพ (ถ้ามี)
                </Label>
                {imageName && (
                  <span className="text-[10px] text-blue-600 font-medium truncate max-w-[150px]">{imageName}</span>
                )}
              </div>

              {!imagePreview ? (
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-3 hover:border-blue-400/50 transition-colors">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    className="cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">คลิกเพื่อเลือกรูปภาพ</p>
                    <p className="text-[10px] text-muted-foreground/70">JPG, PNG, GIF</p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="ตัวอย่าง"
                    className="w-full h-auto max-h-40 object-cover rounded-lg border cursor-pointer"
                    onClick={() => handleImageClick(imagePreview)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1.5 right-1.5 h-6 w-6 p-0 opacity-90 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      setImageName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center pointer-events-none">
                    <Maximize2 className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleUpdate}
                disabled={!message.trim()}
                size="sm"
                className="gap-1.5 h-8 text-xs"
              >
                <Send className="h-3 w-3" />
                ส่งอัปเดต
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog - Full Screen */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
          <div className="relative flex items-center justify-center min-h-[400px]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white h-8 w-8 p-0 rounded-full"
              onClick={() => setImageDialogOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
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
    </>
  );
}