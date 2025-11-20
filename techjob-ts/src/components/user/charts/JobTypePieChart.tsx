"use client";

import React, { useState, useEffect } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Sector, Legend, Tooltip } from "recharts";
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
// 🎨 CONFIG: สีสำหรับ 6 ประเภทงาน (ใช้เป็นค่าคงที่)
// ======================================================================
// สีจากภาพแรก: เขียว, เหลือง, น้ำเงิน, ม่วง, ชมพู/แดง, เทา
const COLORS_IMAGE_1 = ["#39CC97", "#FFB63B", "#68A5FF", "#9C6ADE", "#F36E8B", "#666666"]; 

// สีสำหรับภาพที่สอง (ปรับปรุงให้ใช้ 6 สี)
const COLORS_IMAGE_2 = ["#007FFF", "#00C49F", "#FFBB28", "#8884d8", "#ff7300", "#d0ed57"]; 

// 💡 DATA: ข้อมูลตัวอย่าง 6 งาน สำหรับ TotalCountPieChart (เพื่อการทดสอบ)
const DATA_SIX_JOBS_EXAMPLE = [
  { name: "งานไฟฟ้า", value: 40, percentage: 25.0 },
  { name: "งานประปา", value: 30, percentage: 18.7 },
  { name: "งานเน็ตเวิร์ค", value: 50, percentage: 31.3 },
  { name: "งานโครงสร้าง", value: 15, percentage: 9.4 },
  { name: "งานตกแต่ง", value: 10, percentage: 6.2 },
  { name: "งานทั่วไป", value: 15, percentage: 9.4 },
];

const TOTAL_SIX_JOBS_COUNT = DATA_SIX_JOBS_EXAMPLE.reduce((sum, item) => sum + item.value, 0); // 160

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
// 🖋️ RENDERER: Active Shape (สำหรับ TotalCountPieChart)
// ======================================================================
const renderTotalCountActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} stroke="none" />
    </g>
  );
};


// ======================================================================
// 📦 COMPONENT: TotalCountPieChart (ตามภาพแรก)
// ======================================================================
export function TotalCountPieChart({
  data = DATA_SIX_JOBS_EXAMPLE, // ใช้ข้อมูล 6 งานเริ่มต้น
  totalCount = TOTAL_SIX_JOBS_COUNT, // ใช้ Total Count 160
  title = "สถิติรวมประเภทงาน",
  description = "จำนวนงานที่สำเร็จทั้งหมด แบ่งตามประเภทงาน",
}: {
  data?: { name: string; value: number; percentage: number }[];
  totalCount?: number;
  title?: string;
  description?: string;
}) {
  const theme = useThemeVars();
  const [activeIndex, setActiveIndex] = useState(-1);
  const AnyPie: any = Pie;
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const isDarkMode = isColorDark(theme.background);
  const legendTextColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground;
  const textColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground;

  // ส่วนแสดง Legend ที่กำหนดเอง 
  const renderCustomLegend = () => (
    <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
      {data.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: COLORS_IMAGE_1[index % COLORS_IMAGE_1.length] }}
          />
          <span className="text-base" style={{ color: legendTextColor }}>
            {entry.name} ({entry.percentage.toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          {title}
        </CardTitle>
        <CardDescription className="text-base">
          {description}
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
              innerRadius={90}
              outerRadius={130}
              paddingAngle={2}
              isAnimationActive={true}
              animationDuration={500}
              activeIndex={activeIndex}
              activeShape={renderTotalCountActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              label={false}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS_IMAGE_1[index % COLORS_IMAGE_1.length]}
                  stroke="none"
                />
              ))}
            </AnyPie>
            
            {/* 💡 ส่วนที่เพิ่มเข้ามา: แสดงตัวเลขตรงกลาง Donut Chart 💡 */}
            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" fill={textColor}>
                <tspan x="50%" dy="-0.5em" style={{ fontSize: "2rem", fontWeight: 700 }}>
                    {totalCount}
                </tspan>
                <tspan x="50%" dy="1.5em" style={{ fontSize: "1.1rem" }} fill={theme.muted}>
                    งานทั้งหมด
                </tspan>
            </text>

            <Tooltip formatter={(value, name) => [`${value} งาน`, name]} />

          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend ที่กำหนดเอง (แสดง % ตามภาพแรก) */}
        {renderCustomLegend()}
      </CardContent>
    </Card>
  );
}

// ======================================================================
// 📦 COMPONENT: JobTypePieChart (ตามภาพที่สอง - ใช้โครงสร้างเดิม)
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

export function JobTypePieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const theme = useThemeVars();
  const [activeIndex, setActiveIndex] = useState(0);
  const AnyPie: any = Pie;
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const isDarkMode = isColorDark(theme.background);
  const legendTextColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground;
  
  const mutedColorClass = isDarkMode
    ? "text-gray-400"
    : "text-muted-foreground";

  // กรณีไม่มีข้อมูล
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">
            ประเภทงานที่เชี่ยวชาญ
          </CardTitle>
          <CardDescription className="text-base">
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
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">
          ประเภทงานที่เชี่ยวชาญ
        </CardTitle>
        <CardDescription className="text-base">
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
                  // ใช้ COLORS_IMAGE_2 (6 สี)
                  fill={COLORS_IMAGE_2[index % COLORS_IMAGE_2.length]}
                  stroke="none"
                />
              ))}
            </AnyPie>
          </PieChart>
        </ResponsiveContainer>

        {/* Legend (คำอธิบายสี) */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                // แสดงสีตาม COLORS_IMAGE_2 (6 สี)
                style={{ backgroundColor: COLORS_IMAGE_2[index % COLORS_IMAGE_2.length] }}
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