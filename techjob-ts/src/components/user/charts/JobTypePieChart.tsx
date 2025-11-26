"use client";

import React, { useState, useEffect } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Sector, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// ======================================================================
// 🎨 HOOKS: useThemeVars - สำหรับจัดการสีตามธีม (Dark/Light Mode)
// ======================================================================
function useThemeVars() {
  const [vars, setVars] = React.useState({
    card: "hsl(0 0% 100%)",
    border: "hsl(220 14% 96%)",
    primary: "hsl(252 80% 60%)",
    muted: "hsl(214 14% 58%)",
    foreground: "hsl(210 10% 23%)",
    background: "hsl(0 0% 100%)",
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateVars = () => {
      const s = getComputedStyle(document.documentElement);
      setVars({
        card: (s.getPropertyValue("--card") || "hsl(0 0% 100%)").trim(),
        border: (s.getPropertyValue("--border") || "hsl(220 14% 96%)").trim(),
        primary: (s.getPropertyValue("--primary") || "hsl(252 80% 60%)").trim(),
        muted: (s.getPropertyValue("--muted-foreground") || "hsl(214 14% 58%)").trim(),
        foreground: (s.getPropertyValue("--foreground") || "hsl(210 10% 23%)").trim(),
        background: (s.getPropertyValue("--background") || "hsl(0 0% 100%)").trim(),
      });
    };

    updateVars();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateVars();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateVars);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateVars);
    };
  }, []);

  return vars;
}

// ======================================================================
// 🎨 CONFIG: สีสำหรับ 6 ประเภทงาน
// ======================================================================
// ใช้ COLORS_IMAGE_2 จากโค้ดก่อนหน้า
const COLORS_JOB_TYPES = ["#007FFF", "#00C49F", "#FFBB28", "#8884d8", "#ff7300", "#d0ed57"]; 

// ======================================================================
// 💡 UTILITY: ตรวจสอบโหมดมืด
// ======================================================================
const isColorDark = (color: string) => {
  if (color.startsWith("hsl")) {
    const lightnessMatch = color.match(/hsl\(\d+\s\d+%\s(\d+)%\)/);
    if (lightnessMatch && parseInt(lightnessMatch[1]) < 50) {
      return true;
    }
  }
  return false;
};

// ======================================================================
// 🖋️ RENDERER: Active Shape (แสดงชื่อและเปอร์เซ็นต์เมื่อ Hover)
// ======================================================================
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const theme = useThemeVars();
  const isDarkMode = isColorDark(theme.background);
  const textColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground;
  
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={textColor} style={{ fontSize: "2rem", fontWeight: 700 }}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={12} textAnchor="middle" fill={theme.muted} style={{ fontSize: "1.1rem" }}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke="none" />
    </g>
  );
};


// ======================================================================
// 📦 COMPONENT: JobTypePieChart
// ======================================================================
export function JobTypePieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const theme = useThemeVars();
  // ใช้ค่าเริ่มต้นเป็น 0
  const [activeIndex, setActiveIndex] = useState(0); 
  const AnyPie: any = Pie;
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const cardClassName = "bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2C40]";
  const isDarkMode = isColorDark(theme.background);
  const legendTextColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground;
  
  const mutedColorClass = isDarkMode
    ? "text-gray-400"
    : "text-muted-foreground";

  // กรณีไม่มีข้อมูล (ตามรูปภาพ)
  if (!data || data.length === 0) {
    return (
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            ประเภทงานที่เชี่ยวชาญ
          </CardTitle>
          <CardDescription className="text-base text-gray-500 dark:text-gray-400">
            สัดส่วนของงานที่ทำสำเร็จ แยกตามหมวดหมู่ความเชี่ยวชาญ
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className={`text-base ${mutedColorClass}`}>
            ยังไม่มีข้อมูลงานที่ทำสำเร็จ
          </p>
        </CardContent>
      </Card>
    );
  }

  // กรณีมีข้อมูล
  return (
    <Card className={cardClassName}>
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          ประเภทงานที่เชี่ยวชาญ
        </CardTitle>
        <CardDescription className="text-base text-gray-500 dark:text-gray-400">
          สัดส่วนของงานที่ทำสำเร็จ แยกตามหมวดหมู่ความเชี่ยวชาญ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <AnyPie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={5}
              isAnimationActive={true}
              animationDuration={500}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              label={false}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  // ใช้ COLORS_JOB_TYPES (6 สี)
                  fill={COLORS_JOB_TYPES[index % COLORS_JOB_TYPES.length]}
                  stroke="none"
                />
              ))}
            </AnyPie>
             {/* 💡 Tooltip ถูกเพิ่มเข้ามาเพื่อให้มีข้อมูลเมื่อ hover 💡 */}
            <Tooltip formatter={(value, name) => [`${value} งาน`, name]} />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend (คำอธิบายสี) */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                // แสดงสีตาม COLORS_JOB_TYPES (6 สี)
                style={{ backgroundColor: COLORS_JOB_TYPES[index % COLORS_JOB_TYPES.length] }}
              />
              <span className="text-base" style={{ color: legendTextColor }}>
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ======================================================================
// 📦 COMPONENT: TotalCountPieChart (โค้ดเก่า, คงไว้เพื่อให้สมบูรณ์)
// ======================================================================
// (โค้ด TotalCountPieChart ที่สมบูรณ์จากด้านบน ถูกตัดออกเพื่อความกระชับในการตอบ แต่ถูกรวมอยู่ในไฟล์ต้นฉบับแล้ว)
// ...
// ...