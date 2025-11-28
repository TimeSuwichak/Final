import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { showConfirm, showError } from "@/lib/sweetalert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReportData {
  id: number
  title?: string
  problemType: string
  subCategory?: string
  description: string
  attachmentUrl?: string
  userName: string
  userType: string
  userId: number
  userEmail: string
  userDepartment: string
  submittedAt: string
  reportDate: string
  urgency?: string
  relatedJobId?: string
  relatedJobTitle?: string
  relatedPersonName?: string
  relatedPersonRole?: string
  isResolved?: boolean
}

const mapProblemTypeToLabel = (problemType: string): string => {
  const mapping: Record<string, string> = {
    "data-correction": "แก้ไขข้อมูลใบงาน",
    "person-issue": "ปัญหาบุคคล",
    "system-error": "ระบบล้ม/Error",
    "login-issue": "ฟังก์ชั่นที่ใช้งานไม่ได้",
    "suggestion": "ข้อเสนอแนะ",
    "feature-request": "แนะนำฟีเจอร์ใหม่",
    "other": "อื่นๆ",
  }
  return mapping[problemType] || problemType
}

const Report = () => {
  const navigate = useNavigate()
  const [reports, setReports] = useState<ReportData[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [problemTypeFilter, setProblemTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all")

  useEffect(() => {
    loadReportsFromStorage()
  }, [])

  const loadReportsFromStorage = () => {
    try {
      const storedReports = localStorage.getItem("problemReports")
      if (storedReports) {
        const parsedReports = JSON.parse(storedReports)
        setReports(parsedReports)
      }
    } catch (error) {
      console.error("[v0] Failed to load reports:", error)
    }
  }

  // คำนวณตัวเลขทั้งหมด (ไม่ผ่าน filter)
  const { allNormalReports, allUrgentReports } = useMemo(() => {
    const normal: ReportData[] = []
    const urgent: ReportData[] = []

    reports.forEach((report) => {
      if (report.urgency === "medium") {
        urgent.push(report)
      } else {
        normal.push(report)
      }
    })

    return {
      allNormalReports: normal,
      allUrgentReports: urgent,
    }
  }, [reports])

  // แยกรายงานตาม urgency และ filter
  const { normalReports, urgentReports, filteredReports } = useMemo(() => {
    const normal: ReportData[] = []
    const urgent: ReportData[] = []
    let allFiltered: ReportData[] = []

    reports.forEach((report) => {
      // Filter by problem type
      if (problemTypeFilter !== "all" && report.problemType !== problemTypeFilter) {
        return
      }

      // Filter by status
      if (statusFilter === "resolved" && !report.isResolved) {
        return
      }
      if (statusFilter === "unresolved" && report.isResolved) {
        return
      }

      // Filter by urgency
      if (urgencyFilter === "urgent" && report.urgency !== "medium") {
        return
      }
      if (urgencyFilter === "normal" && report.urgency === "medium") {
        return
      }

      allFiltered.push(report)

      if (report.urgency === "medium") {
        urgent.push(report)
      } else {
        normal.push(report)
      }
    })

    // เรียงตามวันที่ (ใหม่สุดก่อน)
    const sortByDate = (a: ReportData, b: ReportData) => {
      const dateA = new Date(a.submittedAt || a.reportDate).getTime()
      const dateB = new Date(b.submittedAt || b.reportDate).getTime()
      return dateB - dateA
    }

    return {
      normalReports: normal.sort(sortByDate),
      urgentReports: urgent.sort(sortByDate),
      filteredReports: allFiltered.sort(sortByDate),
    }
  }, [reports, problemTypeFilter, statusFilter, urgencyFilter])

  const handleViewDetail = (report: ReportData) => {
    setSelectedReport(report)
    setIsDetailOpen(true)
  }

  const handleDeleteReport = async (reportId: number) => {
    // ปิด Dialog ก่อนแสดง SweetAlert2
    setIsDetailOpen(false)
    
    // รอให้ Dialog ปิดก่อน
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const result = await showConfirm("ยืนยันการลบ", "คุณต้องการลบรายงานนี้หรือไม่?")
    if (!result.isConfirmed) {
      // ถ้ายกเลิก ให้เปิด Dialog กลับมา
      const report = reports.find((r) => r.id === reportId)
      if (report) {
        setSelectedReport(report)
        setIsDetailOpen(true)
      }
      return
    }

    try {
      const updatedReports = reports.filter((report) => report.id !== reportId)
      setReports(updatedReports)

      const storedReports = localStorage.getItem("problemReports")
      if (storedReports) {
        const allReports = JSON.parse(storedReports)
        const filteredReports = allReports.filter((report: any) => report.id !== reportId)
        localStorage.setItem("problemReports", JSON.stringify(filteredReports))
      }

      setSelectedReport(null)
      loadReportsFromStorage()
    } catch (error) {
      console.error("[v0] Failed to delete report:", error)
      showError("เกิดข้อผิดพลาดในการลบรายงาน")
    }
  }

  const handleGoToJob = (jobId: string) => {
    navigate(`/admin/job/${jobId}`)
    setIsDetailOpen(false)
  }

  const handleMarkAsResolved = (reportId: number) => {
    try {
      const updatedReports = reports.map((report) =>
        report.id === reportId ? { ...report, isResolved: true } : report
      )
      setReports(updatedReports)

      const storedReports = localStorage.getItem("problemReports")
      if (storedReports) {
        const allReports = JSON.parse(storedReports)
        const updatedAllReports = allReports.map((report: any) =>
          report.id === reportId ? { ...report, isResolved: true } : report
        )
        localStorage.setItem("problemReports", JSON.stringify(updatedAllReports))
      }

      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, isResolved: true })
      }

      loadReportsFromStorage()
    } catch (error) {
      console.error("[v0] Failed to mark as resolved:", error)
      showError("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    }
  }

  const getStatusColor = (report: ReportData) => {
    if (report.urgency === "medium") {
      return "bg-orange-500" // เร่งด่วน
    } else {
      return "bg-green-500" // ไม่เร่งด่วน
    }
  }

  const handleStatusColorClick = (report: ReportData, e: React.MouseEvent) => {
    e.stopPropagation()
    if (report.urgency === "medium") {
      // คลิกที่สีส้ม -> กรองเฉพาะเร่งด่วน
      setStatusFilter("all")
      setUrgencyFilter("urgent")
    } else {
      // คลิกที่สีเขียว -> กรองเฉพาะไม่เร่งด่วน
      setStatusFilter("all")
      setUrgencyFilter("normal")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // ถ้าไม่ใช่ ISO format ให้ใช้ dateString โดยตรง
        return dateString
      }
      return date.toLocaleString("th-TH", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="w-full space-y-6 p-6 min-h-screen">


      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">ประเภทปัญหา:</label>
          <Select value={problemTypeFilter} onValueChange={setProblemTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="data-correction">แก้ไขข้อมูลใบงาน</SelectItem>
              <SelectItem value="person-issue">ปัญหาบุคคล</SelectItem>
              <SelectItem value="system-error">ระบบล้ม/Error</SelectItem>
              <SelectItem value="suggestion">ข้อเสนอแนะ</SelectItem>
              <SelectItem value="feature-request">แนะนำฟีเจอร์ใหม่</SelectItem>
              <SelectItem value="other">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">สถานะ:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
              <SelectItem value="unresolved">ยังไม่แก้ไข</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Status */}
      <div className="flex items-center gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setUrgencyFilter("all")
            setStatusFilter("all")
          }}
        >
          <div className="w-4 h-4 rounded-full bg-gray-400"></div>
          <span className="text-sm text-muted-foreground">ทั้งหมด: {reports.length}</span>
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setUrgencyFilter("normal")
            setStatusFilter("all")
          }}
        >
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm text-muted-foreground">ไม่เร่งด่วน: {allNormalReports.length}</span>
        </div>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            setUrgencyFilter("urgent")
            setStatusFilter("all")
          }}
        >
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-sm text-muted-foreground">เร่งด่วน: {allUrgentReports.length}</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ปัญหา</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>ส่งโดย</TableHead>
                  <TableHead>วันที่ส่ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getStatusColor(report)} cursor-pointer hover:scale-125 transition-transform`}
                            onClick={(e) => handleStatusColorClick(report, e)}
                            title="คลิกเพื่อกรองตามสถานะนี้"
                          ></div>
                          <span>{report.title || "ไม่มีชื่อปัญหา"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {mapProblemTypeToLabel(report.problemType)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{report.userName}</p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(report.submittedAt || report.reportDate)}
                      </TableCell>
                      <TableCell>
                        {report.isResolved ? (
                          <Badge className="bg-green-500 text-white">แก้ไขแล้ว</Badge>
                        ) : (
                          <Badge variant="outline">ยังไม่แก้ไข</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(report)}
                            className="h-8 px-2"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            ดู
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog สำหรับดูรายละเอียด */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดการแจ้งปัญหา</DialogTitle>
            <DialogDescription>
              {selectedReport?.title || "ไม่มีชื่อปัญหา"}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              {selectedReport.title && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ชื่อปัญหา:</p>
                  <p className="text-base font-semibold">{selectedReport.title}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ชื่อผู้แจ้ง:</p>
                  <p className="text-base">{selectedReport.userName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ตำแหน่ง:</p>
                  <p className="text-base">{selectedReport.userType}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">แผนก:</p>
                  <p className="text-base">{selectedReport.userDepartment}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">วันที่แจ้ง:</p>
                  <p className="text-base">{formatDate(selectedReport.submittedAt || selectedReport.reportDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">ประเภทปัญหา:</p>
                  <p className="text-base">{mapProblemTypeToLabel(selectedReport.problemType)}</p>
                </div>
                {selectedReport.subCategory && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">หมวดหมู่ย่อย:</p>
                    <p className="text-base">{selectedReport.subCategory}</p>
                  </div>
                )}
                {selectedReport.urgency && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">ระดับความเร่งด่วน:</p>
                    <p className="text-base">
                      {selectedReport.urgency === "medium" ? "เร่งด่วน" : "ไม่เร่งด่วน"}
                    </p>
                  </div>
                )}
              </div>

              {selectedReport.relatedJobId && selectedReport.relatedJobTitle && (
                <div className="space-y-2 p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">ใบงานที่เกี่ยวข้อง:</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold text-foreground">{selectedReport.relatedJobTitle}</p>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleGoToJob(selectedReport.relatedJobId!)}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      ไปที่ใบงาน
                    </Button>
                  </div>
                </div>
              )}

              {selectedReport.relatedPersonName && (
                <div className="space-y-1 p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">บุคคลที่เกี่ยวข้อง:</p>
                  <p className="text-base text-foreground">
                    {selectedReport.relatedPersonName}
                    {selectedReport.relatedPersonRole && ` (${selectedReport.relatedPersonRole})`}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">รายละเอียดปัญหา:</p>
                <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.attachmentUrl && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">รูปภาพแนบ:</p>
                  <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={selectedReport.attachmentUrl}
                      alt="Attachment"
                      className="w-full h-auto max-h-96 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        const newWindow = window.open()
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>รูปภาพแนบ</title>
                                <style>
                                  body {
                                    margin: 0;
                                    padding: 20px;
                                    background: #000;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    min-height: 100vh;
                                  }
                                  img {
                                    max-width: 100%;
                                    max-height: 100vh;
                                    object-fit: contain;
                                  }
                                </style>
                              </head>
                              <body>
                                <img src="${selectedReport.attachmentUrl}" alt="Attachment" />
                              </body>
                            </html>
                          `)
                        }
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="p-8 text-center text-muted-foreground">
                              <p class="text-sm">ไม่สามารถแสดงรูปภาพได้</p>
                              <p class="text-xs mt-2">อาจเป็นเพราะไฟล์เสียหายหรือรูปแบบไม่รองรับ</p>
                            </div>
                          `
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  {selectedReport.isResolved ? (
                    <Badge className="bg-green-500 text-white">แก้ไขแล้ว</Badge>
                  ) : (
                    <Badge variant="outline">ยังไม่แก้ไข</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {!selectedReport.isResolved && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleMarkAsResolved(selectedReport.id)}
                      className="gap-2 bg-green-500 hover:bg-green-600"
                    >
                      แก้ไขแล้ว
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteReport(selectedReport.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    ลบรายงาน
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Report
