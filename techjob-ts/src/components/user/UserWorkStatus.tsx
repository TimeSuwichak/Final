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
      bg: "bg-sky-100 dark:bg-sky-900/50", // สีพื้นหลังไอคอน
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
      label: "งานที่รอหัวหน้าตรวจ",
      value: counts.forReview,
      icon: <Eye size={24} className="text-indigo-500" />,
      bg: "bg-indigo-100 dark:bg-indigo-900/50",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>สถานะงานล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {/* ใช้ grid-cols-1 และ md:grid-cols-2 ถ้าเนื้อหาแนวนอนยาวไป */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div
              key={it.key}
              // [!!] เปลี่ยน layout เป็นแนวนอน
              className="flex items-center gap-4 rounded-lg border p-4"
              role="group"
              aria-label={it.label}
            >
              {/* เพิ่มกรอบพื้นหลังให้ไอคอน */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${it.bg}`}
              >
                {it.icon}
              </div>
              <div className="flex flex-col">
                {/* ปรับขนาดตัวเลขและข้อความให้เหมาะสม */}
                <div className="text-2xl font-bold">{it.value}</div>
                <div className="text-sm text-muted-foreground">{it.label}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}