"use client"
import React, { useState } from "react"
import { Package, Layers, AlertTriangle, Box, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

export default function MaterialDashboard() {
  const [openAdd, setOpenAdd] = useState(false)
  const [newMat, setNewMat] = useState({ name: "", type: "", stock: 0, unit: "" })

  const summary = [
    { title: "รายการทั้งหมด", value: 13, icon: <Box className="w-6 h-6 text-blue-500 dark:text-blue-400" /> },
    { title: "สต็อกรวม", value: 1060, icon: <Package className="w-6 h-6 text-green-500 dark:text-green-400" /> },
    { title: "หมวดหมู่", value: 7, icon: <Layers className="w-6 h-6 text-purple-500 dark:text-purple-400" /> },
    { title: "ใกล้หมด", value: 2, icon: <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" /> },
  ]

  const categories = [
    { name: "ไฟฟ้า", percent: 24.5, color: "#4F46E5" },
    { name: "ประปา", percent: 15.1, color: "#22C55E" },
    { name: "เครื่องมือ", percent: 3.8, color: "#9333EA" },
    { name: "สี/เคมีภัณฑ์", percent: 2.8, color: "#F59E0B" },
    { name: "โครงสร้าง", percent: 0.9, color: "#EF4444" },
    { name: "เครื่องปรับอากาศ", percent: 5.7, color: "#06B6D4" },
    { name: "ทั่วไป", percent: 47.2, color: "#9CA3AF" },
  ]

  const addMaterial = () => {
    setOpenAdd(false)
    setNewMat({ name: "", type: "", stock: 0, unit: "" })
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[#0B0B16] p-6 transition-colors duration-300">
      <h1 className="text-2xl font-semibold text-foreground">คลังวัสดุและอุปกรณ์</h1>
      <p className="text-muted-foreground mb-6">ภาพรวมและจัดการสต็อกวัสดุที่มีอยู่</p>

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

<<<<<<< HEAD
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Section (Table Placeholder) */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
=======
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
>>>>>>> 78d4bc40b50571ab5b6b72194b46e2ec9db218a8
                <Input
                  placeholder="ค้นหา (ID, ชื่อ, หมวดหมู่...)"
                  className="max-w-sm bg-muted text-foreground border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
              </div>
              <div className="text-center text-muted-foreground py-12 border rounded-lg bg-muted">
                (ตารางแสดงรายการวัสดุจะอยู่ตรงนี้)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <CardContent className="p-4">
              <Button
                className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white rounded-xl py-6 text-base font-medium flex items-center justify-center gap-2 transition-all"
                onClick={() => setOpenAdd(true)}
              >
                <PlusCircle className="w-5 h-5" /> เพิ่มวัสดุใหม่
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2">ภาพรวมสัดส่วนสต็อก</h3>
              <p className="text-sm text-muted-foreground mb-3">{categories.length} หมวดหมู่</p>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden mb-4">
                <div className="flex h-full">
                  {categories.map((c, i) => (
                    <div key={i} style={{ width: `${c.percent}%`, backgroundColor: c.color }}></div>
                  ))}
                </div>
              </div>
              <ul className="space-y-1 text-sm">
                {categories.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: c.color }}></span>
                    <span>{c.name}</span>
                    <span className="ml-auto text-muted-foreground">{c.percent}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

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
                onChange={e => setNewMat({ ...newMat, name: e.target.value })}
                className="bg-muted border-none focus-visible:ring-blue-500"
              />
            </div>
            <div>
              <Label>หมวดหมู่</Label>
              <Select onValueChange={v => setNewMat({ ...newMat, type: v })}>
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
                  onChange={e => setNewMat({ ...newMat, stock: Number(e.target.value) })}
                  className="bg-muted border-none focus-visible:ring-blue-500"
                />
              </div>
              <div>
                <Label>หน่วย</Label>
                <Input
                  value={newMat.unit}
                  onChange={e => setNewMat({ ...newMat, unit: e.target.value })}
                  className="bg-muted border-none focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAdd(false)}>
              ยกเลิก
            </Button>
            <Button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400" onClick={addMaterial}>
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


