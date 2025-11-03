"use client"

// ====================================================================
// SECTION 1: IMPORTS & INITIAL SETUP
// ====================================================================
import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { th } from "date-fns/locale" // [ใหม่] Import locale ภาษาไทย
import { format } from "date-fns"
import { 
  X, 
  CalendarIcon, 
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react"

// --- SHADCN/UI COMPONENTS ---
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { DialogFooter } from "@/components/ui/dialog"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Command, 
  CommandEmpty,
  CommandGroup, 
  CommandInput,
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

// --- UTILS & DATA ---
import { cn, isDateRangeOverlapping } from "@/lib/utils"
import { user as initialUsers } from "@/data/user"
import { leader as initialLeaders } from "@/data/leader"
import InteractiveMap from "@/components/common/InteractiveMap"
import { JobDetailsDialog } from "@/components/common/JobDetailsDialog"
import { useAuth } from "@/contexts/AuthContext"

// --- DATA ตั้งต้น และการโหลดข้อมูลจาก LocalStorage ---
const initialJobs = [
  {
    id: "JOB-001",
    title: "ซ่อมหลังคารั่วซึม อาคาร C",
    description: "ซ่อมแซมหลังคาบริเวณดาดฟ้าอาคาร C",
    status: "in-progress",
    dates: {
      start: new Date("2025-10-20T00:00:00"),
      end: new Date("2025-10-22T00:00:00"),
    },
    assignment: {
      departments: ["แผนกโครงสร้างพื้นฐานและไฟฟ้า"],
      leadId: 3,
      techIds: [1, 2],
    },
  },
]

const loadDataFromStorage = () => {
  // [สำคัญ] ฟังก์ชันอ่านข้อมูลจาก LocalStorage
  try {
    const data = localStorage.getItem("techJobData")
    if (data) {
      const parsed = JSON.parse(data)
      parsed.jobs = parsed.jobs.map((job) => ({
        ...job,
        dates: job.dates ? { start: new Date(job.dates.start), end: new Date(job.dates.end) } : null,
      }))
      return parsed
    }
  } catch (e) {
    console.error("Failed to load data", e)
  }
  return { jobs: initialJobs, users: initialUsers, leaders: initialLeaders }
}

// ====================================================================
// SECTION 2: REUSABLE SUB-COMPONENTS
// ====================================================================

const DatePicker = ({
  //thomas - ตัวเลือกวัน
  date,
  setDate,
}: {
  date?: Date
  setDate: (date?: Date) => void
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant={"outline"}
        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>เลือกวันที่</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={th} />
    </PopoverContent>
  </Popover>
)

// ====================================================================
// SUB-COMPONENT: ตัวเลือกหัวหน้า (LeaderSelect) - ✨ ฉบับอัปเดต ✨
// ====================================================================
const LeaderSelect = ({ leaders, selectedLead, onSelect, disabled }) => {
  const handleSelect = (leaderId: string) => {
    onSelect(leaders.find((l) => String(l.id) === leaderId) || null)
  }
  return (
    <Select
      value={selectedLead ? String(selectedLead.id) : ""}
      onValueChange={handleSelect}
      disabled={disabled || leaders.length === 0}
    >
      <SelectTrigger>
        <SelectValue placeholder={disabled ? "กรุณาเลือกวันก่อน" : "เลือกหัวหน้างาน..."} />
       {selectedLead && (
         <div className="flex items-center gap-2">
             <Avatar className="h-5 w-5">
            <AvatarImage src={selectedLead.avatarUrl ?? "/placeholder.svg"} />
              <AvatarFallback>{selectedLead.fname?.[0]}</AvatarFallback>
                </Avatar>
                <span>{`${selectedLead.fname} ${selectedLead.lname}`}</span>
        </div>
        )}
      </SelectTrigger>
      <SelectContent>
        {leaders.length > 0 ? (
          leaders.map((lead) => (
            <SelectItem key={lead.id} value={String(lead.id)}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={lead.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>{lead.fname[0]}</AvatarFallback>
                  </Avatar>
                  <span>
                    {lead.fname} {lead.lname}
                  </span>
                </div>
                {/* [ใหม่] เพิ่มการแสดงจำนวนงาน */}
                <span className="text-xs text-muted-foreground mr-2">{lead.jobsThisMonth || 0} งาน</span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">ไม่มีหัวหน้าที่ว่าง</div>
        )}
      </SelectContent>
    </Select>
  )
}

// --- COMPONENT: ตัวเลือกแผนก (Checkbox) ---
const DeptCheckboxGroup = ({
  //thomas - ตัวเลือกแผนก
  allDepartments,
  selectedDepts,
  onSelectionChange,
  disabled,
}) => {
  const handleCheckedChange = (checked, dept) => {
    if (checked) {
      // เพิ่มแผนกถ้ายังไม่มี
      onSelectionChange([...selectedDepts, dept])
    } else {
      // ลบแผนกออก
      onSelectionChange(selectedDepts.filter((d) => d !== dept))
    }
  }

  return (
    <div
      className={`space-y-3 rounded-md border p-4 transition-all ${
        disabled ? "bg-muted/50 opacity-50" : "bg-background cursor-pointer hover:border-primary/50"
      }`}
    >
      <Label className={disabled ? "cursor-not-allowed" : "cursor-pointer"}>
        แผนกที่เกี่ยวข้อง* {disabled && "(กรุณาเลือกหัวหน้างานก่อน)"}
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {allDepartments.map((dept) => (
          <div key={dept} className="flex items-center space-x-2">
            <Checkbox
              id={dept}
              checked={selectedDepts.includes(dept)}
              onCheckedChange={(checked) => handleCheckedChange(checked, dept)}
              disabled={disabled}
              className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
            />
            <Label
              htmlFor={dept}
              className={`text-sm font-medium leading-none ${
                disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              }`}
            >
              {dept}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

const TechSelect = ({
  //thomas - ตัวเลือกช่าง
  technicians,
  selectedTechs,
  onSelectionChange,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [positionFilter, setPositionFilter] = useState("all")

  const positions = useMemo(() => {
    const allPos = new Set(technicians.map((t) => t.position))
    return ["all", ...Array.from(allPos)]
  }, [technicians])

  const handleUnselect = (tech) => {
    onSelectionChange(selectedTechs.filter((s) => s.id !== tech.id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace" && inputValue === "" && selectedTechs.length > 0) {
      handleUnselect(selectedTechs[selectedTechs.length - 1])
    }
  }

  const availableOptions = useMemo(() => {
    // thomas - กรองช่างที่ยังไม่ถูกเลือกและตามตำแหน่ง
    return technicians.filter(
      (tech) =>
        !selectedTechs.some((s) => s.id === tech.id) && (positionFilter === "all" || tech.position === positionFilter),
    )
  }, [technicians, selectedTechs, positionFilter])

  return (
    <div className="space-y-2">
      <Select value={positionFilter} onValueChange={setPositionFilter} disabled={disabled}>
        <SelectTrigger className="w-full h-8 text-xs">
          <SelectValue placeholder="กรองตามตำแหน่ง..." />
        </SelectTrigger>
        <SelectContent>
          {positions.map((pos) => (
            <SelectItem key={pos} value={pos} className="text-xs">
              {pos === "all" ? "ตำแหน่งทั้งหมด" : pos}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
        <div
          className={`group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
            disabled ? "bg-muted opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex flex-col gap-2">
            {selectedTechs.map((tech) => (
              <div key={tech.id} className="flex items-center justify-between w-full p-2 bg-secondary rounded-md">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={tech.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">
                      {tech.fname} {tech.lname}
                    </span>
                    <p className="text-xs text-muted-foreground">{tech.position}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={disabled}
                  className="rounded-full outline-none text-muted-foreground hover:text-foreground"
                  onClick={() => handleUnselect(tech)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={selectedTechs.length > 0 ? "เพิ่มช่างคนอื่น..." : disabled ? "กรุณาเลือกแผนกก่อน" : "เลือกทีมช่าง..."}
              disabled={disabled}
              className="w-full flex-1 bg-transparent outline-none placeholder:text-muted-foreground mt-1"
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && !disabled ? (
            <div className="absolute top-0 z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
              <CommandList>
                <CommandGroup className="h-full max-h-[250px] overflow-auto">
                  {availableOptions.length > 0 ? (
                    availableOptions
                      .filter((tech) =>
                        (tech.fname + " " + tech.lname).toLowerCase().includes(inputValue.toLowerCase()),
                      )
                      .map((tech) => (
                        <CommandItem
                          key={tech.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onSelect={() => {
                            setInputValue("")
                            onSelectionChange([...selectedTechs, tech])
                            inputRef.current?.focus()
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={tech.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {tech.fname} {tech.lname}
                                </span>
                                <p className="text-xs text-muted-foreground">{tech.position}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">{tech.jobsThisMonth || 0} งาน</span>
                          </div>
                        </CommandItem>
                      ))
                  ) : (
                    <div className="p-4 text-sm text-center text-muted-foreground">ไม่พบช่างที่ว่าง</div>
                  )}
                </CommandGroup>
              </CommandList>
            </div>
          ) : null}
        </div>
      </Command>
    </div>
  )
}

// ====================================================================
// SUB-COMPONENT: ฟอร์มสร้างงาน (CreateJobForm) - ✨ ฉบับรื้อใหญ่ ✨
// ====================================================================
const CreateJobForm = ({ formState, formSetters, data, handlers }) => {
  const { allDepartments, availableLeads, availableTechsByDept } = data

  return (
    <form onSubmit={handlers.onSubmit}>
      <ScrollArea className="h-[70vh] p-4">
        <div className="space-y-6">
          {/* --- SECTION 1: รายละเอียดงาน --- */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">รายละเอียดงาน</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="job-title">ชื่องาน*</Label>
                <Input id="job-title" value={formState.title} onChange={(e) => formSetters.setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-type">ประเภทงาน*</Label>
                <Select value={formState.jobType} onValueChange={formSetters.setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทงาน..." />
                  </SelectTrigger>
                  <SelectContent>
                    {data.jobTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formState.jobType === "อื่นๆ..." && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="custom-job-type">ระบุประเภทงานอื่นๆ*</Label>
                  <Input
                    id="custom-job-type"
                    value={formState.customJobType}
                    onChange={(e) => formSetters.setCustomJobType(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="job-description">รายละเอียด</Label>
                <Textarea
                  id="job-description"
                  value={formState.description}
                  onChange={(e) => formSetters.setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 2: ข้อมูลลูกค้า --- */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">ข้อมูลลูกค้า</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="client-name">ชื่อลูกค้า*</Label>
                <Input
                  id="client-name"
                  value={formState.clientName}
                  onChange={(e) => formSetters.setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">เบอร์โทรศัพท์*</Label>
                <Input
                  id="client-phone"
                  type="tel"
                  value={formState.clientPhone}
                  onChange={(e) => formSetters.setClientPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-contact">ช่องทางติดต่ออื่น</Label>
                <Input
                  id="client-contact"
                  placeholder="เช่น LINE ID, Email"
                  value={formState.clientContact}
                  onChange={(e) => formSetters.setClientContact(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- SECTION 3: สถานที่และแผนที่ --- */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">สถานที่ปฏิบัติงาน</h3>
            <Separator />
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="job-address">ที่อยู่*</Label>
                <Textarea
                  id="job-address"
                  placeholder="1693 ถ. พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900"
                  value={formState.address}
                  onChange={(e) => formSetters.setAddress(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">พิมพ์ที่อยู่แล้วกดปุ่ม "ค้นหาบนแผนที่" หรือคลิกบนแผนที่เพื่อปักหมุด</p>
              </div>

              {formState.address && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => formSetters.setGeocodeTrigger(formState.address)}
                  className="w-full"
                >
                  🔍 ค้นหาบนแผนที่
                </Button>
              )}

              <div className="space-y-2">
                <Label>ปักหมุดบนแผนที่ (คลิกเพื่อเลือกตำแหน่ง)</Label>
                <div className="h-80 w-full rounded-md border overflow-hidden">
                  <InteractiveMap
                    center={[13.7563, 100.5018]}
                    zoom={13}
                    markerPosition={formState.mapPosition}
                    onMarkerSet={(pos) => formSetters.setMapPosition(pos)}
                    onAddressFound={(addr) => formSetters.setAddress(addr)}
                    interactive={true}
                    addressToGeocode={formState.geocodeTrigger}
                  />
                </div>
                {formState.mapPosition && (
                  <p className="text-xs text-muted-foreground">
                    ตำแหน่ง: {formState.mapPosition[0].toFixed(6)}, {formState.mapPosition[1].toFixed(6)}
                  </p>
                )}
                
              </div>

              <div className="space-y-2">
                <Label htmlFor="job-files">แนบไฟล์/รูปภาพ</Label>
                <Input id="job-files" type="file" multiple accept="image/*" onChange={handlers.onImageUpload} />
                <p className="text-xs text-muted-foreground">รองรับไฟล์รูปภาพ (JPG, PNG, etc.)</p>
              </div>

              {formState.uploadedImages && formState.uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>รูปภาพที่อัพโหลด ({formState.uploadedImages.length})</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {formState.uploadedImages.map((img, index) => (
                      <div key={index} className="relative group rounded-md overflow-hidden border">
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`อัพโหลด ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handlers.onRemoveImage(index)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- SECTION 4: กำหนดการและทีม --- */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">กำหนดการและทีมผู้รับผิดชอบ</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
              <div className="space-y-2">
                <Label>วันเริ่มงาน*</Label>
                <DatePicker date={formState.startDate} setDate={formSetters.setStartDate} />
              </div>
              <div className="space-y-2">
                <Label>วันจบงาน*</Label>
                <DatePicker date={formState.endDate} setDate={formSetters.setEndDate} />
              </div>
              <div className="space-y-2">
                <Label>หัวหน้างาน*</Label>
                <LeaderSelect
                  leaders={availableLeads}
                  selectedLead={formState.selectedLead}
                  onSelect={handlers.onLeadChange}
                  disabled={!formState.startDate || !formState.endDate}
                />
              </div>
            </div>
            <div className="pt-4">
              <DeptCheckboxGroup
                allDepartments={allDepartments}
                selectedDepts={formState.selectedDepts}
                onSelectionChange={formSetters.setSelectedDepts}
                disabled={!formState.selectedLead}
              />
            </div>
            {formState.selectedDepts.length > 0 && (
              <div className="pt-2">
                <Label>เลือกทีมช่าง*</Label>
                <div className="space-y-4 rounded-md border p-4">
                  {formState.selectedDepts.map((dept) => (
                    <div key={dept}>
                      <Label className="text-base font-medium">{dept}</Label>
                      <div className="mt-2">
                        <TechSelect
                          technicians={availableTechsByDept[dept] || []}
                          selectedTechs={formState.selectedTechs.filter((t) => t.department === dept)}
                          onSelectionChange={(newSelection) => handlers.onTechsChange(dept, newSelection)}
                          disabled={!formState.selectedDepts.includes(dept)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <div className="flex justify-end pt-6 border-t mt-4">
        <Button type="submit">{formState.isEditing ? "บันทึกการแก้ไข" : "สร้างใบงาน"}</Button>
      </div>
    </form>
  )
}

// ====================================================================
// SUB-COMPONENT: Dialog ยืนยันการแก้ไขใบงาน (ConfirmEditDialog)
// ====================================================================

const ConfirmEditDialog = ({ isOpen, onCancel, onConfirm }) => {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!reason.trim()) {
      alert("กรุณาระบุเหตุผลในการแก้ไข")
      return
    }
    onConfirm(reason)
    setReason("") // Reset reason
  }

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการแก้ไข</DialogTitle>
          <DialogDescription>กรุณาระบุเหตุผลสั้นๆ สำหรับการแก้ไขใบงานนี้</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="edit-reason">เหตุผลในการแก้ไข*</Label>
          <Textarea
            id="edit-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="เช่น: เปลี่ยนแปลงความต้องการของลูกค้า, เพิ่มทีมช่าง..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button onClick={handleConfirm}>บันทึกการแก้ไข</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ====================================================================
// SECTION 3: MAIN PAGE COMPONENT (AdminDashboardPage)
// ====================================================================
export default function AdminDashboardPage() {
  const [appData, setAppData] = useState(loadDataFromStorage)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [selectedLead, setSelectedLead] = useState(null)
  const [selectedDepts, setSelectedDepts] = useState([])
  const [selectedTechs, setSelectedTechs] = useState([])
  const [clientName, setClientName] = useState("") //
  const [clientPhone, setClientPhone] = useState("") //
  const [clientContact, setClientContact] = useState("") //
  const [mapPosition, setMapPosition] = useState(null) //
  const [address, setAddress] = useState("") // [ใหม่]
  const [viewingJob, setViewingJob] = useState(null)
  const [jobId, setJobId] = useState("") // State สำหรับเก็บรหัสใบงาน
  const [jobType, setJobType] = useState("") //State สำหรับประเภทงาน
  const [customJobType, setCustomJobType] = useState("") //State สำหรับประเภทงานอื่นๆ
  const [editingJob, setEditingJob] = useState(null) // เก็บข้อมูลงานที่กำลังจะแก้ไข
  const [isConfirmingEdit, setIsConfirmingEdit] = useState(false) // ควบคุม Dialog ยืนยันการแก้ไข
  const [geocodeTrigger, setGeocodeTrigger] = useState("") // State สำหรับ触发地理编码
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const { user: currentUser } = useAuth()

  const allDepartments = useMemo(() => [...new Set(appData.users.map((u) => u.department))], [appData.users])
  useEffect(() => {
    localStorage.setItem("techJobData", JSON.stringify(appData))
  }, [appData])

  // [ใหม่] รายการประเภทงานเริ่มต้น
  const jobTypeOptions = ["ติดตั้งระบบ", "ซ่อมบำรุง", "ตรวจเช็คสภาพ", "รื้อถอน", "ให้คำปรึกษา", "อื่นๆ..."]

  // [ใหม่] ฟังก์ชันสำหรับสร้างรหัสใบงาน
  const generateJobId = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `JOB-${year}${month}${day}-${randomChars}`
  }

  // ▼▼▼ เพิ่ม 2 ฟังก์ชันนี้เข้ามา ▼▼▼
  const findLeaderById = (id: number) => {
    return appData.leaders.find((l) => l.id === id)
  }

  const findUserById = (id: number) => {
    return appData.users.find((u) => u.id === id)
  }
  const availableLeads = useMemo(() => {
    if (!startDate || !endDate) return []
    return appData.leaders
      .filter(
        (leader) =>
          !appData.jobs.some(
            (job) =>
              job.assignment.leadId === leader.id &&
              isDateRangeOverlapping(startDate, endDate, job.dates.start, job.dates.end),
          ),
      )
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0))
  }, [startDate, endDate, appData.leaders, appData.jobs])

  const availableTechsByDept = useMemo(() => {
    if (!startDate || !endDate) return {}
    const techsByDept = {}
    for (const dept of allDepartments) {
      techsByDept[dept] = appData.users
        .filter(
          (user) =>
            user.department === dept &&
            !appData.jobs.some(
              (job) =>
                job.assignment.techIds.includes(user.id) &&
                isDateRangeOverlapping(startDate, endDate, job.dates.start, job.dates.end),
            ),
        )
        .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0))
    }
    return techsByDept
  }, [startDate, endDate, appData.users, appData.jobs, allDepartments])

  //สร้างรหัสใบงานเมื่อเปิด Dialog
  useEffect(() => {
    if (isDialogOpen) {
      setJobId(generateJobId())
    }
  }, [isDialogOpen])

  //ฟังก์ชันรีเซ็ตฟอร์ม
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedLead(null);
    setSelectedDepts([]);
    setSelectedTechs([]);
    setClientName(""); // [ใหม่]
    setClientPhone(""); // [ใหม่]
    setClientContact("");// [ใหม่]
    setAddress("");// [ใหม่]
    setMapPosition(null);// [ใหม่]
    setJobType("");// [ใหม่]
    setCustomJobType("");// [ใหม่]
    setGeocodeTrigger("");// Reset geocode trigger // [ใหม่]
    setUploadedImages([]);// [ใหม่]
  }

  // ==========================================================
  // ✨ HANDLER FUNCTIONS (ฉบับแก้ไขสมบูรณ์) ✨
  // ==========================================================

  const handleCreateJob = (event: React.FormEvent) => {
    event.preventDefault()
    const finalJobType = jobType === "อื่นๆ..." ? customJobType : jobType

    // --- ไม่มีการบังคับกรอกข้อมูลอีกต่อไป ---

    const newJob = {
      id: jobId,
      jobType: finalJobType || "ไม่ได้ระบุ", // ถ้าไม่มี ให้ใส่ค่า default
      status: "new",
      title: title || `งาน-${jobId}`, // ถ้าไม่มี ให้ใส่ค่า default
      description,
      client: { name: clientName, phone: clientPhone, contact: clientContact },
      location: { address: address, mapPosition: mapPosition },
      dates: { start: startDate, end: endDate },
      assignment: {
        departments: selectedDepts,
        leadId: selectedLead?.id, // ใช้ Optional Chaining
        techIds: selectedTechs.map((t: any) => t.id),
      },
      editHistory: [],
      images: uploadedImages, // Include uploaded images
    }

    setAppData((d) => ({
      ...d,
      jobs: [newJob, ...d.jobs],
      leaders: d.leaders.map((l) =>
        l.id === selectedLead?.id ? { ...l, jobsThisMonth: (l.jobsThisMonth || 0) + 1 } : l,
      ),
      users: d.users.map((u) =>
        selectedTechs.some((t: any) => t.id === u.id) ? { ...u, jobsThisMonth: (u.jobsThisMonth || 0) + 1 } : u,
      ),
    }))

    resetForm()
    setIsDialogOpen(false)
  }

  const handleStartEdit = () => {
    // ตรวจสอบก่อนว่ามี viewingJob (งานที่กำลังจะเปิดดูรายละเอียด) อยู่จริง
    if (!viewingJob) return

    // --- 1. ตั้งค่า ID ของงาน ---
    setJobId(viewingJob.id)

    // --- 2. นำข้อมูลจาก viewingJob มาใส่ใน State ของฟอร์มทั้งหมด ---
    setTitle(viewingJob.title || "")
    setDescription(viewingJob.description || "")
    setJobType(viewingJob.jobType || "")

    // ใช้ Optional Chaining (?.) เพื่อป้องกัน Error หากข้อมูลเก่าไม่มี client หรือ location
    setClientName(viewingJob.client?.name || "")
    setClientPhone(viewingJob.client?.phone || "")
    setClientContact(viewingJob.client?.contact || "")
    setAddress(viewingJob.location?.address || "")
    setMapPosition(viewingJob.location?.mapPosition || null)

    // แปลงวันที่กลับเป็น Date object ก่อน set และป้องกันค่า invalid
    setStartDate(viewingJob.dates?.start ? new Date(viewingJob.dates.start) : undefined)
    setEndDate(viewingJob.dates?.end ? new Date(viewingJob.dates.end) : undefined)

    // ค้นหา object เต็มของ leader และ techs จาก ID
    setSelectedLead(findLeaderById(viewingJob.assignment.leadId))
    setSelectedDepts(viewingJob.assignment.departments || [])
    setSelectedTechs(viewingJob.assignment.techIds.map(findUserById).filter(Boolean))

    // Set uploaded images
    setUploadedImages(viewingJob.images || [])

    // --- 3. ตั้งค่าโหมดแก้ไข ---
    setEditingJob(viewingJob)

    // --- 4. ปิด Dialog รายละเอียด และ เปิด Dialog ฟอร์ม (ซึ่งตอนนี้จะอยู่ในโหมดแก้ไข) ---
    setViewingJob(null)
    setIsDialogOpen(true)
  }

  const handleUpdateJob = (event: React.FormEvent) => {
    event.preventDefault()
    // ไม่มีการบังคับกรอกข้อมูล เปิด Dialog ยืนยันเลย
    setIsConfirmingEdit(true)
  }

  const handleConfirmEdit = (reason: string) => {
    const finalJobType = jobType === "อื่นๆ..." ? customJobType : jobType
    const updatedJobPayload = {
      title: title || `งาน-${editingJob.id}`,
      description,
      jobType: finalJobType || "ไม่ได้ระบุ",
      client: { name: clientName, phone: clientPhone, contact: clientContact },
      location: { address: address, mapPosition: mapPosition },
      dates: { start: startDate, end: endDate },
      assignment: {
        departments: selectedDepts,
        leadId: selectedLead?.id,
        techIds: selectedTechs.map((t: any) => t.id),
      },
      images: uploadedImages, // Include uploaded images
    }

    const editEntry = {
      editorName: currentUser ? `${currentUser.fname} ${currentUser.lname}` : "Admin",
      editedAt: new Date(),
      reason: reason,
    }

    setAppData((prevData) => {
      const updatedJobs = prevData.jobs.map((job) => {
        if (job.id === editingJob.id) {
          return {
            ...job,
            ...updatedJobPayload,
            editHistory: [...(job.editHistory || []), editEntry],
          }
        }
        return job
      })
      return { ...prevData, jobs: updatedJobs }
    })

    setIsConfirmingEdit(false)
    setIsDialogOpen(false)
    setEditingJob(null)
    resetForm()
  }

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm("คุณต้องการลบใบงานนี้ใช่หรือไม่?")) {
      setAppData((d) => ({ ...d, jobs: d.jobs.filter((j) => j.id !== jobId) }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result as string)
        if (newImages.length === files.length) {
          setUploadedImages((prev) => [...prev, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              resetForm()
              setEditingJob(null)
            }
            setIsDialogOpen(open)
          }}
        >
          <DialogTrigger asChild>
            <Button>+ สร้างใบงาน</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {editingJob ? `แก้ไขใบงาน: ${editingJob.id}` : "สร้างใบงานใหม่"}</DialogTitle>
              <DialogDescription>กรอกรายละเอียดและมอบหมายงาน</DialogDescription>
            </DialogHeader>
            <CreateJobForm //thomas - pop up ใบงาน
              formState={{
                isEditing: !!editingJob,  // ตัวบอกโหมด
                jobId, // ID งาน
                title,
                description,
                jobType,
                customJobType, // รายละเอียดงาน
                clientName,
                clientPhone,
                clientContact,// ข้อมูลลูกค้า
                address,
                mapPosition,  // สถานที่
                geocodeTrigger,
                startDate,
                endDate,// วันที่
                selectedLead,
                selectedDepts,
                selectedTechs,// ทีม
                uploadedImages,
              }}
              formSetters={{
                setTitle,
                setDescription,
                setJobType,
                setCustomJobType,
                setClientName,
                setClientPhone,
                setClientContact,
                setAddress,
                setMapPosition,
                setGeocodeTrigger,
                setStartDate,
                setEndDate,
                setSelectedDepts,
                setUploadedImages,
              }}
              data={{
                allDepartments,
                availableLeads,
                availableTechsByDept,
                jobTypeOptions,
              }}
              handlers={{
                onSubmit: editingJob ? handleUpdateJob : handleCreateJob,
                onLeadChange: (value) => {
                  setSelectedLead(value)
                  setSelectedDepts([])
                  setSelectedTechs([])
                },
                onTechsChange: (dept, newSelectionInDept) => {
                  const otherDeptsTechs = selectedTechs.filter((t) => t.department !== dept)
                  setSelectedTechs([...otherDeptsTechs, ...newSelectionInDept])
                },
                onImageUpload: handleImageUpload,
                onRemoveImage: handleRemoveImage,
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">งานใหม่</TabsTrigger>
          <TabsTrigger value="in-progress">กำลังทำ</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="space-y-4">
          {appData.jobs
            .filter((j) => j.status === "new")
            .map((job) => {
               // ใช้ฟังก์ชันผู้ช่วยที่เราสร้างขึ้น
              const lead = findLeaderById(job.assignment.leadId);
              const techs = job.assignment.techIds
              .map(findUserById)
              .filter(Boolean) // .filter(Boolean) เพื่อกรองค่า undefined ออก

              return (
                <Card key={job.id} className="dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-xl">{job.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // หยุดไม่ให้ event คลิกนี้ไปเปิด Dialog
                          handleDeleteJob(job.id);
                        }}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardTitle>
                    <CardDescription>{job.description || "ไม่มีรายละเอียดเพิ่มเติม"}</CardDescription>
                  </CardHeader>

                  {/* ▼▼▼ เพิ่ม CardContent เข้ามาแสดงรายละเอียดทีม ▼▼▼ */}
                  <CardContent className="space-y-4 pt-0">
                    <Separator />
                   {/* --- ส่วนหัวหน้างาน --- */}
                    {lead && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">หัวหน้างาน
                        </h4>
                        <div className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={lead.avatarUrl || "/placeholder.svg"} />
                            <AvatarFallback>{lead.fname[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {lead.fname} {lead.lname}
                            </p>
                            <p className="text-xs text-muted-foreground">{lead.position}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- ส่วนทีมช่าง --- */}
                    {techs.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">ทีมช่าง ({techs.length} คน)</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {techs.map((tech) => (
                            <div key={tech.id} className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={tech.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {tech.fname} {tech.lname}
                                </p>
                                <p className="text-xs text-muted-foreground">{tech.position}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <Separator className="mb-4" />
                    <div className="text-sm text-muted-foreground space-y-1">
                       {/* ตรวจสอบให้แน่ใจว่า job.client มีอยู่จริงก่อนแสดงผล */}
                      <p>
                        <strong>ลูกค้า:</strong> {job.client?.name || "N/A"}
                      </p>
                      <p>
                        <strong>เบอร์โทร:</strong> {job.client?.phone || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={() => setViewingJob(job)} className="cursor-pointer">
                      ดูรายละเอียด
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
        </TabsContent>
      </Tabs>
      <JobDetailsDialog
        job={viewingJob}
        lead={viewingJob ? findLeaderById(viewingJob.assignment.leadId) : null}
        techs={viewingJob ? viewingJob.assignment.techIds.map(findUserById).filter(Boolean) : []}
        isOpen={!!viewingJob}
        onClose={() => setViewingJob(null)}
        currentUser={currentUser} // <--- ✨ เพิ่มบรรทัดนี้ ✨
        onEdit={handleStartEdit}
      />
      <ConfirmEditDialog
        isOpen={isConfirmingEdit}
        onCancel={() => setIsConfirmingEdit(false)}
        onConfirm={handleConfirmEdit} // <--- ✨ เพิ่มบรรทัดนี้ ✨
      />
    </div>
  )
}

