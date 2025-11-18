import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import { 
  CheckCircle2, 
  FileSignature, 
  AlertOctagon,
  Briefcase // [NEW] ใช้ไอคอนกระเป๋าทำงาน แทนงานทั้งหมด
} from 'lucide-react';

// --- Type Definition ---
type Job = {
  id: string | number;
  status: string;
  finishedAt?: string | Date;
  completedAt?: string | Date;
  endDate?: string | Date;
};

interface KpiProps {
  title: string;
  value: number | string;
  desc: string;
  icon: React.ReactNode;
  trend?: string;
}

const Kpi = ({ title, value, desc, icon, trend }: KpiProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className={`text-4xl font-bold ${trend}`}>{value}</div>
      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </CardContent>
  </Card>
);

export default function SupervisorKpiRow() {
  const { jobs = [] } = useJobs() as { jobs: Job[] };

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. งานทั้งหมด (นับจาก Array ตรงๆ)
    const totalJobs = jobs.length;

    let completedThisMonth = 0;
    let pendingApproval = 0;
    let overdueCount = 0;
    
    for (const j of jobs) {
      const status = j.status || '';
      const finishedDateRaw = j.finishedAt || j.completedAt;
      const finishedDate = finishedDateRaw ? new Date(finishedDateRaw) : null;

      // 2. นับงานเสร็จเดือนนี้
      if ((status === 'done' || status === 'completed') && finishedDate) {
        if (finishedDate.getMonth() === currentMonth && 
            finishedDate.getFullYear() === currentYear) {
          completedThisMonth++;
        }
      }

      // 3. งานรออนุมัติ
      if (status === 'pending' || status === 'review') {
        pendingApproval++;
      }

      // 4. งานล่าช้า
      if (status !== 'done' && status !== 'completed' && status !== 'cancel' && j.endDate) {
        if (new Date(j.endDate) < now) overdueCount++;
      }
    }

    return { 
      totalJobs,
      completedThisMonth, 
      pendingApproval, 
      overdueCount 
    };
  }, [jobs]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {/* KPI 1: งานทั้งหมด */}
      <Kpi 
        title="งานทั้งหมด" 
        value={stats.totalJobs} 
        desc="จำนวนใบงานทั้งหมดในระบบ" 
        icon={<Briefcase className="h-5 w-5 text-indigo-500" />} 
      />

      {/* KPI 2: ปิดงานเดือนนี้ */}
      <Kpi 
        title="ปิดงานเดือนนี้" 
        value={stats.completedThisMonth} 
        desc={`ยอดรวมเดือน ${new Date().toLocaleDateString('th-TH', { month: 'long' })}`} 
        icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />} 
      />

      {/* KPI 3: รออนุมัติ */}
      <Kpi 
        title="รอตรวจสอบ/อนุมัติ" 
        value={stats.pendingApproval} 
        desc="งานที่รอคุณอนุมัติ" 
        icon={<FileSignature className="h-5 w-5 text-amber-500" />}
        trend={stats.pendingApproval > 0 ? "text-amber-600" : ""} 
      />

      {/* KPI 4: งานล่าช้า */}
      <Kpi 
        title="งานล่าช้ากว่ากำหนด" 
        value={stats.overdueCount} 
        desc="งานที่เกิน Due Date" 
        icon={<AlertOctagon className="h-5 w-5 text-red-500" />} 
        trend={stats.overdueCount > 0 ? "text-red-600" : ""}
      />
    </div>
  );
}