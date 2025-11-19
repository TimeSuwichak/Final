// ต้องนำเข้า Components ที่จำเป็นก่อน (ตามโค้ดเดิมของคุณ)
import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// 🎨 กำหนดชุดสีที่สวยงามและคอนทราสต์สูง
const PROFESSIONAL_COLORS = [
    '#10B981', // Emerald Green (คมชัดใน Dark Mode)
    '#F59E0B', // Amber Orange (คมชัดใน Dark Mode)
    '#3B82F6', // Blue (คมชัดใน Dark Mode)
];

// Custom Tooltip Component เพื่อการแสดงผลที่ดูเป็นมืออาชีพ (ปรับปรุงให้ใช้ Dark Mode)
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // 💡 Tooltip: ปรับพื้นหลัง/ขอบ/สีข้อความให้รองรับ Dark Mode
    return (
      <div className="p-3 border rounded-lg shadow-md bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600">
        <p className="font-bold text-lg text-primary dark:text-indigo-400">{data.name}</p>
        <p>
          <span className="text-muted-foreground dark:text-gray-300">จำนวนทีม:</span> 
          <span className="font-bold text-gray-900 dark:text-gray-50"> {data.value}</span>
        </p>
        <p>
          <span className="text-muted-foreground dark:text-gray-300">สัดส่วน:</span> 
          <span className="font-bold text-gray-900 dark:text-gray-50"> {(data.percent * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// 💅 ปรับปรุง Component หลัก
export function TeamStatusPieChart({ data }) {
    // ⚙️ ตั้งค่าขนาดวงแหวน (Donut Chart)
    const INNER_RADIUS = 55;
    const OUTER_RADIUS = 95;
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    // 🌟 Card: ปรับพื้นหลัง/ขอบ ให้รองรับ Dark Mode
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        {/* Title: ปรับสีข้อความให้เป็นสีสว่างใน Dark Mode */}
        <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-50">
          สถานะทีมช่างทั้งหมด ({total} Teams )
        </CardTitle>
        {/* Description: ปรับสีข้อความให้เป็นสีเทาอ่อนใน Dark Mode */}
        <CardDescription className="text-md text-gray-500 dark:text-gray-400">
          สรุปจำนวนช่างในแต่ละสถานะปัจจุบัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}> 
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              dataKey="value"
              // 📝 Label: ใช้สี Foreground ที่เปลี่ยนตามโหมด
              label={({ name, percent, x, y, cx }) => (
                <text 
                  x={x} 
                  y={y} 
                  // 💡 ใช้สีที่คมชัดใน Dark Mode (สีขาว/เทาอ่อน)
                  fill="hsl(var(--foreground))" 
                  textAnchor={x > cx ? 'start' : 'end'} 
                  dominantBaseline="central" 
                  className="text-xs font-semibold dark:text-gray-50" 
                >
                  {`${name} (${(percent * 100).toFixed(1)}%)`}
                </text>
              )}
              labelLine={false}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]}
                  stroke="none" 
                  onMouseOver={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                />
              ))}
            </Pie>
            {/* 💡 ใช้ Custom Tooltip ที่ปรับแล้ว */}
            <Tooltip content={<CustomTooltip />} />
            {/* 📊 Legend: ปรับสีข้อความ Legend ให้เป็นสีอ่อนใน Dark Mode */}
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              // 💡 ใช้สี muted-foreground ที่เปลี่ยนตามโหมด
              wrapperStyle={{ paddingTop: '20px', color: 'hsl(var(--muted-foreground))' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}