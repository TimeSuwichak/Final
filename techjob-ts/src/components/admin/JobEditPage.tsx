"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useJobs } from "@/contexts/JobContext"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/common/DatePicker"
import { LeaderSelect } from "@/components/admin/LeaderSelect"
import { isDateRangeOverlapping } from "@/lib/utils"
import { leader as ALL_LEADERS } from "@/Data/leader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Job } from "@/types/index"
import { AdminMap } from "@/components/admin/AdminMap"
import { ArrowLeft } from "lucide-react"

const JOB_TYPES = ["ซ่อมบำรุง", "รื้อถอน", "ติดตั้งระบบ", "ตรวจสอบประจำปี", "อื่นๆ"]

export default function JobEditPage() {
  const navigate = useNavigate()
  const { jobId } = useParams<{ jobId: string }>()
  const { jobs, updateJob, deleteJob } = useJobs()
  const { user } = useAuth()

  const job = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId])

  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [editReason, setEditReason] = useState("")
  const [pendingChanges, setPendingChanges] = useState<Partial<Job>>({})
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [jobType, setJobType] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerContactOther, setCustomerContactOther] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [location, setLocation] = useState("")
  const [mapPosition, setMapPosition] = useState<[number, number] | undefined>()
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  useEffect(() => {
    if (job) {
      setTitle(job.title || "")
      setDescription(job.description || "")
      setJobType(job.jobType || "")
      setCustomerName(job.customerName || "")
      setCustomerPhone(job.customerPhone || "")
      setCustomerContactOther(job.customerContactOther || "")
      setStartDate(job.startDate ? new Date(job.startDate) : undefined)
      setEndDate(job.endDate ? new Date(job.endDate) : undefined)
      setSelectedLeadId(job.leadId ? String(job.leadId) : null)
      setLocation(job.location || "")
      if (job.latitude && job.longitude) {
        setMapPosition([job.latitude, job.longitude])
      } else {
        setMapPosition(undefined)
      }
    }
  }, [job])

  const availableLeads = useMemo(() => {
    if (!startDate || !endDate || !job) return []

    const busyLeadIds = new Set(
      jobs
        .filter(
          (j) => j.id !== job.id && isDateRangeOverlapping(startDate, endDate, j.startDate, j.endDate) && j.leadId,
        )
        .map((j) => String(j.leadId)),
    )

    return ALL_LEADERS.filter((lead) => !busyLeadIds.has(String(lead.id))).sort(
      (a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0),
    )
  }, [startDate, endDate, jobs, job])

  const handleSave = () => {
    if (!job) return

    const changes: Partial<Job> = {}

    if (title !== job.title) changes.title = title
    if (description !== (job.description || "")) changes.description = description
    if (jobType !== job.jobType) changes.jobType = jobType
    if (customerName !== job.customerName) changes.customerName = customerName
    if (customerPhone !== (job.customerPhone || "")) changes.customerPhone = customerPhone
    if (customerContactOther !== (job.customerContactOther || "")) changes.customerContactOther = customerContactOther
    if (startDate?.getTime() !== new Date(job.startDate).getTime()) changes.startDate = startDate
    if (endDate?.getTime() !== new Date(job.endDate).getTime()) changes.endDate = endDate

    if (selectedLeadId !== String(job.leadId || null)) {
      changes.leadId = selectedLeadId ? Number(selectedLeadId) : null
    }
    if (location !== (job.location || "")) changes.location = location

    if (mapPosition) {
      if (mapPosition[0] !== job.latitude || mapPosition[1] !== job.longitude) {
        changes.latitude = mapPosition[0]
        changes.longitude = mapPosition[1]
      }
    }

    if (Object.keys(changes).length === 0) {
      alert("ไม่มีข้อมูลเปลี่ยนแปลง")
      navigate(`/admin/job/${jobId}`)
      return
    }

    setPendingChanges(changes)
    setIsAlertOpen(true)
  }

  const handleConfirmSave = () => {
    if (!job || !user || !editReason) {
      alert("เกิดข้อผิดพลาด หรือยังไม่ได้กรอกเหตุผล")
      return
    }
    updateJob(job.id, pendingChanges, editReason, user.fname)
    setEditReason("")
    setIsAlertOpen(false)
    navigate(`/admin/job/${jobId}`)
  }

  if (!job || !user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">ไม่พบข้อมูลงาน</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate(`/admin/job/${jobId}`)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">แก้ไขงาน</h2>
              <p className="text-sm text-muted-foreground">{job.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                ลบงาน
              </Button>
            )}
            <Button onClick={handleSave}>บันทึกการแก้ไข</Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-2 pr-4">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                <CardDescription>อัปเดตหัวข้องานและประเภทงาน</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-sm font-medium">หัวข้องาน*</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-medium">ประเภทงาน*</Label>
                  <Select onValueChange={setJobType} value={jobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกประเภทงาน..." />
                    </SelectTrigger>        
                    <SelectContent>
                      {JOB_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-sm font-medium">รายละเอียดงาน</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="รายละเอียด, ขอบเขตงาน, หรือหมายเหตุ"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลลูกค้า</CardTitle>
                <CardDescription>ตรวจสอบและแก้ไขข้อมูลการติดต่อของลูกค้า</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label className="mb-1 block text-sm font-medium">ชื่อลูกค้า*</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-medium">เบอร์โทร</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-medium">ช่องทางติดต่ออื่น</Label>
                  <Input
                    value={customerContactOther}
                    onChange={(e) => setCustomerContactOther(e.target.value)}
                    placeholder="Line, Email เป็นต้น"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สถานที่ปฏิบัติงาน</CardTitle>
                <CardDescription>ระบุตำแหน่งและที่อยู่สำหรับปฏิบัติงาน</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminMap
                  initialAddress={location}
                  initialPosition={mapPosition}
                  onAddressChange={setLocation}
                  onPositionChange={setMapPosition}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>กำหนดการและหัวหน้างาน</CardTitle>
                <CardDescription>อัปเดตช่วงเวลางาน และเลือกหัวหน้างานใหม่หากจำเป็น</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-sm font-medium">วันเริ่มงาน*</Label>
                  <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <div>
                  <Label className="mb-1 block text-sm font-medium">วันจบงาน*</Label>
                  <DatePicker date={endDate} setDate={setEndDate} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-sm font-medium">
                    หัวหน้างาน* <span className="text-xs text-muted-foreground">(จะแสดงเฉพาะคนที่ว่าง)</span>
                  </Label>
                  <LeaderSelect
                    leaders={availableLeads}
                    selectedValue={selectedLeadId}
                    onValueChange={setSelectedLeadId}
                    disabled={!startDate || !endDate}
                  />
                  {(!startDate || !endDate) && (
                    <p className="text-xs text-muted-foreground">กรุณาเลือกวันเริ่มและวันจบก่อน เพื่อกรองหัวหน้างานที่พร้อม</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการแก้ไข</AlertDialogTitle>
            <AlertDialogDescription>กรุณาระบุเหตุผลสำหรับการแก้ไขในครั้งนี้</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="reason">เหตุผลการแก้ไข*</Label>
            <Textarea
              id="reason"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="เช่น: แก้ไขคำผิด, อัปเดตเบอร์โทรลูกค้า..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} disabled={!editReason}>
              ยืนยัน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(next) => {
          setIsDeleteOpen(next)
          if (!next) setDeleteReason("")
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบใบงาน</AlertDialogTitle>
            <AlertDialogDescription>
              การลบใบงานจะเป็นการลบถาวรและแจ้งเตือนไปยังหัวหน้าและช่างที่เกี่ยวข้อง กรุณาระบุเหตุผลสั้น ๆ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="delete-reason">เหตุผลการลบ*</Label>
            <Textarea
              id="delete-reason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteReason.trim()) {
                  alert("กรุณาระบุเหตุผลการลบ")
                  return
                }
                if (!job || !user) return
                deleteJob(job.id, deleteReason.trim(), user.fname)
                setIsDeleteOpen(false)
                setDeleteReason("")
                navigate("/admin/workoders")
              }}
            >
              ยืนยันลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
