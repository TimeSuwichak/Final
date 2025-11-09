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
import { useJobs } from "@/contexts/JobContext";
import { DatePicker } from "@/components/common/DatePicker";
import { LeaderSelect } from "./LeaderSelect"; // (สำคัญ)
import { isDateRangeOverlapping } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { leader as ALL_LEADERS } from "@/data/leader";

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
        location: "(ข้อมูลจาก Map)",
        startDate,
        endDate,
        leadId: Number(selectedLeadId), // (แปลง ID กลับเป็น Number ตอนส่ง)
        imageUrl: "",
        otherFileUrl: "",
        assignedTechs: [],
        tasks: [],
        status: "new",
        editHistory: [],
      },
      adminName
    );

    onFinished();
  };

  return (
    <form onSubmit={handleSubmit}>
           {" "}
      <ScrollArea className="h-[70vh] p-4">
               {" "}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* --- คอลัมน์ซ้าย: รายละเอียดงาน --- */}       
           {" "}
          <div className="space-y-4">
                        <h4 className="font-semibold">1. รายละเอียดงาน</h4>     
                 {" "}
            <div>
              <Label>หัวข้องาน*</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
                                   {" "}
            <div>
              <Label>ประเภทงาน*</Label>             {" "}
              <Select onValueChange={setJobType} value={jobType}>
                               {" "}
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทงาน..." />
                </SelectTrigger>
                               {" "}
                <SelectContent>
                                   {" "}
                  {JOB_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                                            {type}                   {" "}
                    </SelectItem>
                  ))}
                                 {" "}
                </SelectContent>
                             {" "}
              </Select>
                         {" "}
            </div>
                       {" "}
            <div>
              <Label>รายละเอียดงาน</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
                       {" "}
            <div>
              <Label>รูปภาพหน้างาน</Label>
              <Input type="file" />
            </div>
                       {" "}
            <div>
              <Label>ไฟล์แนบ (PDF, .doc)</Label>
              <Input type="file" />
            </div>
                     {" "}
          </div>
                    {/* --- คอลัมน์ขวา: ลูกค้าและทีม --- */}         {" "}
          <div className="space-y-4">
                        <h4 className="font-semibold">2. ข้อมูลลูกค้า</h4>     
                 {" "}
            <div>
              <Label>ชื่อลูกค้า*</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            {/* ▼▼▼ [แก้ไขข้อ 2] ลบ * ออกจาก "เบอร์โทร" เพราะไม่บังคับ ▼▼▼ */} 
                     {" "}
            <div>
              <Label>เบอร์โทร</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
                       
            <div>
              <Label>ติดต่ออื่นๆ (Line, Email)</Label>
              <Input
                value={customerContactOther}
                onChange={(e) => setCustomerContactOther(e.target.value)}
              />
            </div>
                       {" "}
            <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
                            (พื้นที่สำหรับ Map ปักหมุด)            {" "}
            </div>
                        <h4 className="font-semibold pt-4">3. มอบหมายงาน</h4>   
                   {" "}
            <div className="grid grid-cols-2 gap-4">
                           {" "}
              <div>
                <Label>วันเริ่มงาน*</Label>
                <DatePicker date={startDate} setDate={setStartDate} />
              </div>
                           {" "}
              <div>
                <Label>วันจบงาน*</Label>
                <DatePicker date={endDate} setDate={setEndDate} />
              </div>
                         {" "}
            </div>
                                   {" "}
            <div>
                            <Label>หัวหน้างาน* (จะแสดงเฉพาะคนที่ว่าง)</Label>   
                       
              {/* ▼▼▼ [แก้ไขข้อ 1] เปลี่ยน props จาก onSelect เป็น selectedValue และ onValueChange ▼▼▼ */}
              <LeaderSelect
                leaders={availableLeads}
                selectedValue={selectedLeadId}
                onValueChange={setSelectedLeadId}
                disabled={!startDate || !endDate}
              />
                           {" "}
              {(!startDate || !endDate) && (
                <p className="text-xs text-muted-foreground mt-1">
                  กรุณาเลือกวันเริ่ม-จบงานก่อน
                </p>
              )}
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </ScrollArea>
           {" "}
      <div className="flex justify-end pt-6 border-t mt-4">
                <Button type="submit">สร้างใบงาน</Button>     {" "}
      </div>
         {" "}
    </form>
  );
}
