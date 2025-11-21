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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
  MessageSquare,
  Image as ImageIcon,
  Download,
  X,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Maximize2,
  Package,
  Plus,
  Send,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MaterialSelectionDialog } from "@/components/user/MaterialSelectionDialog";
import { user as ALL_USERS } from "@/Data/user";
import { Users } from "lucide-react";

interface TaskManagementProps {
  job: Job;
  mode?: "leader" | "user";
  onFinishJob?: () => void;
}

export function TaskManagement({
  job,
  mode = "leader",
  onFinishJob,
}: TaskManagementProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Leader State
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

  // User State
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(
    null
  );
  const [updateImageName, setUpdateImageName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  const { materials: inventoryMaterials } = useMaterials();

  const materialDictionary = useMemo(() => {
    const map = new Map<string, { name: string; unit?: string }>();
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

  // --- Helper Functions ---

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

  // --- Leader Actions ---

  const handleAdvanceTaskStep = (taskId: string) => {
    setPendingStatusChange({ taskId, newStatus: "completed" });
    setStatusChangeDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;

    const { taskId, newStatus } = pendingStatusChange;
    const task = job.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentIndex = job.tasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;

    const hasUnfinishedPreviousStep = job.tasks
      .slice(0, currentIndex)
      .some((t) => t.status !== "completed");

    if (hasUnfinishedPreviousStep) {
      alert("ไม่สามารถข้ามขั้นตอนได้ กรุณาดำเนินการขั้นก่อนหน้าให้เสร็จก่อน");
      setStatusChangeDialogOpen(false);
      setPendingStatusChange(null);
      return;
    }

    const updatedTasks: Task[] = job.tasks.map((t, index) => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      if (
        index === currentIndex + 1 &&
        t.status === "pending" &&
        newStatus === "completed"
      ) {
        return { ...t, status: "in-progress" };
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

    job.assignedTechs?.forEach((techId) => {
      addNotification({
        title: "สถานะงานเปลี่ยน",
        message: `หัวหน้า ${user.fname} เปลี่ยนสถานะงาน "${task.title}" เป็น "${
          newStatus === "completed" ? "เสร็จสิ้น" : "กำลังทำ"
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

  // --- User Actions ---

  const handleOpenUpdateDialog = (task: Task) => {
    setSelectedTask(task);
    setUpdateMessage("");
    setUpdateImagePreview(null);
    setUpdateImageName("");
    setUpdateDialogOpen(true);
  };

  const handleOpenMaterialDialog = (task: Task) => {
    setSelectedTask(task);
    setMaterialDialogOpen(true);
  };

  const handleUpdateFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setUpdateImagePreview(null);
      setUpdateImageName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setUpdateImagePreview(reader.result as string);
      setUpdateImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const submitUpdate = () => {
    if (!selectedTask || !updateMessage.trim()) {
      alert("กรุณากรอกข้อความอัปเดต");
      return;
    }

    const newUpdate = {
      message: updateMessage.trim(),
      imageUrl: updateImagePreview || undefined,
      updatedBy: user.fname,
      updatedAt: new Date().toISOString(),
    };

    const updatedTask: Task = {
      ...selectedTask,
      updates: [...(selectedTask.updates || []), newUpdate],
      // If it was pending (which shouldn't happen for active task actions, but just in case), set to in-progress
      status:
        selectedTask.status === "pending" ? "in-progress" : selectedTask.status,
    };

    const updatedTasks = job.tasks.map((t) =>
      t.id === selectedTask.id ? updatedTask : t
    );

    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "task_updated",
      `อัปเดต Task: ${selectedTask.title} - ${updateMessage}`,
      user.fname,
      "tech",
      { taskId: selectedTask.id, taskTitle: selectedTask.title }
    );

    if (job.leadId) {
      addNotification({
        title: "ช่างอัปเดตงาน",
        message: `${user.fname} มีการอัปเดตในงาน "${job.title}" - "${selectedTask.title}"`,
        recipientRole: "leader",
        recipientId: String(job.leadId),
        relatedJobId: job.id,
        metadata: {
          type: "task_update_from_tech",
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          jobTitle: job.title,
          techName: user.fname,
        },
      });
    }

    setUpdateDialogOpen(false);
    setUpdateMessage("");
    setUpdateImagePreview(null);
    setUpdateImageName("");
  };

  // --- Render Logic ---

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-semibold">กระดานงาน (Pipeline)</h4>
        </div>
        {mode === "leader" &&
          onFinishJob &&
          job.tasks.length > 0 &&
          job.tasks.every((t) => t.status === "completed") && (
            <Button
              onClick={onFinishJob}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              จบงาน
            </Button>
          )}
      </div>

      {/* Trello-like Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {job.tasks.map((task, index) => {
          const isCompleted = task.status === "completed";
          const isInProgress = task.status === "in-progress";
          const isPending = task.status === "pending";

          // Determine visual style based on status
          let cardBorderColor = "border-gray-200";
          let headerColor = "bg-gray-50 text-gray-500";
          let icon = <Lock className="h-4 w-4" />;

          if (isCompleted) {
            cardBorderColor = "border-green-200";
            headerColor = "bg-green-100 text-green-700";
            icon = <CheckCircle2 className="h-4 w-4" />;
          } else if (isInProgress) {
            cardBorderColor = "border-blue-400 shadow-md ring-1 ring-blue-100";
            headerColor = "bg-blue-600 text-white";
            icon = <Clock className="h-4 w-4 animate-pulse" />;
          }

          return (
            <Card
              key={task.id}
              className={cn(
                "flex flex-col h-full transition-all duration-200",
                cardBorderColor,
                isPending && "opacity-70 grayscale-[0.5]"
              )}
            >
              {/* Header */}
              <div
                className={cn(
                  "px-4 py-3 flex items-center justify-between font-medium text-sm rounded-t-lg",
                  headerColor
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1 rounded-full">{icon}</div>
                  <span>ขั้นตอนที่ {index + 1}</span>
                </div>
                {isCompleted && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    เสร็จสิ้น
                  </span>
                )}
                {isInProgress && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full animate-pulse">
                    กำลังดำเนินการ
                  </span>
                )}
                {isPending && (
                  <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                    รอเริ่ม
                  </span>
                )}
              </div>

              <CardContent className="p-4 flex-1 flex flex-col gap-4">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Updates Summary */}
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {task.updates?.length || 0} อัปเดต
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {task.materials?.length || 0} รายการเบิก
                    </span>
                  </div>

                  {/* Latest Update Preview */}
                  {task.updates && task.updates.length > 0 && (
                    <div className="bg-muted/30 rounded-md p-2 text-xs border">
                      <div className="flex items-center gap-1 mb-1 font-medium text-primary">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {task.updates[task.updates.length - 1].updatedBy[0]}
                          </AvatarFallback>
                        </Avatar>
                        {task.updates[task.updates.length - 1].updatedBy}
                      </div>
                      <p className="line-clamp-2 text-muted-foreground">
                        {task.updates[task.updates.length - 1].message}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <Separator />

              {/* Actions Footer */}
              <CardFooter className="p-3 bg-gray-50/50 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground hover:text-primary"
                  onClick={() => handleTaskClick(task)}
                >
                  ดูรายละเอียด
                  <Maximize2 className="h-3 w-3" />
                </Button>

                {isInProgress && (
                  <div className="w-full pt-2 border-t">
                    {mode === "leader" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() => handleRejectTask(task.id)}
                        >
                          ตีกลับ
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => handleAdvanceTaskStep(task.id)}
                        >
                          อนุมัติ
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => handleOpenMaterialDialog(task)}
                        >
                          <Plus className="h-3 w-3" />
                          เบิกของ
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => handleOpenUpdateDialog(task)}
                        >
                          <Send className="h-3 w-3" />
                          อัปเดต
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* --- Dialogs --- */}

      {/* Image Preview Dialog */}
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
                <Download className="h-4 w-4" />{" "}
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
                  className={cn(
                    "text-[10px] h-5 px-1.5 gap-1 shrink-0",
                    selectedTask.status === "completed"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : selectedTask.status === "in-progress"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {selectedTask.status === "completed" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : selectedTask.status === "in-progress" ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  {selectedTask.status === "completed"
                    ? "เสร็จสิ้น"
                    : selectedTask.status === "in-progress"
                    ? "กำลังดำเนินการ"
                    : "รอดำเนินการ"}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedTask && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {selectedTask.description && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedTask.description}
                    </p>
                  </div>
                )}
                <Separator />

                {/* Materials Section */}
                {selectedTask.materials &&
                  selectedTask.materials.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4" /> รายการวัสดุที่เบิก (
                        {selectedTask.materials.length})
                      </h4>
                      <div className="grid gap-2">
                        {selectedTask.materials.map((m, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm"
                          >
                            <span>
                              {resolveMaterialName(
                                m.materialId,
                                m.materialName
                              )}
                            </span>
                            <span className="text-muted-foreground">
                              {m.quantity}{" "}
                              {resolveMaterialUnit(m.materialId, m.unit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <Separator />

                {/* Updates Timeline */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2 text-sm">
                    <MessageSquare className="h-4 w-4" /> ความคืบหน้า (
                    {selectedTask.updates.length})
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
                                {format(
                                  new Date(update.updatedAt),
                                  "dd/MM/yyyy HH:mm",
                                  { locale: th }
                                )}
                              </span>
                            </div>
                            <div
                              className={cn(
                                "rounded-lg p-3 space-y-2",
                                update.message.includes("ตีกลับ")
                                  ? "bg-red-50 border border-red-100"
                                  : "bg-muted/30"
                              )}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {update.message}
                              </p>
                              {update.imageUrl && (
                                <div className="relative w-32 h-32 group overflow-hidden rounded-md border bg-muted shrink-0">
                                  <img
                                    src={update.imageUrl}
                                    alt="attachment"
                                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() =>
                                      handleImageClick(update.imageUrl!)
                                    }
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
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">ยังไม่มีการอัปเดต</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          {/* User Mode: Quick Actions in Detail Dialog */}
          {mode === "user" &&
            selectedTask &&
            selectedTask.status === "in-progress" && (
              <DialogFooter className="border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTaskDialogOpen(false);
                    handleOpenMaterialDialog(selectedTask);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" /> เบิกวัสดุ
                </Button>
                <Button
                  onClick={() => {
                    setTaskDialogOpen(false);
                    handleOpenUpdateDialog(selectedTask);
                  }}
                >
                  <Send className="h-4 w-4 mr-2" /> อัปเดตงาน
                </Button>
              </DialogFooter>
            )}
        </DialogContent>
      </Dialog>

      {/* --- Leader Dialogs --- */}

      {/* Confirm Status Change Dialog */}
      <AlertDialog
        open={statusChangeDialogOpen}
        onOpenChange={setStatusChangeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการอนุมัติ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการอนุมัติขั้นตอน "
              {
                job.tasks.find((t) => t.id === pendingStatusChange?.taskId)
                  ?.title
              }
              " ให้เสร็จสิ้น และเริ่มขั้นตอนถัดไปใช่หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              className="bg-green-600 hover:bg-green-700"
            >
              ยืนยันอนุมัติ
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
              ระบุเหตุผลที่ต้องการให้แก้ไขงานนี้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 py-4 space-y-4">
            <Textarea
              placeholder="ระบุเหตุผล..."
              value={pendingRejectTask?.reason || ""}
              onChange={(e) =>
                setPendingRejectTask((prev) =>
                  prev ? { ...prev, reason: e.target.value } : null
                )
              }
            />
            <div className="space-y-2">
              <Label>แนบรูปภาพ (ถ้ามี)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="text-xs"
                />
              </div>
              {pendingRejectTask?.imageUrl && (
                <div className="relative w-full h-32 rounded-md overflow-hidden border">
                  <img
                    src={pendingRejectTask.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() =>
                      setPendingRejectTask((prev) =>
                        prev ? { ...prev, imageUrl: undefined } : null
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRejectTask}
              className="bg-red-600 hover:bg-red-700"
            >
              ยืนยันตีกลับ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- User Dialogs --- */}

      {/* Update Task Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>อัปเดตความคืบหน้า</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>รายละเอียดการทำงาน</Label>
              <Textarea
                placeholder="ระบุรายละเอียดสิ่งที่ทำ..."
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>รูปภาพประกอบ (ถ้ามี)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateFileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  เลือกรูปภาพ
                </Button>
                <span className="text-xs text-muted-foreground">
                  {updateImageName || "ยังไม่ได้เลือกไฟล์"}
                </span>
                <input
                  type="file"
                  ref={updateFileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleUpdateFileChange}
                />
              </div>
              {updateImagePreview && (
                <div className="relative w-full h-48 rounded-md overflow-hidden border mt-2">
                  <img
                    src={updateImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      setUpdateImagePreview(null);
                      setUpdateImageName("");
                      if (updateFileInputRef.current) {
                        updateFileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
            >
              ยกเลิก
            </Button>
            <Button onClick={submitUpdate}>บันทึกอัปเดต</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <MaterialSelectionDialog
          open={materialDialogOpen}
          onOpenChange={setMaterialDialogOpen}
          task={selectedTask}
          job={job}
        />
      )}
    </div>
  );
}
