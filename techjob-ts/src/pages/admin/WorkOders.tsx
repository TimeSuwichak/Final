// src/pages/admin/WorkOrders.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { CreateJobDialog } from "@/components/admin/CreateJobDialog";
import { JobTable } from "@/components/admin/JobTable";
import { EditJobDialog } from "@/components/admin/EditJobDialog";
import type { Job } from "@/types/index";

import { Label } from "@/components/ui/label";


export default function WorkOders() {
  const { jobs } = useJobs();
  const { user } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("all");
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | null>(null);

  if (!user) {
    return <div>Loading user data...</div>;
  }
  const adminName = user.fname;

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (viewMode === "my-jobs" && job.adminCreator !== adminName) return false;
      if (filterType !== "all" && job.jobType !== filterType) return false;
      const term = searchTerm.toLowerCase();
      if (term && !job.id.toLowerCase().includes(term) && !job.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [jobs, searchTerm, filterType, viewMode, adminName]);

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setDialogMode("view");
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setDialogMode("edit");
  };

  const handleCloseDialog = () => {
    setSelectedJob(null);
    setDialogMode(null);
  };

  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in-progress' | 'done'>('all');

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ระบบใบงาน</h2>
        <CreateJobDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      </div>

      {/* (ส่วน Filter ... เหมือนเดิม) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="ค้นหาชื่องาน, รหัสงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกประเภทงาน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภทงาน</SelectItem>
            <SelectItem value="ซ่อมบำรุง">ซ่อมบำรุง</SelectItem>
            <SelectItem value="รื้อถอน">รื้อถอน</SelectItem>
            <SelectItem value="ติดตั้งระบบ">ติดตั้งระบบ</SelectItem>
            <SelectItem value="ตรวจสอบประจำปี">ตรวจสอบประจำปี</SelectItem>
            <SelectItem value="อื่นๆ">อื่นๆ</SelectItem>
          </SelectContent>
        </Select>

        {/* Status filter */}
        <div className="">
          <Label>กรองตามสถานะ</Label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="สถานะทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="new">งานใหม่</SelectItem>
              <SelectItem value="in-progress">กำลังทำ</SelectItem>
              <SelectItem value="done">เสร็จแล้ว</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(val) => val && setViewMode(val)}
          className="justify-start"
        >
          <ToggleGroupItem value="all">งานทั้งหมด</ToggleGroupItem>
          <ToggleGroupItem value="my-jobs">งานของฉัน</ToggleGroupItem>
        </ToggleGroup>



      </div>



      {/* (ส่ง "ฟังก์ชันใหม่" (Props) ไปให้ "รีโมต") */}
      <JobTable
        jobs={filteredJobs}
        onViewDetails={handleViewDetails}
        onEditJob={handleEditJob}
      />

      <EditJobDialog
        job={selectedJob}
        open={dialogMode !== null}
        mode={dialogMode}
        onModeChange={setDialogMode}
        onOpenChange={(open) => { // <--- ✨ แก้ไขเป็น onOpenChange ✨
          // ถ้า `open` เป็น `false` (หมายถึงมีการพยายามจะปิด Dialog)
          if (!open) {
            handleCloseDialog(); // ให้เรียกฟังก์ชันปิดของเรา
          }
        }}
      />
    </div>
  );
}