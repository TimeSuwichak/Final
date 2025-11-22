"use client";

import React, { useState, useEffect, useMemo } from "react";
import { type Job, type Task } from "@/types/index";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Package, Plus, Minus, CheckCircle2, AlertCircle } from "lucide-react";
import { useMaterials } from "@/contexts/MaterialContext";

interface MaterialSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job;
  task: Task;
}

interface SelectedMaterial {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

export function MaterialSelectionDialog({
  open,
  onOpenChange,
  job,
  task,
}: MaterialSelectionDialogProps) {
  const { updateJobWithActivity } = useJobs();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { materials, withdrawMaterials, getMaterialById } = useMaterials();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedMaterials, setSelectedMaterials] = useState<
    SelectedMaterial[]
  >([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    const set = new Set(materials.map((material) => material.category));
    return Array.from(set);
  }, [materials]);

  const currentCategoryData = useMemo(
    () =>
      materials.filter((material) => material.category === selectedCategory),
    [materials, selectedCategory]
  );

  useEffect(() => {
    if (!open) {
      setSelectedCategory("");
      setSelectedMaterials([]);
      setQuantities({});
      setConfirmDialogOpen(false);
      setSuccessDialogOpen(false);
    }
  }, [open]);

  const handleMaterialToggle = (material: (typeof materials)[number]) => {
    const materialId = material.id;
    const isSelected = selectedMaterials.some((m) => m.id === materialId);

    if (!isSelected && material.stock <= 0) {
      alert(`วัสดุ "${material.name}" หมดสต็อก`);
      return;
    }

    if (isSelected) {
      setSelectedMaterials((prev) => prev.filter((m) => m.id !== materialId));
      setQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[materialId];
        return newQuantities;
      });
    } else {
      const newMaterial: SelectedMaterial = {
        id: materialId,
        name: material.name,
        category: material.category,
        quantity: 1,
        unit: material.unit || "ชิ้น",
      };
      setSelectedMaterials((prev) => [...prev, newMaterial]);
      setQuantities((prev) => ({ ...prev, [materialId]: 1 }));
    }
  };

  const handleQuantityChange = (materialId: string, quantity: number) => {
    if (quantity < 1) return;

    const inventoryMaterial = getMaterialById(materialId);
    if (inventoryMaterial && quantity > inventoryMaterial.stock) {
      alert(
        `สต็อก "${inventoryMaterial.name}" คงเหลือ ${inventoryMaterial.stock} ${inventoryMaterial.unit}`
      );
      quantity = inventoryMaterial.stock;
    }

    setQuantities((prev) => ({ ...prev, [materialId]: quantity }));
    setSelectedMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, quantity } : m))
    );
  };

  const handleRemoveSelection = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.filter((material) => material.id !== materialId)
    );
    setQuantities((prev) => {
      const next = { ...prev };
      delete next[materialId];
      return next;
    });
  };

  const handleWithdrawClick = () => {
    if (selectedMaterials.length === 0) {
      alert("กรุณาเลือกวัสดุอย่างน้อย 1 รายการ");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleWithdraw = () => {
    if (!user) return;

    const withdrawRequests = selectedMaterials.map((material) => ({
      materialId: material.id,
      quantity: material.quantity,
    }));

    const withdrawResult = withdrawMaterials(withdrawRequests);
    if (!withdrawResult.success) {
      alert(withdrawResult.errors.join("\n"));
      setConfirmDialogOpen(false);
      return;
    }

    // Create withdrawal records
    const withdrawalRecords = selectedMaterials.map((material) => ({
      materialId: material.id,
      materialName: material.name,
      unit: material.unit,
      quantity: material.quantity,
      withdrawnBy: user.fname,
      withdrawnAt: new Date(),
    }));

    // Update task with materials
    const updatedTask: Task = {
      ...task,
      materials: [...(task.materials || []), ...withdrawalRecords],
    };

    const updatedTasks = job.tasks.map((t) =>
      t.id === task.id ? updatedTask : t
    );

    updateJobWithActivity(
      job.id,
      { tasks: updatedTasks },
      "other",
      `เบิกวัสดุสำหรับ Task: ${task.title} - ${selectedMaterials
        .map((m) => `${m.name} (${m.quantity})`)
        .join(", ")}`,
      user.fname,
      "tech",
      { taskId: task.id, taskTitle: task.title, materials: selectedMaterials }
    );

    // Send notification to leader
    if (job.leadId) {
      addNotification({
        title: "ช่างเบิกวัสดุ",
        message: `${user.fname} เบิกวัสดุสำหรับงาน "${job.title}" - "${task.title}"`,
        recipientRole: "leader",
        recipientId: String(job.leadId),
        relatedJobId: job.id,
        metadata: {
          type: "material_withdrawal",
          taskId: task.id,
          taskTitle: task.title,
          jobTitle: job.title,
          techName: user.fname,
          materials: selectedMaterials,
        },
      });
    }

    // Send notification to all other team members
    job.assignedTechs?.forEach((techId) => {
      if (String(techId) !== String(user.id)) {
        addNotification({
          title: "ช่างในทีมเบิกวัสดุ",
          message: `${user.fname} เบิกวัสดุสำหรับงาน "${task.title}" ในงาน "${job.title}"`,
          recipientRole: "user",
          recipientId: String(techId),
          relatedJobId: job.id,
          metadata: {
            type: "material_withdrawal_from_teammate",
            taskId: task.id,
            taskTitle: task.title,
            jobTitle: job.title,
            techName: user.fname,
            materials: selectedMaterials,
          },
        });
      }
    });

    setConfirmDialogOpen(false);
    setSuccessDialogOpen(true);
  };

  const getTotalItems = () => {
    return selectedMaterials.reduce(
      (sum, material) => sum + material.quantity,
      0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            เบิกวัสดุสำหรับงาน: {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Material Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">เลือกประเภทวัสดุ</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทวัสดุ" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">เลือกวัสดุ</Label>
                <ScrollArea className="h-96 border rounded-lg p-2">
                  <div className="space-y-2">
                    {currentCategoryData.map((material) => {
                      const materialId = material.id;
                      const isSelected = selectedMaterials.some(
                        (m) => m.id === materialId
                      );
                      const isOutOfStock = material.stock <= 0;

                      return (
                        <div
                          key={material.id}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : isOutOfStock
                              ? "border-red-200 bg-red-50 cursor-not-allowed opacity-70"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            !isOutOfStock && handleMaterialToggle(material)
                          }
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {material.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              รหัส: {material.id} • หน่วย:{" "}
                              {material.unit || "ชิ้น"} • คงเหลือ{" "}
                              {material.stock}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                          {isOutOfStock && !isSelected && (
                            <Badge variant="secondary" className="text-[10px]">
                              หมด
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* Selected Materials */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                วัสดุที่เลือก ({selectedMaterials.length})
              </Label>
              <Badge variant="secondary" className="text-xs">
                รวม {getTotalItems()} รายการ
              </Badge>
            </div>

            <ScrollArea className="h-96 border rounded-lg p-2">
              {selectedMaterials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">ยังไม่ได้เลือกวัสดุ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{material.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {material.category} • หน่วย: {material.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(
                                material.id,
                                material.quantity - 1
                              );
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            value={material.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                material.id,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 h-6 text-center text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(
                                material.id,
                                material.quantity + 1
                              );
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSelection(material.id);
                          }}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button
                onClick={handleWithdrawClick}
                disabled={selectedMaterials.length === 0}
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                เบิกวัสดุ ({getTotalItems()})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการเบิกวัสดุ</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการเบิกวัสดุทั้งหมด {getTotalItems()} รายการใช่หรือไม่?
              <div className="mt-3 space-y-1">
                {selectedMaterials.map((material) => (
                  <div key={material.id} className="text-sm">
                    • {material.name} x {material.quantity} {material.unit}
                  </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdraw}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog
        open={successDialogOpen}
        onOpenChange={(open) => {
          setSuccessDialogOpen(open);
          if (!open) {
            onOpenChange(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-2">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              เบิกวัสดุเสร็จสิ้น
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              ระบบได้บันทึกการเบิกวัสดุทั้งหมด {getTotalItems()}{" "}
              รายการเรียบร้อยแล้ว
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction
              onClick={() => {
                setSuccessDialogOpen(false);
                onOpenChange(false);
              }}
            >
              ตกลง
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
