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
import { MaterialWithdrawalList } from "@/components/admin/MaterialWithdrawalList";
import { showSuccess, showError } from "@/lib/sweetalert";

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
    withdrawMaterials,
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
      showSuccess("เพิ่มวัสดุสำเร็จ");
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
      showSuccess("แก้ไขวัสดุสำเร็จ");
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

    // const newOrder: PendingOrder = {
    //   id: `ORD${Date.now()}`,
    //   materialId: withdrawMat!.id,
    //   quantity: withdrawQuantity,
    //   orderedAt: new Date(),
    //   status: "processing_documents",
    //   estimatedDays: Math.floor(Math.random() * 15) + 1, // Random 1-15 days
    // };
    // setPendingOrders([...pendingOrders, newOrder]);

    const result = withdrawMaterials([
      { materialId: withdrawMat!.id, quantity: withdrawQuantity },
    ]);

    setIsProcessing(false);

    if (result.success) {
      setWithdrawMat(null);
      setWithdrawQuantity(0);
      showSuccess("เบิกวัสดุสำเร็จ");
    } else {
      showError("เกิดข้อผิดพลาด", result.errors ? result.errors.join("\n") : "");
    }
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
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ค้นหา (ID, ชื่อ, หมวดหมู่...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-muted border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-[180px] bg-muted border-none">
                    <SelectValue placeholder="ทุกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                    {categories.map((c, i) => (
                      <SelectItem key={i} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={usageTypeFilter}
                  onValueChange={setUsageTypeFilter}
                >
                  <SelectTrigger className="w-full md:w-[150px] bg-muted border-none">
                    <SelectValue placeholder="ทุกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทุกประเภท</SelectItem>
                    <SelectItem value="consumable">ไม่ต้องคืน</SelectItem>
                    <SelectItem value="returnable">คืนได้</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>ชื่อวัสดุ</TableHead>
                      <TableHead>หมวดหมู่</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead className="text-right">คงเหลือ</TableHead>
                      <TableHead className="w-[80px]">หน่วย</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentMaterials.length > 0 ? (
                      currentMaterials.map((material) => (
                        <TableRow
                          key={material.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="font-medium text-xs text-muted-foreground">
                            {material.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {material.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: getCategoryColor(
                                    material.category
                                  ),
                                }}
                              />
                              <span className="text-sm text-muted-foreground">
                                {material.category}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                material.usageType === "returnable"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                material.usageType === "returnable"
                                  ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                              }
                            >
                              {material.usageType === "returnable"
                                ? "คืนได้"
                                : "ไม่ต้องคืน"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span
                                className={
                                  material.minStock !== undefined &&
                                  material.stock <= material.minStock
                                    ? "text-red-600 font-bold"
                                    : ""
                                }
                              >
                                {material.stock}
                              </span>
                              {material.minStock !== undefined &&
                                material.stock <= material.minStock && (
                                  <AlertTriangle
                                    className="w-4 h-4 text-red-500 animate-pulse"
                                    title="สินค้าใกล้หมดสต็อก"
                                  />
                                )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {material.unit}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="เบิกวัสดุ"
                                onClick={() => {
                                  setWithdrawMat(material);
                                  setOpenWithdraw(true);
                                }}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                onClick={() => {
                                  setEditMat(material);
                                  setOpenEdit(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          ไม่พบข้อมูลวัสดุ
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
                      label={({ percent = 0 }) =>
                        `${(percent * 100).toFixed(1)}%`
                      }
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
          <MaterialWithdrawalList />
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
                  <Label>คงเหลือ (แก้ไขไม่ได้)</Label>
                  <Input
                    type="number"
                    value={editMat.stock}
                    disabled
                    className="bg-muted/50 border-none text-muted-foreground cursor-not-allowed"
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
                <div className="col-span-2">
                  <Label>จำนวนขั้นต่ำ (แจ้งเตือนเมื่อต่ำกว่า)</Label>
                  <Input
                    type="number"
                    value={editMat.minStock || 0}
                    onChange={(e) =>
                      setEditMat({
                        ...editMat,
                        minStock: Number(e.target.value),
                      })
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
    </div>
  );
}
