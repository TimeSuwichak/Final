// JobStatusChart.jsx (Grouped Bar Chart: ม่วงเข้ม/ฟ้า/เขียว)

"use client";
import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChartBig } from 'lucide-react'; 

// ==========================================================
// 🎨 ค่าสีที่ได้รับการปรับปรุง (ใช้โทนม่วงเข้ม)
// ==========================================================
const COLOR_NEW = '#60A5FA';        // Blue-400 (สีฟ้า)
const COLOR_IN_PROGRESS = '#A78BFA'; // Violet-400 (สีม่วง)
const COLOR_COMPLETED = '#10B981';   // Emerald-500 (สีเขียว)

// 💡 ข้อมูลจำลองใหม่: ใช้ 3 คีย์สำหรับ Grouped Bar Chart
const groupedBarData = [
  { status: 'สัปดาห์ 1', 'งานใหม่': 15, 'กำลังดำเนินการ': 10, 'งานเสร็จสิ้น': 40 },
  { status: 'สัปดาห์ 2', 'งานใหม่': 20, 'กำลังดำเนินการ': 15, 'งานเสร็จสิ้น': 55 },
  { status: 'สัปดาห์ 3', 'งานใหม่': 25, 'กำลังดำเนินการ': 20, 'งานเสร็จสิ้น': 60 },
  { status: 'สัปดาห์ 4', 'งานใหม่': 30, 'กำลังดำเนินการ': 25, 'งานเสร็จสิ้น': 75 },
];

// Custom Tooltip สำหรับ Grouped Bar Chart
const CustomGroupedTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalJob = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      // 🌙 Tooltip Style (ใช้ Dark Mode Class มาตรฐาน)
      <div className="p-3 border rounded-lg shadow-md 
        dark:bg-card dark:border-border text-foreground bg-card"
      >
        <p className="font-bold text-lg text-indigo-400 mb-1">{label}</p>
        <p className="font-bold text-sm text-muted-foreground">งานรวมในสัปดาห์: {totalJob} งาน</p>
        <hr className="my-1 dark:border-gray-700"/>
        
        {payload.map((p, index) => (
          // 🌙 ปรับสีข้อความใน Tooltip
          <p key={index} style={{ color: p.color }} className="dark:text-gray-100 text-gray-900">
            {p.name}: **{p.value}** งาน
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export function JobStatusChart({ data }) {
    // 💡 1. Logic ตรวจสอบ Dark Mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkTheme();
        
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // 💡 2. ฟังก์ชันกำหนดสี Dynamic (สำหรับ Text/Line)
    const getChartColor = (type) => {
        if (isDarkMode) {
            // Dark Mode: ใช้สีขาว/เทาอ่อน
            if (type === 'text') return '#E0E0E0'; 
            if (type === 'line') return 'hsl(var(--border))'; 
        } else {
            // Light Mode: ใช้สีดำ/เทาเข้ม
            if (type === 'text') return '#000000'; 
            if (type === 'line') return '#D0D0D0'; 
        }
    };
    
  return (
    
    <Card className="shadow-2xl dark:bg-card dark:border-border"> 
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-foreground text-gray-800 flex items-center gap-2"> 
            <BarChartBig size={24} className="text-indigo-500" /> 
            ภาพรวมสถานะงาน (Work Status Overview)
        </CardTitle>
        <CardDescription className="text-md dark:text-muted-foreground text-gray-600"> 
            แสดงจำนวนงานใหม่, งานที่กำลังดำเนินการ, และงานที่เสร็จสิ้น ในแต่ละสัปดาห์
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {/* 💡 ใช้ Grouped Bar Chart */}
          <ComposedChart 
            data={groupedBarData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {/* 🌙 ปรับสีเส้นตาราง */}
            <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={getChartColor('line')} 
                strokeOpacity={0.8} 
                vertical={false} 
              />
            
            <XAxis 
              dataKey="status" 
              stroke={getChartColor('line')}
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: getChartColor('text') }} // 💡 สีข้อความ dynamic
            />
            
            <YAxis 
              stroke={getChartColor('line')}
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
              label={{ 
                  value: 'จำนวนงาน', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: getChartColor('text'), 
                  fontSize: 12, 
                  offset: 5 
              }}
              tick={{ fill: getChartColor('text') }} // 💡 สีข้อความ dynamic
            />
            
            <Tooltip
                content={<CustomGroupedTooltip />}
                cursor={{ fill: 'hsl(var(--border))', fillOpacity: 0.3 }}
            />
            <Legend 
                wrapperStyle={{ paddingTop: '10px', color: getChartColor('text') }} // 💡 สีข้อความ dynamic
            />
            
            {/* Bar 1: งานใหม่ (สีฟ้า) */}
            <Bar 
              dataKey="งานใหม่" 
              fill={COLOR_NEW} 
              barSize={10} 
              radius={[4, 4, 0, 0]}
            />
            
            {/* Bar 2: กำลังดำเนินการ (สีม่วงเข้ม) */}
            <Bar 
              dataKey="กำลังดำเนินการ" 
              fill={COLOR_IN_PROGRESS} 
              barSize={10} 
              radius={[4, 4, 0, 0]}
            />

            {/* Bar 3: งานเสร็จสิ้น (สีเขียว) */}
            <Bar 
              dataKey="งานเสร็จสิ้น" 
              fill={COLOR_COMPLETED} 
              barSize={10} 
              radius={[4, 4, 0, 0]}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}