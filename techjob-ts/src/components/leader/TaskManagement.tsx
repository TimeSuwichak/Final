// src/components/leader/TaskManagement.tsx
"use client";

import React, { useState, useRef, useMemo } from "react";
import { type Job, type Task } from "@/types/index";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useMaterials } from "@/contexts/MaterialContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { format } from "date-fns";
import { th } from "date-fns/locale";
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
  ChevronUp,
  CornerUpLeft,
  Package,
} from "lucide-react";

interface TaskManagementProps {
  job: Job;
}

export function TaskManagement({ job }: TaskManagementProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    taskId: string;
    newStatus: "pending" | "in-progress" | "completed";
  } | null>(null);
  const [rejectTaskDialogOpen, setRejectTaskDialogOpen] = useState(false);
  const [pendingRejectTask, setPendingRejectTask] = useState<{
    taskId: string;
    reason: string;
    imageUrl?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { materials: inventoryMaterials } = useMaterials();

  const materialDictionary = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        unit?: string;
      }
    >();
    inventoryMaterials.forEach((material) => {
      map.set(material.id, { name: material.name, unit: material.unit });
    });
    return map;
  }, [inventoryMaterials]);

  const normalizeMaterialId = (materialId: string) => {
    const parts = String(materialId).split("-");
    if (parts.length <= 2) return String(materialId);
    return parts.slice(-2).join("-");
  };

  const resolveMaterialName = (materialId: string, fallbackName?: string) => {
    if (fallbackName) return fallbackName;
    const normalized = normalizeMaterialId(materialId);
    return materialDictionary.get(normalized)?.name ?? materialId;
  };

  const resolveMaterialUnit = (materialId: string, fallbackUnit?: string) => {
    if (fallbackUnit) return fallbackUnit;
    const normalized = normalizeMaterialId(materialId);
    return materialDictionary.get(normalized)?.unit ?? fallbackUnit ?? "";
  };

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-3.5 w-3.5 text-blue-600" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-50 border-green-200";
      case "in-progress":
        return "text-blue-700 bg-blue-50 border-blue-200";
      default:
        return "text-orange-700 bg-orange-50 border-orange-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "เสร็จสิ้น";
      case "in-progress":
        return "กำลังทำ";
      default:
        return "รอดำเนินการ";
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleDownloadImage = () => {
    if (!selectedImage) return;

    const link = document.createElement("a");
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

  // กดโดย Leader เท่านั้น: ใช้สำหรับ "อนุมัติขั้นตอนนี้ และไปสู่ขั้นถัดไป"
  const handleAdvanceTaskStep = (taskId: string) => {
    // เก็บ task ที่จะอนุมัติไว้ใน state เพื่อแสดงใน Dialog ยืนยัน
    setPendingStatusChange({ taskId, newStatus: "completed" });
    setStatusChangeDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;

    const { taskId, newStatus } = pendingStatusChange;
    const task = job.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // หา index ของ task ปัจจุบันใน pipeline 4 ขั้นตอน
    const currentIndex = job.tasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;

    // ตรวจสอบว่าทุกขั้นตอนก่อนหน้า "เสร็จสิ้น" แล้วหรือยัง
    const hasUnfinishedPreviousStep = job.tasks
      .slice(0, currentIndex)
      .some((t) => t.status !== "completed");

    if (hasUnfinishedPreviousStep) {
      alert("ไม่สามารถข้ามขั้นตอนได้ กรุณาดำเนินการขั้นก่อนหน้าให้เสร็จก่อน");
      setStatusChangeDialogOpen(false);
      setPendingStatusChange(null);
      return;
    }

    // อนุมัติขั้นตอนปัจจุบันให้เป็น "completed"
    const updatedTasks: Task[] = job.tasks.map((t, index) => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
        };
      }

      // ถ้ามีขั้นถัดไป ให้เปลี่ยนจาก pending -> in-progress อัตโนมัติ
      if (
        index === currentIndex + 1 &&
        t.status === "pending" &&
        newStatus === "completed"
      ) {
        return {
          ...t,
          status: "in-progress",
        };
      }

      return t;
    });

    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "task_updated",
      `หัวหน้า "${user.fname}" อนุมัติขั้นตอน "${task.title}" และไปสู่ขั้นถัดไป`,
      user.fname,
      "leader",
      { taskId: task.id, taskTitle: task.title, newStatus }
    );

    // Send notifications to all assigned techs (users)
    job.assignedTechs?.forEach((techId) => {
      addNotification({
        title: "สถานะงานเปลี่ยน",
        message: `หัวหน้า ${user.fname} เปลี่ยนสถานะงาน "${task.title}" เป็น "${
          newStatus === "completed"
            ? "เสร็จสิ้น"
            : newStatus === "in-progress"
            ? "กำลังทำ"
            : "รอดำเนินการ"
        }"`,
        recipientRole: "user",
        recipientId: String(techId),
        relatedJobId: job.id,
        metadata: { type: "task_status_changed", taskId: task.id, newStatus },
      });
    });

    setPendingStatusChange(null);
    setStatusChangeDialogOpen(false);
  };

  const handleRejectTask = (taskId: string) => {
    setPendingRejectTask({ taskId, reason: "" });
    setRejectTaskDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPendingRejectTask((prev) => (prev ? { ...prev, imageUrl } : null));
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmRejectTask = () => {
    if (!pendingRejectTask || !pendingRejectTask.reason.trim()) {
      alert("กรุณาใส่เหตุผลในการตีกลับงาน");
      return;
    }

    const { taskId, reason, imageUrl } = pendingRejectTask;
    const task = job.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newUpdate: Task["updates"][number] = {
      message: `งานถูกตีกลับโดยหัวหน้า: ${reason}`,
      updatedBy: user.fname,
      // เก็บเป็น string เพื่อให้ตรงกับ type ของ Task['updates'][].updatedAt
      updatedAt: new Date().toISOString(),
      imageUrl: imageUrl || undefined,
    };

    const updatedTask: Task = {
      ...task,
      status: "pending",
      updates: [...task.updates, newUpdate],
    };

    const updatedTasks = job.tasks.map((t) =>
      t.id === taskId ? updatedTask : t
    );

    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "task_updated",
      `ตีกลับงาน "${task.title}"`,
      user.fname,
      "leader",
      { taskId: task.id, taskTitle: task.title, reason, imageUrl }
    );

    // Send notifications to all assigned techs (users)
    job.assignedTechs?.forEach((techId) => {
      addNotification({
        title: "งานถูกตีกลับ",
        message: `หัวหน้า ${user.fname} ตีกลับงาน "${task.title}" ในใบงาน "${job.title}" เหตุผล: ${reason}`,
        recipientRole: "user",
        recipientId: String(techId),
        relatedJobId: job.id,
        metadata: { type: "task_rejected", taskId: task.id, reason, imageUrl },
      });
    });

    setPendingRejectTask(null);
    setRejectTaskDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Task List Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-semibold">
            ขั้นตอนงานมาตรฐาน ({job.tasks.length})
          </h4>
        </div>
      </div>

      {/* Task List */}
      {job.tasks.length > 0 ? (
        <div className="grid gap-4">
          {job.tasks.map((task) => (
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
                      <Badge
                        className={`text-[10px] h-5 px-1.5 gap-1 shrink-0 ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                        {getStatusText(task.status)}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Updates Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <h4 className="text-xs font-semibold">
                            ความคืบหน้า ({task.updates?.length || 0})
                          </h4>
                        </div>
                        {task.updates && task.updates.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedTasks((prev) => {
                                const newSet = new Set(prev);
                                if (newSet.has(task.id)) {
                                  newSet.delete(task.id);
                                } else {
                                  newSet.add(task.id);
                                }
                                return newSet;
                              });
                            }}
                            className="h-6 px-2 text-xs gap-1"
                          >
                            {expandedTasks.has(task.id) ? (
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
                        expandedTasks.has(task.id) ? (
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
                                      <span className="font-medium text-xs">
                                        {update.updatedBy}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
                                        {format(
                                          update.updatedAt,
                                          "dd/MM HH:mm",
                                          { locale: th }
                                        )}
                                      </span>
                                    </div>
                                    <div
                                      className={`rounded-lg p-2 space-y-2 ${
                                        update.message.startsWith(
                                          "งานถูกตีกลับโดยหัวหน้า:"
                                        )
                                          ? "bg-yellow-50 border border-yellow-200"
                                          : "bg-muted/50"
                                      }`}
                                    >
                                  <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                        {update.message}
                                      </p>
                                      {update.imageUrl && (
                                        <div className="relative group">
                                          <img
                                            src={update.imageUrl}
                                            alt={`จาก ${update.updatedBy}`}
                                            className="w-full h-auto max-h-48 rounded-md border object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleImageClick(
                                                update.imageUrl!
                                              );
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
                            <p className="text-xs">
                              คลิก "แสดง" เพื่อดูความคืบหน้า
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <MessageSquare className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                          <p className="text-xs">ยังไม่มีการอัปเดต</p>
                          <p className="text-[10px] mt-0.5">
                            เริ่มส่งความคืบหน้าได้เลย
                          </p>
                        </div>
                      )}
                    </div>
                    {task.materials && task.materials.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5 text-green-600" />
                          <h4 className="text-xs font-semibold">
                            วัสดุที่เบิก ({task.materials.length})
                          </h4>
                        </div>
                        <div className="space-y-1">
                          {task.materials.map((material, idx) => {
                            const displayName = resolveMaterialName(
                              material.materialId,
                              material.materialName
                            );
                            const unit = resolveMaterialUnit(
                              material.materialId,
                              material.unit
                            );
                            return (
                              <div
                                key={`${material.materialId}-${idx}`}
                                className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800"
                              >
                                <div className="flex-1">
                                  <p className="text-xs font-medium">
                                    {displayName}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    รหัส: {material.materialId} • หน่วย:{" "}
                                    {unit || "-"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    จำนวน: {material.quantity} | เบิกเมื่อ:{" "}
                                    {format(material.withdrawnAt, "dd/MM/yyyy HH:mm", {
                                      locale: th,
                                    })}{" "}
                                    | โดย: {material.withdrawnBy}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdvanceTaskStep(task.id);
                      }}
                      className="text-xs px-2"
                      disabled={task.status === "completed"}
                    >
                      ไปสู่ขั้นถัดไป
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRejectTask(task.id);
                      }}
                      className="text-xs px-2"
                    >
                      ตีกลับงาน
                    </Button>
                  </div>
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
                <p className="font-medium text-muted-foreground">
                  ยังไม่มี Task งานย่อย
                </p>
                <p className="text-sm text-muted-foreground">
                  เริ่มสร้าง task แรกเพื่อแบ่งงานให้ทีม
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <span>{selectedTask?.title}</span>
              </DialogTitle>
              {selectedTask && (
                <Badge
                  className={`text-[10px] h-5 px-1.5 gap-1 shrink-0 ${getStatusColor(
                    selectedTask.status
                  )}`}
                >
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
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
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
                              <span className="font-medium text-sm">
                                {update.updatedBy}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(update.updatedAt, "dd/MM/yyyy HH:mm", {
                                  locale: th,
                                })}
                              </span>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {update.message}
                              </p>
                              {update.imageUrl && (
                                <div className="relative w-32 h-32 group overflow-hidden rounded-md border bg-muted shrink-0">
                                  <img
                                    src={update.imageUrl}
                                    alt={`จาก ${update.updatedBy}`}
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() =>
                                      handleImageClick(update.imageUrl!)
                                    }
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

      {/* Status Change Confirmation Dialog */}
      <AlertDialog
        open={statusChangeDialogOpen}
        onOpenChange={setStatusChangeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการไปสู่ขั้นตอนถัดไป</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการอนุมัติขั้นตอน "
              {
                job.tasks.find((t) => t.id === pendingStatusChange?.taskId)
                  ?.title
              }
              " และไปยังขั้นตอนถัดไปใช่หรือไม่?
              <br />
              การยืนยันนี้จะบันทึกในประวัติงานและส่งการแจ้งเตือนไปยังทีมช่าง
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Task Dialog */}
      <AlertDialog
        open={rejectTaskDialogOpen}
        onOpenChange={setRejectTaskDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ตีกลับงาน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการตีกลับงาน "
              {job.tasks.find((t) => t.id === pendingRejectTask?.taskId)?.title}
              " ใช่หรือไม่?
              <br />
              กรุณาระบุเหตุผลในการตีกลับงาน
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                เหตุผลในการตีกลับงาน *
              </Label>
              <Textarea
                value={pendingRejectTask?.reason || ""}
                onChange={(e) =>
                  setPendingRejectTask((prev) =>
                    prev ? { ...prev, reason: e.target.value } : null
                  )
                }
                placeholder="ระบุเหตุผลในการตีกลับงาน..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                แนบรูปภาพ (ไม่บังคับ)
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  เลือกรูปภาพ
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {pendingRejectTask?.imageUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      รูปภาพถูกเลือกแล้ว
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setPendingRejectTask((prev) =>
                          prev ? { ...prev, imageUrl: undefined } : null
                        )
                      }
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {pendingRejectTask?.imageUrl && (
                <div className="relative w-32 h-32 group overflow-hidden rounded-md border bg-muted shrink-0">
                  <img
                    src={pendingRejectTask.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRejectTask}
              disabled={!pendingRejectTask?.reason.trim()}
            >
              ตีกลับงาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
