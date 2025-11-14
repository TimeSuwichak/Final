"use client";

import React, { useState } from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Read CSS theme variables so charts match dark / light mode
// (ใช้ Hook `useThemeVars` เดิมของคุณ)
function useThemeVars() {
  const [vars, setVars] = React.useState({
    card: 'hsl(0 0% 100%)',
    border: 'hsl(220 14% 96%)',
    primary: 'hsl(252 80% 60%)',
    muted: 'hsl(214 14% 58%)',
    foreground: 'hsl(210 10% 23%)'
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = getComputedStyle(document.documentElement);
    setVars(prev => ({
      card: (s.getPropertyValue('--card') || prev.card).trim(),
      border: (s.getPropertyValue('--border') || prev.border).trim(),
      primary: (s.getPropertyValue('--primary') || prev.primary).trim(),
      muted: (s.getPropertyValue('--muted-foreground') || prev.muted).trim(),
      foreground: (s.getPropertyValue('--foreground') || prev.foreground).trim(),
    }));
  }, []);

  return vars;
}

// สีสำหรับแต่ละประเภทงาน
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

// คอมโพเนนต์สำหรับ Active Shape (ชิ้นส่วนที่ถูก Hover)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const theme = useThemeVars(); // ดึง theme มาใช้

  return (
    <g>
      {/* ข้อความตรงกลาง */}
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={theme.foreground} style={{ fontSize: '1.1rem', fontWeight: 600 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill={theme.muted} style={{ fontSize: '0.9rem' }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      
      {/* ตัวชิ้นส่วน Pie ที่ขยายออกมา */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // ขยายขนาดเมื่อ active
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={theme.card} // ใช้สีพื้นหลัง Card เป็นเส้นขอบ
        strokeWidth={2}
      />
    </g>
  );
};

export function JobTypePieChart({ data }: { data: { name: string, value: number }[] }) {
  const theme = useThemeVars();
  const [activeIndex, setActiveIndex] = useState(0);

  // Workaround: some Recharts TS typings don't include activeIndex/activeShape on Pie in this project setup.
  // Cast to any locally to avoid changing global types.
  const AnyPie: any = Pie;

  // เมื่อเมาส์เข้าไปในชิ้นส่วน Pie
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ประเภทงานที่เชี่ยวชาญ</CardTitle>
          <CardDescription>สัดส่วนประเภทงานทั้งหมดที่คุณเคยทำสำเร็จ</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">ยังไม่มีข้อมูลงานที่ทำเสร็จ</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>ประเภทงานที่เชี่ยวชาญ</CardTitle>
        <CardDescription>สัดส่วนประเภทงานทั้งหมดที่คุณเคยทำสำเร็จ</CardDescription>
      </CardHeader>
      <CardContent>
        {/* กราฟ */}
        <ResponsiveContainer width="100%" height={325}>
          <PieChart>
            <AnyPie 
              data={data} 
              dataKey="value" 
              nameKey="name" 
              cx="50%" 
              cy="50%" 
              innerRadius={80} // รูตรงกลาง (Donut)
              outerRadius={110} // ขนาดวงนอก
              paddingAngle={5} // ช่องว่างระหว่างชิ้น
              isAnimationActive={true}
              animationDuration={500}
              activeIndex={activeIndex} // ชิ้นที่กำลัง active
              activeShape={renderActiveShape} // คอมโพเนนต์ที่จะ render
              onMouseEnter={onPieEnter} // Event เมื่อเมาส์เข้า
              label={false} // ปิด label เริ่มต้น
              labelLine={false} // ปิดเส้น label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </AnyPie>
            {/* เราไม่ใช้ Tooltip และ Legend เริ่มต้น แต่ใช้ ActiveShape แทน */}
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend (คำอธิบาย) */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span 
                className="h-3 w-3 shrink-0 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-sm" style={{ color: theme.foreground }}>
                {entry.name}
              </span>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}