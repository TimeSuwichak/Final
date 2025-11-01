"use client";

// --- 1. IMPORTS ---
import React, { useState, useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { X, Calendar as CalendarIcon, Trash2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
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
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- UTILS & DATA ---
import { cn, isDateRangeOverlapping } from "@/lib/utils";
import { user as initialUsers } from "@/data/user";
import { leader as initialLeaders } from "@/data/leader";

// --- DATA ตั้งต้น ---
const initialJobs = [
  {
    id: "JOB-001",
    title: "ซ่อมหลังคารั่วซึม อาคาร C",
    description: "ซ่อมแซมหลังคาบริเวณดาดฟ้าอาคาร C",
    status: "in-progress", // เปลี่ยนเป็นกำลังทำ
    dates: {
      start: new Date("2025-10-20T00:00:00"),
      end: new Date("2025-10-22T00:00:00"),
    },
    assignment: {
      department: "แผนกโครงสร้างพื้นฐานและไฟฟ้า",
      leadId: 3,
      techIds: [1, 2], // มอบหมายให้ช่าง ID 1 และ 2
    },
  },
  {
    id: "JOB-002",
    title: "ติดตั้งระบบ Network ใหม่ชั้น 5",
    description: "เดินสาย LAN และติดตั้ง Access Point ใหม่ทั้งหมด",
    status: "new",
    dates: {
      start: new Date("2025-10-25T00:00:00"),
      end: new Date("2025-10-27T00:00:00"),
    },
    assignment: {
      department: "แผนกระบบเครือข่ายและความปลอดภัย",
      leadId: 11,
      techIds: [1, 5], // มอบหมายให้ช่าง ID 1 และ 5
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
// SUB-COMPONENT: ปฏิทินเลือกวัน (Calendar)
// ====================================================================
const DatePicker = ({
  date,
  setDate,
}: {
  date?: Date;
  setDate: (date?: Date) => void;
}) => {
  return (
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
        />
      </PopoverContent>
    </Popover>
  );
};

// ====================================================================
// SUB-COMPONENT: ตัวเลือกหัวหน้า (LeaderSelect)
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
          placeholder={
            disabled ? "กรุณากรอกข้อมูลให้ครบ" : "เลือกหัวหน้างาน..."
          }
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

// ====================================================================
// ✨ SUB-COMPONENT: ตัวเลือกทีมช่าง (TechSelect) - ฉบับแก้ไขให้ลื่นไหล
// ====================================================================
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
      {/* ✨ 1. ย้ายฟิลเตอร์ออกมาข้างนอก ✨ */}
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
          <div className="flex flex-wrap gap-1">
            {selectedTechs.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between w-full p-2 bg-secondary rounded-md"
              >
                {/* ส่วนแสดงข้อมูล: รูป, ชื่อ, ตำแหน่ง */}
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
                {/* ส่วนปุ่มลบ (X) */}
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
                disabled ? "กรุณากรอกข้อมูลให้ครบ" : "เลือกทีมช่าง..."
              }
              disabled={disabled}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
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
                          // ✨ 2. แก้ไข Logic การเลือก ให้ Dropdown "ไม่หายไป" ✨
                          onSelect={() => {
                            setInputValue("");
                            onSelectionChange([...selectedTechs, tech]);
                            inputRef.current?.focus(); // ทำให้ cursor กลับไปที่ช่องค้นหา
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
// SUB-COMPONENT: ฟอร์มสร้างงาน (CreateJobForm) - ฉบับ UI เท่านั้น
// ====================================================================
const CreateJobForm = ({ formState, formSetters, data, handlers }) => {
  const allDepartments = useMemo(
    () => [...new Set(data.allLeaders.map((l) => l.department))],
    [data.allLeaders]
  );

  return (
    <form onSubmit={handlers.onSubmit}>
      <ScrollArea className="h-[70vh] p-4">
        <div className="space-y-6">
          <Separator />
          {/* --- รายละเอียดงาน & ลูกค้า --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>ชื่องาน*</Label>
              <Input
                value={formState.title}
                onChange={(e) => formSetters.setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>รายละเอียด</Label>
              <Textarea
                value={formState.description}
                onChange={(e) => formSetters.setDescription(e.target.value)}
              />
            </div>
          </div>
          <Separator />
          {/* --- วันที่ & แผนก --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
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
              <Label>แผนก*</Label>
              <Select
                value={formState.department}
                onValueChange={handlers.onDeptChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกแผนก..." />
                </SelectTrigger>
                <SelectContent>
                  {allDepartments.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          {/* --- ทีม --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>หัวหน้างาน*</Label>
              <LeaderSelect
                leaders={data.availableLeads}
                selectedLead={formState.selectedLead}
                onSelect={formSetters.setSelectedLead}
                disabled={
                  !formState.department ||
                  !formState.startDate ||
                  !formState.endDate
                }
              />
            </div>
            <div className="space-y-2">
              <Label>ทีมช่าง*</Label>
              <TechSelect
                technicians={data.availableTechs}
                selectedTechs={formState.selectedTechs}
                onSelectionChange={formSetters.setSelectedTechs}
                disabled={
                  !formState.department ||
                  !formState.startDate ||
                  !formState.endDate
                }
              />
            </div>
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
// COMPONENT หลัก: DASHBOARD (ศูนย์บัญชาการ)
// ====================================================================
export default function AdminDashboardPage() {
  // --- STATE หลักของแอป ---
  const [appData, setAppData] = useState(loadDataFromStorage);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // --- STATE ทั้งหมดของฟอร์ม ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [department, setDepartment] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedTechs, setSelectedTechs] = useState([]);

  // --- บันทึกข้อมูล ---
  useEffect(() => {
    localStorage.setItem("techJobData", JSON.stringify(appData));
  }, [appData]);

  // --- LOGIC การกรองและเรียงลำดับ ---
  const availableLeads = useMemo(() => {
    if (!department || !startDate || !endDate) return [];
    return appData.leaders
      .filter((leader) => {
        if (leader.department !== department) return false;
        const isBusy = appData.jobs.some(
          (job) =>
            job.assignment.leadId === leader.id &&
            isDateRangeOverlapping(
              startDate,
              endDate,
              job.dates.start,
              job.dates.end
            )
        );
        return !isBusy;
      })
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
  }, [department, startDate, endDate, appData.leaders, appData.jobs]);

  const availableTechs = useMemo(() => {
    if (!department || !startDate || !endDate) return [];
    return appData.users
      .filter((user) => {
        if (user.department !== department) return false;
        const isBusy = appData.jobs.some(
          (job) =>
            job.assignment.techIds.includes(user.id) &&
            isDateRangeOverlapping(
              startDate,
              endDate,
              job.dates.start,
              job.dates.end
            )
        );
        return !isBusy;
      })
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
  }, [department, startDate, endDate, appData.users, appData.jobs]);

  // --- ฟังก์ชัน Reset ฟอร์ม ---
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartDate(undefined);
    setEndDate(undefined);
    setDepartment("");
    setSelectedLead(null);
    setSelectedTechs([]);
  };

  // --- ฟังก์ชันจัดการฟอร์ม ---
  const handleCreateJob = (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !title ||
      !department ||
      !startDate ||
      !endDate ||
      !selectedLead ||
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
        department,
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
                department,
                selectedLead,
                selectedTechs,
              }}
              formSetters={{
                setTitle,
                setDescription,
                setStartDate,
                setEndDate,
                setSelectedLead,
                setSelectedTechs,
              }}
              data={{
                allLeaders: appData.leaders,
                availableLeads,
                availableTechs,
              }}
              handlers={{
                onSubmit: handleCreateJob,
                onDeptChange: (value) => {
                  setDepartment(value);
                  setSelectedLead(null);
                  setSelectedTechs([]);
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
            .map((job) => (
              <Card key={job.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{job.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardTitle>
                  <CardDescription>{job.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
