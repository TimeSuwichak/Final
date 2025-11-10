"use client";
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function JobStatusChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ภาพรวมสถานะงาน</CardTitle>
        <CardDescription>สรุปจำนวนงานในแต่ละสถานะของเดือนนี้</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar dataKey="งานใหม่" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="กำลังทำ" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="เสร็จสิ้น" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}