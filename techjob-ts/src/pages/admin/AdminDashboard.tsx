"use client";

// ====================================================================
// SECTION 1: IMPORTS & INITIAL SETUP
// ====================================================================
import React, { useState, useEffect, useMemo, useRef } from "react";
import { th } from "date-fns/locale"; // [ใหม่] Import locale ภาษาไทย
import { format } from "date-fns";
import {
  X,
  Calendar as CalendarIcon,
  Trash2,
  Check,
  ChevronsUpDown,
} from "lucide-react";

// --- SHADCN/UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- UTILS & DATA ---
import { cn, isDateRangeOverlapping } from "@/lib/utils";
import { user as initialUsers } from "@/data/user";
import { leader as initialLeaders } from "@/data/leader";
import InteractiveMap from "@/components/common/InteractiveMap";

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
];

const loadDataFromStorage = () => {
  try {
    const data = localStorage.getItem("techJobData");
    if (data) {
      const parsed = JSON.parse(data);
      parsed.jobs = parsed.jobs.map((job) => ({
        ...job,
        dates: job.dates
          ? { start: new Date(job.dates.start), end: new Date(job.dates.end) }
          : null,
      }));
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return { jobs: initialJobs, users: initialUsers, leaders: initialLeaders };
};

// ====================================================================
// SECTION 2: REUSABLE SUB-COMPONENTS
// ====================================================================

const DatePicker = ({
  date,
  setDate,
}: {
  date?: Date;
  setDate: (date?: Date) => void;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant={"outline"}
        className={cn(
          "w-full justify-start text-left font-normal",
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? format(date, "PPP") : <span>เลือกวันที่</span>}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        initialFocus
        locale={th}
      />
    </PopoverContent>
  </Popover>
);

// ====================================================================
// SUB-COMPONENT: ตัวเลือกหัวหน้า (LeaderSelect) - ✨ ฉบับอัปเดต ✨
// ====================================================================
const LeaderSelect = ({ leaders, selectedLead, onSelect, disabled }) => {
  const handleSelect = (leaderId: string) => {
    onSelect(leaders.find((l) => String(l.id) === leaderId) || null);
  };
  return (
    <Select
      value={selectedLead ? String(selectedLead.id) : ""}
      onValueChange={handleSelect}
      disabled={disabled || leaders.length === 0}
    >
      <SelectTrigger>
        <SelectValue
          placeholder={disabled ? "กรุณาเลือกวันก่อน" : "เลือกหัวหน้างาน..."}
        />
      </SelectTrigger>
      <SelectContent>
        {leaders.length > 0 ? (
          leaders.map((lead) => (
            <SelectItem key={lead.id} value={String(lead.id)}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={lead.avatarUrl} />
                    <AvatarFallback>{lead.fname[0]}</AvatarFallback>
                  </Avatar>
                  <span>
                    {lead.fname} {lead.lname}
                  </span>
                </div>
                {/* [ใหม่] เพิ่มการแสดงจำนวนงาน */}
                <span className="text-xs text-muted-foreground mr-2">
                  {lead.jobsThisMonth || 0} งาน
                </span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
            ไม่มีหัวหน้าที่ว่าง
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

// --- COMPONENT: ตัวเลือกแผนก (Checkbox) ---
const DeptCheckboxGroup = ({ allDepartments, selectedDepts, onSelectionChange, disabled }) => {

    const handleCheckedChange = (checked, dept) => {
      if (checked) {
        // เพิ่มแผนกถ้ายังไม่มี
        onSelectionChange([...selectedDepts, dept]);
      } else {
        // ลบแผนกออก
        onSelectionChange(selectedDepts.filter(d => d !== dept));
      }
    };
  
    return (
      <div className={`space-y-3 rounded-md border p-4 ${disabled ? "bg-muted opacity-50 cursor-not-allowed" : ""}`}>
        <Label>แผนกที่เกี่ยวข้อง*</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {allDepartments.map((dept) => (
            <div key={dept} className="flex items-center space-x-2">
              <Checkbox
                id={dept}
                checked={selectedDepts.includes(dept)}
                onCheckedChange={(checked) => handleCheckedChange(checked, dept)}
                disabled={disabled}
              />
              <Label htmlFor={dept} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {dept}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
};

const TechSelect = ({
  technicians,
  selectedTechs,
  onSelectionChange,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");

  const positions = useMemo(() => {
    const allPos = new Set(technicians.map((t) => t.position));
    return ["all", ...Array.from(allPos)];
  }, [technicians]);

  const handleUnselect = (tech) => {
    onSelectionChange(selectedTechs.filter((s) => s.id !== tech.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "Backspace" &&
      inputValue === "" &&
      selectedTechs.length > 0
    ) {
      handleUnselect(selectedTechs[selectedTechs.length - 1]);
    }
  };

  const availableOptions = useMemo(() => {
    return technicians.filter(
      (tech) =>
        !selectedTechs.some((s) => s.id === tech.id) &&
        (positionFilter === "all" || tech.position === positionFilter)
    );
  }, [technicians, selectedTechs, positionFilter]);

  return (
    <div className="space-y-2">
      <Select
        value={positionFilter}
        onValueChange={setPositionFilter}
        disabled={disabled}
      >
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
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        <div
          className={`group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${
            disabled ? "bg-muted opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <div className="flex flex-col gap-2">
            {selectedTechs.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between w-full p-2 bg-secondary rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={tech.avatarUrl} />
                    <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">
                      {tech.fname} {tech.lname}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {tech.position}
                    </p>
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
              placeholder={
                selectedTechs.length > 0
                  ? "เพิ่มช่างคนอื่น..."
                  : disabled
                  ? "กรุณาเลือกแผนกก่อน"
                  : "เลือกทีมช่าง..."
              }
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
                        (tech.fname + " " + tech.lname)
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      )
                      .map((tech) => (
                        <CommandItem
                          key={tech.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onSelect={() => {
                            setInputValue("");
                            onSelectionChange([...selectedTechs, tech]);
                            inputRef.current?.focus();
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={tech.avatarUrl} />
                                <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium">
                                  {tech.fname} {tech.lname}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {tech.position}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {tech.jobsThisMonth || 0} งาน
                            </span>
                          </div>
                        </CommandItem>
                      ))
                  ) : (
                    <div className="p-4 text-sm text-center text-muted-foreground">
                      ไม่พบช่างที่ว่าง
                    </div>
                  )}
                </CommandGroup>
              </CommandList>
            </div>
          ) : null}
        </div>
      </Command>
    </div>
  );
};

// ====================================================================
// SUB-COMPONENT: ฟอร์มสร้างงาน (CreateJobForm) - ✨ ฉบับรื้อใหญ่ ✨
// ====================================================================
const CreateJobForm = ({ formState, formSetters, data, handlers }) => {
  const { allDepartments, availableLeads, availableTechsByDept } = data;

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
                <Input
                  id="job-title"
                  value={formState.title}
                  onChange={(e) => formSetters.setTitle(e.target.value)}
                />
              </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-address">ที่อยู่*</Label>
                  <Textarea
                    id="job-address"
                    placeholder="7/7 ถ.พหลโยธิน แขวงสามเสนใน..."
                    value={formState.address}
                    onChange={(e) => formSetters.setAddress(e.target.value)}
                  />
                </div>
                {/* [ใหม่] เพิ่มส่วนแนบไฟล์ */}
                <div className="space-y-2">
                  <Label htmlFor="job-files">แนบไฟล์/รูปภาพ</Label>
                  <Input id="job-files" type="file" multiple />
                </div>
              </div>
              <div className="space-y-2">
                <Label>ปักหมุดบนแผนที่</Label>
                <div className="h-64 w-full rounded-md border overflow-hidden">
                  {/* [ใหม่] เรียกใช้ Component แผนที่ */}
                  {/* <InteractiveMap center={[13.7563, 100.5018]} onMarkerSet={(pos) => formSetters.setMapPosition(pos)} /> */}
                  <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground">
                    <InteractiveMap/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 4: กำหนดการและทีม --- */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              กำหนดการและทีมผู้รับผิดชอบ
            </h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
              <div className="space-y-2">
                <Label>วันเริ่มงาน*</Label>
                <DatePicker
                  date={formState.startDate}
                  setDate={formSetters.setStartDate}
                />
              </div>
              <div className="space-y-2">
                <Label>วันจบงาน*</Label>
                <DatePicker
                  date={formState.endDate}
                  setDate={formSetters.setEndDate}
                />
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
                          selectedTechs={formState.selectedTechs.filter(
                            (t) => t.department === dept
                          )}
                          onSelectionChange={(newSelection) =>
                            handlers.onTechsChange(dept, newSelection)
                          }
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
        <Button type="submit">สร้างใบงาน</Button>
      </div>
    </form>
  );
};

// ====================================================================
// SECTION 3: MAIN PAGE COMPONENT (AdminDashboardPage)
// ====================================================================
export default function AdminDashboardPage() {
  const [appData, setAppData] = useState(loadDataFromStorage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState([]);
  const [clientName, setClientName] = useState(""); // [ใหม่]
  const [clientPhone, setClientPhone] = useState(""); // [ใหม่]
  const [clientContact, setClientContact] = useState(""); // [ใหม่]
  const [mapPosition, setMapPosition] = useState(null); // [ใหม่]
  const [address, setAddress] = useState(""); // [ใหม่]

  const allDepartments = useMemo(
    () => [...new Set(appData.users.map((u) => u.department))],
    [appData.users]
  );
  useEffect(() => {
    localStorage.setItem("techJobData", JSON.stringify(appData));
  }, [appData]);

  // ▼▼▼ เพิ่ม 2 ฟังก์ชันนี้เข้ามา ▼▼▼
  const findLeaderById = (id: number) => {
    return appData.leaders.find((l) => l.id === id);
  };

  const findUserById = (id: number) => {
    return appData.users.find((u) => u.id === id);
  };
  const availableLeads = useMemo(() => {
    if (!startDate || !endDate) return [];
    return appData.leaders
      .filter(
        (leader) =>
          !appData.jobs.some(
            (job) =>
              job.assignment.leadId === leader.id &&
              isDateRangeOverlapping(
                startDate,
                endDate,
                job.dates.start,
                job.dates.end
              )
          )
      )
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
  }, [startDate, endDate, appData.leaders, appData.jobs]);

  const availableTechsByDept = useMemo(() => {
    if (!startDate || !endDate) return {};
    const techsByDept = {};
    for (const dept of allDepartments) {
      techsByDept[dept] = appData.users
        .filter(
          (user) =>
            user.department === dept &&
            !appData.jobs.some(
              (job) =>
                job.assignment.techIds.includes(user.id) &&
                isDateRangeOverlapping(
                  startDate,
                  endDate,
                  job.dates.start,
                  job.dates.end
                )
            )
        )
        .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
    }
    return techsByDept;
  }, [startDate, endDate, appData.users, appData.jobs, allDepartments]);
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
    setClientContact(""); // [ใหม่]
    setAddress(""); // [ใหม่]
    setMapPosition(null); // [ใหม่]
  };
  const handleCreateJob = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !title ||
      !startDate ||
      !endDate ||
      !selectedLead ||
      selectedDepts.length === 0 ||
      selectedTechs.length === 0
    ) {
      alert("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน");
      return;
    }
    const newJob = {
      id: `JOB-${Date.now()}`,
      status: "new",
      title,
      description,
      dates: { start: startDate, end: endDate },
      assignment: {
        departments: selectedDepts,
        leadId: selectedLead.id,
        techIds: selectedTechs.map((t) => t.id),
      },
    };
    setAppData((d) => ({
      ...d,
      jobs: [newJob, ...d.jobs],
      leaders: d.leaders.map((l) =>
        l.id === selectedLead.id
          ? { ...l, jobsThisMonth: (l.jobsThisMonth || 0) + 1 }
          : l
      ),
      users: d.users.map((u) =>
        selectedTechs.some((t) => t.id === u.id)
          ? { ...u, jobsThisMonth: (u.jobsThisMonth || 0) + 1 }
          : u
      ),
    }));
    resetForm();
    setIsDialogOpen(false);
  };
  const handleDeleteJob = (jobId: string) => {
    if (window.confirm("คุณต้องการลบใบงานนี้ใช่หรือไม่?")) {
      setAppData((d) => ({ ...d, jobs: d.jobs.filter((j) => j.id !== jobId) }));
    }
  };
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button>+ สร้างใบงาน</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>สร้างใบงานใหม่</DialogTitle>
              <DialogDescription>กรอกรายละเอียดและมอบหมายงาน</DialogDescription>
            </DialogHeader>
            <CreateJobForm
              formState={{
                title,
                description,
                startDate,
                endDate,
                selectedLead,
                selectedDepts,
                selectedTechs,
              }}
              formSetters={{
                setTitle,
                setDescription,
                setClientName,
                setClientPhone,
                setClientContact, // [ใหม่]
                setAddress,
                setMapPosition, // [ใหม่]
                setStartDate,
                setEndDate,
              }}
              data={{ allDepartments, availableLeads, availableTechsByDept }}
              handlers={{
                onSubmit: handleCreateJob,
                onLeadChange: (value) => {
                  setSelectedLead(value);
                  setSelectedDepts([]);
                  setSelectedTechs([]);
                },
                onDeptToggle: (checked, dept) => {
                  if (checked) {
                    setSelectedDepts((prev) => [...prev, dept]);
                  } else {
                    setSelectedDepts((prev) => prev.filter((d) => d !== dept));
                    setSelectedTechs((prev) =>
                      prev.filter((t) => t.department !== dept)
                    );
                  }
                },
                onTechsChange: (dept, newSelectionInDept) => {
                  const otherDeptsTechs = selectedTechs.filter(
                    (t) => t.department !== dept
                  );
                  setSelectedTechs([...otherDeptsTechs, ...newSelectionInDept]);
                },
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
                .filter(Boolean); // .filter(Boolean) เพื่อกรองค่า undefined ออก

              return (
                <Card key={job.id} className="dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="text-xl">{job.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteJob(job.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {job.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </CardDescription>
                  </CardHeader>

                  {/* ▼▼▼ เพิ่ม CardContent เข้ามาแสดงรายละเอียดทีม ▼▼▼ */}
                  <CardContent className="space-y-4 pt-0">
                    <Separator />
                    {/* --- ส่วนหัวหน้างาน --- */}
                    {lead && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">หัวหน้างาน</h4>
                        <div className="flex items-center gap-3 p-2 bg-secondary rounded-md">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={lead.avatarUrl} />
                            <AvatarFallback>{lead.fname[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {lead.fname} {lead.lname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lead.position}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* --- ส่วนทีมช่าง --- */}
                    {techs.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          ทีมช่าง ({techs.length} คน)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {techs.map((tech) => (
                            <div
                              key={tech.id}
                              className="flex items-center gap-3 p-2 bg-secondary rounded-md"
                            >
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={tech.avatarUrl} />
                                <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {tech.fname} {tech.lname}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {tech.position}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
