// src/components/admin/JobTable.tsx (ฉบับแก้ไข asChild)
"use client";

import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";
import type { Job } from "@/types/index";

// (Props ใหม่ ที่ "ทีวี" รู้จัก)
interface JobTableProps {
  jobs: Job[];
  onViewDetails: (job: Job) => void;
  onEditJob: (job: Job) => void;
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
};
const getStatusBadge = (status: "new" | "in-progress" | "done") => {
  switch (status) {
    case "new":
      return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">งานใหม่</Badge>;
    case "in-progress":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">กำลังทำ</Badge>;
    case "done":
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">เสร็จแล้ว</Badge>;
    default:
      return <Badge variant="destructive">ไม่ทราบสถานะ</Badge>;
  }
};

export function JobTable({ jobs, onViewDetails, onEditJob }: JobTableProps) {
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
                  {format(job.startDate, "dd/MM/yy")} -{" "}
                  {format(job.endDate, "dd/MM/yy")}
                </TableCell>
                <TableCell>
                  {getStatusBadge(job.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {/* ตอนนี้โค้ดส่วนนี้จะทำงานได้ถูกต้องแล้ว */}
                      <DropdownMenuItem onClick={() => onViewDetails(job)}>
                        ดูรายละเอียด
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditJob(job)}>
                        แก้ไข
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
