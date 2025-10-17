// React Hooks ที่จำเป็นสำหรับการจัดการ state และ performance
import { useState, useMemo } from "react"
// Components UI จาก shadcn/ui สำหรับสร้างตาราง
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Component Input สำหรับช่องค้นหา
import { Input } from "@/components/ui/input"
// Component Button สำหรับปุ่มกด
import { Button } from "@/components/ui/button"
// Components สำหรับสร้าง Dropdown (Select)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// ไอคอนลูกศรจาก lucide-react
import { ChevronDown, ChevronUp } from "lucide-react"

// --- Mock Data (ข้อมูลจำลอง) ---
// รายชื่อข้อมูลตัวอย่าง
const thaiNames = [
  "จักริน","รัตนา","ชยวัฒน์","พรทิพย์","อนันต์", "อรพิน", "สมชาย", "สมหญิง", "กิตติ", "พิมพ์","ธนิดา", "ประยูร", "สิริพร", "มานพ", "สายใจ",
]
// หมวดหมู่ของการแจ้งปัญหา
const reportCategories = ["ระบบล้ม/Error","ฟังก์ชั่นที่ใช้งานไม่ได้","ข้อเสนอเเนะ / เเนะนำฟีเจอร์ใหม่","อื่นๆ"]
// แผนกต่างๆ
const departments = ["ช่าง", "แอดมิน", "หัวหน้าช่าง", "ผู้บริหาร"]
// ประเภทของงาน
const reportTypes = ["ไฟฟ้า", "เครื่องกล", "โยธา"]

// สร้างข้อมูลการแจ้งปัญหาจำลองจำนวน 20 รายการ
const mockReports = Array.from({ length: 20 }).map((_, i) => {
  // วนลูปข้อมูลจาก array ด้านบนมาใช้งาน
  const technicianName = thaiNames[i % thaiNames.length]
  const category = reportCategories[i % reportCategories.length]
  const department = departments[i % departments.length]
  const type = reportTypes[i % reportTypes.length]

  // return โครงสร้างข้อมูลของ report แต่ละรายการ
  return {
    id: i + 1, // ID ที่ไม่ซ้ำกัน
    category, // หมวดหมู่
    title: `${category}ไม่ได้`, // หัวข้อ (สร้างจากหมวดหมู่)
    department, // แผนก
    type, // ประเภท
    technicianName, // ชื่อผู้แจ้ง
    details: { // ข้อมูลรายละเอียดเพิ่มเติม
      reporterName: technicianName,
      position: ["ช่าง", "แอดมิน", "ผู้บริหาร"][i % 3], // ตำแหน่ง
      reportDate: "15/01/2568", // วันที่แจ้ง
      description: "พบปัญหาการทำงานผิดปกติ ต้องการการตรวจสอบและซ่อมแซม", // รายละเอียดปัญหา
    },
  }
})

// --- Component หลัก ---
const Report = () => {
  // --- State Management (การจัดการสถานะของ Component) ---
  // State สำหรับเก็บข้อความในช่องค้นหา
  const [searchQuery, setSearchQuery] = useState("")
  // State สำหรับเก็บหมวดหมู่ที่ถูกเลือก (ค่าเริ่มต้นคือ "ทั้งหมด")
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด")
  // State สำหรับเก็บ ID ของแถวที่ถูกกดขยาย (ใช้ Set เพื่อประสิทธิภาพในการเพิ่ม/ลบ)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // --- Data Filtering (การกรองข้อมูล) ---
  // ใช้ useMemo เพื่อให้คำนวณข้อมูลที่ต้องกรองใหม่ต่อเมื่อ searchQuery หรือ selectedCategory เปลี่ยนแปลงเท่านั้น
  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      // ตรวจสอบว่าข้อความค้นหาตรงกับ title, ชื่อผู้แจ้ง, หรือแผนกหรือไม่ (แปลงเป็นตัวพิมพ์เล็กทั้งหมดก่อนเทียบ)
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.department.toLowerCase().includes(searchQuery.toLowerCase())

      // ตรวจสอบว่าหมวดหมู่ที่เลือกคือ "ทั้งหมด" หรือตรงกับหมวดหมู่ของ report หรือไม่
      const matchesCategory = selectedCategory === "ทั้งหมด" || report.category === selectedCategory

      // คืนค่า true หากตรงกับเงื่อนไขทั้งสองอย่าง
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory]) // Dependencies: ให้ re-run ฟังก์ชันนี้เมื่อค่าเหล่านี้เปลี่ยน

  // --- Event Handlers (ฟังก์ชันจัดการเหตุการณ์) ---
  // ฟังก์ชันสำหรับสลับการแสดง/ซ่อนรายละเอียดของแถว
  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows) // คัดลอก Set เดิม
    if (newExpanded.has(id)) {
      newExpanded.delete(id) // ถ้ามี ID นี้อยู่แล้ว (แถวกำลังเปิด) ให้ลบออก (ปิดแถว)
    } else {
      newExpanded.add(id) // ถ้ายังไม่มี (แถวกำลังปิด) ให้เพิ่มเข้าไป (เปิดแถว)
    }
    setExpandedRows(newExpanded) // อัปเดต state
  }

  // --- JSX (ส่วนที่แสดงผลบนหน้าจอ) ---
  return (
    <div className="w-full space-y-6 p-6">
      {/* ส่วนหัวข้อของหน้า */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">การแจ้งปัญหา</h1>
      </div>

      {/* กล่องสีขาวที่ครอบฟิลเตอร์และตาราง */}
      <div className="bg-card rounded-lg border-2 shadow-sm p-6 space-y-4">
        {/* ส่วนของฟิลเตอร์ (ค้นหาและหมวดหมู่) */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              {/* ช่อง Input สำหรับค้นหา */}
              <Input
                placeholder="ค้นหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // เมื่อพิมพ์ ให้อัปเดต state searchQuery
                className="pr-10 border-2"
              />
            </div>
            {/* ปุ่มสำหรับล้างข้อความในช่องค้นหา */}
            <Button variant="default" onClick={() => setSearchQuery("")}>
              ยกเลิก
            </Button>
          </div>
        </div>

        {/* ส่วนของ Dropdown สำหรับเลือกหมวดหมู่ */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">เลือกหมวดหมู่</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px] border-2">
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">ทั้งหมด</SelectItem>
              {/* วนลูปสร้างตัวเลือกจาก reportCategories */}
              {reportCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ส่วนของตาราง */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            {/* ส่วนหัวของตาราง (Header) */}
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>ชื่อผู้แจ้ง</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead>ตำแหน่ง</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead className="text-center">เพิ่มเติม</TableHead>
              </TableRow>
            </TableHeader>
            {/* ส่วนเนื้อหาของตาราง (Body) */}
            <TableBody>
              {/* วนลูปข้อมูลที่ผ่านการกรองแล้วมาแสดงผล */}
              {filteredReports.map((report) => (
                // ใช้ Fragment (<>) เพื่อครอบคลุมแถวหลักและแถวรายละเอียด
                <>
                  {/* แถวหลักของข้อมูล */}
                  <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{report.technicianName}</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>{report.details.position}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell className="text-center">
                      {/* ปุ่มสำหรับเปิด/ปิดรายละเอียด */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(report.id)} // เมื่อคลิกจะเรียกฟังก์ชัน toggleRow
                        className="flex-right gap-1 justify-end"
                      >
                        ดู
                        {/* แสดงไอคอนลูกศรขึ้น/ลง ตามสถานะของแถว */}
                        {expandedRows.has(report.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {/* แถวรายละเอียด (จะแสดงก็ต่อเมื่อ ID ของแถวอยู่ใน expandedRows) */}
                  {expandedRows.has(report.id) && (
                    <TableRow key={`${report.id}-details`}>
                      <TableCell colSpan={5} className="bg-muted/20 p-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg mb-4">รายละเอียดการแจ้งปัญหา</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">1. ชื่อผู้แจ้ง:</p>
                              <p className="text-base">{report.details.reporterName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">2. วันที่แจ้ง:</p>
                              <p className="text-base">{report.details.reportDate}</p>
                            </div>
                            <div className="space-y-1 ">
                              <p className="text-sm font-medium text-muted-foreground">3. รายละเอียดปัญหา:</p>
                              <p className="text-base">{report.details.description}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              
              {/* แสดงข้อความ "ไม่พบข้อมูล" เมื่อไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา */}
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

// ส่งออก Component เพื่อให้ไฟล์อื่นสามารถนำไปใช้งานได้w
export default Report