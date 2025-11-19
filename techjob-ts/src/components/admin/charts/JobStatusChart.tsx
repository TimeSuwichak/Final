"use client";
import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

// ⚠️ ข้อมูลจำลองที่ถูกแก้ไข: เพิ่ม In_Progress
const candlestickData = [
  // Open และ Close ยังคงอยู่เพื่อความสมบูรณ์ของข้อมูล แต่จะไม่ได้ถูกใช้ใน Chart นี้แล้ว
  { status: 'สัปดาห์ 1', Open: 20, High: 65, Low: 40, Close: 45, In_Progress: 15 },
  { status: 'สัปดาห์ 2', Open: 45, High: 70, Low: 40, Close: 50, In_Progress: 20 },
  { status: 'สัปดาห์ 3', Open: 50, High: 80, Low: 50, Close: 75, In_Progress: 25 },
  { status: 'สัปดาห์ 4', Open: 75, High: 90, Low: 60, Close: 85, In_Progress: 30 },
];

// Custom Tooltip สำหรับ Candlestick (ปรับปรุงให้รองรับคีย์ In_Progress)
const CustomCandlestickTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border rounded-lg shadow-md 
        bg-white dark:bg-slate-800 
        border-gray-200 dark:border-slate-700"
      >
        <p className="font-bold text-lg text-primary dark:text-indigo-400 mb-1">{label}</p>
        {payload.map((p, index) => (
          <p key={index} style={{ color: p.color }} className="text-gray-900 dark:text-gray-100">
            {p.name}: **{p.value}** งาน
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 🎨 สีที่ใช้ใน Recharts (สี Hex Code ต้องคงที่)
const COLORS = {
    AXIS: '#94a3b8',      // Slate-400
    GRID_LIGHT: '#e2e8f0', // Slate-200
    GRID_DARK: '#334155',  // Slate-700
};


export function JobStatusChart({ data }) {
  return (
    
<Card className="shadow-2xl dark:bg-slate-900 dark:border-slate-700">
  <CardHeader>
    <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-gray-50"> 
        <TrendingUp size={24} className="text-red-500" />
        ภาพรวมสถานะงาน (Work status overview)
    </CardTitle>
    <CardDescription className="text-md text-gray-500 dark:text-gray-300"> 
        แสดงความผันผวนของงานที่เข้ามา (High) และงานที่เสร็จสิ้น (Low) เทียบกับงานที่กำลังดำเนินการ
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart 
        data={candlestickData}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={COLORS.GRID_LIGHT} 
            strokeOpacity={0.5} 
            vertical={false} 
          />
        
        <XAxis 
          dataKey="status" 
          stroke={COLORS.AXIS} 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tick={{ fill: COLORS.AXIS }} 
        />
        
        <YAxis 
          stroke={COLORS.AXIS} 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false}
          label={{ value: 'จำนวนงาน', angle: -90, position: 'insideLeft', fill: COLORS.AXIS, fontSize: 12, offset: 5 }}
          tick={{ fill: COLORS.AXIS }} 
        />
        
        <Tooltip
            content={<CustomCandlestickTooltip />}
            cursor={false} 
        />
        <Legend 
            wrapperStyle={{ paddingTop: '10px', color: COLORS.AXIS }} 
        />
        
        {/* Bar Chart: คงเดิม */}
        <Bar 
          dataKey="High" 
          name="งานทั้งหมด"
          fill="#4f46e5" // Indigo-600
          barSize={5} 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="Low" 
          name="งานเสร็จสิ้น"
          fill="#10B981" // Emerald-500
          barSize={5} 
          radius={[4, 4, 0, 0]}
        />

        {/* 🚀 Line Chart: เปลี่ยน type เป็น smoothstep */}
        <Line 
            type="smoothstep" // ✨ ปรับให้เส้นโค้งมน ไม่เป็นมุมหักหรือเส้นตรงทื่อ ๆ
            dataKey="In_Progress" 
            name="งานที่กำลังดำเนินการ"
            stroke="#F97316" 
            strokeWidth={2} 
            dot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} 
            activeDot={{ r: 8, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} 
        />

      </ComposedChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
  );
}