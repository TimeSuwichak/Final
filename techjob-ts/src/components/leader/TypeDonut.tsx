"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// --- 1. Hook สำหรับดึงค่าสีจาก Theme (Shadcn/Tailwind variables) ---
function useThemeVars() {
  const [vars, setVars] = useState({
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#94a3b8",
  });

  useEffect(() => {
    const updateVars = () => {
      const s = getComputedStyle(document.documentElement);
      // Helper function to convert hsl to hex or generic usage if needed
      // For simplicity here, we just use these to determine theme mode
      setVars({
        background: s.getPropertyValue("--background") || "#ffffff",
        foreground: s.getPropertyValue("--foreground") || "#0f172a",
        muted: s.getPropertyValue("--muted-foreground") || "#94a3b8",
      });
    };

    updateVars();
    const observer = new MutationObserver(updateVars);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return vars;
}

// --- 2. สีตามรูปภาพ (Blue, Green, Yellow) ---
const COLORS = [
  "#3b82f6", // Blue-500 (ซ่อมบำรุง)
  "#10b981", // Emerald-500 (ติดตั้งระบบ)
  "#f59e0b", // Amber-500 (ตรวจเช็คสภาพ)
  "#ef4444", // Red-500 (เผื่อมีเพิ่ม)
];

// --- 3. Function เรนเดอร์ตรงกลางวงกลมเมื่อ Hover ---
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      {/* ชื่อหมวดหมู่ */}
      <text x={cx} y={cy - 10} dy={-5} textAnchor="middle" fill={fill} className="text-sm font-semibold">
        {payload.name}
      </text>
      
      {/* ตัวเลขเปอร์เซ็นต์ขนาดใหญ่ */}
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill={fill} className="text-3xl font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      
      {/* จำนวนงาน */}
      <text x={cx} y={cy + 30} dy={15} textAnchor="middle" className="fill-slate-400 text-xs">
        ({value} งาน)
      </text>

      {/* วงแหวนรอบนอก Highlight */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        fillOpacity={0.2} // ทำให้ดูโปร่งแสงรอบนอก
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

// --- 4. Component หลัก ---
export function JobTypePieChart({
  data = [
    { name: 'ซ่อมบำรุง', value: 6 },
    { name: 'ติดตั้งระบบ', value: 4 },
    { name: 'ตรวจเช็คสภาพ', value: 5 },
  ] // Default Data ถ้าไม่มี prop ส่งมา
}: {
  data?: { name: string; value: number }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e1e2d] shadow-md transition-colors duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">
          ประเภทงานที่เชี่ยวชาญ
        </CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400">
          สัดส่วนประเภทงานทั้งหมดที่คุณเคยทำสำเร็จ
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center">
        {/* Chart Section */}
        <div className="w-full h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape} // ใช้ Shape พิเศษเมื่อ Hover
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65} // รูตรงกลาง
                outerRadius={85} // ขนาดวงนอก
                paddingAngle={4} // ช่องว่างระหว่างชิ้น
                dataKey="value"
                onMouseEnter={onPieEnter}
                stroke="none" // เอาเส้นขอบขาวออก
                cornerRadius={5} // มุมมน
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 outline-none focus:outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend ด้านล่าง */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {data.map((entry, index) => (
            <div 
              key={`legend-${index}`} 
              className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors cursor-pointer ${activeIndex === index ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className={`text-sm font-medium ${activeIndex === index ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default JobTypePieChart;