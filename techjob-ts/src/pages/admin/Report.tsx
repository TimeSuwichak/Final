// React Hooks ที่ใช้จัดการสถานะ (state) และประสิทธิภาพของ component
import { useState, useMemo } from "react"

// Components UI จาก shadcn/ui สำหรับสร้างตาราง
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// ช่องค้นหา
import { Input } from "@/components/ui/input"
// ปุ่มกด
import { Button } from "@/components/ui/button"
// Dropdown (Select)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// กล่องข้อความหลายบรรทัด
import { Textarea } from "@/components/ui/textarea"
// ไอคอนลูกศรจาก lucide-react
import { ChevronDown, ChevronUp } from "lucide-react"
// ดึงข้อมูลจำลองผู้ใช้
import { user } from "@/Data/user"

// หมวดหมู่ของการแจ้งปัญหา (mock data)
const reportCategories = ["ระบบล้ม/Error", "ฟังก์ชั่นที่ใช้งานไม่ได้", "ข้อเสนอเเนะ / เนานะนำฟีเจอร์ใหม่", "อื่นๆ"]

// กำหนดรูปแบบของข้อมูลแต่ละรายการ (TypeScript interface)
interface ReportEntry {
  id: number
  name: string
  category: string
  position: string
  department: string
  description: string
  reportDate: string
}

// Component หลัก
const Report = () => {
  // 📦 ส่วนของ State (สถานะที่ใช้ภายใน component)
  const [searchQuery, setSearchQuery] = useState("") // คำค้นหา
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด") // หมวดหมู่ที่เลือก
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set()) // เก็บ id ของแถวที่ขยาย
  const [selectedUserId, setSelectedUserId] = useState<string>("") // ผู้แจ้งปัญหา
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>("") // หมวดหมู่ที่เลือกในแบบฟอร์ม
  const [reportDescription, setReportDescription] = useState<string>("") // รายละเอียดปัญหา
  const [reports, setReports] = useState<ReportEntry[]>([]) // เก็บรายการการแจ้งทั้งหมด

  // ฟังก์ชันเพิ่มการแจ้งปัญหาใหม่
  const handleAddReport = () => {
    if (!selectedUserId || !selectedReportCategory || !reportDescription.trim()) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    const selectedUser = user.find((u) => u.id.toString() === selectedUserId)
    if (!selectedUser) return

    // สร้าง object การแจ้งปัญหาใหม่
    const newReport: ReportEntry = {
      id: Date.now(), // ใช้ timestamp เป็น id
      name: `${selectedUser.fname} ${selectedUser.lname}`,
      category: selectedReportCategory,
      position: selectedUser.position,
      department: selectedUser.department,
      description: reportDescription,
      reportDate: new Date().toLocaleString("th-TH"), // วันที่และเวลาที่บันทึก
    }

    // เพิ่มข้อมูลใหม่เข้า state
    setReports([...reports, newReport])

    // เคลียร์ฟอร์ม
    setSelectedUserId("")
    setSelectedReportCategory("")
    setReportDescription("")
  }

  // กรองข้อมูลตามการค้นหาและหมวดหมู่
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.department.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = selectedCategory === "ทั้งหมด" || report.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, reports])

  // ฟังก์ชันสำหรับเปิด/ปิดรายละเอียดแต่ละแถว
  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedRows(newExpanded)
  }

  // ส่วนแสดงผล (JSX)
  return (
    <div className="w-full space-y-6 p-6">
      {/* หัวข้อหน้า */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">การแจ้งปัญหา</h1>
      </div>

      {/* ส่วนแบบฟอร์มเพิ่มการแจ้ง */}
      <div className="bg-card rounded-lg border-2 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">การจำลอง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* เลือกชื่อผู้แจ้ง */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ชื่อ</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="เลือกชื่อ" />
              </SelectTrigger>
              <SelectContent>
                {user.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.fname} {u.lname}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* เลือกหมวดหมู่ */}
          <div className="space-y-2">
            <label className="text-sm font-medium">หมวดหมู่</label>
            <Select value={selectedReportCategory} onValueChange={setSelectedReportCategory}>
              <SelectTrigger className="border-2">
                <SelectValue placeholder="เลือกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                {reportCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* รายละเอียดเพิ่มเติม */}
        <div className="space-y-2">
          <label className="text-sm font-medium">การอ้างอง</label>
          <Textarea
            placeholder="เพิ่มเติม..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="border-2 min-h-[100px]"
          />
        </div>

        {/* ปุ่มเพิ่มข้อมูล */}
        <div className="flex justify-end">
          <Button onClick={handleAddReport}>เพิ่ม</Button>
        </div>
      </div>

      {/* ส่วนตารางแสดงข้อมูล */}
      <div className="bg-card rounded-lg border-2 shadow-sm p-6 space-y-4">
        {/* ฟิลเตอร์ค้นหา + หมวดหมู่ */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 border-2"
            />
            <Button variant="default" onClick={() => setSearchQuery("")}>
              ยกเลิก
            </Button>
          </div>
        </div>

        {/* Dropdown เลือกหมวดหมู่ */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">เลือกหมวดหมู่</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px] border-2">
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
              {reportCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ตารางข้อมูล */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ชื่อ</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>แผนก</TableHead>
                <TableHead className="text-center">เพิ่มเติม</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredReports.map((report) => (
                <>
                  {/* แถวหลัก */}
                  <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>{report.position}</TableCell>
                    <TableCell>{report.department}</TableCell>
                    <TableCell className="text-center">
                      {/* ปุ่มดูรายละเอียด */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(report.id)}
                        className="flex-right gap-1 justify-end"
                      >
                        ดู {expandedRows.has(report.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* แถวรายละเอียด */}
                  {expandedRows.has(report.id) && (
                    <TableRow key={`${report.id}-details`}>
                      <TableCell colSpan={5} className="bg-muted/20 p-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg mb-4">รายละเอียดการแจ้งปัญหา</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">1. ชื่อผู้แจ้ง:</p>
                              <p className="text-base">{report.name}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">2. วันที่แจ้ง:</p>
                              <p className="text-base">{report.reportDate}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">3. ตำแหน่ง:</p>
                              <p className="text-base">{report.position}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">4. แผนก:</p>
                              <p className="text-base">{report.department}</p>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <p className="text-sm font-medium text-muted-foreground">5. รายละเอียดปัญหา:</p>
                              <p className="text-base">{report.description}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}

              {/* แสดงเมื่อไม่พบข้อมูล */}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// ✅ ส่งออก component
export default Report