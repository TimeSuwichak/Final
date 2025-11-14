import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react'; // Import Icon ที่เข้ากัน

// --- Type (เพื่อขจัด 'as any') ---
type Job = {
  id: string;
  department?: string;
  dept?: string;
  // เพิ่ม field อื่นๆ ที่อาจเกี่ยวข้อง ถ้ามี
};

// --- Colors ---
// สีที่เข้ากับ shadcn/ui (Tailwind colors)
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
  const { jobs = [] } = useJobs() as { jobs: Job[] }; // ใช้ Type

  const data = useMemo(() => {
    const map: Record<string, number> = {};
    // ใช้ Type ที่ชัดเจน
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
          <CardTitle className="text-lg font-semibold">การกระจายภาระงาน</CardTitle>
          <CardDescription className="text-sm">สัดส่วนงานต่อแผนก (จำนวนงาน)</CardDescription>
        </div>
        {/* เพิ่ม Icon ที่นี่ - ใช้สีที่สอดคล้องกับสีแรกของ Chart */}
        <PieChartIcon className="h-6 w-6 text-indigo-600" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            ไม่มีข้อมูลงานสำหรับแสดงผล
          </p>
        ) : (
          // กำหนดความสูงของ Chart ให้ชัดเจน
          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50} // เพิ่มขนาดรูตรงกลางเล็กน้อย (Donut chart)
                  outerRadius={80}
                  paddingAngle={4} // ระยะห่างระหว่างชิ้น
                  fill="#8884d8" // สีตั้งต้น (จะถูก override โดย Cell)
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0.5rem', // 8px
                    borderColor: 'hsl(var(--border))', 
                    backgroundColor: 'hsl(var(--popover))', 
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}