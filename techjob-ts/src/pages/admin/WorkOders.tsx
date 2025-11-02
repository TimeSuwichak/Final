"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { th } from "date-fns/locale";

// ฟังก์ชันโหลดข้อมูล (เหมือนกับใน Dashboard)
const loadDataFromStorage = () => {
  // [สำคัญ] ฟังก์ชันอ่านข้อมูลจาก LocalStorage
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

export default function WorkOrders() {
  const [allJobs, setAllJobs] = useState(loadDataFromStorage().jobs || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const jobTypes = useMemo(() => ["all", ...new Set(allJobs.map(job => job.jobType))], [allJobs]);
  
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const matchesSearch = job.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesType = typeFilter === 'all' || job.jobType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allJobs, searchTerm, statusFilter, typeFilter]);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">รายการใบงานทั้งหมด</h2>
      
      {/* --- ส่วน Filter และ Search --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input 
          placeholder="ค้นหาด้วยรหัสใบงาน (เช่น JOB-...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger><SelectValue placeholder="กรองตามสถานะ..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สถานะทั้งหมด</SelectItem>
            <SelectItem value="new">งานใหม่</SelectItem>
            <SelectItem value="in-progress">กำลังทำ</SelectItem>
            <SelectItem value="completed">เสร็จสิ้น</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger><SelectValue placeholder="กรองตามประเภท..." /></SelectTrigger>
          <SelectContent>
            {jobTypes.map(type => (
              <SelectItem key={type} value={type}>{type === 'all' ? 'ประเภททั้งหมด' : type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* --- ตารางแสดงผล --- */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสใบงาน</TableHead>
              <TableHead>ชื่องาน</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead>วันที่เริ่ม</TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.jobType}</TableCell>
                  <TableCell>{format(job.dates.start, "PPP", { locale: th })}</TableCell>
                  <TableCell><Badge>{job.status}</Badge></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  ไม่พบข้อมูลใบงาน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}