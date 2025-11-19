// ต้องนำเข้า Components ที่จำเป็นก่อน (ตามโค้ดเดิมของคุณ)
import React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// 🎨 กำหนดชุดสีที่สวยงามและคอนทราสต์สูง
// ใช้สีที่สื่อถึงสถานะ: พร้อม/ว่าง (เขียว), กำลังทำงาน (ส้ม), มีปัญหา/ปิด (น้ำเงินเข้ม)
const PROFESSIONAL_COLORS = [
    '#10B981', // Emerald Green
    '#F59E0B', // Amber Orange
    '#3B82F6', // Blue (แทนสีแดง หากไม่ต้องการให้ดูเป็น Error มากเกินไป)
];

// Custom Tooltip Component เพื่อการแสดงผลที่ดูเป็นมืออาชีพ
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 border rounded-lg shadow-md" style={{ 
        backgroundColor: 'hsl(var(--background))', // ใช้สีพื้นหลังของ Dashboard
        borderColor: 'hsl(var(--border))' 
      }}>
        <p className="font-bold text-lg text-primary">{data.name}</p>
        <p>
          <span className="text-muted-foreground">จำนวนทีม:</span> **{data.value}**
        </p>
        <p>
          <span className="text-muted-foreground">สัดส่วน:</span> **{(data.percent * 100).toFixed(1)}%**
        </p>
      </div>
    );
  }
  return null;
};

// 💅 ปรับปรุง Component หลัก (ใช้ชื่อฟังก์ชันเดิมเพื่อให้เข้ากับโค้ดที่คุณมี)
export function TeamStatusPieChart({ data }) {
    // ⚙️ ตั้งค่าขนาดวงแหวน (Donut Chart)
    const INNER_RADIUS = 65; // ขนาดวงใน
    const OUTER_RADIUS = 110; // ขนาดวงนอก
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    // 🌟 เพิ่มเงาและเอฟเฟกต์ยกขึ้นเล็กน้อยเมื่อเมาส์ชี้
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        {/* 🛠️ ปรับปรุง Title ให้ชัดเจนยิ่งขึ้น */}
        <CardTitle className="text-2xl font-bold text-gray-800">
          สถานะทีมช่างทั้งหมด ({total} ทีม)
        </CardTitle>
        <CardDescription className="text-md text-gray-500">
          สรุปสัดส่วนสถานะการทำงานของทีมช่างในปัจจุบัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              // ⚙️ **สำคัญ:** กำหนด innerRadius เพื่อสร้าง Donut Chart
              innerRadius={INNER_RADIUS}
              outerRadius={OUTER_RADIUS}
              dataKey="value"
              // 📝 ปรับ Label ให้แสดงผลแบบแม่นยำขึ้น (ทศนิยม 1 ตำแหน่ง) และจัดตำแหน่งที่ชัดเจน
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              labelLine={false}
              paddingAngle={3} // เพิ่มช่องว่างเล็กน้อยระหว่างชิ้น
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={PROFESSIONAL_COLORS[index % PROFESSIONAL_COLORS.length]}
                  // 🚫 ลบ Stroke ออกเพื่อให้ดูเป็นวงแหวนที่สวยงาม
                  stroke="none" 
                  // 🖱️ เพิ่มเอฟเฟกต์ไฮไลท์เมื่อเมาส์ชี้ (Optional)
                  onMouseOver={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.filter = 'none';
                  }}
                />
              ))}
            </Pie>
            {/* 💡 ใช้ Custom Tooltip ที่จัดรูปแบบใหม่ */}
            <Tooltip content={<CustomTooltip />} />
            {/* 📊 ปรับ Legend ให้อยู่ด้านล่างและจัดกึ่งกลาง */}
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}