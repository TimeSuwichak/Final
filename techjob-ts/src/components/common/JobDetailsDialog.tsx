// src/components/JobDetailsDialog.jsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button"; // เพิ่ม Button
import { DialogFooter } from "@/components/ui/dialog"; // เพิ่ม DialogFooter

export const JobDetailsDialog = ({
  job,
  lead,
  techs,
  isOpen,
  onClose,
  onEdit,
  currentUser,
}) => {
  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{job.title}</DialogTitle>
          <DialogDescription>
            {job.description || "ไม่มีรายละเอียดเพิ่มเติม"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[70vh] p-4">
          <div className="space-y-6">
            {/* --- ข้อมูลลูกค้า --- */}
            <div className="space-y-2">
              <h3 className="font-semibold">ข้อมูลลูกค้า</h3>
              <Separator />
              <div className="text-sm text-muted-foreground pt-2">
                <p>
                  <strong>ชื่อ:</strong> {job.client?.name || "ไม่มีข้อมูล"}
                </p>
                <p>
                  <strong>เบอร์โทร:</strong> {job.client?.phone || "ไม่มีข้อมูล"}
                </p>
                {job.client?.contact && (
                  <p>
                    <strong>ติดต่ออื่น:</strong> {job.client.contact || "ไม่มีข้อมูล"}
                  </p>
                )}
              </div>
            </div>

            {/* --- สถานที่ --- */}
            <div className="space-y-2">
              <h3 className="font-semibold">สถานที่ปฏิบัติงาน</h3>
              <Separator />
              <div className="text-sm text-muted-foreground pt-2">
                <p>
                  <strong>ที่อยู่:</strong> {job.location?.address || "ไม่มีข้อมูล"}
                </p>
              </div>
            </div>

            {/* --- กำหนดการ --- */}
            <div className="space-y-2">
              <h3 className="font-semibold">กำหนดการ</h3>
              <Separator />
              <div className="text-sm text-muted-foreground pt-2">
                <p>
                  <strong>สถานะ:</strong> <Badge>{job.status}</Badge>
                </p>
                <p>
                  <strong>ระยะเวลา:</strong>{" "}
                  {format(job.dates.start, "PPP", { locale: th })} -{" "}
                  {format(job.dates.end, "PPP", { locale: th })}
                </p>
              </div>
            </div>

            {/* --- ทีมผู้รับผิดชอบ --- */}
            <div className="space-y-4">
              <h3 className="font-semibold">ทีมผู้รับผิดชอบ</h3>
              <Separator />
              {lead && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium">หัวหน้างาน</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={lead.avatarUrl} />
                      <AvatarFallback>{lead.fname[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {lead.fname} {lead.lname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lead.position}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {techs?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-medium">
                    ทีมช่าง ({techs.length} คน)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {techs.map((tech) => (
                      <div key={tech.id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={tech.avatarUrl} />
                          <AvatarFallback>{tech.fname[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {tech.fname} {tech.lname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tech.position}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {job.editHistory && job.editHistory.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">
                    ประวัติการแก้ไข ({job.editHistory.length} ครั้ง)
                  </h3>
                  <Separator />
                  <div className="text-sm text-muted-foreground pt-2 space-y-3">
                    {job.editHistory.map((entry, index) => (
                      <div key={index} className="p-2 bg-secondary rounded-md">
                        <p>
                          <strong>ผู้แก้ไข:</strong> {entry.editorName}
                        </p>
                        <p>
                          <strong>วันที่:</strong>{" "}
                          {format(new Date(entry.editedAt), "PPP p", {
                            locale: th,
                          })}
                        </p>
                        <p>
                          <strong>เหตุผล:</strong> {entry.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
          {/* แสดงปุ่ม "แก้ไข" เฉพาะเมื่อผู้ใช้เป็น admin */}
          {currentUser?.role === "admin" && (
            <Button onClick={onEdit}>แก้ไขใบงาน</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
