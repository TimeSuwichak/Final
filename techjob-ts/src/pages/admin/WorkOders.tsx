"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { JobTable } from "@/components/admin/JobTable";
import type { Job } from "@/types/index";
import { useNavigate } from "react-router-dom";

export default function WorkOders() {
  const navigate = useNavigate()
  const { jobs, updateJobWithActivity } = useJobs()
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("all");
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in-progress' | 'done'>('all');

  const adminName = user ? user.fname : ""

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (viewMode === "my-jobs" && job.adminCreator !== adminName) return false;
      if (filterType !== "all" && job.jobType !== filterType) return false;
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      const term = searchTerm.toLowerCase();
      if (term && !job.id.toLowerCase().includes(term) && !job.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [jobs, searchTerm, filterType, viewMode, adminName, statusFilter]);

  const handleViewDetails = (job: Job) => {
    navigate(`/admin/job/${job.id}`)
  };

  const handleEditJob = (job: Job) => {
    navigate(`/admin/job/${job.id}/edit`)
  }

  if (!user) {
    return <div>Loading user data...</div>
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        
        <Button onClick={() => navigate("/admin/create-job")}>+ สร้างใบงานใหม่</Button>
      </div>

      {/* (ส่วน Filter ... เหมือนเดิม) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="ค้นหาชื่องาน, รหัสงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-white"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="bg-white">
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
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-44 bg-white ">
              <SelectValue placeholder="สถานะทั้งหมด"  />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">สถานะงานทั้งหมด</SelectItem>
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
          <ToggleGroupItem
            value="all"
            className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white rounded-l-md rounded-r-none border border-r-0 
                     hover:bg-gray-50 dark:hover:bg-[#2d2d2d] 
                     data-[state=on]:bg-primary data-[state=on]:text-white
                     dark:data-[state=on]:bg-[#5f5aff] dark:data-[state=on]:text-white
                     transition-colors"

          >
            งานทั้งหมด
          </ToggleGroupItem>

          <ToggleGroupItem
            value="my-jobs"
            className="bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white rounded-r-md rounded-l-none border 
                     hover:bg-gray-50 dark:hover:bg-[#2d2d2d]
                     data-[state=on]:bg-primary data-[state=on]:text-white
                     dark:data-[state=on]:bg-[#5f5aff] dark:data-[state=on]:text-white
                     transition-colors"
          >
            งานของฉัน
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      

      {/* (ส่ง "ฟังก์ชันใหม่" (Props) ไปให้ "รีโมต") */}
      <JobTable jobs={filteredJobs} onViewDetails={handleViewDetails} onEditJob={handleEditJob} />
    </div>
  )
}
