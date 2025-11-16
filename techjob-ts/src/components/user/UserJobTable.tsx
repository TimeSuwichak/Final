// src/components/user/UserJobTable.tsx
"use client";

import React, { useState } from 'react';

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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Job } from '@/types/index';

interface UserJobTableProps {
  jobs: Job[];
  onViewJob: (job: Job) => void;
}

// (ฟังก์ชันนี้อาจจะย้ายไป /lib/utils ก็ได้ถ้าใช้บ่อย)
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

const ITEMS_PER_PAGE = 10;

export function UserJobTable({ jobs, onViewJob }: UserJobTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {currentJobs.length > 0 ? (
          currentJobs.map((job) => (
            <div key={job.id} className="rounded-md border bg-white dark:bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">รหัสใบงาน</span>
                <span className="font-semibold">{job.id}</span>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-sm text-muted-foreground">ชื่องาน</span>
                <p className="font-medium">{job.title}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">วันที่</span>
                <span className="text-sm">
                  {format(job.startDate, "dd/MM/yy")} - {format(job.endDate, "dd/MM/yy")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-muted-foreground">สถานะ</span>
                {getStatusBadge(job.status)}
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => onViewJob(job)}>
                  <Eye className="h-4 w-4 mr-2" />
                  ดูรายละเอียด
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border bg-white dark:bg-card p-8 text-center">
            <p className="text-muted-foreground">ไม่พบใบงาน</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border bg-white dark:bg-card overflow-hidden min-h-[485px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">รหัสใบงาน</TableHead>
                <TableHead className="min-w-[200px]">ชื่องาน</TableHead>
                <TableHead className="min-w-[140px]">วันที่</TableHead>
                <TableHead className="min-w-[100px]">สถานะ</TableHead>
                <TableHead className="w-[56px] text-center">ดู</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {currentJobs.length > 0 ? (
              currentJobs.map((job, index) => (
                <TableRow key={job.id} className="[&>td]:border-b [&>td]:border-gray-200 ">
                  <TableCell className="font-medium">{job.id}</TableCell>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>
                    {format(job.startDate, "dd/MM/yy")} - {format(job.endDate, "dd/MM/yy")}
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Button variant="ghost" size="icon" onClick={() => onViewJob(job)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-b border-gray-200">
                <TableCell colSpan={5} className="h-24 text-center">
                  ไม่พบใบงาน
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </div>
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
