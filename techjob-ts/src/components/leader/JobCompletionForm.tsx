"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Camera, FileText, X, Upload } from "lucide-react";
import type { Job } from "@/types/index";
import { showWarning } from "@/lib/sweetalert";

interface JobCompletionFormProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    summary: string;
    issues: string;
    issueImage: string | null;
    pdfFile: string | null;
  }) => void;
}

export function JobCompletionForm({
  job,
  open,
  onOpenChange,
  onSubmit,
}: JobCompletionFormProps) {
  const [summary, setSummary] = useState("");
  const [issues, setIssues] = useState("");
  const [issueImage, setIssueImage] = useState<string | null>(null);
  const [issueImageName, setIssueImageName] = useState("");
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setIssueImage(null);
      setIssueImageName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setIssueImage(reader.result as string);
      setIssueImageName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPdfFile(null);
      setPdfFileName("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPdfFile(reader.result as string);
      setPdfFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitClick = () => {
    if (!summary.trim()) {
      showWarning("กรุณากรอกสรุปผลการทำงาน");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    onSubmit({
      summary: summary.trim(),
      issues: issues.trim(),
      issueImage,
      pdfFile,
    });
    setConfirmDialogOpen(false);
    onOpenChange(false);
    // Reset form
    setSummary("");
    setIssues("");
    setIssueImage(null);
    setIssueImageName("");
    setPdfFile(null);
    setPdfFileName("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg">สรุปและปิดงาน</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {job.title} ({job.id})
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-sm font-semibold">
                สรุปผลการทำงาน <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="summary"
                placeholder="กรอกสรุปผลการทำงาน..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={5}
                className="resize-none bg-white border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Issues */}
            <div className="space-y-2">
              <Label htmlFor="issues" className="text-sm font-semibold">
                ปัญหาที่พบระหว่างการทำงาน
              </Label>
              <Textarea
                id="issues"
                placeholder="กรอกปัญหาที่พบ (ถ้ามี)..."
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                rows={4}
                className="resize-none bg-white border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">แนบหลักฐานรูปภาพ</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  className="gap-2"
                >
                  <Camera className="h-4 w-4" />
                  เลือกรูปภาพ
                </Button>
                {issueImageName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {issueImageName}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIssueImage(null);
                        setIssueImageName("");
                        if (imageInputRef.current) {
                          imageInputRef.current.value = "";
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {issueImage && (
                <div className="mt-2 rounded-md border overflow-hidden max-h-48">
                  <img
                    src={issueImage}
                    alt="Preview"
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                แนบไฟล์ PDF เพิ่มเติม
              </Label>
              <div className="flex items-center gap-2">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pdfInputRef.current?.click()}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  เลือกไฟล์ PDF
                </Button>
                {pdfFileName && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground truncate max-w-[200px]">
                      {pdfFileName}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPdfFile(null);
                        setPdfFileName("");
                        if (pdfInputRef.current) {
                          pdfInputRef.current.value = "";
                        }
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmitClick}
              className="bg-green-600 hover:bg-green-700"
            >
              ปิดงาน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการปิดงาน</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการปิดงาน "{job.title}" ใช่หรือไม่?
              <br />
              <br />
              เมื่อปิดงานแล้ว จะไม่สามารถแก้ไขข้อมูลได้อีก
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubmit}
              className="bg-green-600 hover:bg-green-700"
            >
              ยืนยันปิดงาน
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
