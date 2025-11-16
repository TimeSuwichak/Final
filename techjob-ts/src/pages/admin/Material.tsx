"use client"
import React, { useState, useMemo } from "react"
import { Package, Layers, AlertTriangle, Box, PlusCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { electricalMaterials } from "@/data/materials/electrical"
import { networkMaterials } from "@/data/materials/network"
import { toolMaterials } from "@/data/materials/tools"
import { multimediaMaterials } from "@/data/materials/multimedia"
import { consumableMaterials } from "@/data/materials/consumables"
import type { Material } from "@/types"

export default function MaterialDashboard() {
  const [openAdd, setOpenAdd] = useState(false)
  const [newMat, setNewMat] = useState({ name: "", type: "", stock: 0, unit: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [usageTypeFilter, setUsageTypeFilter] = useState("")

  // รวมข้อมูลวัสดุจากทุกหมวดหมู่
  const allMaterials = useMemo(() => [
    ...electricalMaterials,
    ...networkMaterials,
    ...toolMaterials,
    ...multimediaMaterials,
    ...consumableMaterials,
  ], [])

  // คำนวณข้อมูลสรุปแบบไดนามิก
  const summary = useMemo(() => {
    const totalItems = allMaterials.length
    const totalStock = allMaterials.reduce((sum, mat) => sum + mat.stock, 0)
    const categories = [...new Set(allMaterials.map(mat => mat.category))].length
    const lowStock = allMaterials.filter(mat => mat.stock < 10).length

    return [
      { title: "รายการทั้งหมด", value: totalItems, icon: <Box className="w-6 h-6 text-blue-500 dark:text-blue-400" /> },
      { title: "สต็อกรวม", value: totalStock, icon: <Package className="w-6 h-6 text-green-500 dark:text-green-400" /> },
      { title: "หมวดหมู่", value: categories, icon: <Layers className="w-6 h-6 text-purple-500 dark:text-purple-400" /> },
      { title: "ใกล้หมด", value: lowStock, icon: <AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" /> },
    ]
  }, [allMaterials])

  // คำนวณสัดส่วนหมวดหมู่แบบไดนามิก
  const categories = useMemo(() => {
    const categoryGroups = allMaterials.reduce((acc, mat) => {
      if (!acc[mat.category]) {
        acc[mat.category] = { total: 0, count: 0 }
      }
      acc[mat.category].total += mat.stock
      acc[mat.category].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const totalStock = allMaterials.reduce((sum, mat) => sum + mat.stock, 0)

    return Object.entries(categoryGroups).map(([name, data]) => ({
      name,
      percent: totalStock > 0 ? Math.round((data.total / totalStock) * 100 * 10) / 10 : 0,
      color: getCategoryColor(name),
    }))
  }, [allMaterials])

  // ฟิลเตอร์วัสดุตามการค้นหาและกรอง
  const filteredMaterials = useMemo(() => {
    let filtered = allMaterials

    // กรองตามหมวดหมู่
    if (categoryFilter && categoryFilter !== "all") {
      filtered = filtered.filter(mat => mat.category === categoryFilter)
    }

    // กรองตามประเภท
    if (usageTypeFilter && usageTypeFilter !== "all") {
      filtered = filtered.filter(mat => mat.usageType === usageTypeFilter)
    }

    // กรองตามการค้นหา
    if (searchTerm) {
      filtered = filtered.filter(mat =>
        mat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mat.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [allMaterials, searchTerm, categoryFilter, usageTypeFilter])

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      "อุปกรณ์ไฟฟ้าและเดินสาย": "#4F46E5",
      "อุปกรณ์เครือข่ายและความปลอดภัย": "#22C55E",
      "เครื่องมือช่าง": "#9333EA",
      "อุปกรณ์ระบบอาคารและมัลติมีเดีย": "#F59E0B",
      "วัสดุติดตั้งและสิ้นเปลือง": "#EF4444",
    }
    return colors[category] || "#9CA3AF"
  }

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

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Section (Table Placeholder) */}
        <div className="md:col-span-2">
          <Card className="rounded-2xl bg-card text-card-foreground shadow-sm transition-colors">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหา (ID, ชื่อ, หมวดหมู่...)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-muted text-foreground border-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="flex-1 bg-muted border-none focus-visible:ring-blue-500">
                      <SelectValue placeholder="กรองตามหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {categories.map((c, i) => (
                        <SelectItem key={i} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={usageTypeFilter} onValueChange={setUsageTypeFilter}>
                    <SelectTrigger className="flex-1 bg-muted border-none focus-visible:ring-blue-500">
                      <SelectValue placeholder="กรองตามประเภท" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="consumable">ไม่ต้องคืน</SelectItem>
                      <SelectItem value="reusable">คืนได้</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>ชื่อวัสดุ</TableHead>
                      <TableHead>หมวดหมู่</TableHead>
                      <TableHead className="w-24">คงเหลือ</TableHead>
                      <TableHead className="w-20">หน่วย</TableHead>
                      <TableHead className="w-24">ประเภท</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-mono text-sm">{material.id}</TableCell>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {material.category}
                          </Badge>
                        </TableCell>
                        <TableCell className={`font-semibold ${material.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {material.stock}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{material.unit}</TableCell>
                        <TableCell>
                          <Badge variant={material.usageType === 'consumable' ? 'default' : 'outline'} className="text-xs">
                            {material.usageType === 'consumable' ? 'ไม่ต้องคืน' : 'คืนได้'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredMaterials.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    ไม่พบวัสดุที่ค้นหา
                  </div>
                )}
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


