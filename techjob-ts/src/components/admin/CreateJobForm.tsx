// src/components/admin/CreateJobForm.tsx (ฉบับแก้ไข)
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useJobs } from "@/contexts/JobContext";
import { DatePicker } from "@/components/common/DatePicker";
import { LeaderSelect } from "./LeaderSelect"; // (สำคัญ)
import { isDateRangeOverlapping } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { leader as ALL_LEADERS } from "@/data/leader";
import { AdminMap } from "./AdminMap";

// "ประเภทงาน" ที่ Admin จะเลือก
const JOB_TYPES = [
  "ซ่อมบำรุง",
  "รื้อถอน",
  "ติดตั้งระบบ",
  "ตรวจสอบประจำปี",
  "อื่นๆ",
];

export function CreateJobForm({ onFinished }: { onFinished: () => void }) {
  const { jobs, addJob } = useJobs();
  const { user } = useAuth(); // --- State ของฟอร์มทั้งหมด ---

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerContactOther, setCustomerContactOther] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null); // --- "สมอง" กรองหัวหน้างาน ---
  const [location, setLocation] = useState("");
  const [mapPosition, setMapPosition] = useState<
    [number, number] | undefined
  >();

  const availableLeads = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }
    const busyLeadIds = new Set(
      jobs
        .filter(
          (job) =>
            isDateRangeOverlapping(
              startDate,
              endDate,
              job.startDate,
              job.endDate
            ) && job.leadId
        )
        .map((job) => String(job.leadId)) // (ปรับเป็น String เพื่อความปลอดภัย)
    );
    return ALL_LEADERS.filter((lead) => !busyLeadIds.has(String(lead.id))) // (ปรับเป็น String เพื่อความปลอดภัย)
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0));
  }, [startDate, endDate, jobs]); // --- ฟังก์ชัน Submit ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ▼▼▼ [แก้ไขข้อ 2] ตรวจสอบเฉพาะฟิลด์ที่บังคับจริงๆ (ที่มี *) ▼▼▼
    if (
      !startDate ||
      !endDate ||
      !selectedLeadId ||
      !jobType ||
      !title ||
      !customerName
    ) {
      alert("กรุณากรอกข้อมูล * (ที่มีดาว) ให้ครบถ้วน");
      return;
    }
    if (!user) {
      alert("เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้");
      return;
    }
    const adminName = user.fname;

    // ▼▼▼ [แก้ไขข้อ 2] หากฟิลด์ไม่บังคับ (เช่น description, phone) เป็นค่าว่าง ให้ใส่ "ไม่มีข้อมูล" ▼▼▼
    addJob(
      {
        title,
        description: description || "ไม่มีข้อมูล",
        jobType: jobType,
        customerName,
        customerPhone: customerPhone || "ไม่มีข้อมูล",
        customerContactOther: customerContactOther || "ไม่มีข้อมูล",
        location: location || "ไม่ได้ระบุสถานที่", // ใช้ค่า location จาก state
        latitude: mapPosition?.[0], // บันทึก latitude
        longitude: mapPosition?.[1], // บันทึก longitude
        startDate,
        endDate,
        leadId: Number(selectedLeadId), // (แปลง ID กลับเป็น Number ตอนส่ง)
        imageUrl: "",
        otherFileUrl: "",
        assignedTechs: [],
        tasks: [],
        status: "new",
      },
      adminName
    );

    onFinished();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <ScrollArea className="flex-1 h-full p-4 overflow-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-6 ">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
              <CardDescription>
                กรอกหัวข้องานและประเภทงานที่ต้องการ
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label className="mb-1 block text-sm font-medium">
                  หัวข้องาน*
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ติดตั้งระบบ Network"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  ประเภทงาน*
                </Label>
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
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  รูปภาพหน้างาน{" "}
                  <span className="text-xs text-muted-foreground">(ถ้ามี)</span>
                </Label>
                <Input type="file" accept="image/*" />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  ไฟล์แนบ (PDF, DOC){" "}
                  <span className="text-xs text-muted-foreground">(ถ้ามี)</span>
                </Label>
                <Input type="file" accept=".pdf,.doc,.docx" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>กำหนดการและการมอบหมาย</CardTitle>
              <CardDescription>
                ระบุช่วงเวลางานและเลือกหัวหน้างานที่พร้อมดูแล
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  วันเริ่มงาน*
                </Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  วันจบงาน*
                </Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label className="text-sm font-medium">
                  หัวหน้างาน*{" "}
                  <span className="text-xs text-muted-foreground">
                    (จะแสดงเฉพาะคนที่ว่าง)
                  </span>
                </Label>
                <LeaderSelect
                  leaders={availableLeads}
                  selectedValue={selectedLeadId}
                  onValueChange={setSelectedLeadId}
                  disabled={!startDate || !endDate}
                />
                {(!startDate || !endDate) && (
                  <p className="text-xs text-muted-foreground">
                    กรุณาเลือกช่วงเวลางานก่อนเพื่อดูหัวหน้างานที่ว่าง
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลลูกค้า</CardTitle>
              <CardDescription>
                ระบุรายละเอียดการติดต่อของลูกค้า
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label className="mb-1 block text-sm font-medium">
                  ชื่อลูกค้า*
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="เช่น บริษัท ABC จำกัด"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  เบอร์โทร
                </Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="081-234-5678"
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">
                  ช่องทางติดต่ออื่น (Line, Email)
                </Label>
                <Input
                  value={customerContactOther}
                  onChange={(e) => setCustomerContactOther(e.target.value)}
                  placeholder="line: example หรือ email@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <AdminMap
                  initialAddress={location}
                  initialPosition={mapPosition}
                  onAddressChange={setLocation}
                  onPositionChange={setMapPosition}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดงาน</CardTitle>
              <CardDescription>
                ใส่รายละเอียดงานเพิ่มเติมเพื่อให้ทีมเข้าใจตรงกัน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียด, เงื่อนไข, หมายเหตุ หรือสิ่งที่ต้องเตรียม..."
                className="min-h-[160px]"
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <div className="mx-auto flex w-full max-w-4xl justify-end">
          <Button type="submit" size="lg">
            สร้างใบงาน
          </Button>
        </div>
      </div>
    </form>
  );
}
