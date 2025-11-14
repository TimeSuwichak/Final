import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'; // ลบ CardDescription ออกจาก import นี้ เพราะเราจะใช้ <p> ธรรมดาแทน
import { useJobs } from '../../contexts/JobContext';
import { CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';

// --- Type Definition ---
// เพิ่ม Type เพื่อให้โค้ดสะอาดขึ้น และลบ 'as any' ออก
type Job = {
  status: string;
  finishedAt?: string | Date;
  completedAt?: string | Date;
  endDate?: string | Date;
};

// --- Kpi Component (ปรับปรุงใหม่) ---
interface KpiProps {
  title: string;
  value: number | string;
  desc: string;
  icon: React.ReactNode;
}

// นี่คือโครงสร้างมาตรฐานของ shadcn/ui สำหรับ Stat Card
// เรียบร้อย, อ่านง่าย, และเว้นวรรคได้สวยงาม
const Kpi = ({ title, value, desc, icon }: KpiProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {/* Icon จะแสดงที่มุมบนขวา */}
      {icon}
    </CardHeader>
    <CardContent>
      {/* ตัวเลข (Value) จะเด่นที่สุด */}
      <div className="text-2xl font-bold">{value}</div>
      {/* คำอธิบาย (Description) เป็นข้อมูลเสริม */}
      <p className="text-xs text-muted-foreground">{desc}</p>
    </CardContent>
  </Card>
);

// --- KpiRow Component (ปรับปรุงใหม่) ---
export default function KpiRow() {
  // ทำให้การดึงข้อมูลมี Type ที่ชัดเจน
  const { jobs = [] } = useJobs() as { jobs: Job[] };

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    let newJobs = 0;
    let inProgress = 0;
    let pendingApproval = 0;
    let completedToday = 0;

    // ไม่ต้องใช้ 'as any' แล้ว
    for (const j of jobs) {
      const status = j.status || '';
      if (status === 'new' || status === 'received') newJobs++;
      if (status === 'in-progress' || status === 'working') inProgress++;
      if (status === 'pending' || status === 'review') pendingApproval++;
      if (status === 'done' || status === 'completed') {
        const finishedAt = j.finishedAt || j.completedAt || j.endDate;
        if (finishedAt) {
          const t = new Date(finishedAt).getTime();
          if (t >= startOfDay && t <= endOfDay) completedToday++;
        }
      }
    }

    return { newJobs, inProgress, pendingApproval, completedToday };
  }, [jobs]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* ส่ง Icon ที่ใส่สีเข้าไป
        - text-blue-500: สื่อถึงของใหม่ (New)
        - text-orange-500: สื่อถึงงานที่กำลังทำ (In Progress)
        - text-amber-500: สื่อถึงการรอ (Pending) - ใช้ amber (เหลืองเข้ม) แทน AlertTriangle (แดง) เพื่อไม่ให้ดูน่ากลัวเกินไป
        - text-green-500: สื่อถึงความสำเร็จ (Completed)
      */}
      <Kpi 
        title="รับงานใหม่" 
        value={stats.newJobs} 
        desc="งานรอรับและจ่ายงาน" 
        icon={<Calendar className="h-4 w-4 text-blue-500" />} 
      />
      <Kpi 
        title="กำลังดำเนินการ" 
        value={stats.inProgress} 
        desc="ช่างกำลังปฏิบัติงาน" 
        icon={<Clock className="h-4 w-4 text-orange-500" />} 
      />
      <Kpi 
        title="รอดำเนินการ/อนุมัติ" 
        value={stats.pendingApproval} 
        desc="รออนุมัติหรือรีวิว" 
        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} 
      />
      <Kpi 
        title="เสร็จวันนี้" 
        value={stats.completedToday} 
        desc="งานที่เสร็จภายในวันนี้" 
        icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} 
      />
    </div>
  );
}