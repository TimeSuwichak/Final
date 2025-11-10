// src/components/leader/LeaderJobTable.tsx
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
import { Eye } from 'lucide-react';
import type { Job } from '@/types/index';

interface LeaderJobTableProps {
  jobs: Job[];
  onViewJob: (job: Job) => void;
}

const getStatusBadge = (status: 'new' | 'in-progress' | 'done') => {
  switch (status) {
    case 'new':
      return <Badge variant="default">รอรับงาน</Badge>;
    case 'in-progress':
      return <Badge variant="secondary">กำลังทำ</Badge>;
    case 'done':
      return <Badge variant="outline">เสร็จสิ้น</Badge>;
    default:
      return <Badge variant="destructive">ไม่ทราบสถานะ</Badge>;
  }
};

export function LeaderJobTable({ jobs, onViewJob }: LeaderJobTableProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสใบงาน</TableHead>
            <TableHead>ชื่องาน</TableHead>
            <TableHead>วันที่</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="w-[50px]">ดู</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>{job.title}</TableCell>
                <TableCell>
                  {format(job.startDate, "dd/MM/yy")} - {format(job.endDate, "dd/MM/yy")}
                </TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onViewJob(job)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                ไม่พบใบงาน
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}