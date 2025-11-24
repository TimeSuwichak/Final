"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eraser, PenTool, Download } from "lucide-react";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (signatureData: string, signerName: string) => void;
  jobTitle: string;
  defaultSignerName?: string;
}

export function SignatureDialog({
  open,
  onOpenChange,
  onSubmit,
  jobTitle,
  defaultSignerName = "",
}: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [open]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setIsEmpty(false);

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y =
      "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleSubmit = () => {
    if (isEmpty) {
      alert("กรุณาเซ็นชื่อก่อนยืนยัน");
      return;
    }
    if (!signerName.trim()) {
      alert("กรุณากรอกชื่อผู้เซ็น");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL("image/png");
    onSubmit(signatureData, signerName.trim());

    clearCanvas();
    setSignerName("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    clearCanvas();
    setSignerName(defaultSignerName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">เซ็นรับทราบงาน</DialogTitle>
          <DialogDescription className="text-sm">{jobTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="signerName" className="text-sm font-semibold">
              ชื่อผู้เซ็นรับทราบ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="signerName"
              placeholder="กรอกชื่อผู้เซ็นรับทราบ..."
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                ลายเซ็น <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="gap-2"
              >
                <Eraser className="h-4 w-4" />
                ล้างลายเซ็น
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-64 cursor-crosshair touch-none"
                style={{ touchAction: "none" }}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              💡 วาดลายเซ็นด้วยเมาส์หรือนิ้วบนหน้าจอ
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Download className="h-4 w-4" />
            ยืนยันและดาวน์โหลด PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
