"use client"
import React, { useMemo, useState } from "react"
import { Loader2, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// -----------------------------
// Types
// -----------------------------
type MainCategory =
  | "Electrical" | "Plumbing" | "HVAC" | "General"
  | "Tools" | "Construction" | "Office"

type SubCategoryMap = { [K in MainCategory]: string[] }

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
  at: string
  arrivalAt: string
}

// -----------------------------
// Subcategory mapping
// -----------------------------
const SUBCATEGORIES: SubCategoryMap = {
  Electrical: ["สายไฟ", "หลอดไฟ", "เบรกเกอร์", "ปลั๊ก/สวิตช์", "กล่องพักสาย", "ข้อต่อรางไฟ"],
  Plumbing: ["ท่อ PVC", "ข้อต่อ", "ก๊อกน้ำ", "วาล์ว", "ปั๊มน้ำ", "ถังเก็บน้ำ"],
  HVAC: ["น้ำยาแอร์", "ท่อทองแดง", "คอมเพรสเซอร์", "ฟิลเตอร์แอร์", "เทปพันท่อแอร์"],
  General: ["ตะปู", "น็อต/สกรู", "เทปพันเกลียว", "สายรัด", "สเปรย์หล่อลื่น", "กาว"],
  Tools: ["ค้อน", "ไขควง", "ประแจ", "คีม", "สว่าน", "ใบเลื่อย", "มีดคัตเตอร์"],
  Construction: ["ปูนซีเมนต์", "เหล็กเส้น", "อิฐบล็อก", "ทราย", "หิน", "ไม้แบบ"],
  Office: ["ปากกา", "ดินสอ", "กระดาษ A4", "แฟ้มเอกสาร", "คลิปหนีบ", "เครื่องเย็บกระดาษ"],
}

// -----------------------------
// Mock Data
// -----------------------------
const INITIAL_MATERIALS: Material[] = [
  { id: "E001", name: "สายไฟ THW 1x2.5 sq.mm", mainCategory: "Electrical", subCategory: "สายไฟ", stock: 150, minStock: 50, unit: "เมตร" },
  { id: "E002", name: "หลอดไฟ LED 18W", mainCategory: "Electrical", subCategory: "หลอดไฟ", stock: 60, minStock: 20, unit: "ดวง" },
  { id: "P001", name: "ท่อ PVC 1 นิ้ว", mainCategory: "Plumbing", subCategory: "ท่อ PVC", stock: 30, minStock: 10, unit: "เส้น" },
  { id: "T001", name: "ค้อนเหล็ก 1 ปอนด์", mainCategory: "Tools", subCategory: "ค้อน", stock: 25, minStock: 5, unit: "อัน" },
]

// -----------------------------
function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString()
}

// -----------------------------
export default function MaterialPage() {
  const [materials, setMaterials] = useState(INITIAL_MATERIALS)
  const [history, setHistory] = useState<WithdrawEntry[]>([])

  const [query, setQuery] = useState("")
  const [filterMain, setFilterMain] = useState("ทั้งหมด")
  const [filterSub, setFilterSub] = useState("ทั้งหมด")

  // Dialog states
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState<Material | null>(null)
  const [withdrawQty, setWithdrawQty] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<{
    days: number, hours: number, arrivalAt: string
  } | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return materials.filter((m) => {
      if (filterMain !== "ทั้งหมด" && m.mainCategory !== filterMain) return false
      if (filterSub !== "ทั้งหมด" && m.subCategory !== filterSub) return false
      if (!q) return true
      return m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
    })
  }, [materials, query, filterMain, filterSub])

  function openWithdrawDialog(m: Material) {
    setWithdrawTarget(m)
    setWithdrawQty(0)
    setSimulationResult(null)
    setOpenWithdraw(true)
  }

  function confirmWithdraw() {
    if (!withdrawTarget || withdrawQty <= 0) return
    setIsSimulating(true)
    setSimulationResult(null)

    setTimeout(() => {
      setIsSimulating(false)
      const days = Math.floor(Math.random() * 3) + 1
      const hours = Math.floor(Math.random() * 24)
      const now = new Date()
      const arrival = new Date(now.getTime() + (days * 24 + hours) * 3600000)

      setMaterials(prev => prev.map(p =>
        p.id === withdrawTarget.id
          ? { ...p, stock: Math.max(0, p.stock - withdrawQty) }
          : p
      ))

      const entry: WithdrawEntry = {
        id: `W${Date.now()}`,
        materialId: withdrawTarget.id,
        materialName: withdrawTarget.name,
        qty: withdrawQty,
        days,
        hours,
        at: now.toISOString(),
        arrivalAt: arrival.toISOString(),
      }
      setHistory(prev => [entry, ...prev])
      setSimulationResult({ days, hours, arrivalAt: arrival.toISOString() })
    }, Math.random() * 2000 + 1500)
  }

  const mainCategories: (MainCategory | "ทั้งหมด")[] = ["ทั้งหมด", ...Object.keys(SUBCATEGORIES) as MainCategory[]]
  const subCategories = filterMain === "ทั้งหมด"
    ? ["ทั้งหมด"]
    : ["ทั้งหมด", ...SUBCATEGORIES[filterMain as MainCategory]]

  return (
    <div className="p-6 w-full min-h-screen">
      <h1 className="text-2xl font-extrabold mb-6">ระบบคลังวัสดุ</h1>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="ค้นหาวัสดุ..." value={query} onChange={e => setQuery(e.target.value)} className="max-w-xs" />
        <Select value={filterMain} onValueChange={v => { setFilterMain(v); setFilterSub("ทั้งหมด") }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="หมวดหลัก" /></SelectTrigger>
          <SelectContent>
            {mainCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSub} onValueChange={setFilterSub}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="หมวดย่อย" /></SelectTrigger>
          <SelectContent>
            {subCategories.map(sub => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>รายการวัสดุทั้งหมด</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส</TableHead>
                <TableHead>ชื่อวัสดุ</TableHead>
                <TableHead>หมวดหลัก</TableHead>
                <TableHead>หมวดย่อย</TableHead>
                <TableHead>คงเหลือ</TableHead>
                <TableHead>หน่วย</TableHead>
                <TableHead>จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">ไม่พบวัสดุ</TableCell></TableRow>
              ) : filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.mainCategory}</TableCell>
                  <TableCell>{m.subCategory}</TableCell>
                  <TableCell className={m.stock < m.minStock ? "text-red-500 font-semibold" : ""}>{m.stock}</TableCell>
                  <TableCell>{m.unit}</TableCell>
                  <TableCell><Button size="sm" variant="outline" onClick={() => openWithdrawDialog(m)}>เบิก</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
        <DialogContent
          className="sm:max-w-[500px] space-y-5"
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle>เบิกวัสดุ</DialogTitle>
            {withdrawTarget && (
              <div className="text-sm text-muted-foreground mt-1">
                {withdrawTarget.name}
              </div>
            )}
          </DialogHeader>

          {isSimulating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="animate-spin w-8 h-8 mb-3" />
              <p>กำลังดำเนินการ...</p>
            </div>
          ) : simulationResult ? (
            <div className="text-center space-y-3 py-6">
              <Truck className="mx-auto text-green-500 w-10 h-10" />
              <p className="font-medium text-green-600">เบิกสำเร็จ</p>
              <p>จะมาถึงใน {simulationResult.days} วัน {simulationResult.hours} ชั่วโมง</p>
              <p className="text-xs text-gray-400">({formatDateTime(simulationResult.arrivalAt)})</p>
              <Button onClick={() => setOpenWithdraw(false)}>ปิด</Button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>จำนวนที่ต้องการเบิก</Label>
                <Input
                  type="number"
                  value={withdrawQty}
                  onChange={(e) => setWithdrawQty(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <DialogFooter className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setOpenWithdraw(false)}>ยกเลิก</Button>
                <Button onClick={confirmWithdraw} disabled={withdrawQty <= 0}>เริ่มจำลองเบิก</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">ประวัติการเบิก</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการเบิก</p>
        ) : (
          history.map(h => (
            <div key={h.id} className="border rounded-lg p-3 flex justify-between items-center mb-2">
              <div>
                <div className="font-medium">{h.materialName}</div>
                <div className="text-sm text-muted-foreground">
                  เบิก {h.qty} หน่วย • {formatDateTime(h.at)}<br />
                  <span className="text-green-600">
                    จะมาถึงใน {h.days} วัน {h.hours} ชั่วโมง ({formatDateTime(h.arrivalAt)})
                  </span>
                </div>
              </div>
              <Badge variant="secondary">{h.id}</Badge>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

