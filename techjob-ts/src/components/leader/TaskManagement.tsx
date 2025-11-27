// src/components/leader/TaskManagement.tsx
"use client";

/**
 * ไฟล์: TaskManagement.tsx
 * วัตถุประสงค์: จัดการงานย่อย (Tasks) ภายในใบงาน (Job)
 *
 * คุณสมบัติหลัก:
 * - แสดงรายการงานย่อยในรูปแบบ Grid (คล้าย Trello)
 * - Leader: อนุมัติงาน (Advance Step), ตีกลับงาน (Reject), ดูความคืบหน้า
 * - User (Tech): อัปเดตความคืบหน้า, เบิกวัสดุ, รับทราบงานที่ถูกตีกลับ
 * - แสดงสถานะของแต่ละงาน (Pending, In-Progress, Completed)
 * - ระบบแจ้งเตือน (Notifications) เมื่อมีการเปลี่ยนแปลงสถานะ
 */

import React, { useState, useRef, useMemo, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MaterialSelectionDialog } from "@/components/user/MaterialSelectionDialog";
import { user as ALL_USERS } from "@/Data/user";
import { Users } from "lucide-react";
import { showWarning, showSuccess } from "@/lib/sweetalert";

// --- Interfaces ---

interface TaskManagementProps {
  job: Job; // ข้อมูลงานหลัก
  mode?: "leader" | "user" | "admin"; // โหมดการทำงาน (หัวหน้า, ช่าง, แอดมิน)
  onFinishJob?: () => void; // Callback เมื่อกดจบงาน (เฉพาะ Leader)
}

export function TaskManagement({
  job,
  mode = "leader",
  onFinishJob,
}: TaskManagementProps) {
  // --- Hooks ---
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { materials: inventoryMaterials } = useMaterials();

  // --- State Management ---

  // Image Preview
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Task Selection
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  // Leader Actions State
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

  // User Actions State
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateImagePreview, setUpdateImagePreview] = useState<string | null>(
    null
  );
  const [updateImageName, setUpdateImageName] = useState("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---

  // อัปเดต selectedTask เมื่อข้อมูล job เปลี่ยนแปลง (Real-time update)
  useEffect(() => {
    if (!selectedTask) return;
    const latestTask = job.tasks.find((t) => t.id === selectedTask.id);
    if (!latestTask) return;

    if (latestTask !== selectedTask) {
      setSelectedTask(latestTask);
    }

    // ปิด Dialog อัปเดต/เบิกของ หากงานถูกตีกลับ (Needs Acknowledgment)
    if (
      latestTask.needsAcknowledgment &&
      (updateDialogOpen || materialDialogOpen)
    ) {
      setUpdateDialogOpen(false);
      setMaterialDialogOpen(false);
    }
  }, [job.tasks, selectedTask, updateDialogOpen, materialDialogOpen]);

  // --- Memoized Data ---

  // สร้าง Dictionary สำหรับค้นหาชื่อและหน่วยของวัสดุ
  const materialDictionary = useMemo(() => {
    const map = new Map<string, { name: string; unit?: string }>();
    inventoryMaterials.forEach((material) => {
      map.set(material.id, { name: material.name, unit: material.unit });
    });
    return map;
  }, [inventoryMaterials]);

  // --- Helper Functions ---

  // ตัด ID วัสดุให้สั้นลง (ถ้าจำเป็น)
  const normalizeMaterialId = (materialId: string) => {
    const parts = String(materialId).split("-");
    if (parts.length <= 2) return String(materialId);
    return parts.slice(-2).join("-");
  };

  // ค้นหาชื่อวัสดุจาก ID
  const resolveMaterialName = (materialId: string, fallbackName?: string) => {
    if (fallbackName) return fallbackName;
    const normalized = normalizeMaterialId(materialId);
    return materialDictionary.get(normalized)?.name ?? materialId;
  };

  // ค้นหาหน่วยวัสดุจาก ID
  const resolveMaterialUnit = (materialId: string, fallbackUnit?: string) => {
    if (fallbackUnit) return fallbackUnit;
    const normalized = normalizeMaterialId(materialId);
    return materialDictionary.get(normalized)?.unit ?? fallbackUnit ?? "";
  };

  if (!user) return null;

  // เปิดดูรูปภาพขยาย
  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  // ดาวน์โหลดรูปภาพ
  const handleDownloadImage = () => {
    if (!selectedImage) return;
    const link = document.createElement("a");
    link.href = selectedImage;
    link.download = `task-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // เปิดดูรายละเอียดงาน
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  // --- Leader Actions (ส่วนการทำงานของหัวหน้า) ---

  // เตรียมการอนุมัติงาน (เปลี่ยนสถานะเป็น Completed)
  const handleAdvanceTaskStep = (taskId: string) => {
    setPendingStatusChange({ taskId, newStatus: "completed" });
    setStatusChangeDialogOpen(true);
  };

  // ยืนยันการเปลี่ยนสถานะงาน (อนุมัติงาน)
  const confirmStatusChange = () => {
    if (!pendingStatusChange) return;

    const { taskId, newStatus } = pendingStatusChange;
    const task = job.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentIndex = job.tasks.findIndex((t) => t.id === taskId);
    if (currentIndex === -1) return;

    // ตรวจสอบว่างานก่อนหน้าเสร็จหรือยัง (Sequential Workflow)
    const hasUnfinishedPreviousStep = job.tasks
      .slice(0, currentIndex)
      .some((t) => t.status !== "completed");

    if (hasUnfinishedPreviousStep) {
      showWarning(
        "ไม่สามารถข้ามขั้นตอนได้",
        "กรุณาดำเนินการขั้นก่อนหน้าให้เสร็จก่อน"
      );
      setStatusChangeDialogOpen(false);
      setPendingStatusChange(null);
      return;
    }

    // อัปเดตสถานะงาน: งานปัจจุบัน -> Completed, งานถัดไป -> In-Progress
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

    // บันทึก Activity Log
    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "task_updated",
      `หัวหน้า "${user.fname}" อนุมัติขั้นตอน "${task.title}" และไปสู่ขั้นถัดไป`,
      user.fname,
      "leader",
      { taskId: task.id, taskTitle: task.title, newStatus }
    );

    // แจ้งเตือนช่างทุกคนในทีม
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

    showSuccess(
      "อนุมัติงานสำเร็จ",
      `อนุมัติขั้นตอน "${task.title}" และเริ่มขั้นตอนถัดไปแล้ว`
    );

    setPendingStatusChange(null);
    setStatusChangeDialogOpen(false);
  };

  // เตรียมการตีกลับงาน (Reject)
  const handleRejectTask = (taskId: string) => {
    setPendingRejectTask({ taskId, reason: "" });
    setRejectTaskDialogOpen(true);
  };

  // เลือกรูปภาพประกอบการตีกลับ
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

  // ยืนยันการตีกลับงาน
  const confirmRejectTask = () => {
    if (!pendingRejectTask || !pendingRejectTask.reason.trim()) {
      showWarning("กรุณาใส่เหตุผลในการตีกลับงาน");
      return;
    }

    const { taskId, reason, imageUrl } = pendingRejectTask;
    const task = job.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // สร้างรายการอัปเดตใหม่ (แจ้งเหตุผลการตีกลับ)
    const newUpdate: Task["updates"][number] = {
      message: `งานถูกตีกลับโดยหัวหน้า: ${reason}`,
      updatedBy: user.fname,
      updatedAt: new Date().toISOString(),
      imageUrl: imageUrl || undefined,
    };

    // อัปเดตสถานะงานเป็น Pending และต้องการการรับทราบ (Needs Acknowledgment)
    const updatedTask: Task = {
      ...task,
      status: "pending",
      needsAcknowledgment: true,
      lastAcknowledgedAt: undefined,
      lasrtAcknowledgedBy: undefined,
      updates: [...task.updates, newUpdate],
    };

    const updatedTasks = job.tasks.map((t) =>
      t.id === taskId ? updatedTask : t
    );

    // บันทึก Activity Log
    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "task_updated",
      `ตีกลับงาน "${task.title}"`,
      user.fname,
      "leader",
      { taskId: task.id, taskTitle: task.title, reason, imageUrl }
    );

    // แจ้งเตือนช่างทุกคน
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

    showSuccess(
      "ตีกลับงานสำเร็จ",
      `ตีกลับงาน "${task.title}" แล้ว ช่างจะได้รับแจ้งเตือน`
    );

    setPendingRejectTask(null);
    setRejectTaskDialogOpen(false);
  };

  // --- User Actions (ส่วนการทำงานของช่าง) ---

  // เปิด Dialog อัปเดตงาน
  const handleOpenUpdateDialog = (task: Task) => {
    if (task.needsAcknowledgment) {
      showWarning("กรุณากดรับทราบงานที่ถูกตีกลับก่อนส่งอัปเดต");
      return;
    }
    setSelectedTask(task);
    setUpdateMessage("");
    setUpdateImagePreview(null);
    setUpdateImageName("");
    setUpdateDialogOpen(true);
  };

  // เปิด Dialog เบิกวัสดุ
  const handleOpenMaterialDialog = (task: Task) => {
    if (task.needsAcknowledgment) {
      showWarning("กรุณากดรับทราบงานที่ถูกตีกลับก่อนเบิกวัสดุ");
      return;
    }
    setSelectedTask(task);
    setMaterialDialogOpen(true);
  };

  // รับทราบงานที่ถูกตีกลับ (Acknowledge Rejected Task)
  const handleAcknowledgeRejectedTask = (task: Task) => {
    const now = new Date().toISOString();
    const acknowledgementUpdate = {
      message: `ช่าง ${user.fname} รับทราบการตีกลับและพร้อมดำเนินงานต่อ`,
      updatedBy: user.fname,
      updatedAt: now,
    };

    // อัปเดตสถานะกลับเป็น In-Progress และเคลียร์ flag needsAcknowledgment
    const updatedTask: Task = {
      ...task,
      status: "in-progress",
      needsAcknowledgment: false,
      lastAcknowledgedAt: now,
      lasrtAcknowledgedBy: user.fname,
      updates: [...(task.updates || []), acknowledgementUpdate],
    };

    const updatedTasks = job.tasks.map((t) =>
      t.id === task.id ? updatedTask : t
    );

    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "acknowledge",
      `ช่าง "${user.fname}" รับทราบการตีกลับของงาน "${task.title}"`,
      user.fname,
      "tech",
      { taskId: task.id, taskTitle: task.title }
    );

    // แจ้งเตือนหัวหน้า
    if (job.leadId) {
      addNotification({
        title: "ช่างรับทราบงานที่ถูกตีกลับ",
        message: `${user.fname} รับทราบงาน "${task.title}" ในใบงาน "${job.title}" และจะดำเนินงานต่อ`,
        recipientRole: "leader",
        recipientId: String(job.leadId),
        relatedJobId: job.id,
        metadata: {
          type: "task_acknowledged",
          taskId: task.id,
          taskTitle: task.title,
          jobTitle: job.title,
          techName: user.fname,
        },
      });
    }

    showSuccess(
      "รับทราบงานสำเร็จ",
      `รับทราบการตีกลับของงาน "${task.title}" แล้ว สามารถดำเนินงานต่อได้`
    );
  };

  // เลือกรูปภาพสำหรับอัปเดตงาน
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

  // ส่งข้อมูลอัปเดตงาน (Submit Update)
  const submitUpdate = () => {
    if (!selectedTask || !updateMessage.trim()) {
      showWarning("กรุณากรอกข้อความอัปเดต");
      return;
    }

    if (selectedTask.needsAcknowledgment) {
      showWarning("กรุณากดรับทราบงานที่ถูกตีกลับก่อนส่งอัปเดต");
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
      // ถ้าสถานะเป็น pending ให้เปลี่ยนเป็น in-progress อัตโนมัติเมื่อมีการอัปเดต
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

    // แจ้งเตือนหัวหน้า
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

    // แจ้งเตือนเพื่อนร่วมทีม (ยกเว้นตัวเอง)
    job.assignedTechs?.forEach((techId) => {
      if (String(techId) !== String(user.id)) {
        addNotification({
          title: "ช่างในทีมอัปเดตงาน",
          message: `${user.fname} อัปเดตงาน "${selectedTask.title}" ในงาน "${job.title}"`,
          recipientRole: "user",
          recipientId: String(techId),
          relatedJobId: job.id,
          metadata: {
            type: "task_update_from_teammate",
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            jobTitle: job.title,
            techName: user.fname,
          },
        });
      }
    });

    showSuccess(
      "ส่งอัปเดตสำเร็จ",
      `ส่งอัปเดตงาน "${selectedTask.title}" เรียบร้อยแล้ว`
    );

    setUpdateDialogOpen(false);
    setUpdateMessage("");
    setUpdateImagePreview(null);
    setUpdateImageName("");
  };

  // --- Render Logic (ส่วนการแสดงผล) ---

  return (
    <div className="space-y-6">
      {/* ส่วนหัวของ Pipeline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-semibold">กระดานงาน (Pipeline)</h4>
        </div>
        {/* ปุ่มจบงาน (แสดงเฉพาะ Leader และเมื่องานทุกขั้นตอนเสร็จสิ้น) */}
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

      {/* Trello-like Grid - Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {job.tasks.map((task, index) => {
          const isCompleted = task.status === "completed";
          const isInProgress = task.status === "in-progress";
          const isPending = task.status === "pending";
          const isAwaitingAcknowledgement = Boolean(task.needsAcknowledgment);

          // กำหนดสไตล์ตามสถานะงาน
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

          if (isAwaitingAcknowledgement) {
            cardBorderColor = "border-amber-300 ring-1 ring-amber-100";
            headerColor = "bg-amber-50 text-amber-700";
            icon = <AlertCircle className="h-4 w-4 text-amber-700" />;
          }

          return (
            <Card
              key={task.id}
              className={cn(
                "flex flex-col h-full transition-all duration-200 bg-white dark:bg-card",
                cardBorderColor,
                isPending &&
                  !isAwaitingAcknowledgement &&
                  "opacity-70 grayscale-[0.5]"
              )}
            >
              {/* Card Header: แสดงลำดับและสถานะ */}
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
                {isPending && !isAwaitingAcknowledgement && (
                  <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">
                    รอเริ่ม
                  </span>
                )}
                {isAwaitingAcknowledgement && (
                  <span className="text-xs bg-white/40 px-2 py-0.5 rounded-full text-amber-900">
                    รอช่างรับทราบ
                  </span>
                )}
              </div>

              {/* Card Content: รายละเอียดงาน */}
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

                {/* Alert: แสดงเมื่อมีการตีกลับงาน */}
                {isAwaitingAcknowledgement && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-amber-900">
                        งานถูกตีกลับโดยหัวหน้า
                      </p>
                      <p>กรุณากดรับทราบก่อนเริ่มอัปเดตหรือเบิกวัสดุต่อ</p>
                    </div>
                  </div>
                )}

                {/* Updates Summary: สรุปจำนวนอัปเดตและรายการเบิก */}
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

                  {/* Latest Update Preview: แสดงอัปเดตล่าสุด */}
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

              {/* Actions Footer: ปุ่มดำเนินการต่างๆ */}
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

                {/* ปุ่ม Action ตามสถานะและ Role */}
                {((mode === "leader" && isInProgress) ||
                  (mode === "user" &&
                    (isInProgress || isAwaitingAcknowledgement))) && (
                  <div className="w-full pt-2 border-t">
                    {mode === "leader" ? (
                      // Leader Actions: ตีกลับ / อนุมัติ
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
                    ) : isAwaitingAcknowledgement ? (
                      // User Action: รับทราบงานตีกลับ
                      <div className="space-y-2 text-xs text-amber-900">
                        <p>
                          หัวหน้าตีกลับงานนี้แล้ว
                          กรุณากดรับทราบเพื่อเริ่มทำงานต่อ
                        </p>
                        <Button
                          size="sm"
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white gap-1"
                          onClick={() => handleAcknowledgeRejectedTask(task)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          รับทราบและเริ่มต่อ
                        </Button>
                      </div>
                    ) : (
                      // User Actions: เบิกของ / อัปเดต
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

      {/* --- Dialogs (หน้าต่างเสริม) --- */}

      {/* 1. Image Preview Dialog (ดูรูปภาพขยาย) */}
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

      {/* 2. Task Detail Dialog (รายละเอียดงานย่อย) */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="max-w-2xl h-[90vh] max-h-[90vh] flex flex-col overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
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

          <Tabs
            defaultValue="updates"
            className="w-full flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            <div className="px-6 border-b shrink-0">
              <TabsList className="w-full justify-start h-12 bg-transparent p-0 space-x-6">
                <TabsTrigger
                  value="updates"
                  className="h-full rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
                >
                  ความคืบหน้า ({selectedTask?.updates.length || 0})
                </TabsTrigger>
                <TabsTrigger
                  value="materials"
                  className="h-full rounded-none border-b-2 border-transparent px-0 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
                >
                  วัสดุ ({selectedTask?.materials?.length || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden bg-slate-50/50 min-h-0">
              {/* Updates Tab(ประวัติความคืบหน้า) */}
              <TabsContent value="updates" className="h-full m-0 p-0 overflow-hidden">
                <div className="h-full flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 min-h-0 max-h-full">
                    <div className="p-6 space-y-6">
                      {selectedTask?.updates &&
                      selectedTask.updates.length > 0 ? (
                        selectedTask.updates.map((update, idx) => (
                          <div key={idx} className="flex gap-4 group">
                            <Avatar className="h-8 w-8 shrink-0 border-2 border-white shadow-sm">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                {update.updatedBy[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {update.updatedBy}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(
                                    new Date(update.updatedAt),
                                    "d MMM HH:mm",
                                    { locale: th }
                                  )}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "rounded-2xl rounded-tl-none p-3 text-sm shadow-sm inline-block max-w-[90%] w-full",
                                  update.message.includes("ตีกลับ")
                                    ? "bg-red-50 text-red-900 border border-red-100"
                                    : "bg-white border border-slate-100"
                                )}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                                  {update.message}
                                </p>
                                {update.imageUrl && (
                                  <div className="mt-2 relative rounded-lg overflow-hidden border">
                                    <img
                                      src={update.imageUrl}
                                      alt="attachment"
                                      className="max-w-full max-h-64 w-auto h-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() =>
                                        handleImageClick(update.imageUrl!)
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <div className="bg-slate-100 p-4 rounded-full mb-3">
                            <MessageSquare className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium">
                            ยังไม่มีการอัปเดต
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Update Action (ปุ่มอัปเดตด่วนสำหรับช่าง) */}
                  {mode === "user" &&
                    selectedTask?.status === "in-progress" && (
                      <div className="p-4 border-t bg-white shrink-0">
                        <Button
                          className="w-full gap-2"
                          onClick={() => {
                            setTaskDialogOpen(false);
                            handleOpenUpdateDialog(selectedTask);
                          }}
                        >
                          <Send className="h-4 w-4" />
                          เขียนอัปเดตใหม่
                        </Button>
                      </div>
                    )}
                </div>
              </TabsContent>

              {/* Materials Tab (รายการวัสดุที่เบิก) */}
              <TabsContent value="materials" className="h-full m-0 p-0 overflow-hidden">
                <div className="h-full flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 min-h-0 max-h-full">
                    <div className="p-6">
                      {selectedTask?.materials &&
                      selectedTask.materials.length > 0 ? (
                        <div className="space-y-3">
                          {selectedTask.materials.map((m, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="bg-blue-50 p-2 rounded-md shrink-0">
                                  <Package className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm break-words">
                                    {resolveMaterialName(
                                      m.materialId,
                                      m.materialName
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    รหัส: {normalizeMaterialId(m.materialId)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="font-mono shrink-0">
                                {m.quantity}{" "}
                                {resolveMaterialUnit(m.materialId, m.unit)}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <div className="bg-slate-100 p-4 rounded-full mb-3">
                            <Package className="h-6 w-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium">
                            ไม่มีรายการเบิกวัสดุ
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Quick Material Action (ปุ่มเบิกวัสดุเพิ่ม) */}
                  {mode === "user" &&
                    selectedTask?.status === "in-progress" && (
                      <div className="p-4 border-t bg-white shrink-0">
                        <Button
                          variant="outline"
                          className="w-full gap-2 border-dashed"
                          onClick={() => {
                            setTaskDialogOpen(false);
                            handleOpenMaterialDialog(selectedTask);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          เบิกวัสดุเพิ่ม
                        </Button>
                      </div>
                    )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* --- Leader Dialogs --- */}

      {/* 3. Confirm Status Change Dialog (ยืนยันการอนุมัติงาน) */}
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

      {/* 4. Reject Task Dialog (ฟอร์มตีกลับงาน) */}
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

      {/* 5. Update Task Dialog (ฟอร์มอัปเดตความคืบหน้า) */}
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

      {/* 6. Material Selection Dialog (Component ภายนอกสำหรับเลือกวัสดุ) */}
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
