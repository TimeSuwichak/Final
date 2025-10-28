
// src/pages/admin/Material.tsx
"use client"

import React, { useMemo, useState } from "react"
import { Plus, Search as SearchIcon, Edit3, Trash2, Clock, Package, Bell } from "lucide-react"

// shadcn/ui imports (per-file)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// -----------------------------
// Types
// -----------------------------
type MainCategory = "Electrical" | "Plumbing" | "HVAC" | "General"

type SubCategoryMap = {
  [K in MainCategory]: string[]
}

interface Material {
  id: string
  name: string
  mainCategory: MainCategory
  subCategory: string
  stock: number
  minStock: number
  unit: string
}

interface WithdrawEntry {
  id: string
  materialId: string
  materialName: string
  qty: number
  days: number
  hours: number
  at: string // ISO timestamp
}

// -----------------------------
// Subcategory mapping
// -----------------------------
const SUBCATEGORIES: SubCategoryMap = {
  Electrical: ["สายไฟ", "หลอดไฟ", "เบรกเกอร์", "ปลั๊ก/สวิตช์"],
  Plumbing: ["ท่อ PVC", "ข้อต่อ", "ก๊อก/วาล์ว"],
  HVAC: ["น้ำยาแอร์", "ท่อทองแดง", "คอมเพรสเซอร์"],
  General: ["น็อต/สกรู", "เทปพันเกลียว", "ตะปู", "อุปกรณ์อื่นๆ"],
}

// -----------------------------
// Initial Mock Data
// -----------------------------
const INITIAL_MATERIALS: Material[] = [
  { id: "M001", name: "สายไฟ THW 1.5 sq.mm.", mainCategory: "Electrical", subCategory: "สายไฟ", stock: 150, minStock: 50, unit: "เมตร" },
  { id: "M002", name: "ท่อ PVC 4 นิ้ว", mainCategory: "Plumbing", subCategory: "ท่อ PVC", stock: 3, minStock: 5, unit: "เส้น" },
  { id: "M003", name: "น้ำยาแอร์ R32", mainCategory: "HVAC", subCategory: "น้ำยาแอร์", stock: 12, minStock: 10, unit: "กระป๋อง" },
  { id: "M004", name: "ตะปูเกลียว 2 นิ้ว", mainCategory: "General", subCategory: "ตะปู", stock: 900, minStock: 1000, unit: "ตัว" },
  { id: "M005", name: "เทปพันเกลียว", mainCategory: "General", subCategory: "เทปพันเกลียว", stock: 85, minStock: 30, unit: "ม้วน" },
]

// -----------------------------
// Helper: format date/time
// -----------------------------
function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString()
}

// -----------------------------
// Component: MaterialPage
// -----------------------------
export default function MaterialPage() {
  // Materials + history
  const [materials, setMaterials] = useState<Material[]>(INITIAL_MATERIALS)
  const [history, setHistory] = useState<WithdrawEntry[]>([])

  // UI state
  const [query, setQuery] = useState<string>("")
  const [filterMain, setFilterMain] = useState<string>("ทั้งหมด")
  const [page, setPage] = useState<number>(1)
  const pageSize = 10

  // Dialogs state
  const [openAddEdit, setOpenAddEdit] = useState(false)
  const [editing, setEditing] = useState<Material | null>(null)

  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState<Material | null>(null)

  // Form state for add/edit
  const emptyForm = {
    name: "",
    mainCategory: "Electrical" as MainCategory,
    subCategory: SUBCATEGORIES["Electrical"][0],
    stock: 0,
    minStock: 0,
    unit: "",
  }
  const [form, setForm] = useState<typeof emptyForm>(emptyForm)

  // Withdraw form
  const [withdrawQty, setWithdrawQty] = useState<number>(0)
  const [withdrawDays, setWithdrawDays] = useState<number>(0)
  const [withdrawHours, setWithdrawHours] = useState<number>(0)

  // Derived lists
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return materials.filter((m) => {
      if (filterMain !== "ทั้งหมด" && m.mainCategory !== filterMain) return false
      if (!q) return true
      return (
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.subCategory.toLowerCase().includes(q)
      )
    })
  }, [materials, query, filterMain])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)

  // Stats
  const lowStockCount = materials.filter((m) => m.stock < m.minStock).length
  const totalUnique = materials.length
  const totalQty = materials.reduce((s, m) => s + m.stock, 0)

  // -----------------------------
  // Handlers: Add / Edit
  // -----------------------------
  function openAdd() {
    setEditing(null)
    setForm(emptyForm)
    setOpenAddEdit(true)
  }

  function openEdit(m: Material) {
    setEditing(m)
    setForm({
      name: m.name,
      mainCategory: m.mainCategory,
      subCategory: m.subCategory,
      stock: m.stock,
      minStock: m.minStock,
      unit: m.unit,
    })
    setOpenAddEdit(true)
  }

  function saveForm() {
    if (!form.name.trim()) {
      alert("กรุณากรอกชื่อวัสดุ")
      return
    }
    if (!form.unit.trim()) {
      alert("กรุณาระบุหน่วย")
      return
    }

    if (editing) {
      // update
      setMaterials((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? { ...p, name: form.name.trim(), mainCategory: form.mainCategory, subCategory: form.subCategory, stock: Number(form.stock), minStock: Number(form.minStock), unit: form.unit.trim() }
            : p
        )
      )
    } else {
      // create new id: M + 4-digit
      const nextIdNumber = (materials.length > 0 ? Math.max(...materials.map(m => Number(m.id.replace(/^M0*/, "") || 0))) : 0) + 1
      const id = `M${String(nextIdNumber).padStart(3, "0")}`
      const newMat: Material = {
        id,
        name: form.name.trim(),
        mainCategory: form.mainCategory,
        subCategory: form.subCategory,
        stock: Number(form.stock),
        minStock: Number(form.minStock),
        unit: form.unit.trim() || "ชิ้น",
      }
      setMaterials((prev) => [...prev, newMat])
    }

    setOpenAddEdit(false)
  }

  // -----------------------------
  // Handlers: Withdraw
  // -----------------------------
  function openWithdrawDialog(m: Material) {
    setWithdrawTarget(m)
    setWithdrawQty(0)
    setWithdrawDays(0)
    setWithdrawHours(0)
    setOpenWithdraw(true)
  }

  function confirmWithdraw() {
    if (!withdrawTarget) return
    if (withdrawQty <= 0) {
      alert("จำนวนที่เบิกต้องมากกว่า 0")
      return
    }
    // clamp subtract
    setMaterials((prev) =>
      prev.map((p) =>
        p.id === withdrawTarget.id
          ? { ...p, stock: Math.max(0, p.stock - withdrawQty) }
          : p
      )
    )

    const entry: WithdrawEntry = {
      id: `W${Date.now()}`,
      materialId: withdrawTarget.id,
      materialName: withdrawTarget.name,
      qty: withdrawQty,
      days: Math.max(0, Math.floor(withdrawDays)),
      hours: Math.max(0, Math.floor(withdrawHours)),
      at: new Date().toISOString(),
    }
    setHistory((prev) => [entry, ...prev])
    setOpenWithdraw(false)
  }

  // -----------------------------
  // Handlers: Delete
  // -----------------------------
  function handleDelete(id: string) {
    if (!confirm("ต้องการลบวัสดุนี้ใช่หรือไม่?")) return
    setMaterials((prev) => prev.filter((p) => p.id !== id))
    // optionally remove related history entries (we keep them for audit trail)
  }

  // -----------------------------
  // UI small helpers
  // -----------------------------
  const mainCategories: (MainCategory | "ทั้งหมด")[] = ["ทั้งหมด", "Electrical", "Plumbing", "HVAC", "General"]

  return (
    <div className="p-6 w-full min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">ระบบคลังวัสดุ</h1>
          <p className="text-sm text-muted-foreground mt-1">ภาพรวม จัดการ เพิ่ม / แก้ไข / เบิกวัสดุ และดูประวัติการเบิก</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openAdd} className="flex items-center">
            <Plus className="w-4 h-4 mr-2" /> เพิ่มวัสดุใหม่
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">จำนวน SKU</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnique.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">รายการวัสดุทั้งหมด</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รวมจำนวนหน่วย</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQty.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">รวม stock ทุก SKU</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รายการใกล้หมด</CardTitle>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <div className="text-sm text-muted-foreground mt-1">วัสดุที่ต่ำกว่า threshold</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls: Search + Filter */}
      <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
        <div className="relative w-full md:w-1/2">
          <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="ค้นหาชื่อวัสดุ / ID / หมวดหมู่ย่อย..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={filterMain} onValueChange={(v) => { setFilterMain(v); setPage(1) }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="กรองหมวดหมู่หลัก" />
            </SelectTrigger>
            <SelectContent>
              {mainCategories.map((mc) => (
                <SelectItem key={mc} value={mc}>{mc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">ID / ชื่อ</TableHead>
              <TableHead>หมวดหมู่หลัก / ย่อย</TableHead>
              <TableHead className="w-[160px] text-right">จำนวนคงคลัง</TableHead>
              <TableHead className="w-[160px] text-right">ขั้นต่ำแจ้งเตือน</TableHead>
              <TableHead className="w-[120px] text-right">หน่วย</TableHead>
              <TableHead className="w-[160px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length > 0 ? paginated.map((m) => {
              const isLow = m.stock < m.minStock
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{m.mainCategory} • <span className="text-muted-foreground">{m.subCategory}</span></div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{m.stock.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{m.minStock.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{m.unit}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)} title="แก้ไข">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openWithdrawDialog(m)} title="เบิก">
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(m.id)} title="ลบ">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-2">
                      {isLow ? <Badge variant="destructive">ใกล้หมด</Badge> : <Badge>ปกติ</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              )
            }) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  ไม่พบรายการวัสดุที่ตรงกับคำค้นหา
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }} />
            </PaginationItem>
            {/* simple numeric pages */}
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => { e.preventDefault(); setPage(i + 1) }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Withdraw History */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">ประวัติการเบิก (ล่าสุด)</h3>
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground">ยังไม่มีการเบิกวัสดุ</div>
          ) : (
            history.map((h) => (
              <div key={h.id} className="flex items-center justify-between bg-card p-3 rounded-md border">
                <div>
                  <div className="font-medium">{h.materialName} — {h.qty.toLocaleString()} หน่วย</div>
                  <div className="text-sm text-muted-foreground">
                    ใช้เวลา {h.days} วัน {h.hours} ชั่วโมง • {formatDateTime(h.at)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{h.id}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* -----------------------
          Dialog: Add / Edit
         ----------------------- */}
      <Dialog open={openAddEdit} onOpenChange={setOpenAddEdit}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{editing ? "แก้ไขวัสดุ" : "เพิ่มวัสดุใหม่"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>ชื่อวัสดุ</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สายไฟ THW 1.5 sq.mm." />
            </div>

            <div>
              <Label>หมวดหมู่หลัก</Label>
              <Select value={form.mainCategory} onValueChange={(v) => {
                const mc = v as MainCategory
                setForm({ ...form, mainCategory: mc, subCategory: SUBCATEGORIES[mc][0] })
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่หลัก" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                  <SelectItem value="HVAC">HVAC</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>หมวดหมู่ย่อย</Label>
              <Select value={form.subCategory} onValueChange={(v) => setForm({ ...form, subCategory: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่ย่อย" />
                </SelectTrigger>
                <SelectContent>
                  {(SUBCATEGORIES[form.mainCategory] || []).map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>หน่วย</Label>
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="เมตร / ม้วน / ตัว / กระป๋อง" />
            </div>

            <div>
              <Label>จำนวนคงคลัง (เริ่มต้น)</Label>
              <Input type="number" value={String(form.stock)} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>

            <div>
              <Label>ขั้นต่ำแจ้งเตือน</Label>
              <Input type="number" value={String(form.minStock)} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddEdit(false)}>ยกเลิก</Button>
            <Button onClick={saveForm}>{editing ? "บันทึกการแก้ไข" : "เพิ่มวัสดุ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -----------------------
          Dialog: Withdraw
         ----------------------- */}
      <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>เบิกวัสดุ</DialogTitle>
            <div className="text-sm text-muted-foreground mt-1">{withdrawTarget ? `${withdrawTarget.name} (${withdrawTarget.id})` : ""}</div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label>จำนวนที่ต้องการเบิก</Label>
              <Input type="number" value={withdrawQty} onChange={(e) => setWithdrawQty(Math.max(0, Number(e.target.value || 0)))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ใช้เวลากี่วัน</Label>
                <Input type="number" value={withdrawDays} onChange={(e) => setWithdrawDays(Math.max(0, Number(e.target.value || 0)))} />
              </div>
              <div>
                <Label>ใช้เวลากี่ชั่วโมง</Label>
                <Input type="number" value={withdrawHours} onChange={(e) => setWithdrawHours(Math.max(0, Number(e.target.value || 0)))} />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              เวลาที่ระบุจะบันทึกในประวัติการเบิกเพื่อใช้วิเคราะห์เวลางาน/ติดตามทรัพยากร
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenWithdraw(false)}>ยกเลิก</Button>
            <Button onClick={confirmWithdraw} disabled={withdrawQty <= 0}>ยืนยันเบิก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
