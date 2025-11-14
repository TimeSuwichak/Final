"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Bell, AlertTriangle, Eye } from "lucide-react";

type Counts = {
  today: number;
  new: number;
  toFix: number;
  forReview: number;
};

export default function UserWorkStatusHorizontal({
  counts = { today: 2, new: 1, toFix: 0, forReview: 1 },
}: {
  counts?: Counts;
}) {
  const items = [
    {
      key: "today",
      label: "งานที่ต้องทำวันนี้",
      value: counts.today,
      icon: <CalendarCheck size={24} className="text-sky-500" />,
      bg: "bg-sky-100 dark:bg-sky-900/50",
    },
    {
      key: "new",
      label: "งานใหม่ที่รอรับ",
      value: counts.new,
      icon: <Bell size={24} className="text-amber-500" />,
      bg: "bg-amber-100 dark:bg-amber-900/50",
    },
    {
      key: "toFix",
      label: "งานที่รอแก้ไข",
      value: counts.toFix,
      icon: <AlertTriangle size={24} className="text-rose-500" />,
      bg: "bg-rose-100 dark:bg-rose-900/50",
    },
    {
      key: "forReview",
      label: "งานที่รอหัวหน้าตรวจสอบ",
      value: counts.forReview,
      icon: <Eye size={24} className="text-indigo-500" />,
      bg: "bg-indigo-100 dark:bg-indigo-900/50",
    },
  ];

  return (
    // [กรอบนอก] ใช้ Card หลักสำหรับหัวข้อ "สถานะงานล่าสุด"
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-3xl tracking-tight">
           Task Status สถานะงานของคุณ 
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ใช้ grid แบ่งพื้นที่เหมือนเดิม */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* [!!] 1. เปลี่ยนจาก <Card> เป็น <div style="minimal"> */}
          {items.map((it) => (
            <div
              key={it.key}
              // [!!] 2. นี่คือสไตล์ "มินิมอล" ครับ
              // เราใช้ padding, rounded, และ hover effect ที่เปลี่ยนสีพื้นหลัง (bg-accent)
              // แทนการใช้เงา (shadow) หรือกรอบ (border)
              className="flex items-center gap-4 p-4 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground"
              role="group"
              aria-label={it.label}
            >
              {/* ส่วนไอคอน (เหมือนเดิม) */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${it.bg}`}
              >
                {it.icon}
              </div>
              
              {/* ส่วนข้อความ (ปรับขนาด Font) */}
              <div className="flex flex-col">
                <div className="text-3xl font-bold">{it.value}</div>
                
                {/* [!!] 3. ปรับ Font คำอธิบายเป็น text-sm (14px) */}
                {/* เพื่อให้ตัวเลข (text-3xl) เด่นชัดที่สุด (Minimalist) */}
                <div className="text-sm text-muted-foreground">
                  {it.label}
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </CardContent>
    </Card>
  );
}