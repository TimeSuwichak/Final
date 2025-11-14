"use client";

import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Read CSS theme variables so charts match dark / light mode
function useThemeVars() {
  const [vars, setVars] = React.useState({
    card: 'hsl(0 0% 100%)',
    border: 'hsl(220 14% 96%)',
    primary: 'hsl(252 80% 60%)',
    muted: 'hsl(214 14% 58%)',
    foreground: 'hsl(210 10% 23%)'
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = getComputedStyle(document.documentElement);
    setVars(prev => ({
      card: (s.getPropertyValue('--card') || prev.card).trim(),
      border: (s.getPropertyValue('--border') || prev.border).trim(),
      primary: (s.getPropertyValue('--primary') || prev.primary).trim(),
      muted: (s.getPropertyValue('--muted-foreground') || prev.muted).trim(),
      foreground: (s.getPropertyValue('--foreground') || prev.foreground).trim(),
    }));
  }, []);

  return vars;
}

export function MonthlyPerformanceChart({ data }: { data: { name: string, "งานที่เสร็จ": number }[] }) {
  const theme = useThemeVars();
  // annotate percent change vs previous month for tooltip
  const annotated = data.map((d, i) => {
    const prev = i > 0 ? data[i - 1]["งานที่เสร็จ"] : null;
    const pct = prev !== null && prev !== 0 ? ((d["งานที่เสร็จ"] - prev) / prev) * 100 : null;
    return { ...d, pct };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const pctText = p.pct === null ? '—' : `${p.pct >= 0 ? '+' : ''}${p.pct.toFixed(1)}%`;
    return (
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: 10, color: theme.foreground, borderRadius: 8, minWidth: 160 }}>
        <div style={{ fontSize: 12, opacity: 0.9 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{p["งานที่เสร็จ"]} งาน</div>
        <div style={{ fontSize: 12, marginTop: 6, opacity: 0.95 }}>เปลี่ยนจากเดือนก่อน: {pctText}</div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ผลงานรายเดือน</CardTitle>
        <CardDescription>จำนวนงานที่คุณทำสำเร็จในแต่ละเดือน</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={annotated} margin={{ top: 16, right: 12, left: 0, bottom: 6 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={theme.primary} stopOpacity={0.95} />
                <stop offset="100%" stopColor={theme.primary} stopOpacity={0.25} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke={theme.border} strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="name"
              stroke={theme.muted}
              fontSize={13}
              tickLine={false}
              axisLine={false}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              stroke={theme.muted}
              fontSize={13}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" wrapperStyle={{ color: theme.foreground }} />

            <Bar dataKey="งานที่เสร็จ" fill="url(#barGrad)" radius={[8, 8, 4, 4]} barSize={42}>
              <LabelList dataKey="งานที่เสร็จ" position="top" style={{ fill: theme.foreground, fontSize: 12, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}