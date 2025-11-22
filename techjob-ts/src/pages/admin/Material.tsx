"use client";
import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  Layers,
  AlertTriangle,
  Box,
  PlusCircle,
  Search,
  Edit,
  ShoppingCart,
  Clock,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { electricalMaterials } from "@/data/materials/electrical";
import { networkMaterials } from "@/data/materials/network";
import { toolMaterials } from "@/data/materials/tools";
import { multimediaMaterials } from "@/data/materials/multimedia";
import { consumableMaterials } from "@/data/materials/consumables";
import { useMaterials } from "@/contexts/MaterialContext";
import type { Material } from "@/types";

interface PendingOrder {
  id: string;
  materialId: string;
  quantity: number;
  orderedAt: Date;
  status: "processing_documents" | "shipping" | "sorting" | "completed";
  estimatedDays: number;
}

export default function MaterialDashboard() {
  const {
    materials,
    addMaterial: addMaterialRecord,
    updateMaterial,
    restockMaterial,
  } = useMaterials();
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [newMat, setNewMat] = useState({
    name: "",
    type: "",
    stock: 0,
    unit: "",
  });
  const [editMat, setEditMat] = useState<Material | null>(null);
  const [withdrawMat, setWithdrawMat] = useState<Material | null>(null);
  const [withdrawQuantity, setWithdrawQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [usageTypeFilter, setUsageTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openShipping, setOpenShipping] = useState(false);
  const itemsPerPage = 10;

  // คำนวณข้อมูลสรุปแบบไดนามิก
  const summary = useMemo(() => {
    const totalItems = materials.length;
    const totalStock = materials.reduce((sum, mat) => sum + mat.stock, 0);
    const categories = [...new Set(materials.map((mat) => mat.category))]
      .length;
    const lowStock = materials.filter(
      (mat) => mat.minStock !== undefined && mat.stock <= mat.minStock
    ).length;

    return [
      {
        title: "รายการทั้งหมด",
        value: totalItems,
        icon: <Box className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
      },
      {
        title: "สต็อกรวม",
        value: totalStock,
        icon: (
          <Package className="w-6 h-6 text-green-500 dark:text-green-400" />
        ),
      },
      {
        title: "หมวดหมู่",
        value: categories,
        icon: (
          <Layers className="w-6 h-6 text-purple-500 dark:text-purple-400" />
        ),
      },
      {
        title: "ใกล้หมด",
        value: lowStock,
        icon: (
          <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
        ),
      },
    ];
  }, [materials]);

  // คำนวณสัดส่วนหมวดหมู่แบบไดนามิก
  const categories = useMemo(() => {
    const categoryGroups = materials.reduce((acc, mat) => {
      if (!acc[mat.category]) {
        acc[mat.category] = { total: 0, count: 0 };
      }
      acc[mat.category].total += mat.stock;
      acc[mat.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const totalStock = materials.reduce((sum, mat) => sum + mat.stock, 0);

    return Object.entries(categoryGroups).map(([name, data]) => ({
      name,
      percent:
        totalStock > 0
          ? Math.round((data.total / totalStock) * 100 * 10) / 10
          : 0,
      color: getCategoryColor(name),
    }));
  }, [materials]);

  // ฟิลเตอร์วัสดุตามการค้นหาและกรอง
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // กรองตามหมวดหมู่
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter((mat) => mat.category === categoryFilter);
    }

    // กรองตามประเภท
    if (usageTypeFilter && usageTypeFilter !== "all") {
      filtered = filtered.filter((mat) => mat.usageType === usageTypeFilter);
    }

    // กรองตามการค้นหา
    if (searchTerm) {
      filtered = filtered.filter(
        (mat) =>
          mat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mat.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [materials, searchTerm, categoryFilter, usageTypeFilter]);

  // คำนวณข้อมูลสำหรับ pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  // รีเซ็ตหน้าเมื่อมีการเปลี่ยนการกรองหรือค้นหา
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, usageTypeFilter]);

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      อุปกรณ์ไฟฟ้าและเดินสาย: "#4F46E5",
      อุปกรณ์เครือข่ายและความปลอดภัย: "#22C55E",
      เครื่องมือช่าง: "#9333EA",
      อุปกรณ์ระบบอาคารและมัลติมีเดีย: "#F59E0B",
      วัสดุติดตั้ง: "#EF4444",
    };
    return colors[category] || "#9CA3AF";
  }

  const addMaterial = () => {
    if (newMat.name && newMat.type && newMat.stock > 0 && newMat.unit) {
      addMaterialRecord({
        name: newMat.name,
        category: newMat.type,
        stock: newMat.stock,
        unit: newMat.unit,
        usageType: "consumable",
        minStock: 0,
      });
      setOpenAdd(false);
      setNewMat({ name: "", type: "", stock: 0, unit: "" });
      alert("เพิ่มวัสดุสำเร็จ");
    }
  };

  const editMaterial = () => {
    if (editMat) {
      updateMaterial(editMat.id, {
        name: editMat.name,
        category: editMat.category,
        usageType: editMat.usageType,
        stock: editMat.stock,
        unit: editMat.unit,
        minStock: editMat.minStock,
      });
      setOpenEdit(false);
      setEditMat(null);
      alert("แก้ไขวัสดุสำเร็จ");
    }
  };

  const withdrawMaterial = () => {
    if (withdrawMat && withdrawQuantity > 0) {
      setOpenWithdraw(false);
      setOpenConfirm(true);
    }
  };

  const confirmWithdraw = async () => {
    setOpenConfirm(false);
    setIsProcessing(true);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newOrder: PendingOrder = {
      id: `ORD${Date.now()}`,
      materialId: withdrawMat!.id,
      quantity: withdrawQuantity,
      orderedAt: new Date(),
      status: "processing_documents",
      estimatedDays: Math.floor(Math.random() * 15) + 1, // Random 1-15 days
    };
    setPendingOrders([...pendingOrders, newOrder]);
    restockMaterial(withdrawMat!.id, withdrawQuantity);
    setIsProcessing(false);
    setWithdrawMat(null);
    setWithdrawQuantity(0);
    alert("สั่งซื้อ/เพิ่มสต็อกสำเร็จ");
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#0B0B16] p-6 transition-colors duration-300">
      <h1 className="text-2xl font-semibold text-foreground">
        คลังวัสดุและอุปกรณ์
      </h1>
      <p className="text-muted-foreground mb-6">
        ภาพรวมและจัดการสต็อกวัสดุที่มีอยู่
      </p>



      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {summary.map((item, i) => (
          <Card
            key={i}
            className="rounded-2xl bg-card text-card-foreground shadow-sm hover:shadow-md transition-colors duration-300"
          >
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <h2 className="text-xl font-semibold">{item.value}</h2>
              </div>
              <div className="bg-muted p-3 rounded-xl">{item.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Section (Table Placeholder) */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <Input
                  placeholder="ค้นหา (ID, ชื่อ, หมวดหมู่...)"
                  className="max-w-sm bg-muted text-foreground border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
              <div className="text-center text-muted-foreground py-12 border rounded-lg bg-muted">
                (ตารางแสดงรายการวัสดุจะอยู่ตรงนี้)
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center ">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">

          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <CardContent className="">
              <h3 className="font-semibold text-foreground mb-2">
                ภาพรวมสัดส่วนสต็อก
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {categories.length} หมวดหมู่
              </p>
              <div className="w-full h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories.map((c) => ({
                        name: c.name,
                        value: c.percent,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent = 0 }) => `${(percent * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {categories.map((c, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={c.color}
                          stroke={c.color}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="space-y-1 text-sm">
                {categories.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: c.color }}
                    ></span>
                    <span>{c.name}</span>
                    <span className="ml-auto text-muted-foreground">
                      {c.percent}%
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

                {/* Shipping Status Button */}
      <Button
        variant="outline"
        className="w-full max-w-sm justify-start h-auto p-4 rounded-2xl bg-card text-card-foreground shadow-sm transition-colors hover:shadow-md mb-6"
        onClick={() => setOpenShipping(true)}
      >
        <Truck className="w-5 h-5 text-blue-500 mr-2" />
        <div className="text-left">
          <p className="font-semibold">สถานะการจัดส่ง</p>
          <p className="text-sm text-muted-foreground">
            {pendingOrders.length} คำสั่งซื้อรอดำเนินการ
          </p>
        </div>
      </Button>


          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <p>test</p>
          </Card>


        </div>
      </div>

      {/* Low Stock Card */}
      {materials.filter(
        (mat) => mat.minStock !== undefined && mat.stock <= mat.minStock
      ).length > 0 && (
        <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              วัสดุใกล้หมดสต็อก
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials
                .filter(
                  (mat) =>
                    mat.minStock !== undefined && mat.stock <= mat.minStock
                )
                .map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                  >
                    <div>
                      <p className="font-medium text-sm">{material.name}</p>
                      <p className="text-xs text-muted-foreground">
                        คงเหลือ: {material.stock} {material.unit} (ต่ำสุด:{" "}
                        {material.minStock})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setWithdrawMat(material);
                        setOpenWithdraw(true);
                      }}
                      className="h-8 px-3"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      เบิก
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog เพิ่มวัสดุ */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>เพิ่มวัสดุใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>ชื่อวัสดุ</Label>
              <Input
                value={newMat.name}
                onChange={(e) => setNewMat({ ...newMat, name: e.target.value })}
                className="bg-muted border-none focus-visible:ring-blue-500"
              />
            </div>
            <div>
              <Label>หมวดหมู่</Label>
              <Select onValueChange={(v) => setNewMat({ ...newMat, type: v })}>
                <SelectTrigger className="bg-muted border-none focus-visible:ring-blue-500">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c, i) => (
                    <SelectItem key={i} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>คงเหลือ</Label>
                <Input
                  type="number"
                  value={newMat.stock}
                  onChange={(e) =>
                    setNewMat({ ...newMat, stock: Number(e.target.value) })
                  }
                  className="bg-muted border-none focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <Label>หน่วย</Label>
                <Input
                  value={newMat.unit}
                  onChange={(e) =>
                    setNewMat({ ...newMat, unit: e.target.value })
                  }
                  className="bg-muted border-none focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdd(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400"
              onClick={addMaterial}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog แก้ไขวัสดุ */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>แก้ไขวัสดุ</DialogTitle>
          </DialogHeader>
          {editMat && (
            <div className="space-y-3 py-2">
              <div>
                <Label>ชื่อวัสดุ</Label>
                <Input
                  value={editMat.name}
                  onChange={(e) =>
                    setEditMat({ ...editMat, name: e.target.value })
                  }
                  className="bg-muted border-none focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <Label>หมวดหมู่</Label>
                <Select
                  value={editMat.category}
                  onValueChange={(v) => setEditMat({ ...editMat, category: v })}
                >
                  <SelectTrigger className="bg-muted border-none focus-visible:ring-blue-500">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c, i) => (
                      <SelectItem key={i} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ประเภท</Label>
                <Select
                  value={editMat.usageType}
                  onValueChange={(v) =>
                    setEditMat({
                      ...editMat,
                      usageType: v as "consumable" | "returnable",
                    })
                  }
                >
                  <SelectTrigger className="bg-muted border-none focus-visible:ring-blue-500">
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumable">ไม่ต้องคืน</SelectItem>
                    <SelectItem value="returnable">คืนได้</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>คงเหลือ</Label>
                  <Input
                    type="number"
                    value={editMat.stock}
                    onChange={(e) =>
                      setEditMat({ ...editMat, stock: Number(e.target.value) })
                    }
                    className="bg-muted border-none focus-visible:ring-blue-500"
                  />
                </div>
                <div>
                  <Label>หน่วย</Label>
                  <Input
                    value={editMat.unit}
                    onChange={(e) =>
                      setEditMat({ ...editMat, unit: e.target.value })
                    }
                    className="bg-muted border-none focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400"
              onClick={editMaterial}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog เบิกวัสดุ */}
      <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>ซื้อวัสดุ</DialogTitle>
          </DialogHeader>
          {withdrawMat && (
            <div className="space-y-3 py-2">
              <div>
                <p className="font-medium">{withdrawMat.name}</p>
                <p className="text-sm text-muted-foreground">
                  คงเหลือ: {withdrawMat.stock} {withdrawMat.unit}
                </p>
              </div>
              <div>
                <Label className="mb-2">จำนวนที่ต้องการสั่งซื้อ</Label>
                <Input
                  type="number"
                  value={withdrawQuantity}
                  onChange={(e) => setWithdrawQuantity(Number(e.target.value))}
                  className="bg-muted border-none focus-visible:ring-blue-500"
                  min={1}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenWithdraw(false)}>
              ยกเลิก
            </Button>
            <Button
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400"
              onClick={withdrawMaterial}
            >
              เบิกวัสดุ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ยืนยันการสั่งซื้อ */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-md bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>ยืนยันการสั่งซื้อวัสดุ</DialogTitle>
          </DialogHeader>
          {withdrawMat && (
            <div className="space-y-3 py-2">
              <div className="text-center">
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <p className="font-medium text-lg">{withdrawMat.name}</p>
                <p className="text-sm text-muted-foreground">
                  จำนวน: {withdrawQuantity} {withdrawMat.unit}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  กรุณายืนยันการสั่งซื้อวัสดุนี้
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenConfirm(false)}
              disabled={isProcessing}
            >
              ยกเลิก
            </Button>
            <Button
              className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400"
              onClick={confirmWithdraw}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังดำเนินการ...
                </>
              ) : (
                "ยืนยันการสั่งซื้อ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog สถานะการจัดส่ง */}
      <Dialog open={openShipping} onOpenChange={setOpenShipping}>
        <DialogContent className="max-w-2xl bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-500" />
              สถานะการจัดส่ง
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                ไม่มีคำสั่งซื้อที่รอดำเนินการ
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingOrders.map((order) => {
                  const material = materials.find(m => m.id === order.materialId);
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{material?.name || 'วัสดุไม่พบ'}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.quantity} {material?.unit} • {order.estimatedDays} วัน
                        </p>
                        <p className="text-xs text-muted-foreground">
                          สั่งซื้อเมื่อ: {order.orderedAt.toLocaleDateString('th-TH')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ถึงภายวันที่: {(() => {
                            const deliveryDate = new Date(order.orderedAt);
                            deliveryDate.setDate(deliveryDate.getDate() + order.estimatedDays);
                            return deliveryDate.toLocaleDateString('th-TH');
                          })()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          order.status === "completed" ? "default" :
                          order.status === "shipping" ? "secondary" :
                          "outline"
                        }
                        className="text-xs"
                      >
                        {order.status === "processing_documents" ? "กำลังดำเนินเอกสาร" :
                         order.status === "shipping" ? "กำลังจัดส่ง" :
                         order.status === "sorting" ? "กำลังคัดแยก" :
                         "เสร็จสิ้น"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
