"use client";
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function JobStatusChart({ data }) {
  return (
    
<Card>
  <CardHeader>
    <CardTitle> ภาพรวมสถานะงาน (Work status overview)</CardTitle>
    <CardDescription>สรุปจำนวนงานในแต่ละสถานะของเดือนนี้</CardDescription>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data}
        // เพิ่ม margin เพื่อให้ BarChart ไม่ชิดขอบมากเกินไป
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false}
          // เพิ่ม label เพื่อบอกว่าแกน Y คือ 'จำนวนงาน'
          label={{ value: 'จำนวนงาน', angle: -90, position: 'insideLeft', fill: '#888888', fontSize: 12, offset: 5 }}
        />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
          cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }} // เพิ่มไฮไลท์เมื่อ hover
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        
        {/* ปรับสี Bar ให้สื่อความหมายตามสถานะ: 
            1. 'กำลังทำ' (สีเขียว: งานที่กำลังเดินหน้า) 
            2. 'งานใหม่' (สีหลัก: เน้นความสนใจ) 
            3. 'เสร็จสิ้น' (สีม่วง: งานที่จบไปแล้ว)
        */}
        <Bar dataKey="กำลังทำ" fill="#82ca9d" radius={[4, 4, 0, 0]} name="กำลังทำ" />
        <Bar dataKey="งานใหม่" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="งานใหม่" />
        <Bar dataKey="เสร็จสิ้น" fill="#8884d8" radius={[4, 4, 0, 0]} name="เสร็จสิ้น" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
  );
}