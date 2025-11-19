// JobStatusChart.jsx (ปรับเป็น Grouped Bar Chart 3 แท่งต่อสัปดาห์: งานใหม่, กำลังดำเนินการ, งานเสร็จสิ้น)

"use client";
import React from 'react';
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
import { BarChartBig } from 'lucide-react'; // 💡 ใช้ BarChartBig เพื่อสื่อถึง Bar Chart

// ==========================================================
// 🎨 ค่าสีที่ได้รับการปรับปรุงเพื่อให้เข้ากับ Deep Dark Mode
// ==========================================================
const PRIMARY_DARK_BG = '#1B182B'; // ม่วงเข้มเกือบดำ (พื้นหลัง Card)
const DARK_BORDER_COLOR = '#2F2C41'; // สีขอบ/เส้น Grid
const DARK_AXIS_COLOR = '#9894dd'; // สีแกน/ข้อความรอง

// 💡 ข้อมูลจำลองใหม่: ใช้ 3 คีย์สำหรับ Grouped Bar Chart (งานใหม่, กำลังดำเนินการ, งานเสร็จสิ้น)
const groupedBarData = [
  // 💡 ปรับตัวเลขและคีย์ให้เข้ากับ: งานใหม่ (ฟ้า), กำลังดำเนินการ (เหลือง), งานเสร็จสิ้น (เขียว)
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
      // 🌙 ใช้สีพื้นหลัง Card ใหม่ และสีขอบใหม่
      <div className="p-3 border rounded-lg shadow-md 
        bg-[var(--primary-dark-bg)] border-[var(--dark-border-color)] 
        text-gray-50"
        style={{ '--primary-dark-bg': PRIMARY_DARK_BG, '--dark-border-color': DARK_BORDER_COLOR }}
      >
        <p className="font-bold text-lg text-indigo-400 mb-1">{label}</p>
        <p className="font-bold text-sm">งานรวมในสัปดาห์: {totalJob} งาน</p>
        <hr className="my-1 border-gray-700"/>
        
        {payload.map((p, index) => (
          // 🌙 ปรับสีข้อความใน Tooltip
          <p key={index} style={{ color: p.color }} className="dark:text-gray-100">
            {p.name}: **{p.value}** งาน
          </p>
        ))}
      </div>
    );
  }
  return null;
};


export function JobStatusChart({ data }) {
  return (
    
    <Card className="shadow-2xl dark:bg-[var(--primary-dark-bg)] dark:border-[var(--dark-border-color)]"
        style={{ '--primary-dark-bg': PRIMARY_DARK_BG, '--dark-border-color': DARK_BORDER_COLOR }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2 dark:text-gray-50"> 
            <BarChartBig size={24} className="text-indigo-500" /> {/* เปลี่ยนสี Icon */}
            ภาพรวมสถานะงาน (Work Status Overview)
        </CardTitle>
        <CardDescription className="text-md text-gray-500 dark:text-gray-400"> 
            แสดงจำนวนงานใหม่, งานที่กำลังดำเนินการ, และงานที่เสร็จสิ้น ในแต่ละสัปดาห์
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {/* 💡 ใช้ ComposedChart แต่ใส่แต่ Bar เพื่อให้ได้ Grouped Bar Chart */}
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
                stroke={DARK_BORDER_COLOR} 
                strokeOpacity={0.8} 
                vertical={false} 
              />
            
            <XAxis 
              dataKey="status" 
              stroke={DARK_AXIS_COLOR} 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: DARK_AXIS_COLOR }} 
            />
            
            <YAxis 
              stroke={DARK_AXIS_COLOR} 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              allowDecimals={false}
              label={{ value: 'จำนวนงาน', angle: -90, position: 'insideLeft', fill: DARK_AXIS_COLOR, fontSize: 12, offset: 5 }}
              tick={{ fill: DARK_AXIS_COLOR }} 
            />
            
            <Tooltip
                content={<CustomGroupedTooltip />}
                cursor={{ fill: DARK_BORDER_COLOR, fillOpacity: 0.3 }}
            />
            <Legend 
                wrapperStyle={{ paddingTop: '10px', color: DARK_AXIS_COLOR }} 
            />
            
            {/* Bar 1: งานใหม่ (สีน้ำเงิน) - เรียงลำดับที่ 1 */}
            <Bar 
              dataKey="งานใหม่" 
              fill="#60A5FA" // Blue-400
              barSize={10} 
              radius={[4, 4, 0, 0]}
            />
            
            {/* Bar 2: กำลังดำเนินการ (สีเหลือง/ส้ม) - เรียงลำดับที่ 2 */}
            <Bar 
              dataKey="กำลังดำเนินการ" 
              fill="#FBBF24" // Amber-400
              barSize={10} 
              radius={[4, 4, 0, 0]}
            />

            {/* Bar 3: งานเสร็จสิ้น (สีเขียว) - เรียงลำดับที่ 3 */}
            <Bar 
              dataKey="งานเสร็จสิ้น" 
              fill="#10B981" // Emerald-500
              barSize={10} 
              radius={[4, 4, 0, 0]}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}