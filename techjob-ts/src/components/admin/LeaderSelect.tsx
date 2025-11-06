// src/components/admin/LeaderSelect.tsx
"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// (ในอนาคตอาจจะ import Type 'Leader' มาจาก /types)
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ▼▼▼ 1. อัปเกรด "พิมพ์เขียว" ของ props ▼▼▼
interface LeaderSelectProps {
  leaders: any[]; // รับ Array ของ "Leader object" ตัวจริง
  onSelect: (id: string | null) => void;
  disabled: boolean;
}
export function LeaderSelect({ leaders, onSelect, disabled }: LeaderSelectProps) {
  
  const handleSelect = (leaderId: string) => {
    // (แปลง ID จาก string (ใน <Select>) กลับเป็น number (ใน data)
    // หรือถ้าเราใช้ ID สั้นๆ ที่เป็น string ก็ไม่ต้อง parseInt)
    onSelect(leaderId); 
  };
  
  return (
    <Select onValueChange={handleSelect} disabled={disabled || leaders.length === 0}>
      <SelectTrigger>
        <SelectValue placeholder={disabled ? "กรุณาเลือกวันเริ่ม-จบงาน" : "เลือกหัวหน้างาน..."} />
      </SelectTrigger>
      <SelectContent>
        {leaders.length > 0 ? (
          // ▼▼▼ 2. (อัปเกรด!) วนลูปและแสดงผลแบบเต็ม ▼▼▼
          leaders.map(lead => (
            <SelectItem key={lead.id} value={String(lead.id)}> {/* ใช้ String(id) */}
              <div className="flex items-center justify-between w-full">
                {/* ส่วนแสดง รูป, ชื่อ, นามสกุล */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={lead.avatarUrl} />
                    <AvatarFallback>{lead.fname[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium">{lead.fname} {lead.lname}</span>
                    <p className="text-xs text-muted-foreground">{lead.position}</p>
                  </div>
                </div>
                {/* ส่วนแสดง จำนวนงาน */}
                <span className="text-sm text-muted-foreground mr-2">
                  {lead.jobsThisMonth || 0} งาน
                </span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
            {disabled ? "..." : "ไม่พบหัวหน้าที่ว่างในเวลานี้"}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}