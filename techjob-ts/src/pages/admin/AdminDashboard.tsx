// src/pages/admin/AdminDashboard.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext'; // 1. (สำคัญ!) Import useAuth


import { CreateJobDialog } from '@/components/admin/CreateJobDialog';
import { JobTable } from '@/components/admin/JobTable';
import { EditJobDialog } from '@/components/admin/EditJobDialog';
import type { Job } from '@/types/index';

export default function AdminDashboard() {
  const { jobs } = useJobs();
  const { user } = useAuth(); // 2. (สำคัญ!) ดึง "user จริง" ที่ล็อกอินอยู่

  // (State ... เหมือนเดิม)
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("all");

  // --- 3. (สำคัญ!) รอให้ 'user' โหลดเสร็จก่อน ---
  if (!user) {
    return <div>Loading user data...</div>; // หรือ Spinner
  }
  
  // 4. (สำคัญ!) ใช้ "ชื่อจริง" (ไม่ใช่ "Admin Demo")
  const adminName = user.fname; 

  // --- Logic การกรองงาน (ตอนนี้จะทำงานถูกต้องแล้ว) ---
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. กรองตาม "โหมดการดู" (งานฉัน / ทั้งหมด)
      // (ตอนนี้ adminName จะเป็นชื่อจริง เช่น "AdminB")
      // (job.adminCreator จะเป็น "AdminA")
      // ("AdminA" !== "AdminB") -> true -> return false (กรองออก)
      if (viewMode === 'my-jobs' && job.adminCreator !== adminName) {
        return false;
      }
      
      // 2. กรองตาม "ประเภทงาน"
      if (filterType !== 'all' && job.jobType !== filterType) {
        return false;
      }
      
      // 3. กรองตาม "คำค้นหา"
      const term = searchTerm.toLowerCase();
      if (term && 
          !job.id.toLowerCase().includes(term) && 
          !job.title.toLowerCase().includes(term)
      ) {
        return false;
      }
      
      return true;
    });
  }, [jobs, searchTerm, filterType, viewMode, adminName]); // <-- 5. เพิ่ม adminName ใน dependencies

  // --- Handlers (เหมือนเดิม) ---
  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ระบบใบงาน</h2>
        <CreateJobDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      {/* --- ส่วนของระบบ Filter (เหมือนเดิม) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input 
          placeholder="ค้นหาชื่องาน, รหัสงาน..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger><SelectValue placeholder="เลือกประเภทงาน" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภทงาน</SelectItem>
            <SelectItem value="ซ่อมบำรุง">ซ่อมบำรุง</SelectItem>
            <SelectItem value="รื้อถอน">รื้อถอน</SelectItem>
            <SelectItem value="ติดตั้งระบบ">ติดตั้งระบบ</SelectItem>
            <SelectItem value="ตรวจสอบประจำปี">ตรวจสอบประจำปี</SelectItem>
            <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={val => val && setViewMode(val)} className="justify-start">
          <ToggleGroupItem value="all">งานทั้งหมด</ToggleGroupItem>
          <ToggleGroupItem value="my-jobs">งานของฉัน</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* --- ส่วนของตารางใบงาน (เหมือนเดิม) --- */}
      <JobTable jobs={filteredJobs} onViewJob={handleViewJob} />
      
      {/* --- Pop-up แก้ไข (เหมือนเดิม) --- */}
      <EditJobDialog 
        job={selectedJob} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
      />
    </div>
  );
}