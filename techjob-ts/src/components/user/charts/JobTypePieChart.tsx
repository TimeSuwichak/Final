"use client";

import React, { useState, useEffect } from "react"; // เพิ่ม useEffect
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// (useThemeVars hook - ไม่เปลี่ยนแปลง)
function useThemeVars() {
  const [vars, setVars] = React.useState({
    card: "hsl(0 0% 100%)",
    border: "hsl(220 14% 96%)",
    primary: "hsl(252 80% 60%)",
    muted: "hsl(214 14% 58%)",
    foreground: "hsl(210 10% 23%)",
    background: "hsl(0 0% 100%)", // เพิ่ม background เข้ามา
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const s = getComputedStyle(document.documentElement);
    setVars((prev) => ({
      card: (s.getPropertyValue("--card") || prev.card).trim(),
      border: (s.getPropertyValue("--border") || prev.border).trim(),
      primary: (s.getPropertyValue("--primary") || prev.primary).trim(),
      muted: (s.getPropertyValue("--muted-foreground") || prev.muted).trim(),
      foreground: (s.getPropertyValue("--foreground") || prev.foreground).trim(),
      background: (s.getPropertyValue("--background") || prev.background).trim(), // ดึง background มาด้วย
    }));
  }, []);

  return vars;
}

// สีสำหรับแต่ละประเภทงาน
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

// Helper function เพื่อตรวจสอบว่าเป็น Dark Mode
const isColorDark = (color: string) => {
  // ตัวอย่างการตรวจสอบ: ถ้าค่า HSL ของ background มี L (Lightness) ต่ำ แสดงว่าเป็น Dark Mode
  // หรือถ้าสีมีค่า RGB ที่รวมกันแล้วน้อยกว่าค่าที่กำหนด
  // ใน shadcn/ui dark mode มักจะมี --background เป็นสีเข้ม
  // เราจะดูที่ --background เป็นหลักเพื่อความแม่นยำ
  if (color.startsWith("hsl")) {
    const lightnessMatch = color.match(/hsl\(\d+\s\d+%\s(\d+)%\)/);
    if (lightnessMatch && parseInt(lightnessMatch[1]) < 50) {
      return true; // Lightness ต่ำกว่า 50% ถือว่ามืด
    }
  }
  // คุณสามารถเพิ่มเงื่อนไขการตรวจสอบสีอื่นๆ ได้ตามต้องการ
  // เช่น ถ้าสีเป็น #000000 หรือมีค่าใกล้เคียง
  return false;
};

// (renderActiveShape component)
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props;
  const theme = useThemeVars(); // ดึง theme มาใช้

  // ใช้ isColorDark จากสีพื้นหลังของ Card หรือ Background โดยรวม
  const isDarkMode = isColorDark(theme.background); // ตรวจสอบจาก background โดยตรง
  const textColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground; // ถ้าเป็น Dark Mode ให้ใช้สีขาว

  return (
    <g>
      {/* [!!] 1. ปรับขนาด Font ข้อความตรงกลาง (ชื่อ) */}
      <text
        x={cx}
        y={cy - 10}
        dy={8}
        textAnchor="middle"
        fill={textColor} // ใช้ textColor ที่ปรับแล้ว
        // [!!] ปรับให้ใหญ่และหนาขึ้น
        style={{ fontSize: "2rem", fontWeight: 700 }} // e.g., 32px
      >
        {payload.name}
      </text>
      {/* [!!] 2. ปรับขนาด Font ข้อความตรงกลาง (เปอร์เซ็นต์) */}
      <text
        x={cx}
        y={cy + 10}
        dy={12} // เพิ่มระยะห่างจากชื่อ
        textAnchor="middle"
        fill={theme.muted} // muted-foreground มักจะปรับตาม theme อยู่แล้ว
        // [!!] ปรับให้ใหญ่ขึ้น
        style={{ fontSize: "1.1rem" }} // e.g., ~18px
      >
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

  // ใช้ isColorDark จากสีพื้นหลังของ Card หรือ Background โดยรวม
  const isDarkMode = isColorDark(theme.background); // ตรวจสอบจาก background โดยตรง
  const legendTextColor = isDarkMode ? "hsl(0 0% 90%)" : theme.foreground; // ถ้าเป็น Dark Mode ให้ใช้สีขาว

  if (!data || data.length === 0) {
    // (ส่วนแสดง "ไม่มีข้อมูล" - [!!] ปรับขนาด Font ที่นี่)
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">
            ประเภทงานที่เชี่ยวชาญ
          </CardTitle>
          <CardDescription className="text-base">
            สัดส่วนประเภทงานทั้งหมดที่คุณเคยทำสำเร็จ
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          {/* [!!] 3. ปรับขนาด Font ของ Fallback */}
          <p className="text-base text-muted-foreground">
            ยังไม่มีข้อมูลงานที่ทำสำเร็จ
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {/* [!!] 4. ปรับขนาด Font หัวข้อหลัก */}
        <CardTitle className="text-2xl tracking-tight">
          ประเภทงานที่เชี่ยวชาญ
        </CardTitle>
        <CardDescription className="text-base">
          สัดส่วนประเภทงานทั้งหมดที่คุณเคยทำสำเร็จ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* กราฟ */}
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
                  fill={COLORS[index % COLORS.length]}
                  stroke={theme.card}
                  strokeWidth={2}
                />
              ))}
            </AnyPie>
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend (คำอธิบาย) - [!!] ปรับขนาด Font ที่นี่ */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length]} }
              />
              {/* [!!] 5. ปรับขนาด Font ของ Legend */}
              <span
                className="text-base" // เปลี่ยนจาก text-sm
                style={{ color: legendTextColor }} // ใช้ legendTextColor ที่ปรับแล้ว
              >
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}