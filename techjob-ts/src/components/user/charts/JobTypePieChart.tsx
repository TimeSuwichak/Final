"use client";

import React, { useState, useEffect } from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Sector } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// --- [FIX] useThemeVars Hook (ที่คอยดักฟังการสลับธีม - ตัวนี้ถูกต้องแล้ว) ---
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

    // ฟังก์ชันสำหรับดึงค่าสี CSS
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

    updateVars(); // เรียกครั้งแรก

    // [สำคัญ] ใช้ MutationObserver คอยฟังการเปลี่ยนแปลง class บน <html>
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateVars(); // อัปเดตสีเมื่อ class เปลี่ยน (สลับธีม)
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    // (เผื่อไว้) คอยฟังการเปลี่ยนแปลงธีมจาก System
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateVars);

    // Cleanup: หยุดฟังเมื่อ component ปิดตัว
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateVars);
    };
  }, []);

  return vars;
}

// (COLORS, isColorDark, renderActiveShape - ไม่เปลี่ยนแปลง)
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const isColorDark = (color: string) => {
  if (color.startsWith("hsl")) {
    const lightnessMatch = color.match(/hsl\(\d+\s\d+%\s(\d+)%\)/);
    if (lightnessMatch && parseInt(lightnessMatch[1]) < 50) {
      return true;
    }
  }
  return false;
};

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

  if (!data || data.length === 0) {
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
          <p className={`text-base ${mutedColorClass}`}>
            ยังไม่มีข้อมูลงานที่ทำสำเร็จ
          </p>
        </CardContent>
      </Card>
    );
  }

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
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </AnyPie>
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {data.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
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