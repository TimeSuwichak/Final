import { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { user } from "@/data/user"
import { showWarning, showConfirm, showError } from "@/lib/sweetalert"

const reportCategories = ["ระบบล้ม/Error", "ฟังก์ชั่นที่ใช้งานไม่ได้", "ข้อเสนอเเนะ / เเนะนำฟีเจอร์ใหม่", "อื่นๆ"]

const mapProblemTypeToCategory = (problemType: string): string => {
  const mapping: Record<string, string> = {
    "system-error": "ระบบล้ม/Error",
    "login-issue": "ฟังก์ชั่นที่ใช้งานไม่ได้",
    "data-error": "ข้อเสนอเเนะ / เเนะนำฟีเจอร์ใหม่",
    performance: "ข้อเสนอเเนะ / เเนะนำฟีเจอร์ใหม่",
    other: "อื่นๆ",
  }
  return mapping[problemType] || problemType
}

interface ReportEntry {
  id: number
  name: string
  category: string
  position: string
  department: string
  description: string
  reportDate: string
  attachmentUrl?: string
}

const Report = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedReportCategory, setSelectedReportCategory] = useState<string>("")
  const [reportDescription, setReportDescription] = useState<string>("")
  const [reports, setReports] = useState<ReportEntry[]>([])

  useEffect(() => {
    loadReportsFromStorage()
  }, [])

  const loadReportsFromStorage = () => {
    try {
      const storedReports = localStorage.getItem("problemReports")
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports)
        // Transform the data to match ReportEntry interface
        const transformedReports = parsedReports.map((report: any) => ({
          id: report.id,
          name: report.userName,
          category: mapProblemTypeToCategory(report.problemType),
          position: report.userType,
          department: report.userDepartment,
          description: report.description,
          reportDate: report.reportDate,
          attachmentUrl: report.attachmentUrl,
        }))
        setReports(transformedReports)
      }
    } catch (error) {
      console.error("[v0] Failed to load reports:", error)
    }
  }

  const handleAddReport = () => {
    if (!selectedUserId || !selectedReportCategory || !reportDescription.trim()) {
      showWarning("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    const selectedUser = user.find((u) => u.id.toString() === selectedUserId)
    if (!selectedUser) return

    const newReport: ReportEntry = {
      id: Date.now(),
      name: `${selectedUser.fname} ${selectedUser.lname}`,
      category: selectedReportCategory,
      position: selectedUser.position,
      department: selectedUser.department,
      description: reportDescription,
      reportDate: new Date().toLocaleString("th-TH"),
    }

    const updatedReports = [...reports, newReport]
    setReports(updatedReports)

    // Also save to localStorage in the same format as user/leader submissions
    try {
      const storedReports = localStorage.getItem("problemReports")
      const allReports = storedReports ? JSON.parse(storedReports) : []
      allReports.push({
        id: newReport.id,
        userName: newReport.name,
        problemType: selectedReportCategory,
        userType: newReport.position,
        userDepartment: newReport.department,
        description: newReport.description,
        reportDate: newReport.reportDate,
        attachmentUrl: "",
        submittedAt: new Date().toISOString(),
      })
      localStorage.setItem("problemReports", JSON.stringify(allReports))
    } catch (error) {
      console.error("[v0] Failed to save to localStorage:", error)
    }

    setSelectedUserId("")
    setSelectedReportCategory("")
    setReportDescription("")
  }

  const handleDeleteReport = async (reportId: number) => {
    const result = await showConfirm("ยืนยันการลบ", "คุณต้องการลบรายงานนี้หรือไม่?");
    if (!result.isConfirmed) {
      return
    }

    try {
      // Remove from state
      const updatedReports = reports.filter((report) => report.id !== reportId)
      setReports(updatedReports)

      // Remove from localStorage
      const storedReports = localStorage.getItem("problemReports")
      if (storedReports) {
        const allReports = JSON.parse(storedReports)
        const filteredReports = allReports.filter((report: any) => report.id !== reportId)
        localStorage.setItem("problemReports", JSON.stringify(filteredReports))
      }

      // Close expanded row if it was open
      if (expandedRows.has(reportId)) {
        const newExpanded = new Set(expandedRows)
        newExpanded.delete(reportId)
        setExpandedRows(newExpanded)
      }
    } catch (error) {
      console.error("[v0] Failed to delete report:", error)
      showError("เกิดข้อผิดพลาดในการลบรายงาน")
    }
  }

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

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) newExpanded.delete(id)
    else newExpanded.add(id)
    setExpandedRows(newExpanded)
  }

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">การแจ้งปัญหา</h1>
      </div>

      <div className="bg-card rounded-lg border-2 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">การจำลอง</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <label className="text-sm font-medium">การอ้างอง</label>
          <Textarea
            placeholder="เพิ่มเติม..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
            className="border-2 min-h-[100px]"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleAddReport}>เพิ่ม</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border-2 shadow-sm p-6 space-y-4">
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
                  <TableRow key={report.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.category}</TableCell>
                    <TableCell>{report.position}</TableCell>
                    <TableCell>{report.department}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(report.id)}
                        className="flex-right gap-1 justify-end"
                      >
                        ดู{" "}
                        {expandedRows.has(report.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>

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
                            {report.attachmentUrl && (
                              <div className="space-y-1 md:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">6. รูปภาพแนบ:</p>
                                <img
                                  src={report.attachmentUrl || "/placeholder.svg"}
                                  alt="Attachment"
                                  className="max-h-60 rounded border border-border"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReport(report.id)}
                              className="gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              ลบรายงาน
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}

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

export default Report
