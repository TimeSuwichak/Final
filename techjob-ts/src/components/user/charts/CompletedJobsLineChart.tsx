"use client";

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Theme helper (reads CSS variables so chart matches dark/light)
function useThemeVars() {
  const [vars, setVars] = React.useState({
    card: 'hsl(0 0% 100%)',
    border: 'rgba(255,255,255,0.06)',
    primary: '#60A5FA', // fallback light-blue
    muted: 'rgba(255,255,255,0.6)',
    foreground: '#E6EEF8'
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = getComputedStyle(document.documentElement);
    setVars(prev => ({
      card: (s.getPropertyValue('--card') || prev.card).trim(),
      border: (s.getPropertyValue('--border') || prev.border).trim(),
      primary: (s.getPropertyValue('--primary') || prev.primary).trim() || prev.primary,
      muted: (s.getPropertyValue('--muted-foreground') || prev.muted).trim(),
      foreground: (s.getPropertyValue('--foreground') || prev.foreground).trim(),
    }));
  }, []);

  return vars;
}

export type MonthlyPoint = { name: string; value: number };

export function CompletedJobsLineChart({ data, height = 360 }: { data: MonthlyPoint[]; height?: number }) {
  const theme = useThemeVars();

  // annotate percent change from previous month
  const annotated = data.map((d, i) => {
    const prev = i > 0 ? data[i - 1].value : null;
    const pct = prev !== null && prev !== 0 ? ((d.value - prev) / prev) * 100 : null;
    return { ...d, pct };
  });

  const lastIndex = Math.max(0, annotated.length - 1);

  // custom tooltip to show month, count and percent change
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    const pctText = p.pct === null ? '—' : `${p.pct >= 0 ? '+' : ''}${p.pct.toFixed(1)}%`;

    return (
      <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: 10, color: theme.foreground, borderRadius: 8, minWidth: 180 }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginTop: 6 }}>{p.value} งาน</div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>เปลี่ยนจากเดือนก่อน: {pctText}</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: 6, background: theme.primary, display: 'inline-block' }} />
          <span style={{ fontSize: 12, color: theme.muted }}>เส้นแสดงจำนวนงานที่เสร็จ</span>
        </div>
      </div>
    );
  };

  // custom dot renderer: circular dot; label only for last point
  const renderDot = (props: any) => {
    const { cx, cy, index, payload } = props;
    if (cx == null || cy == null) return null;
    const isLast = index === lastIndex;
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} stroke={theme.card} strokeWidth={2} fill={theme.primary} />
        {isLast && (
          <text x={cx} y={cy - 14} fill={theme.foreground} fontSize={12} fontWeight={700} textAnchor="middle">
            {payload.value}
          </text>
        )}
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>จำนวนงานที่ทำสำเร็จ</CardTitle>
        <CardDescription>แสดงแนวโน้มผลงานเป็น Line Chart</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height, position: 'relative' }}>
          {/* top-right badge: latest value + pct change */}
          {annotated.length > 0 && (
            <div style={{ position: 'absolute', right: 12, top: 8, zIndex: 2 }}>
              <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: '6px 10px', borderRadius: 10, color: theme.foreground, fontWeight: 700 }}>
                <div style={{ fontSize: 12, opacity: 0.85 }}>ล่าสุด</div>
                <div style={{ fontSize: 16 }}>{annotated[lastIndex].value} งาน</div>
                <div style={{ fontSize: 12, color: annotated[lastIndex].pct && annotated[lastIndex].pct >= 0 ? '#22c55e' : '#ef4444' }}>{annotated[lastIndex].pct === null ? '—' : `${annotated[lastIndex].pct >= 0 ? '+' : ''}${annotated[lastIndex].pct.toFixed(1)}%`}</div>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={annotated} margin={{ top: 28, right: 28, left: 0, bottom: 8 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.primary} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={theme.primary} stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={theme.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={theme.muted} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke={theme.muted} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />

              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="value" stroke="none" fill="url(#areaGrad)" />

              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.primary}
                strokeWidth={3}
                strokeLinecap="round"
                dot={renderDot}
                activeDot={{ r: 7 }}
                animationDuration={700}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default CompletedJobsLineChart;
