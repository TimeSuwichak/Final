import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import {
  Activity,       // Icon สำหรับ Header
  CheckCircle2,   // Icon สำหรับ Completed
  Clock,          // Icon สำหรับ In Progress
  FilePlus,       // Icon สำหรับ New
  AlertTriangle,  // Icon สำหรับ Pending
  XCircle,        // Icon สำหรับ Cancelled
  FileText        // Icon สำหรับ Default
} from 'lucide-react';

// --- Types (เพื่อขจัด 'as any') ---
type Job = {
  id: string;
  title?: string;
  subject?: string;
  status: string; // 'new', 'in-progress', 'completed', 'pending', 'cancelled' etc.
  updatedAt?: string | Date;
  createdAt?: string | Date;
  created_on?: string | Date;
};

// --- Helper: Get Timestamp (รวม Logic ที่ซ้ำซ้อน) ---
const getTimestamp = (job: Job): number => {
  const ts = job.updatedAt || job.createdAt || job.created_on;
  return ts ? new Date(ts).getTime() : 0;
};

// --- Helper: Get Status Icon (หัวใจของการ "ตกแต่ง") ---
const getStatusIcon = (status: string) => {
  const s = status.toLowerCase();
  
  if (s === 'done' || s === 'completed') {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  if (s === 'in-progress' || s === 'working') {
    return <Clock className="h-5 w-5 text-blue-500" />;
  }
  if (s === 'new' || s === 'received') {
    return <FilePlus className="h-5 w-5 text-indigo-500" />;
  }
  if (s === 'pending' || s === 'review') {
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
  if (s === 'cancelled') {
    return <XCircle className="h-5 w-5 text-red-500" />;
  }
  
  // สถานะอื่นๆ ที่ไม่รู้จัก
  return <FileText className="h-5 w-5 text-gray-400" />;
};

export default function RecentActivityFeed() {
  const { jobs = [] } = useJobs() as { jobs: Job[] }; // ใช้ Type

  const recent = useMemo(() => {
    return [...jobs]
      .sort((a, b) => getTimestamp(b) - getTimestamp(a)) // ใช้ Helper
      .slice(0, 8); // แสดง 8 รายการล่าสุด
  }, [jobs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">กิจกรรมล่าสุด</CardTitle>
          <CardDescription className="text-sm">อัพเดทงานล่าสุดในระบบ</CardDescription>
        </div>
        {/* --- Icon ที่ Card Header --- */}
        <Activity className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            ยังไม่มีการอัพเดท
          </p>
        ) : (
          <ul className="space-y-4 pt-2">
            {recent.map((j) => (
              // --- จัด Layout ใหม่โดยใช้ Flex ---
              <li key={j.id} className="flex items-center space-x-3">
                {/* 1. Icon (ส่วนตกแต่ง) */}
                <div className="flex-shrink-0">
                  {getStatusIcon(j.status)}
                </div>
                {/* 2. Text Content (Title + Subtitle) */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{j.title || j.subject || 'งาน (ไม่ระบุชื่อ)'}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {`สถานะ: ${j.status || 'ไม่ระบุ'} • ${new Date(getTimestamp(j)).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}