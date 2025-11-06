// src/components/admin/CreateJobForm.tsx (ฉบับแก้ไขที่ถูกต้อง)
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useJobs } from '@/contexts/JobContext';
import { DatePicker } from '@/components/common/DatePicker';
import { LeaderSelect } from './LeaderSelect';
import { isDateRangeOverlapping } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // 1. (สำคัญ!) Import useAuth
// (Import ข้อมูลจริงทั้งหมด)
import { leader as ALL_LEADERS } from '@/data/leader';
// (ลบ import 'departments' ที่ไม่ได้ใช้ออก)

// "ประเภทงาน" ที่ Admin จะเลือก (ตามที่คุณต้องการ)
const JOB_TYPES = [
  "ซ่อมบำรุง",
  "รื้อถอน",
  "ติดตั้งระบบ",
  "ตรวจสอบประจำปี",
  "อื่นๆ"
];

export function CreateJobForm({ onFinished }: { onFinished: () => void }) {
  const { jobs, addJob } = useJobs();
  const { user } = useAuth(); // 2. (สำคัญ!) ดึง "user จริง" ที่ล็อกอินอยู่
  // const { currentUser } = useAuth(); // (สมมติว่าได้ชื่อ Admin ที่ Login อยู่)

  // --- State ของฟอร์มทั้งหมด ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState(""); 
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerContactOther, setCustomerContactOther] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  // ▼▼▼ 1. (แก้ไข!) ลบ State 'department' ทิ้ง ▼▼▼
  // const [department, setDepartment] = useState<string>(""); 
  
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // --- "สมอง" กรองหัวหน้างาน (ฉบับเรียบง่าย) ---
  const availableLeads = useMemo(() => {
    // ▼▼▼ 2. (แก้ไข!) เอา 'department' ออกจากเงื่อนไข ▼▼▼
    // "กฎข้อที่ 1: ต้องเลือก 'วัน' ก่อน"
    if (!startDate || !endDate) {
      return [];
    }

    // "กฎข้อที่ 2: หาหัวหน้าที่ไม่ว่าง (เช็ควันซ้อน)"
    const busyLeadIds = new Set(
      jobs
        .filter(job => 
          isDateRangeOverlapping(startDate, endDate, job.startDate, job.endDate) && job.leadId
        )
        .map(job => job.leadId)
    );

    // "กฎข้อที่ 3: คืนค่าหัวหน้าที่ "ว่าง" (ไม่กรองแผนก)"
    return ALL_LEADERS
      // ▼▼▼ 3. (แก้ไข!) ลบ .filter(lead => lead.department === department) ทิ้ง ▼▼▼
      .filter(lead => !busyLeadIds.has(lead.id))
      .sort((a, b) => (a.jobsThisMonth || 0) - (b.jobsThisMonth || 0)); // เรียงตามงานน้อยไปมาก

  }, [startDate, endDate, jobs]); // <-- 4. (แก้ไข!) เอา 'department' ออกจาก dependencies

  // --- ฟังก์ชัน Submit ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ▼▼▼ 5. (แก้ไข!) เอา 'department' ออกจากเงื่อนไข validation ▼▼▼
    if (!startDate || !endDate || !selectedLeadId || !jobType || !title || !customerName) {
      alert("กรุณากรอกข้อมูล * (ที่มีดาว) ให้ครบถ้วน");
      return;
    }
    if (!user) {
      alert("เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้");
      return;
    }
    
    const adminName = user.fname;

    addJob({
      title, description, 
      jobType: jobType,
      customerName, customerPhone, customerContactOther,
      location: "(ข้อมูลจาก Map)",
      startDate, endDate,
      leadId: selectedLeadId, 
      imageUrl: "",
      otherFileUrl: "",
      assignedTechs: [],
      tasks: [],
      status: 'new',
      editHistory: [],
    }, adminName);

    onFinished();
  };

  return (
    <form onSubmit={handleSubmit}>
      <ScrollArea className="h-[70vh] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* --- คอลัมน์ซ้าย: รายละเอียดงาน --- */}
          <div className="space-y-4">
            <h4 className="font-semibold">1. รายละเอียดงาน</h4>
            <div><Label>หัวข้องาน*</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
            
            {/* Dropdown "ประเภทงาน" (จาก List ใหม่) */}
            <div><Label>ประเภทงาน*</Label>
              <Select onValueChange={setJobType} value={jobType}>
                <SelectTrigger><SelectValue placeholder="เลือกประเภทงาน..." /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* (ส่วนที่เหลือ... เหมือนเดิม) */}
            <div><Label>รายละเอียดงาน</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
            <div><Label>รูปภาพหน้างาน</Label><Input type="file" /></div>
            <div><Label>ไฟล์แนบ (PDF, .doc)</Label><Input type="file" /></div>
          </div>

          {/* --- คอลัมน์ขวา: ลูกค้าและทีม --- */}
          <div className="space-y-4">
            <h4 className="font-semibold">2. ข้อมูลลูกค้า</h4>
            {/* (ส่วนข้อมูลลูกค้า... เหมือนเดิม) */}
            <div><Label>ชื่อลูกค้า*</Label><Input value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
            <div><Label>เบอร์โทร*</Label><Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} /></div>
            <div><Label>ติดต่ออื่นๆ (Line, Email)</Label><Input value={customerContactOther} onChange={e => setCustomerContactOther(e.target.value)} /></div>
            <div className="h-40 bg-gray-100 rounded-md flex items-center justify-center">
              (พื้นที่สำหรับ Map ปักหมุด)
            </div>

            <h4 className="font-semibold pt-4">3. มอบหมายงาน</h4>
            {/* (ส่วนวันที่... เหมือนเดิม) */}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>วันเริ่มงาน*</Label><DatePicker date={startDate} setDate={setStartDate} /></div>
              <div><Label>วันจบงาน*</Label><DatePicker date={endDate} setDate={setEndDate} /></div>
            </div>
            
            <div>
              <Label>หัวหน้างาน* (จะแสดงเฉพาะคนที่ว่าง)</Label>
              <LeaderSelect
                leaders={availableLeads} 
                onSelect={setSelectedLeadId}
                // ▼▼▼ 6. (แก้ไข!) เอา 'department' ออกจาก 'disabled' ▼▼▼
                disabled={!startDate || !endDate} 
              />
              {/* ▼▼▼ 7. (แก้ไข!) เอา 'department' ออกจาก 'helper text' ▼▼▼ */}
              {(!startDate || !endDate) && (
                <p className="text-xs text-muted-foreground mt-1">กรุณาเลือกวันเริ่ม-จบงานก่อน</p>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="flex justify-end pt-6 border-t mt-4">
        <Button type="submit">สร้างใบงาน</Button>
      </div>
    </form>
  );
}