// src/components/admin/LeaderSelect.tsx (โค้ดที่ถูกต้อง 100%)
"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger, // (เราไม่ใช้ SelectValue เพราะเราจะปรับแต่ง Trigger เอง)
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Leader } from "@/types/index";

interface LeaderSelectProps {
  leaders: Leader[];
  selectedValue: string | null;
  onValueChange: (id: string) => void;
  disabled: boolean;
}

export function LeaderSelect({
  leaders,
  onValueChange,
  disabled,
  selectedValue,
}: LeaderSelectProps) {
  // ค้นหา "ข้อมูลเต็ม" ของ Leader ที่ถูกเลือก
  const selectedLeader = leaders.find(
    (lead) => String(lead.id) === selectedValue
  );

  return (
    <Select
      value={selectedValue || undefined}
      onValueChange={onValueChange}
      disabled={disabled || leaders.length === 0}
    >
      {/* ส่วนแสดงผล (Trigger) ที่ปรับแต่งแล้ว */}     {" "}
      <SelectTrigger>
        {selectedLeader ? (
          // "ถ้ามี" คนที่ถูกเลือก: ให้แสดง Avatar และชื่อ
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedLeader.avatarUrl} />
              <AvatarFallback>{selectedLeader.fname[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">
              {selectedLeader.fname} {selectedLeader.lname}
            </span>
          </div>
        ) : (
          // "ถ้าไม่": ให้แสดง Placeholder
          <span className="text-muted-foreground">
            {disabled ? "กรุณาเลือกวันเริ่ม-จบงาน" : "เลือกหัวหน้างาน..."}
          </span>
        )}
             {" "}
      </SelectTrigger>
      {/* ส่วน Dropdown Content (เหมือนเดิม) */}     {" "}
      <SelectContent>
               {" "}
        {leaders.length > 0 ? (
          leaders.map((lead) => (
            <SelectItem key={lead.id} value={String(lead.id)}>
              {/* * โค้ดด้านล่างนี้คือ {children} ที่จะถูกส่งเข้าไปใน
               * <SelectItemText> ในไฟล์ ui/select.tsx
               */}
                           {" "}
              <div className="flex items-center justify-between w-full">
                               {" "}
                <div className="flex items-center gap-3">
                                   {" "}
                  <Avatar className="h-8 w-8">
                                        <AvatarImage src={lead.avatarUrl} />   
                                   {" "}
                    <AvatarFallback>{lead.fname[0]}</AvatarFallback>           
                         {" "}
                  </Avatar>
                                   {" "}
                  <div>
                                       {" "}
                    <span className="font-medium">
                                            {lead.fname} {lead.lname}           
                             {" "}
                    </span>
                                       {" "}
                    <p className="text-xs text-muted-foreground">
                                            {lead.position}                   {" "}
                    </p>
                                     {" "}
                  </div>
                                 {" "}
                </div>
                               {" "}
                <span className="text-sm text-muted-foreground mr-2">
                                    {lead.jobsThisMonth || 0} งาน              
                   {" "}
                </span>
                             {" "}
              </div>
                         {" "}
            </SelectItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
                        {disabled ? "..." : "ไม่พบหัวหน้าที่ว่างในเวลนี้"}     
               {" "}
          </div>
        )}
             {" "}
      </SelectContent>
         {" "}
    </Select>
  );
}
