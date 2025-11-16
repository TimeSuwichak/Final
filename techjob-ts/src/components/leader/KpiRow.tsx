import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import { CheckCircle2, Clock, AlertTriangle, Calendar } from 'lucide-react';

// --- Type Definition ---
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

const Kpi = ({ title, value, desc, icon }: KpiProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      {/* [UPGRADE] 
        - เปลี่ยนจาก text-sm font-medium (เล็ก) 
        - เป็น text-base font-semibold (ใหญ่ขึ้นและชัดขึ้น)
      */}
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {/* [UPGRADE] 
        - เปลี่ยนจาก text-2xl (ใหญ่)
        - เป็น text-4xl font-bold (ใหญ่และเด่นชัดมาก)
      */}
      <div className="text-4xl font-bold">{value}</div>
      {/* [UPGRADE] 
        - เปลี่ยนจาก text-xs (เล็กมาก)
        - เป็น text-sm (อ่านง่ายขึ้น)
      */}
      <p className="text-sm text-muted-foreground">{desc}</p>
    </CardContent>
  </Card>
);

// --- KpiRow Component (ปรับปรุงใหม่) ---
export default function KpiRow() {
  const { jobs = [] } = useJobs() as { jobs: Job[] };

  const stats = useMemo(() => {
    // ... (ส่วน Logic การคำนวณเหมือนเดิม) ...
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    let newJobs = 0;
    let inProgress = 0;
    let pendingApproval = 0;
    let completedToday = 0;

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
      {/* [UPGRADE] 
        - เปลี่ยน Icon จาก h-4 w-4 (16px) 
        - เป็น h-5 w-5 (20px) ให้สมดุลกับ Title ใหม่
      */}
      <Kpi 
        title="รับงานใหม่" 
        value={stats.newJobs} 
        desc="งานรอรับและจ่ายงาน" 
        icon={<Calendar className="h-5 w-5 text-blue-500" />} 
      />
      <Kpi 
        title="กำลังดำเนินการ" 
        value={stats.inProgress} 
        desc="ช่างกำลังปฏิบัติงาน" 
        icon={<Clock className="h-5 w-5 text-orange-500" />} 
      />
      <Kpi 
        title="รอดำเนินการ/อนุมัติ" 
        value={stats.pendingApproval} 
        desc="รออนุมัติหรือรีวิว" 
        icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} 
      />
      <Kpi 
        title="เสร็จวันนี้" 
        value={stats.completedToday} 
        desc="งานที่เสร็จภายในวันนี้" 
        icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} 
      />
    </div>
  );
}