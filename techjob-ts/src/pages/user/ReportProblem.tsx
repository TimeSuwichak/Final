import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { Upload, AlertCircle, FileText, User, Settings, X, Image as ImageIcon, Eye, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useJobs } from "@/contexts/JobContext"
import { showWarning, showSuccess, showError } from "@/lib/sweetalert"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Interface สำหรับเก็บข้อมูลการแจ้งปัญหา
interface ReportData {
  id?: number
  title?: string
  problemType: string
  subCategory?: string
  description: string
  attachmentUrl: string
  userName: string
  userType: string
  userId: number
  userEmail: string
  userDepartment: string
  submittedAt: string
  reportDate?: string
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
    "suggestion": "ข้อเสนอแนะ",
    "feature-request": "แนะนำฟีเจอร์ใหม่",
    "other": "อื่นๆ",
  }
  return mapping[problemType] || problemType
}

const saveReportToStorage = (report: ReportData) => {
  try {
    const existingReports = localStorage.getItem("problemReports")
    const reports = existingReports ? JSON.parse(existingReports) : []

    // Add new report with unique ID
    const newReport = {
      ...report,
      id: Date.now(),
      reportDate: new Date().toLocaleString("th-TH"),
    }

    reports.push(newReport)
    localStorage.setItem("problemReports", JSON.stringify(reports))
    return true
  } catch (error) {
    console.error("[v0] Failed to save report:", error)
    return false
  }
}

// Component หลักสำหรับหน้าแจ้งปัญหาของ User
const LeaderReport: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { jobs } = useJobs()

  // State สำหรับเก็บข้อมูลในฟอร์ม
  const [title, setTitle] = useState<string>("")
  const [problemType, setProblemType] = useState<string>("")
  const [subCategory, setSubCategory] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [attachmentUrl, setAttachmentUrl] = useState<string>("")
  const [attachmentName, setAttachmentName] = useState<string>("")
  const [urgency, setUrgency] = useState<string>("medium")
  const [relatedJobId, setRelatedJobId] = useState<string>("")
  const [relatedPersonName, setRelatedPersonName] = useState<string>("")
  const [relatedPersonRole, setRelatedPersonRole] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myReports, setMyReports] = useState<ReportData[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // ข้อมูลผู้ใช้สำหรับแสดงผลและส่งรายงาน
  const userName = user ? `${user.fname} ${user.lname}` : "ผู้ใช้งาน"
  const userType = user?.position || "ช่างเทคนิค"

  // งานที่ผู้ใช้เกี่ยวข้อง (assigned หรือเห็น)
  const userJobs = jobs?.filter((job: any) => {
    if (!user) return false
    const userIdString = String(user.id)
    // ตรวจสอบว่า user ถูกมอบหมายในงานนี้
    const assignedTechs = job.assignedTechs || []
    return assignedTechs.some((techId: any) => String(techId) === userIdString)
  }) || []

  // โหลดรายการที่ส่งไปแล้ว
  useEffect(() => {
    if (user) {
      try {
        const storedReports = localStorage.getItem("problemReports")
        if (storedReports) {
          const allReports = JSON.parse(storedReports)
          const myReportsList = allReports.filter(
            (report: ReportData) => report.userId === user.id
          )
          // เรียงตามวันที่ (ใหม่สุดก่อน)
          myReportsList.sort((a: ReportData, b: ReportData) => {
            const dateA = new Date(a.submittedAt || a.reportDate || "").getTime()
            const dateB = new Date(b.submittedAt || b.reportDate || "").getTime()
            return dateB - dateA
          })
          setMyReports(myReportsList)
        }
      } catch (error) {
        console.error("Failed to load my reports:", error)
      }
    }
  }, [user])

  // Reload reports after submission
  const reloadMyReports = () => {
    if (user) {
      try {
        const storedReports = localStorage.getItem("problemReports")
        if (storedReports) {
          const allReports = JSON.parse(storedReports)
          const myReportsList = allReports.filter(
            (report: ReportData) => report.userId === user.id
          )
          myReportsList.sort((a: ReportData, b: ReportData) => {
            const dateA = new Date(a.submittedAt || a.reportDate || "").getTime()
            const dateB = new Date(b.submittedAt || b.reportDate || "").getTime()
            return dateB - dateA
          })
          setMyReports(myReportsList)
        }
      } catch (error) {
        console.error("Failed to reload reports:", error)
      }
    }
  }


  // Handler สำหรับการเลือกไฟล์ (รูปภาพ)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showWarning("ไฟล์มีขนาดใหญ่เกินไป", "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5 MB")
        return
      }
      const mockUrl = URL.createObjectURL(file)
      setAttachmentUrl(mockUrl)
      setAttachmentName(file.name)
    }
  }

  // Reset subCategory เมื่อเปลี่ยน problemType
  const handleProblemTypeChange = (value: string) => {
    setProblemType(value)
    setSubCategory("")
    setRelatedJobId("")
    setRelatedPersonName("")
    setRelatedPersonRole("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !problemType || !description.trim()) {
      showWarning("กรุณากรอกข้อมูลให้ครบถ้วน", "กรุณากรอกชื่อปัญหา, เลือกประเภทปัญหาและกรอกคำอธิบาย")
      return
    }

    // Validate for data-correction
    if (problemType === "data-correction") {
      if (!relatedJobId) {
        showWarning("กรุณาเลือกใบงาน", "กรุณาเลือกใบงานที่ต้องการแก้ไขข้อมูล")
        return
      }
      if (!subCategory) {
        showWarning("กรุณาเลือกหมวดหมู่ย่อย", "กรุณาเลือกหมวดหมู่ย่อยของปัญหาที่พบ")
        return
      }
    }

    // Validate for person-issue
    if (problemType === "person-issue" && !subCategory) {
      showWarning("กรุณาเลือกหมวดหมู่ย่อย", "กรุณาเลือกหมวดหมู่ย่อยของปัญหาที่พบ")
      return
    }

    setIsSubmitting(true)

    const relatedJob = relatedJobId ? userJobs.find((job: any) => job.id === relatedJobId) : null

    const reportData: ReportData = {
      title: title.trim(),
      problemType,
      subCategory: subCategory || undefined,
      description: description.trim(),
      attachmentUrl,
      userName,
      userType,
      userId: user?.id || 0,
      userEmail: user?.email || "",
      userDepartment: user?.department || "",
      submittedAt: new Date().toISOString(),
      urgency,
      relatedJobId: relatedJobId || undefined,
      relatedJobTitle: relatedJob?.title || undefined,
      relatedPersonName: relatedPersonName || undefined,
      relatedPersonRole: relatedPersonRole || undefined,
    }

    const success = saveReportToStorage(reportData)

    setTimeout(() => {
      setIsSubmitting(false)
      if (success) {
        showSuccess("ส่งรายงานปัญหาเรียบร้อยแล้ว", "ทีมงานจะตรวจสอบและดำเนินการแก้ไขโดยเร็วที่สุด")
        // Reset form
        setTitle("")
        setProblemType("")
        setSubCategory("")
        setDescription("")
        setAttachmentUrl("")
        setAttachmentName("")
        setUrgency("medium")
        setRelatedJobId("")
        setRelatedPersonName("")
        setRelatedPersonRole("")
        reloadMyReports() // Reload my reports
        // navigate("/user/userworks")
      } else {
        showError("เกิดข้อผิดพลาดในการส่งรายงาน", "กรุณาลองใหม่อีกครั้ง")
      }
    }, 1000)
  }


  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-8xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-primary" />
            แจ้งปัญหา   
          </h1>
          <p className="text-muted-foreground">
            กรุณากรอกข้อมูลให้ครบถ้วนเพื่อให้ทีมงานสามารถช่วยเหลือคุณได้อย่างรวดเร็ว
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>ข้อมูลผู้แจ้ง</CardTitle>
            <CardDescription>ข้อมูลของคุณจะถูกบันทึกอัตโนมัติ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <span className="text-sm text-muted-foreground">ชื่อ: </span>
                <span className="text-sm font-medium">{userName}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">ตำแหน่ง: </span>
                <span className="text-sm font-medium">{userType}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">แผนก: </span>
                <span className="text-sm font-medium">{user?.department || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>รายละเอียดปัญหา</CardTitle>
            <CardDescription>กรุณาเลือกประเภทและกรอกรายละเอียดให้ครบถ้วน</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ช่องกรอกชื่อปัญหา */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-semibold">
                  ชื่อปัญหา <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="ระบุชื่อปัญหาที่พบ เช่น 'ข้อมูลงานผิดพลาด' หรือ 'ระบบล็อกอินไม่ได้'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* ช่องเลือกประเภทปัญหา */}
              <div className="space-y-2">
                <Label htmlFor="problemType" className="text-foreground font-semibold">
                  ประเภทปัญหา <span className="text-red-500">*</span>
                </Label>
                <Select value={problemType} onValueChange={handleProblemTypeChange}>
                  <SelectTrigger id="problemType" className="w-full">
                    <SelectValue placeholder="เลือกประเภทปัญหา" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data-correction">แก้ไขข้อมูลใบงาน</SelectItem>
                    <SelectItem value="person-issue">ปัญหาบุคคล</SelectItem>
                    <SelectItem value="system-error">ระบบล้ม/Error</SelectItem>
                    <SelectItem value="suggestion">ข้อเสนอแนะ</SelectItem>
                    <SelectItem value="feature-request">แนะนำฟีเจอร์ใหม่</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* หมวดหมู่ย่อย */}
              {problemType === "data-correction" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="relatedJob" className="text-foreground font-semibold">
                      ใบงานที่ต้องการแก้ไข <span className="text-red-500">*</span>
                    </Label>
                    {userJobs.length > 0 ? (
                      <Select value={relatedJobId} onValueChange={setRelatedJobId}>
                        <SelectTrigger id="relatedJob" className="w-full">
                          <SelectValue placeholder="เลือกใบงาน" />
                        </SelectTrigger>
                        <SelectContent>
                          {userJobs.map((job: any) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title} ({job.status === "done" ? "เสร็จสิ้น" : job.status === "in-progress" ? "กำลังดำเนินการ" : job.status === "new" ? "ใหม่" : job.status})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-muted rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground">
                          คุณยังไม่มีงานที่ถูกมอบหมาย กรุณาติดต่อหัวหน้าหรือผู้ดูแลระบบ
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCategory" className="text-foreground font-semibold">
                      หมวดหมู่ย่อย <span className="text-red-500">*</span>
                    </Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger id="subCategory" className="w-full">
                        <SelectValue placeholder="เลือกหมวดหมู่ย่อย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="job-data">ข้อมูลงานผิดพลาด</SelectItem>
                        <SelectItem value="user-data">ข้อมูลผู้ใช้ผิดพลาด</SelectItem>
                        <SelectItem value="material-data">ข้อมูลวัสดุผิดพลาด</SelectItem>
                        <SelectItem value="location-data">ข้อมูลสถานที่ผิดพลาด</SelectItem>
                        <SelectItem value="other-data">ข้อมูลอื่นๆ ผิดพลาด</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {problemType === "person-issue" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subCategory" className="text-foreground font-semibold">
                      หมวดหมู่ย่อย <span className="text-red-500">*</span>
                    </Label>
                    <Select value={subCategory} onValueChange={setSubCategory}>
                      <SelectTrigger id="subCategory" className="w-full">
                        <SelectValue placeholder="เลือกหมวดหมู่ย่อย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="communication">ปัญหาการสื่อสาร</SelectItem>
                        <SelectItem value="cooperation">ปัญหาการทำงานร่วมกัน</SelectItem>
                        <SelectItem value="behavior">พฤติกรรมที่ไม่เหมาะสม</SelectItem>
                        <SelectItem value="conflict">ความขัดแย้ง</SelectItem>
                        <SelectItem value="other-person">ปัญหาอื่นๆ เกี่ยวกับบุคคล</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="relatedPersonName" className="text-foreground">
                        ชื่อบุคคลที่เกี่ยวข้อง (ถ้ามี)
                      </Label>
                      <Input
                        id="relatedPersonName"
                        placeholder="ระบุชื่อ (ไม่บังคับ)"
                        value={relatedPersonName}
                        onChange={(e) => setRelatedPersonName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relatedPersonRole" className="text-foreground">
                        ตำแหน่ง/บทบาท
                      </Label>
                      <Input
                        id="relatedPersonRole"
                        placeholder="เช่น หัวหน้า, ช่าง, Admin (ไม่บังคับ)"
                        value={relatedPersonRole}
                        onChange={(e) => setRelatedPersonRole(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ความเร่งด่วน */}
              <div className="space-y-3">
                <Label className="text-foreground font-semibold">ระดับความเร่งด่วน</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="urgency"
                      value="low"
                      checked={urgency === "low"}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="h-4 w-4 text-green-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-green-600">ไม่เร่งด่วน</span>
                      <p className="text-xs text-muted-foreground">ไม่เร่งด่วน สามารถแก้ไขได้ในภายหลัง</p>
                    </div>
                  </label>
                  <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="urgency"
                      value="medium"
                      checked={urgency === "medium"}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="h-4 w-4 text-orange-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-orange-600">เร่งด่วน</span>
                      <p className="text-xs text-muted-foreground">ควรแก้ไขในเร็วๆ นี้</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* ช่องคำอธิบายเพิ่มเติม */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-semibold">
                  คำอธิบายปัญหา <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="กรุณาอธิบายปัญหาที่พบโดยละเอียด เช่น สถานการณ์ที่เกิดขึ้น, ขั้นตอนที่ทำ, ผลลัพธ์ที่ได้, และสิ่งที่คาดหวัง..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 คำแนะนำ: ยิ่งอธิบายละเอียด ยิ่งช่วยให้ทีมงานแก้ไขปัญหาได้เร็วขึ้น
                </p>
              </div>

              {/* ช่องแนบไฟล์ (รูปภาพ) */}
              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-foreground">
                  แนบรูปภาพ / หลักฐาน (ไม่บังคับ)
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/30 hover:border-primary/50 transition-colors">
                  {attachmentUrl ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={attachmentUrl || "/placeholder.svg"}
                          alt="Attachment preview"
                          className="max-h-48 mx-auto rounded-lg border shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => {
                            setAttachmentUrl("")
                            setAttachmentName("")
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {attachmentName && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs mx-auto">
                          {attachmentName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        เลือกไฟล์รูปภาพ
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        รองรับไฟล์รูปภาพ (PNG, JPG, GIF) ขนาดไม่เกิน 5 MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ปุ่มส่งฟอร์ม */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/user/userworks")}
                  disabled={isSubmitting}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-8">
                  {isSubmitting ? "กำลังส่ง..." : "ส่งรายงานปัญหา"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* ส่วนแสดงรายการที่ส่งไปแล้ว */}
        <Card>
          <CardHeader>
            <CardTitle>รายการที่ส่งไปแล้ว</CardTitle>
            <CardDescription>รายการแจ้งปัญหาที่คุณส่งไปทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent>
            {myReports.length > 0 ? (
              <div className="space-y-3">
                {myReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-foreground">
                            {report.title || `ID: ${report.id}`}
                          </span>
                          {report.isResolved ? (
                            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                              <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                              แก้ไขแล้ว
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 rounded">
                              ยังไม่แก้ไข
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          ประเภท: {mapProblemTypeToLabel(report.problemType)}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          {new Date(report.submittedAt || report.reportDate || "").toLocaleString("th-TH", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report)
                            setIsDetailOpen(true)
                          }}
                          className="h-7 px-2 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          ดูรายละเอียด
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-lg border border-dashed border-border">
                ยังไม่มีรายการที่ส่งไป
              </div>
            )}
          </CardContent>
        </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedReport.title && (
                  <div className="space-y-1 md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">ชื่อปัญหา:</p>
                    <p className="text-base font-semibold">{selectedReport.title}</p>
                  </div>
                )}
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
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">วันที่แจ้ง:</p>
                  <p className="text-base">
                    {new Date(selectedReport.submittedAt || selectedReport.reportDate || "").toLocaleString("th-TH", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">สถานะ:</p>
                  <p className="text-base">
                    {selectedReport.isResolved ? (
                      <Badge className="bg-green-500 text-white">แก้ไขแล้ว</Badge>
                    ) : (
                      <Badge variant="outline">ยังไม่แก้ไข</Badge>
                    )}
                  </p>
                </div>
              </div>

              {selectedReport.relatedJobTitle && (
                <div className="space-y-1 p-4 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">ใบงานที่เกี่ยวข้อง:</p>
                  <p className="text-base font-semibold text-foreground">{selectedReport.relatedJobTitle}</p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LeaderReport
