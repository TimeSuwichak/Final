import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

// --- Type (เหมือนเดิม) ---
type Job = {
  id: string;
  department?: string;
  dept?: string;
};

// --- Colors (เหมือนเดิม) ---
const COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
];

export default function WorkloadDistributionChart() {
  const { jobs = [] } = useJobs() as { jobs: Job[] }; 

  const data = useMemo(() => {
    // ... (Logic การคำนวณเหมือนเดิม) ...
    const map: Record<string, number> = {};
    for (const j of jobs) {
      const dept = j.department || j.dept || 'ไม่ระบุ';
      map[dept] = (map[dept] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          {/* [UPGRADE] เพิ่มขนาด Title เป็น text-xl */}
          <CardTitle className="text-xl font-semibold">การกระจายภาระงาน</CardTitle>
          <CardDescription className="text-sm">สัดส่วนงานต่อแผนก (จำนวนงาน)</CardDescription>
        </div>
        <PieChartIcon className="h-6 w-6 text-indigo-600" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          // [UPGRADE] เพิ่มขนาด Font ของ Fallback text
          <p className="text-base text-muted-foreground text-center py-10">
            ไม่มีข้อมูลงานสำหรับแสดงผล
          </p>
        ) : (
          // [UPGRADE] เพิ่มความสูงของ Chart เป็น h-[300px]
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  // [UPGRADE] ขยายขนาด Donut chart
                  innerRadius={60} 
                  outerRadius={100}
                  paddingAngle={4} 
                  fill="#8884d8" 
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0.5rem', 
                    borderColor: 'hsl(var(--border))', 
                    backgroundColor: 'hsl(var(--popover))', 
                    color: 'hsl(var(--popover-foreground))',
                    // [UPGRADE] เพิ่มขนาด font ใน Tooltip
                    fontSize: '16px' 
                  }}
                  // [UPGRADE] ทำให้ Label (Name) เป็นตัวหนา
                  labelStyle={{ fontWeight: '600' }}
                />
                <Legend 
                  iconType="circle" 
                  // [UPGRADE] เพิ่มขนาด font ของ Legend
                  wrapperStyle={{ 
                    fontSize: '16px', 
                    paddingTop: '10px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}