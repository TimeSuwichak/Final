import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import {
  Activity,
  CheckCircle2,
  Clock,
  FilePlus,
  AlertTriangle,
  XCircle,
  FileText
} from 'lucide-react';

// --- Types (เหมือนเดิม) ---
type Job = {
  id: string;
  title?: string;
  subject?: string;
  status: string;
  updatedAt?: string | Date;
  createdAt?: string | Date;
  created_on?: string | Date;
};

// --- Helper: Get Timestamp (เหมือนเดิม) ---
const getTimestamp = (job: Job): number => {
  const ts = job.updatedAt || job.createdAt || job.created_on;
  return ts ? new Date(ts).getTime() : 0;
};

// --- Helper: Get Status Icon (เหมือนเดิม) ---
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
  
  return <FileText className="h-5 w-5 text-gray-400" />;
};

export default function RecentActivityFeed() {
  const { jobs = [] } = useJobs() as { jobs: Job[] }; 

  const recent = useMemo(() => {
    return [...jobs]
      .sort((a, b) => getTimestamp(b) - getTimestamp(a))
      .slice(0, 8);
  }, [jobs]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          {/* [UPGRADE] เพิ่มขนาด Title เป็น text-xl */}
          <CardTitle className="text-xl font-semibold">กิจกรรมล่าสุด</CardTitle>
          <CardDescription className="text-sm">อัพเดทงานล่าสุดในระบบ</CardDescription>
        </div>
        <Activity className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          // [UPGRADE] เพิ่มขนาด Fallback text เป็น text-base
          <p className="text-base text-muted-foreground text-center py-4">
            ยังไม่มีการอัพเดท
          </p>
        ) : (
          <ul className="space-y-4 pt-2">
            {recent.map((j) => (
              <li key={j.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(j.status)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* [UPGRADE] 
                    - Key Change: เพิ่มขนาดและความหนา (text-base font-semibold)
                  */}
                  <div className="text-base font-semibold truncate">{j.title || j.subject || 'งาน (ไม่ระบุชื่อ)'}</div>
                  {/* [UPGRADE] 
                    - Key Change: เพิ่มขนาดจาก xs เป็น sm (text-sm) 
                  */}
                  <div className="text-sm text-muted-foreground truncate">
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