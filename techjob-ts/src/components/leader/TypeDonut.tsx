"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from "recharts";
import { Wrench } from 'lucide-react'; 
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// --- 0. ข้อมูล Legend และสีทั้งหมด (รวม 8 รายการ: 3 งานหลัก + 5 อุปกรณ์) ---
const ALL_LEGENDS = [
    { name: 'ซ่อมบำรุง', color: "#3b82f6", type: 'job' }, // Blue
    { name: 'ติดตั้งระบบ', color: "#10b981", type: 'job' }, // Emerald
    { name: 'ตรวจเช็คสภาพ', color: "#f59e0b", type: 'job' }, // Amber
    
    // ✅ เพิ่มรายการอุปกรณ์ใหม่ พร้อมกำหนดสี
    { name: 'สายไฟฟ้าและเดินสาย', color: "#ef4444", type: 'equipment' }, // Red
    { name: 'อุปกรณ์เครือข่ายและความปลอดภัย', color: "#8b5cf6", type: 'equipment' }, // Violet
    { name: 'เครื่องมือช่าง', color: "#f97316", type: 'equipment' }, // Orange
    { name: 'อุปกรณ์ระบบมัลติมีเดีย', color: "#06b6d4", type: 'equipment' }, // Cyan
    { name: 'วัสดุติดตั้ง', color: "#6b7280", type: 'equipment' }, // Gray
];

// --- 0.5. สีทั้งหมดสำหรับกราฟ (8 สี) ---
const CHART_COLORS = ALL_LEGENDS.map(item => item.color);

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

// --- 3. Function เรนเดอร์ตรงกลางวงกลมเมื่อ Hover (เหมือนเดิม) ---
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
  // Default Data สำหรับ 3 ประเภทงานหลัก
  data = [
    { name: 'ซ่อมบำรุง', value: 6 },
    { name: 'ติดตั้งระบบ', value: 4 },
    { name: 'ตรวจเช็คสภาพ', value: 5 },
  ] 
}: {
  data?: { name: string; value: number }[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  // 💡 [NEW] Mock Data สำหรับอุปกรณ์ (5 รายการพร้อมค่า Value)
  const EQUIPMENT_DATA = useMemo(() => ([
      { name: 'สายไฟฟ้าและเดินสาย', value: 2 },
      { name: 'อุปกรณ์เครือข่ายและความปลอดภัย', value: 1 },
      { name: 'เครื่องมือช่าง', value: 1 },
      { name: 'อุปกรณ์ระบบมัลติมีเดีย', value: 0.5 },
      { name: 'วัสดุติดตั้ง', value: 0.5 },
  ]), []);
  
  // 💡 [NEW] รวมข้อมูลทั้งหมด (8 ชิ้น) สำหรับ Pie Chart
  const fullChartData = useMemo(() => ([...data, ...EQUIPMENT_DATA]), [data, EQUIPMENT_DATA]);
  
  // 💡 สร้าง Legend Map สำหรับประเภทงานหลัก (Job Type)
  const jobLegendMap = ALL_LEGENDS.filter(item => item.type === 'job');
  
  // 💡 สร้าง Legend Map สำหรับอุปกรณ์เสริม
  const equipmentLegendMap = ALL_LEGENDS.filter(item => item.type === 'equipment');

  // 💡 [NEW] รวม Legend ทั้งหมดสำหรับแสดงผล
  const allDisplayLegends = [...jobLegendMap, ...equipmentLegendMap];

  // 💡 Logic สำหรับการ Hover บนกราฟ (ผูกกับ Index 0-7)
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  // 💡 Logic สำหรับการ Hover บน Legend ทั้งหมด
  const onLegendHover = (legendIndex: number) => {
      // Index ของ Legend ตรงกับ Index ของ fullChartData (0-7)
      setActiveIndex(legendIndex);
  };
  
  // 💡 Logic สำหรับการออกจาก Legend
  const onLegendLeave = () => {
      // กลับไป Active ที่ส่วนแรกเมื่อออกจาก Legend
      setActiveIndex(0); 
  };
  

  return (
    <Card className="h-full border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e1e2d] shadow-md transition-colors duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Wrench size={20} className="text-indigo-500" /> 
          ประเภทงานที่เชี่ยวชาญ Expertise
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
                activeShape={renderActiveShape} 
                data={fullChartData} // ✅ ใช้ข้อมูลรวม 8 ชิ้น
                cx="50%"
                cy="50%"
                innerRadius={65} 
                outerRadius={85} 
                paddingAngle={4} 
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={() => setActiveIndex(0)} 
                stroke="none" 
                cornerRadius={5} 
              >
                {fullChartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    // ✅ ใช้ CHART_COLORS ที่มี 8 สี
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    className="transition-all duration-300 outline-none focus:outline-none"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend ด้านล่าง (รวม 8 รายการเข้าด้วยกัน) */}
        <div className="mt-4 flex flex-col w-full px-4">
            
            {/* ⭐️ รวม Legend ทั้งหมด 8 รายการไว้ใน Flex Container เดียว */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                {allDisplayLegends.map((entry, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <div 
                            key={`combined-legend-${index}`} 
                            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors cursor-pointer`}
                            style={{ 
                                // ปรับ style ให้สวยงามขึ้นเมื่อ Active
                                backgroundColor: isActive ? 'hsl(210 40% 96.1% / 0.8)' : 'transparent', 
                                boxShadow: isActive && '0 0 0 1px hsl(210 40% 96.1% / 0.8)' 
                            }} 
                            onMouseEnter={() => onLegendHover(index)}
                            onMouseLeave={onLegendLeave}
                        >
                            <span
                                className="h-3 w-3 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className={`text-sm font-medium ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {entry.name}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobTypePieChart;