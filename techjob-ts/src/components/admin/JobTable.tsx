// src/components/admin/JobTable.tsx
"use client";

import React from 'react';

import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import type { Job } from '@/types/index';

// "พิมพ์เขียว" สำหรับ props ที่จะรับเข้ามา
interface JobTableProps {
  jobs: Job[];
  onViewJob: (job: Job) => void; // ฟังก์ชันที่จะถูกเรียกเมื่อกดปุ่ม "ดู/แก้ไข"
}

// ฟังก์ชันสำหรับ "ย่อข้อความ"
const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

// ฟังก์ชันสำหรับ "เปลี่ยนสีสถานะ"
const getStatusBadge = (status: 'new' | 'in-progress' | 'done') => {
  switch (status) {
    case 'new':
      return <Badge variant="default">งานใหม่</Badge>;
    case 'in-progress':
      return <Badge variant="secondary">กำลังทำ</Badge>;
    case 'done':
      return <Badge variant="outline">เสร็จสิ้น</Badge>;
    default:
      return <Badge variant="destructive">ไม่ทราบสถานะ</Badge>;
  }
};

export function JobTable({ jobs, onViewJob }: JobTableProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสใบงาน</TableHead>
            <TableHead>ชื่องาน</TableHead>
            <TableHead>รายละเอียด (ย่อ)</TableHead>
            <TableHead>ผู้สร้าง</TableHead>
            <TableHead>ประเภท</TableHead>
            <TableHead>วันที่</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="w-[50px]">...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>{truncateText(job.title, 30)}</TableCell>
                <TableCell>{truncateText(job.description, 40)}</TableCell>
                <TableCell>{job.adminCreator}</TableCell>
                <TableCell>{job.jobType}</TableCell>
                <TableCell>
                  {format(job.startDate, "dd/MM/yy")} - {format(job.endDate, "dd/MM/yy")}
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onViewJob(job)}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                ไม่พบใบงาน
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}