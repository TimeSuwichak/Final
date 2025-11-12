"use client"
import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Search, Package, TriangleAlert } from "lucide-react"

type MainCategory =
  | "ไฟฟ้า"
  | "ประปา"
  | "เครื่องมือ"
  | "สี/เคมีภัณฑ์"
  | "โครงสร้าง"
  | "ทั่วไป"
  | "เครื่องปรับอากาศ"

interface Material {
  id: string
  name: string
  mainCategory: MainCategory
  unit: string
  stock: number
  minStock: number
  date: string
}

const CATEGORY_COLORS: Record<MainCategory, string> = {
  "ไฟฟ้า": "bg-blue-500",
  "ประปา": "bg-green-500",
  "เครื่องมือ": "bg-purple-600",
  "สี/เคมีภัณฑ์": "bg-yellow-500",
  "โครงสร้าง": "bg-pink-500",
  "ทั่วไป": "bg-gray-400",
  "เครื่องปรับอากาศ": "bg-indigo-500",
}

export default function MaterialDashboard() {
  const [materials, setMaterials] = useState<Material[]>([
    { id: "A001", name: "สายเคเบิล VAF 2x2.5", mainCategory: "ไฟฟ้า", unit: "เมตร", stock: 80, minStock: 10, date: "01/10/68" },
    { id: "A002", name: "หลอดไฟ LED 12W", mainCategory: "ไฟฟ้า", unit: "หลอด", stock: 150, minStock: 20, date: "03/10/68" },
    { id: "B001", name: "ท่อ PVC 1/2”", mainCategory: "ประปา", unit: "เส้น", stock: 45, minStock: 10, date: "05/10/68" },
    { id: "B002", name: "ก๊อกน้ำ", mainCategory: "ประปา", unit: "อัน", stock: 15, minStock: 5, date: "05/10/68" },
    { id: "C001", name: "ไขควงชุด", mainCategory: "เครื่องมือ", unit: "ชุด", stock: 20, minStock: 10, date: "07/10/68" },
    { id: "C002", name: "สว่านไฟฟ้า", mainCategory: "เครื่องมือ", unit: "เครื่อง", stock: 5, minStock: 5, date: "08/10/68" },
    { id: "D001", name: "สีกำแพงใน (ขาว)", mainCategory: "สี/เคมีภัณฑ์", unit: "แกลลอน", stock: 30, minStock: 5, date: "10/10/68" },
  ])

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<MainCategory | "ทั้งหมด">("ทั้งหมด")
  const [openAdd, setOpenAdd] = useState(false)
  const [newMat, setNewMat] = useState<Partial<Material>>({})

  const filtered = useMemo(() => {
    return materials.filter(m =>
      (filter === "ทั้งหมด" || m.mainCategory === filter) &&
      (m.name.includes(search) || m.id.includes(search))
    )
  }, [materials, search, filter])

  const addMaterial = () => {
    if (!newMat.name || !newMat.mainCategory) return
    setMaterials([
      ...materials,
      {
        id: "X" + (materials.length + 1).toString().padStart(3, "0"),
        name: newMat.name!,
        mainCategory: newMat.mainCategory!,
        stock: newMat.stock ?? 0,
        minStock: newMat.minStock ?? 0,
        unit: newMat.unit ?? "",
        date: new Date().toLocaleDateString("th-TH"),
      },
    ])
    setOpenAdd(false)
    setNewMat({})
  }

  const totalStock = materials.reduce((sum, m) => sum + m.stock, 0)
  const nearOut = materials.filter(m => m.stock <= m.minStock).length
  const categoryCount = new Set(materials.map(m => m.mainCategory)).size

  const totalByCategory = useMemo(() => {
    const grouped = materials.reduce((acc, m) => {
      acc[m.mainCategory] = (acc[m.mainCategory] || 0) + m.stock
      return acc
    }, {} as Record<MainCategory, number>)
    const total = Object.values(grouped).reduce((s, v) => s + v, 0)
    return Object.entries(grouped).map(([cat, val]) => ({
      cat,
      val,
      percent: (val / total) * 100,
    }))
  }, [materials])

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ซ้าย */}
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold">คลังวัสดุและอุปกรณ์</h1>
          <p className="text-sm text-muted-foreground">ภาพรวมและจัดการสต็อกวัสดุทั้งหมด</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground flex items-center gap-2"><Package size={16}/> รายการทั้งหมด</p><h2 className="text-2xl font-bold">{materials.length}</h2></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground flex items-center gap-2"><Package size={16}/> สต็อกรวม</p><h2 className="text-2xl font-bold">{totalStock}</h2></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground flex items-center gap-2"><Package size={16}/> หมวดหมู่</p><h2 className="text-2xl font-bold">{categoryCount}</h2></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground flex items-center gap-2"><TriangleAlert size={16}/> ใกล้หมด</p><h2 className="text-2xl font-bold text-yellow-500">{nearOut}</h2></CardContent></Card>
        </div>

        {/* ค้นหา + Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 text-gray-400" size={18}/>
            <Input placeholder="ค้นหา (ID, ชื่อ, หมวดหมู่...)" className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ทั้งหมด", ...Object.keys(CATEGORY_COLORS)] as (MainCategory | "ทั้งหมด")[]).map((cat) => (
            <Button key={cat} variant={filter === cat ? "default" : "outline"} onClick={() => setFilter(cat)}>
              {cat}
            </Button>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>รายการวัสดุทั้งหมด</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th>วัสดุ / รหัส</th>
                  <th>หมวดหมู่</th>
                  <th>คงคลัง</th>
                  <th>หน่วย</th>
                  <th>อัปเดตล่าสุด</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b">
                    <td className="py-2">
                      <div>{m.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {m.id}</div>
                    </td>
                    <td><span className={`text-white text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[m.mainCategory]}`}>{m.mainCategory}</span></td>
                    <td>{m.stock}</td>
                    <td>{m.unit}</td>
                    <td>{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* ขวา */}
      <div className="w-full lg:w-[320px] space-y-4">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold" onClick={() => setOpenAdd(true)}>
          + เพิ่มวัสดุใหม่
        </Button>

        <Card>
          <CardHeader><CardTitle>ภาพรวมสัดส่วนสต็อก</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm mb-2">{categoryCount} หมวดหมู่</p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden flex">
              {totalByCategory.map(({ cat, percent }) => (
                <div key={cat} className={`${CATEGORY_COLORS[cat as MainCategory]} h-full`} style={{ width: `${percent}%` }}></div>
              ))}
            </div>

            <div className="mt-3 space-y-1 text-xs">
              {totalByCategory.map(({ cat, percent }) => (
                <div key={cat} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat as MainCategory]}`} />
                  {cat} <span className="text-muted-foreground">{percent.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog เพิ่มวัสดุ */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>เพิ่มวัสดุใหม่</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>ชื่อวัสดุ</Label>
            <Input value={newMat.name || ""} onChange={e => setNewMat({ ...newMat, name: e.target.value })}/>
            <Label>หมวดหมู่</Label>
            <Select value={newMat.mainCategory} onValueChange={(v: MainCategory) => setNewMat({ ...newMat, mainCategory: v })}>
              <SelectTrigger><SelectValue placeholder="เลือกหมวดหมู่"/></SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_COLORS).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
            <Label>หน่วย</Label>
            <Input value={newMat.unit || ""} onChange={e => setNewMat({ ...newMat, unit: e.target.value })}/>
            <Label>คงเหลือ</Label>
            <Input type="number" value={newMat.stock ?? 0} onChange={e => setNewMat({ ...newMat, stock: Number(e.target.value) })}/>
            <Label>ขั้นต่ำ</Label>
            <Input type="number" value={newMat.minStock ?? 0} onChange={e => setNewMat({ ...newMat, minStock: Number(e.target.value) })}/>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setOpenAdd(false)}>ยกเลิก</Button>
            <Button className="bg-blue-600" onClick={addMaterial}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


