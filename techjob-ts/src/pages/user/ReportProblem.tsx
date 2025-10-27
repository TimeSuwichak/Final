import type React from "react"
import { useState } from "react" // Hook สำหรับจัดการสถานะ (state) ใน component
import { Button } from "@/components/ui/button" // Component ปุ่มจากไลบรารี shadcn/ui
import { Card, CardContent } from "@/components/ui/card" // Component Card สำหรับจัดกรอบเนื้อหา
import { Label } from "@/components/ui/label" // Component Label สำหรับข้อความกำกับฟอร์ม
import { Textarea } from "@/components/ui/textarea" // Component Textarea สำหรับกรอกคำอธิบายยาวๆ
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Components สำหรับ dropdown เลือกประเภทปัญหา
import { useNavigate } from "react-router-dom" // Hook สำหรับเปลี่ยนเส้นทาง (navigation)
import { Upload } from "lucide-react" // Icon รูปอัปโหลดไฟล์
import { useAuth } from "@/contexts/AuthContext" // Custom Hook สำหรับเข้าถึงข้อมูลผู้ใช้ (Auth Context)

// Interface (โครงสร้างข้อมูล) สำหรับเก็บข้อมูลการแจ้งปัญหา
interface ReportData {
  problemType: string // ประเภทของปัญหาที่เลือก
  description: string // คำอธิบายปัญหา
  attachmentUrl: string // URL ของไฟล์แนบ (รูปภาพ)
  userName: string // ชื่อผู้ใช้งาน
  userType: string // ประเภทผู้ใช้งาน (ตำแหน่ง)
  userId: number // ID ผู้ใช้งาน
  userEmail: string // Email ผู้ใช้งาน
  userDepartment: string // แผนกของผู้ใช้งาน
  submittedAt: string // เวลาที่ส่งรายงาน
}

// Component หลักสำหรับหน้าแจ้งปัญหา
const ReportProblem: React.FC = () => {
  const navigate = useNavigate() // ฟังก์ชันสำหรับนำทางไปยังหน้าอื่น
  const { user } = useAuth() // ดึงข้อมูลผู้ใช้ปัจจุบันจาก Auth Context

  // --- State สำหรับเก็บข้อมูลในฟอร์ม ---
  const [problemType, setProblemType] = useState<string>("") // สถานะประเภทปัญหา
  const [description, setDescription] = useState<string>("") // สถานะคำอธิบายปัญหา
  const [attachmentUrl, setAttachmentUrl] = useState<string>("") // สถานะ URL ของไฟล์แนบ
  const [isSubmitting, setIsSubmitting] = useState(false) // สถานะว่ากำลังส่งข้อมูลหรือไม่

  // --- ข้อมูลผู้ใช้สำหรับแสดงผลและส่งรายงาน ---
  const userName = user ? `${user.fname} ${user.lname}` : "ผู้ใช้งาน" // ชื่อ-นามสกุลผู้ใช้
  const userType = user?.position || "ช่างเทคนิค" // ตำแหน่งผู้ใช้ (ค่าเริ่มต้น "ช่างเทคนิค" ถ้าไม่มี)

  // --- Handler สำหรับการเลือกไฟล์ (รูปภาพ) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // ดึงไฟล์แรกที่ถูกเลือก
    if (file) {
      // สร้าง URL ชั่วคราวสำหรับแสดงตัวอย่างรูปภาพ
      const mockUrl = URL.createObjectURL(file) 
      setAttachmentUrl(mockUrl) // อัปเดต state ด้วย URL ชั่วคราว
    }
  }

  // --- Handler สำหรับการส่งฟอร์ม ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // หยุดการโหลดหน้าใหม่เมื่อกด submit

    // ตรวจสอบการกรอกข้อมูลที่จำเป็น
    if (!problemType || !description) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    setIsSubmitting(true) // ตั้งค่าสถานะเป็นกำลังส่ง

    // สร้าง Object ข้อมูลรายงานที่จะส่ง
    const reportData: ReportData = {
      problemType,
      description,
      attachmentUrl,
      userName,
      userType,
      userId: user?.id || 0,
      userEmail: user?.email || "",
      userDepartment: user?.department || "",
      submittedAt: new Date().toISOString(), // เวลาที่ส่งในรูปแบบ ISO String
    }

    console.log("[v0] Submitting report:", reportData) // แสดงข้อมูลใน console (จำลองการส่งจริง)

    // --- จำลองการส่งข้อมูลไปยัง Server ---
    setTimeout(() => {
      setIsSubmitting(false) // เสร็จสิ้นการส่ง
      alert("ส่งรายงานปัญหาเรียบร้อยแล้ว") // แจ้งเตือนผู้ใช้
      navigate("/user/UserDashboard") // นำทางกลับไปยัง User Dashboard
    }, 1000) // หน่วงเวลา 1 วินาที เพื่อให้เห็นสถานะ "กำลังส่ง..."
  }

  // --- ส่วนการแสดงผล (Render) ของ Component ---
  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
       <h1 className="text-2xl font-bold text-foreground mb-6">การแจ้งปัญหา</h1>
      <div className="w-full">
        <Card className="border-border">
          <CardContent className="pt-8">
            {/* --- ส่วนแสดงข้อมูลผู้ใช้ --- */}
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

            {/* --- ฟอร์มแจ้งปัญหา --- */}
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
                    {/* ตัวเลือกปัญหาต่างๆ */}
                    <SelectItem value="system-error">ระบบล้ม/Error</SelectItem>
                    <SelectItem value="login-issue">ฟังก์ชั่นที่ใช้งานไม่ได้</SelectItem>
                    <SelectItem value="data-error">ข้อเสนอเเนะ</SelectItem>
                    <SelectItem value="performance">เเนะนำฟีเจอร์ใหม่</SelectItem>
                    
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
                    // แสดงตัวอย่างรูปภาพที่ถูกแนบแล้ว
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
                    // แสดงปุ่มสำหรับเลือกไฟล์
                    <div>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <Label
                        htmlFor="file-upload" // เชื่อมโยงกับ input type="file" ด้านล่าง
                        className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
                      >
                        เลือกไฟล์
                      </Label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden" // ซ่อน input จริง แต่ใช้ Label แทน
                        accept="image/*" // กำหนดให้รับเฉพาะไฟล์รูปภาพ
                        onChange={handleFileChange} // เรียก handler เมื่อมีการเลือกไฟล์
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
                  value={description} // ผูกค่ากับ state
                  onChange={(e) => setDescription(e.target.value)} // อัปเดต state เมื่อมีการเปลี่ยนแปลง
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

export default ReportProblem