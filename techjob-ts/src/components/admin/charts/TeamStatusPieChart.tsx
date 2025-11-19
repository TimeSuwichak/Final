// TeamStatusPieChart.jsx (ปรับให้เป็น Professional Donut Chart สำหรับ "ประเภทงานทั้งหมด")

"use client";
import React, { useMemo, useState, useEffect } from 'react'; // 💡 เพิ่ม useState, useEffect
import { 
    Pie, 
    PieChart, 
    ResponsiveContainer, 
    Cell, 
    Tooltip, 
    Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChartBig } from 'lucide-react'; 

// ==========================================================
// 🎨 ค่าสีที่ได้รับการปรับปรุงเพื่อให้เข้ากับ Deep Dark Mode (ใช้เฉพาะใน Tooltip/Card Background)
// ==========================================================
const PRIMARY_DARK_BG = '#1B182B'; 
const DARK_BORDER_COLOR = '#2F2C41'; 
// 💡 DARK_AXIS_COLOR ถูกแทนที่ด้วย Logic ด้านล่าง

// 🎨 กำหนดชุดสีสำหรับชิ้นส่วน Pie
const PROFESSIONAL_COLORS = [
    '#34D399', // Emerald-400 
    '#FBBF24', // Amber-400 
    '#60A5FA', // Blue-400 
    '#F472B6', // Pink-400
    '#A78BFA', // Violet-400
];

// Custom Tooltip Component (ใช้ Dark/Light Mode Class มาตรฐานใน Tailwind Class)
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percent = data.total > 0 ? (data.value / data.total * 100).toFixed(1) : 0;
    
    // 💡 ใช้ Tailwind Classes สำหรับ Dark/Light Mode ใน Tooltip
    return (
      <div className="p-3 border rounded-lg shadow-xl 
        bg-card dark:bg-card border-border dark:border-border text-foreground dark:text-gray-50"
      >
        <p className="font-bold text-lg text-primary dark:text-indigo-400">{data.name}</p>
        <p>
          <span className="text-muted-foreground">จำนวน:</span> 
          <span className="font-bold text-foreground"> {data.value} งาน</span>
        </p>
        <p>
          <span className="text-muted-foreground">สัดส่วน:</span> 
          <span className="font-bold text-foreground"> {percent}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// 💅 ปรับปรุง Component หลัก
export function TeamStatusPieChart({ data }) {
    // 💡 1. เพิ่ม State เพื่อเก็บสถานะ Dark Mode
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 💡 2. ใช้ Effect เพื่อตรวจสอบสถานะ Dark Mode เมื่อ Component ถูก Mount
    useEffect(() => {
        const checkTheme = () => {
            // ตรวจสอบ class 'dark' บน element <html>
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        checkTheme();

        // 💡 สร้าง MutationObserver เพื่อตรวจจับการเปลี่ยนแปลง class ของ <html> element
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Cleanup observer เมื่อ Component ถูก Unmount
        return () => observer.disconnect();
    }, []);

    // 💡 3. ใช้ useMemo เพื่อกำหนดสีตามสถานะ Dark Mode ที่อ่านได้
    const chartStyles = useMemo(() => {
        // Light Mode: Dark text on light background
        const lightForeground = '#333333'; // เข้มมาก
        const lightMuted = '#6b7280'; // เทาปานกลาง

        // Dark Mode: Light text on dark background
        const darkForeground = '#e5e7eb'; // ขาว/เทาอ่อน
        const darkMuted = '#9894dd'; // ม่วงอ่อน (สีที่เข้ากับ deep dark theme)
        
        return {
            // สีข้อความหลัก: เข้มใน Light, สว่างใน Dark
            foreground: isDarkMode ? darkForeground : lightForeground,
            // สีข้อความรอง (เช่น Legend, คำว่า "งานทั้งหมด"): เทาใน Light, ม่วงอ่อนใน Dark
            muted: isDarkMode ? darkMuted : lightMuted,
        };
    }, [isDarkMode]);

    // 💡 ข้อมูลจำลองสำหรับประเภทงาน (แทน data prop เดิม)
    const jobTypeData = useMemo(() => {
        const rawData = [
            { name: 'งานไฟฟ้า', value: 45 },
            { name: 'งานประปา', value: 32 },
            { name: 'งานอินเทอร์เน็ต', value: 25 },
            { name: 'งานช่างทั่วไป', value: 18 },
            { name: 'งานโครงสร้าง', value: 10 },
        ];
        const total = rawData.reduce((sum, entry) => sum + entry.value, 0);
        return rawData.map(d => ({ ...d, total }));
    }, []);

    // ⚙️ ตั้งค่าขนาดวงแหวน (Donut Chart)
    const INNER_RADIUS = 70; 
    const OUTER_RADIUS = 100; 
    const totalJobs = jobTypeData.reduce((sum, entry) => sum + entry.value, 0);

  return (
    // Card: ใช้ Tailwind/Shadcn UI Class มาตรฐาน
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-card dark:border-border">
      <CardHeader>
        {/* Title: ใช้ Tailwind Class มาตรฐาน */}
        <CardTitle className="text-2xl font-bold dark:text-foreground text-gray-800 flex items-center gap-2">
          <BarChartBig size={24} className="text-blue-400" /> 
          ประเภทงานทั้งหมดในเดือนนี้ ({totalJobs} งาน)
        </CardTitle>
        {/* Description: ใช้ Tailwind Class มาตรฐาน */}
        <CardDescription className="dark:text-muted-foreground text-gray-600">
          สัดส่วนงานที่เข้ามาตามประเภทงานในรอบเดือน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}> 
          <PieChart>
            <Pie
              data={jobTypeData} 
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              dataKey="value"
              style={{ filter: 'drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.2))' }}
              // 📝 Label: ใช้สี chartStyles.foreground
              label={({ name, percent, x, y, cx }) => (
                <text 
                  x={x} 
                  y={y} 
                  fill={chartStyles.foreground} // 💡 เปลี่ยนสีตาม Theme
                  textAnchor={x > cx ? 'start' : 'end'} 
                  dominantBaseline="central" 
                  className="text-xs font-semibold" 
                >
                  {`${name} (${(percent * 100).toFixed(1)}%)`}
                </text>
              )}
              labelLine={false} 
              paddingAngle={3}
            >
              {jobTypeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]}
                  stroke="none" 
                  onMouseOver={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.2) drop-shadow(0 0 5px rgba(255, 255, 255, 0.3))';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.filter = 'drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.2))';
                  }}
                />
              ))}
            </Pie>
            
            {/* 💡 Text กลางวงแหวน: แสดง Total Jobs */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-lg font-extrabold" fill={chartStyles.foreground}>
                {totalJobs}
            </text>
            <text x="50%" y="50%" dy="20" textAnchor="middle" dominantBaseline="middle" className="text-xs font-semibold" fill={chartStyles.muted}>
                งานทั้งหมด
            </text>

            {/* 💡 ใช้ Custom Tooltip ที่ปรับแล้ว */}
            <Tooltip content={<CustomTooltip />} />
            {/* 📊 Legend: ใช้สี chartStyles.muted */}
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              // 💡 เปลี่ยนสีข้อความ Legend ตาม Theme
              wrapperStyle={{ paddingTop: '20px', color: chartStyles.muted }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}