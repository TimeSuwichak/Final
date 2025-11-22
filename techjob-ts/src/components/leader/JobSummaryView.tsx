"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Phone,
  Package,
  ImageIcon,
} from "lucide-react";
import type { Job } from "@/types/index";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { generateCompletionReportPdf } from "@/utils/jobReport";

interface JobSummaryViewProps {
  job: Job;
}

export function JobSummaryView({ job }: JobSummaryViewProps) {
  const handleDownloadReport = () => {
    generateCompletionReportPdf(job);
  };

  // Calculate total materials used
  const allMaterials = job.tasks.flatMap((task) => task.materials || []);

  return (
    <div className="space-y-4">
      {/* Completion Status Card */}
      <Card className="border-green-200 bg-green-50/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              งานเสร็จสิ้นแล้ว
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลดรายงาน PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ปิดงานโดย</p>
              <p className="font-medium">{job.leaderCloser || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">วันที่ปิดงาน</p>
              <p className="font-medium">
                {job.completedAt
                  ? format(job.completedAt, "dd MMM yyyy HH:mm", { locale: th })
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            ข้อมูลงาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">รหัสงาน</p>
              <p className="font-medium">{job.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ประเภทงาน</p>
              <Badge variant="outline" className="text-xs">
                {job.jobType}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">ชื่องาน</p>
            <p className="font-medium">{job.title}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">รายละเอียด</p>
            <p className="text-muted-foreground">{job.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                ลูกค้า
              </p>
              <p className="font-medium">{job.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                เบอร์โทร
              </p>
              <p className="font-medium">{job.customerPhone}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              สถานที่
            </p>
            <p className="text-muted-foreground">{job.location}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                วันที่ทำงาน
              </p>
              <p className="font-medium">
                {format(job.startDate, "dd/MM/yyyy", { locale: th })} -{" "}
                {format(job.endDate, "dd/MM/yyyy", { locale: th })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">สร้างโดย</p>
              <p className="font-medium">{job.adminCreator}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">สรุปผลการทำงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {job.completionSummary || "-"}
          </p>
        </CardContent>
      </Card>

      {/* Issues Found */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">ปัญหาที่พบระหว่างการทำงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {job.completionIssues || "ไม่มี"}
          </p>

          {job.completionIssueImage && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                หลักฐานรูปภาพ
              </p>
              <div className="rounded-md border overflow-hidden max-h-60 bg-white">
                <img
                  src={job.completionIssueImage}
                  alt="หลักฐาน"
                  className="w-full object-contain max-h-60 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() =>
                    window.open(job.completionIssueImage, "_blank")
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials Used */}
      {allMaterials.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              วัสดุที่ใช้ ({allMaterials.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allMaterials.map((material, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm"
                >
                  <span>{material.materialName || material.materialId}</span>
                  <span className="text-muted-foreground">
                    {material.quantity} {material.unit || ""}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">สรุปงานย่อย</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {job.tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm"
              >
                <span>
                  {index + 1}. {task.title}
                </span>
                <Badge
                  variant="outline"
                  className={
                    task.status === "completed"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : task.status === "in-progress"
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }
                >
                  {task.status === "completed"
                    ? "เสร็จสิ้น"
                    : task.status === "in-progress"
                    ? "กำลังทำ"
                    : "รอดำเนินการ"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
