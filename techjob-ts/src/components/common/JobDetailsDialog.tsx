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

export const JobDetailsDialog = ({ job, lead, techs, isOpen, onClose }) => {
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
                  <strong>ชื่อ:</strong> {job.client?.name || "N/A"}
                </p>
                <p>
                  <strong>เบอร์โทร:</strong> {job.client?.phone || "N/A"}
                </p>
                {job.client?.contact && (
                  <p>
                    <strong>ติดต่ออื่น:</strong> {job.client.contact}
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
                  <strong>ที่อยู่:</strong> {job.location?.address || "N/A"}
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
            </div>

            {/* --- ประวัติการแก้ไข (ยังไม่ทำในขั้นตอนนี้) --- */}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
