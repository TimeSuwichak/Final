"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// กำหนด Type ของข้อมูล Job (เพื่อให้ TypeScript รู้จัก)
export type Job = {
  id: string;
  title: string;
  images: string[];
  jobType: string;
  status: string;
  // ... เพิ่ม properties อื่นๆ ตามโครงสร้างข้อมูล job ของคุณ
};

const getStatusBadge = (status: string, acknowledged: boolean) => {
  if (status === "completed") return <Badge variant="success">เสร็จสิ้น</Badge>;
  if (status === "in-progress" || (status === "new" && acknowledged))
    return <Badge variant="secondary">กำลังทำ</Badge>;
  if (status === "new" && !acknowledged)
    return <Badge variant="default">งานใหม่</Badge>;
  return <Badge variant="outline">{status}</Badge>;
};

export const columns: ColumnDef<Job>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "รหัสใบงาน",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "title",
    header: "ชื่องาน",
    cell: ({ row }) => {
        const job = row.original;
        return (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage src={job.images?.[0]} className="object-cover" />
                    <AvatarFallback className="rounded-md bg-secondary">
                        {job.title[0]}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold line-clamp-1">{job.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{job.description || "ไม่มีรายละเอียด"}</p>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "jobType",
    header: "ประเภทงาน",
  },
  {
    accessorKey: "status",
    header: "สถานะ",
    cell: ({ row }) => {
      const job = row.original;
      // เรายังคงใช้ฟังก์ชันเดิมในการแสดง Badge ได้
      return getStatusBadge(job.status, !!job.acknowledgedByLeader);
    },
    // ✨ [ใหม่] เพิ่มฟังก์ชันสำหรับกรอง ✨
    filterFn: (row, id, value) => {
      const status = row.original.status;
      const acknowledged = !!row.original.acknowledgedByLeader;

      if (value === "new") return status === "new" && !acknowledged;
      if (value === "in-progress")
        return (status === "new" && acknowledged) || status === "in-progress";
      return value === status;
    },
  },
  {
    accessorKey: "dates.start",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          วันที่เริ่ม
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      new Date(row.original.dates.start).toLocaleDateString("th-TH"),
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const job = row.original;
      const { meta } = table.options; // ดึงฟังก์ชันมาจาก meta
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.viewJob(job)}>
              ดูรายละเอียด/แก้ไข
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => meta?.deleteJob(job.id)}
            >
              ลบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
