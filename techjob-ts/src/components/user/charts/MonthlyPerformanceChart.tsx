"use client";

import React from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// [!!] เเก้บัค: อัปเดต Hook ให้อ่านค่าสีใหม่เมื่อธีมเปลี่ยน
function useThemeVars() {
  const [vars, setVars] = React.useState({
    card: "hsl(0 0% 100%)",
    border: "hsl(220 14% 96%)",
    primary: "hsl(252 80% 60%)",
    muted: "hsl(214 14% 58%)",
    foreground: "hsl(210 10% 23%)",
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // [!!] เเก้บัค: สร้างฟังก์ชันสำหรับอ่านค่าสี CSS
    const updateVars = () => {
      const s = getComputedStyle(document.documentElement);
      setVars((prev) => ({
        card: (s.getPropertyValue("--card") || prev.card).trim(),
        border: (s.getPropertyValue("--border") || prev.border).trim(),
        primary: (s.getPropertyValue("--primary") || prev.primary).trim(),
        muted: (s.getPropertyValue("--muted-foreground") || prev.muted).trim(),
        foreground: (s.getPropertyValue("--foreground") || prev.foreground).trim(),
      }));
    };

    // [!!] เเก้บัค: อ่านค่าสีครั้งแรกตอนโหลด
    updateVars();

    // [!!] เเก้บัค: สร้าง Observer
    // เราจะคอยดูการเปลี่ยนแปลง class หรือ style ที่ <html>
    // (ซึ่งเป็นวิธีที่ shadcn/next-themes ใช้ในการสลับ 'dark' mode)
    const observer = new MutationObserver((mutations) => {
      // ถ้ามีการเปลี่ยนแปลง ให้เรียก updateVars() เพื่ออ่านค่าสีใหม่
      updateVars();
    });

    // [!!] เเก้บัค: สั่งให้ Observer เริ่มทำงาน
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"], // ดูแค่ class กับ style
    });

    // [!!] เเก้บัค: คืนค่า cleanup function เพื่อหยุด observer
    return () => observer.disconnect();
    
  }, []); // useEffect ยังคงทำงานครั้งเดียวเพื่อ "ติดตั้ง" observer

  return vars;
}

export function MonthlyPerformanceChart({
  data,
}: {
  data: { name: string; "งานที่เสร็จ": number }[];
}) {
  const theme = useThemeVars(); // Hook นี้จะ re-render เมื่อ vars เปลี่ยน
  
  // (ส่วนของ annotated data - ไม่เปลี่ยนแปลง)
  const annotated = data.map((d, i) => {
    const prev = i > 0 ? data[i - 1]["งานที่เสร็จ"] : null;
    const pct =
      prev !== null && prev !== 0
        ? ((d["งานที่เสร็จ"] - prev) / prev) * 100
        : null;
    return { ...d, pct };
  });

  // (ส่วนของ CustomTooltip - ไม่เปลี่ยนแปลง)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const pctText =
      p.pct === null ? "—" : `${p.pct >= 0 ? "+" : ""}${p.pct.toFixed(1)}%`;
    return (
      <div
        style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          padding: 10,
          color: theme.foreground,
          borderRadius: 8,
          minWidth: 160,
        }}
      >
        <div style={{ fontSize: 14, opacity: 0.9 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
          {p["งานที่เสร็จ"]} งาน
        </div>
        <div style={{ fontSize: 14, marginTop: 6, opacity: 0.95 }}>
          เปลี่ยนจากเดือนก่อน: {pctText}
        </div>
      </div>
    );
  };

  return (
    <Card>
      {/* (ส่วนของ CardHeader - ไม่เปลี่ยนแปลง) */}
      <CardHeader>
        <CardTitle className="text-2xl tracking-tight">ผลงานรายเดือน</CardTitle>
        <CardDescription className="text-base">
          จำนวนงานที่คุณทำสำเร็จในแต่ละเดือน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={annotated}
            margin={{ top: 16, right: 12, left: 0, bottom: 6 }}
          >
            {/* [!!] ส่วนนี้สำคัญมาก 
              เพราะ `theme.primary` ในนี้จะอัปเดตตาม state ที่เปลี่ยนแล้ว
            */}
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.primary} stopOpacity={0.95} />
                <stop
                  offset="100%"
                  stopColor={theme.primary}
                  stopOpacity={0.25}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke={theme.border}
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* (ส่วนของ XAxis, YAxis - ไม่เปลี่ยนแปลง) */}
            <XAxis
              dataKey="name"
              stroke={theme.muted}
              fontSize={14}
              tickLine={false}
              axisLine={false}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              stroke={theme.muted}
              fontSize={14}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />
            
            {/* (ส่วนของ Legend - ไม่เปลี่ยนแปลง) */}
            <Legend
              verticalAlign="top"
              wrapperStyle={{
                color: theme.foreground,
                fontSize: 14,
                paddingTop: 5,
                paddingBottom: 10,
              }}
            />

            {/* (ส่วนของ Bar, LabelList - ไม่เปลี่ยนแปลง) */}
            <Bar
              dataKey="งานที่เสร็จ"
              fill="url(#barGrad)"
              radius={[8, 8, 4, 4]}
              barSize={42}
            >
              <LabelList
                dataKey="งานที่เสร็จ"
                position="top"
                style={{
                  fill: theme.foreground,
                  fontSize: 15,
                  fontWeight: 700,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}