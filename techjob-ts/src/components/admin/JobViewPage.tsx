"use client"

import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useJobs } from "@/contexts/JobContext"
import { useAuth } from "@/contexts/AuthContext"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminMap } from "@/components/admin/AdminMap"
import { TaskDetailsLocked } from "@/components/leader/TaskDetailsLocked"
import { Briefcase, Users, UserCheck, Download, ImageIcon, ArrowLeft } from "lucide-react"
import { generateCompletionReportPdf } from "@/utils/jobReport"
import { PdfViewer } from "@/components/common/PdfViewer"
import { leader as ALL_LEADERS } from "@/Data/leader"
import { user as ALL_USERS } from "@/Data/user"

export default function JobViewPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()
  const { jobs } = useJobs()
  const { user } = useAuth()

  const job = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId])

  if (!job || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">ไม่พบข้อมูลงาน</p>
      </div>
    )
  }

  const mapPosition: [number, number] | undefined =
    job.latitude && job.longitude ? [job.latitude, job.longitude] : undefined

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/workoders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{job.title}</h2>
            <p className="text-sm text-muted-foreground">รหัสงาน: {job.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.status === "done" ? (
            <Button onClick={() => generateCompletionReportPdf(job)} variant="default">
              <Download className="h-4 w-4 mr-2" />
              โหลด PDF รายงาน
            </Button>
          ) : (
            <Button onClick={() => navigate(`/admin/job/${jobId}/edit`)}>แก้ไขงาน</Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Job Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <CardTitle className="text-lg">ข้อมูลงาน</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">หัวข้องาน</p>
                    <p className="font-medium">{job.title}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ประเภทงาน</p>
                    <p className="font-medium">{job.jobType}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">วันที่เริ่มต้น-สิ้นสุด</p>
                    <p className="font-medium">
                      {format(job.startDate, "dd/MM/yyyy")} - {format(job.endDate, "dd/MM/yyyy")}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">หัวหน้างาน</p>
                    {job.leadId ? (
                      (() => {
                        const assignedLeader = ALL_LEADERS.find((l) => String(l.id) === String(job.leadId))
                        return assignedLeader ? (
                          <p className="font-medium flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5 text-primary" />
                            {assignedLeader.fname} {assignedLeader.lname}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">ไม่พบข้อมูล</p>
                        )
                      })()
                    ) : (
                      <p className="text-xs text-muted-foreground">ยังไม่ได้มอบหมาย</p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ทีมช่าง</p>
                    {job.assignedTechs && job.assignedTechs.length > 0 ? (
                      <div className="space-y-1.5">
                        {job.assignedTechs.map((techId) => {
                          const tech = ALL_USERS.find((u) => String(u.id) === String(techId))
                          return tech ? (
                            <p key={techId} className="font-medium flex items-center gap-1.5 text-xs">
                              <Users className="h-3 w-3 text-primary" />
                              {tech.fname} {tech.lname}
                            </p>
                          ) : null
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">ยังไม่มีช่างที่มอบหมาย</p>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ผู้สร้าง</p>
                    <p className="font-medium">{job.adminCreator}</p>
                    <p className="text-xs text-muted-foreground">
                      เมื่อ {format(job.createdAt, "dd/MM/yyyy HH:mm", { locale: th })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <CardTitle className="text-lg">ข้อมูลลูกค้า</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ชื่อลูกค้า</p>
                    <p className="font-medium">{job.customerName}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">เบอร์โทรศัพท์</p>
                    <p className="font-medium">{job.customerPhone || "-"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">ช่องทางติดต่ออื่น</p>
                    <p className="font-medium">{job.customerContactOther || "ไม่มีข้อมูล"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Location Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <CardTitle className="text-lg">สถานที่ปฏิบัติงาน</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{job.location || "ไม่ระบุ"}</p>
                  
                </div>
                {mapPosition && (  
                  <div className="rounded-lg overflow-hidden border">
                    <AdminMap  initialPosition={mapPosition} readOnly={true} />
                  </div>
                )}
                {!job.location && !mapPosition && <p className="text-sm text-muted-foreground">ไม่มีข้อมูลสถานที่</p>}
              </CardContent>
            </Card>
          </div>

          {/* Job Description Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <CardTitle className="text-lg">รายละเอียดงาน</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">
                <p>{job.description || "ไม่มีรายละเอียด"}</p>
              </div>

              {job.imageUrl && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    รูปภาพหน้างาน
                  </p>
                  <div className="rounded-md overflow-hidden border border-border">
                    <img
                      src={job.imageUrl || "/placeholder.svg"}
                      alt="รูปภาพหน้างาน"
                      className="w-full h-auto max-h-50 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(job.imageUrl, "_blank")}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PDF Viewer Card */}
          {job.pdfFiles && job.pdfFiles.length > 0 && <PdfViewer pdfFiles={job.pdfFiles} />}

          {/* Leader Status & Progress Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <CardTitle className="text-lg">สถานะและความคืบหน้า</CardTitle>
                </div>
                <Badge
                  variant={job.status === "new" ? "default" : job.status === "in-progress" ? "secondary" : "outline"}
                >
                  {job.status === "new" ? "รอยืนยัน" : job.status === "in-progress" ? "กำลังดำเนินการ" : "เสร็จสิ้น"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {job.status === "new" ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <p>
                    <strong>สถานะ:</strong> ยังอยู่ในระหว่างรอการยืนยันจากหัวหน้างาน
                  </p>
                </div>
              ) : job.status === "done" ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">สรุปผลการทำงาน</h4>
                    <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                      <p>{job.completionSummary || "ไม่มีข้อมูลสรุปผล"}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-primary mb-2">ปัญหาที่พบ</h4>
                    <div className="rounded-lg bg-muted p-3 text-sm leading-relaxed">
                      <p>{job.completionIssues || "ไม่มีปัญหาที่พบ"}</p>
                    </div>
                  </div>
                  {job.completionIssueImage && (
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-2">หลักฐานรูปภาพ</h4>
                      <div className="rounded-lg overflow-hidden border">
                        <img
                          src={job.completionIssueImage || "/placeholder.svg"}
                          alt="Completion issue"
                          className="w-full h-auto max-h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Tabs defaultValue="leader" className="w-full">
                  <TabsList>
                    <TabsTrigger value="leader">ความคืบหน้า (Leader/Tech)</TabsTrigger>
                    <TabsTrigger value="admin">ประวัติแก้ไข (Admin)</TabsTrigger>
                  </TabsList>
                  <TabsContent value="leader" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                    {(!job.activityLog || job.activityLog.length === 0) && job.tasks.length === 0 && (
                      <p className="text-sm text-muted-foreground p-4 text-center">ยังไม่มีความคืบหน้า</p>
                    )}
                    {job.activityLog && job.activityLog.length > 0 && (
                      <div className="space-y-2">
                        {job.activityLog.map((activity, idx) => (
                          <div key={idx} className="p-3 bg-muted rounded-md text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{activity.actorName}</span>
                              <span className="text-xs text-muted-foreground">
                                ({activity.actorRole === "leader" ? "หัวหน้า" : "ช่าง"})
                              </span>
                              <span className="text-xs text-muted-foreground">
                                - {format(activity.timestamp, "PPpp", { locale: th })}
                              </span>
                            </div>
                            <p className="text-sm">{activity.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="admin" className="space-y-2 max-h-[40vh] overflow-auto pr-2">
                    {job.editHistory.length === 0 && (
                      <p className="text-sm text-muted-foreground p-4 text-center">ยังไม่มีการแก้ไขโดย Admin</p>
                    )}
                    {job.editHistory.map((entry, index) => (
                      <div key={index} className="text-sm p-3 bg-muted rounded-md">
                        <p>
                          <strong>ผู้แก้ไข:</strong> {entry.adminName}
                        </p>
                        <p>
                          <strong>เวลา:</strong> {format(entry.editedAt, "PPpp", { locale: th })}
                        </p>
                        <p>
                          <strong>เหตุผล:</strong> {entry.reason}
                        </p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
          
        
          {/* Subtasks */}
          {job.tasks && job.tasks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase className="h-5 w-5" />
                  <CardTitle className="text-lg">รายละเอียดงานย่อย ({job.tasks.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <TaskDetailsLocked tasks={job.tasks} />
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
