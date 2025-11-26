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
  const [dragOverColumn, setDragOverColumn] = useState<"normal" | "urgent" | null>(null)

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

  // แยกรายงานตาม urgency
  const { normalReports, urgentReports } = useMemo(() => {
    const normal: ReportData[] = []
    const urgent: ReportData[] = []

    reports.forEach((report) => {
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
    }
  }, [reports])

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

  const handleDragStart = (e: React.DragEvent, reportId: number) => {
    e.dataTransfer.setData("reportId", reportId.toString())
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, column: "normal" | "urgent") => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(column)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetUrgency: "normal" | "urgent") => {
    e.preventDefault()
    setDragOverColumn(null)
    const reportId = parseInt(e.dataTransfer.getData("reportId"))
    if (isNaN(reportId)) return

    const newUrgency = targetUrgency === "urgent" ? "medium" : undefined

    try {
      const updatedReports = reports.map((report) =>
        report.id === reportId ? { ...report, urgency: newUrgency } : report
      )
      setReports(updatedReports)

      const storedReports = localStorage.getItem("problemReports")
      if (storedReports) {
        const allReports = JSON.parse(storedReports)
        const updatedAllReports = allReports.map((report: any) =>
          report.id === reportId ? { ...report, urgency: newUrgency } : report
        )
        localStorage.setItem("problemReports", JSON.stringify(updatedAllReports))
      }

      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, urgency: newUrgency })
      }

      loadReportsFromStorage()
    } catch (error) {
      console.error("[v0] Failed to update urgency:", error)
      showError("เกิดข้อผิดพลาดในการอัปเดตสถานะ")
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

  const ReportCard = ({ report }: { report: ReportData }) => (
    <div
      draggable
      onDragStart={(e) => {
        handleDragStart(e, report.id)
        e.currentTarget.style.opacity = "0.5"
      }}
      onDragEnd={(e) => {
        e.currentTarget.style.opacity = "1"
      }}
      className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow cursor-move"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">
              {report.title || `ID: ${report.id}`}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">ส่งโดย: {report.userId}</p>
          <p className="text-xs text-muted-foreground mb-3">{formatDate(report.submittedAt || report.reportDate)}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewDetail(report)}
              className="h-7 px-2 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              ดูรายละเอียด
            </Button>
          </div>
        </div>
        <div className="flex-shrink-0">
          {report.isResolved ? (
            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">แก้ไขแล้ว</Badge>
          ) : report.urgency === "medium" ? (
            <Badge variant="destructive" className="text-xs px-2 py-0.5 rounded">ยังไม่แก้ไข</Badge>
            ) : (
            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded font-medium">
              {mapProblemTypeToLabel(report.problemType)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-6 p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">การแจ้งปัญหา</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* คอลัมน์ซ้าย: แจ้งปัญหา */}
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                </div>
                <div>
                  <p className="text-primary font-medium">ไม้เร่งด่วน</p>
                  <p className="text-2xl font-bold text-foreground">{normalReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card
            className={`overflow-hidden border-0 shadow-md transition-colors ${
              dragOverColumn === "normal" ? "bg-green-50 dark:bg-green-950/20" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, "normal")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "normal")}
          >
            <div className="h-1.5 bg-green-500"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">ไม่เร่งด่วน</CardTitle>
                <span className="text-sm text-muted-foreground">{normalReports.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {normalReports.length > 0 ? (
                normalReports.map((report) => <ReportCard key={report.id} report={report} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-lg border border-dashed border-border">
                  ไม่มีรายการ
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* คอลัมน์ขวา: เหตุด่วน */}
        <div className="space-y-4">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                </div>
                <div>
                  <p className="text-primary font-medium">เร่งด่วน</p>
                  <p className="text-2xl font-bold text-foreground">{urgentReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card
            className={`overflow-hidden border-0 shadow-md transition-colors ${
              dragOverColumn === "urgent" ? "bg-orange-50 dark:bg-orange-950/20" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, "urgent")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "urgent")}
          >
            <div className="h-1.5 bg-orange-500"></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">เร่งด่วน</CardTitle>
                <span className="text-sm text-muted-foreground">{urgentReports.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentReports.length > 0 ? (
                urgentReports.map((report) => <ReportCard key={report.id} report={report} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-lg border border-dashed border-border">
                  ไม่มีรายการ
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog สำหรับดูรายละเอียด */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดการแจ้งปัญหา</DialogTitle>
            <DialogDescription>
              {selectedReport?.title || `ID: ${selectedReport?.id}`}
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
                  <img
                    src={selectedReport.attachmentUrl}
                    alt="Attachment"
                    className="max-h-60 rounded border border-border w-full object-contain"
                  />
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
