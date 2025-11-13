"use client";

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function MonthlyPerformanceChart({ data }: { data: { name: string, "งานที่เสร็จ": number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ผลงานรายเดือน</CardTitle>
        <CardDescription>จำนวนงานที่คุณทำสำเร็จในแต่ละเดือน (6 เดือนล่าสุด)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false} 
            />
            <Tooltip 
              contentStyle={{ 
                background: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))" 
              }} 
            />
            <Legend />
            <Bar dataKey="งานที่เสร็จ" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}