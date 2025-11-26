import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { showWarning, showSuccess, showError } from "@/lib/sweetalert"

// Interface สำหรับเก็บข้อมูลการแจ้งปัญหา
interface ReportData {
  problemType: string
  description: string
  attachmentUrl: string
  userName: string
  userType: string
  userId: number
  userEmail: string
  userDepartment: string
  submittedAt: string
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

// Component หลักสำหรับหน้าแจ้งปัญหาของ Leader
const LeaderReport: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // State สำหรับเก็บข้อมูลในฟอร์ม
  const [problemType, setProblemType] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [attachmentUrl, setAttachmentUrl] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ข้อมูลผู้ใช้สำหรับแสดงผลและส่งรายงาน
  const userName = user ? `${user.fname} ${user.lname}` : "ผู้ใช้งาน"
  const userType = user?.position || "หัวหน้างาน"

  // Handler สำหรับการเลือกไฟล์ (รูปภาพ)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const mockUrl = URL.createObjectURL(file)
      setAttachmentUrl(mockUrl)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!problemType || !description) {
      showWarning("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setIsSubmitting(true)

    const reportData: ReportData = {
      problemType,
      description,
      attachmentUrl,
      userName,
      userType,
      userId: user?.id || 0,
      userEmail: user?.email || "",
      userDepartment: user?.department || "",
      submittedAt: new Date().toISOString(),
    }

    // debug log removed

    const success = saveReportToStorage(reportData)

    setTimeout(() => {
      setIsSubmitting(false)
        if (success) {
        showSuccess("ส่งรายงานปัญหาเรียบร้อยแล้ว")
        setProblemType("")
        setDescription("")
        setAttachmentUrl("")
        navigate("/leader/leaderdashboard")
      } else {
        showError("เกิดข้อผิดพลาดในการส่งรายงาน", "กรุณาลองใหม่อีกครั้ง")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <h1 className="text-2xl font-bold text-foreground mb-6">การแจ้งปัญหา</h1>
      <div className="w-full">
        <Card className="border-border">
          <CardContent className="pt-8">
            {/* ส่วนแสดงข้อมูลผู้ใช้ */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-muted-foreground">ชื่อ: </span>
                  <span className="text-foreground font-medium">{userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ประเภทผู้ใช้: </span>
                  <span className="text-foreground font-medium">{userType}</span>
                </div>
              </div>
            </div>

            {/* ฟอร์มแจ้งปัญหา */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ช่องเลือกประเภทปัญหา */}
              <div className="space-y-2">
                <Label htmlFor="problemType" className="text-foreground">
                  ประเภทปัญหา / Error
                </Label>
                <Select value={problemType} onValueChange={setProblemType}>
                  <SelectTrigger id="problemType" className="w-full">
                    <SelectValue placeholder="ไม่ระบุ / Error" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system-error">ระบบล้ม/Error</SelectItem>
                    <SelectItem value="login-issue">ฟังก์ชั่นที่ใช้งานไม่ได้</SelectItem>
                    <SelectItem value="data-error">ข้อเสนอแนะ</SelectItem>
                    <SelectItem value="performance">แนะนำฟีเจอร์ใหม่</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ช่องแนบไฟล์ (รูปภาพ) */}
              <div className="space-y-2">
                <Label htmlFor="attachment" className="text-foreground">
                  แนบรูปภาพ
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/30">
                  {attachmentUrl ? (
                    <div className="space-y-2">
                      <img
                        src={attachmentUrl || "/placeholder.svg"}
                        alt="Attachment preview"
                        className="max-h-40 mx-auto rounded"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => setAttachmentUrl("")}>
                        ลบไฟล์
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
                      >
                        เลือกไฟล์
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">รองรับไฟล์รูปภาพ (PNG, JPG, GIF)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ช่องคำอธิบายเพิ่มเติม */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">
                  คำอธิบายเพิ่มเติม
                </Label>
                <Textarea
                  id="description"
                  placeholder="กรุณาอธิบายปัญหาที่พบโดยละเอียด..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[150px] resize-none"
                />
              </div>

              {/* ปุ่มส่งฟอร์ม */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="px-8">
                  {isSubmitting ? "กำลังส่ง..." : "ส่ง"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LeaderReport
