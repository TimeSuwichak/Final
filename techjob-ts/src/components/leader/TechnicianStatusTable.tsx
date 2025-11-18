import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useJobs } from '../../contexts/JobContext';
import { user as usersData } from '../../Data/user';
import { Users, Clock, CheckCircle2, ClipboardList } from 'lucide-react';

// --- Types (เหมือนเดิม) ---
type UserStatus = 'available' | 'on-job' | 'offline' | 'traveling';
type JobStatus = 'new' | 'in-progress' | 'working' | 'pending' | 'done' | 'completed' | 'cancelled';

type User = {
  id: string;
  fname: string;
  lname: string;
  status: UserStatus;
  avatar?: string;
  initials: string;
};

type Job = {
  id: string;
  status: JobStatus;
  assignedTo?: string[];
  techId?: string;
  techs?: string[];
};

type DisplayStatus = 'available' | 'on-job' | 'completed' | 'offline' | 'unknown';

type TechRow = {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  assigned: number;
  inProgress: number;
  completed: number;
  status: DisplayStatus;
};

// --- Status Badge Helper (เหมือนเดิม) ---
const StatusBadge = ({ status }: { status: DisplayStatus }) => {
  const statusStyles: Record<DisplayStatus, { text: string; className: string }> = {
    available: { text: 'ว่าง', className: 'bg-green-100 text-green-800 border-green-200' },
    'on-job': { text: 'กำลังทำงาน', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    completed: { text: 'งานเสร็จสิ้น', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    offline: { text: 'ออฟไลน์', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    unknown: { text: 'ไม่ทราบ', className: 'bg-red-100 text-red-800 border-red-200' },
  };
  
  const style = statusStyles[status] || statusStyles.unknown;
  
  return <Badge variant="outline" className={`font-semibold ${style.className}`}>{style.text}</Badge>;
};

// --- Main Component ---
export default function TechnicianStatusTable() {
  const { jobs = [] } = useJobs() as { jobs: Job[] };
  const users = usersData as User[];

  const rows = useMemo(() => {
    // ... (Logic การคำนวณเหมือนเดิมทั้งหมด) ...
    const map: Record<string, TechRow> = {};

    // 1. โหลดช่าง
    for (const u of users) {
      const baseStatus = u.status === 'offline' ? 'offline' : 'available';
      map[u.id] = {
        id: u.id,
        name: `${u.fname} ${u.lname}`,
        avatar: u.avatar,
        initials: u.initials || `${u.fname[0] || ''}${u.lname[0] || ''}`,
        status: baseStatus,
        assigned: 0,
        inProgress: 0,
        completed: 0,
      };
    }

    // 2. นับงาน
    const getAssignedTechIds = (job: Job): string[] => {
      if (job.assignedTo && Array.isArray(job.assignedTo)) return job.assignedTo;
      if (job.techs && Array.isArray(job.techs)) return job.techs;
      if (job.techId && typeof job.techId === 'string') return [job.techId];
      if ((job as any).techName) {
        const user = users.find(u => `${u.fname} ${u.lname}` === (job as any).techName);
        if (user) return [user.id];
      }
      return [];
    };

    for (const j of jobs) {
      const techIds = getAssignedTechIds(j);
      const status = j.status || '';
      const isJobActive = status !== 'done' && status !== 'completed' && status !== 'cancelled';
      
      for (const id of techIds) {
        if (!map[id]) {
          map[id] = { id, name: `ช่าง (ID: ${id})`, initials: '??', status: 'unknown', assigned: 0, inProgress: 0, completed: 0 };
        }
        if (status === 'done' || status === 'completed') {
          map[id].completed++;
        }
        if (isJobActive) {
          map[id].assigned++;
          if (status === 'in-progress' || status === 'working') {
            map[id].inProgress++;
          }
        }
      }
    }

    // 3. อัปเดตสถานะ
    const finalRows = Object.values(map).map(row => {
      let finalStatus: DisplayStatus = row.status;
      if (finalStatus === 'unknown') {} 
      else if (finalStatus === 'offline') {} 
      else if (row.inProgress > 0) {
        finalStatus = 'on-job';
      } else if (row.inProgress === 0 && row.assigned === 0 && row.completed > 0) {
        finalStatus = 'completed';
      } else {
        finalStatus = 'available';
      }
      return { ...row, status: finalStatus };
    });

    return finalRows.sort((a, b) => b.assigned - a.assigned).slice(0, 12);
  }, [jobs, users]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          {/* [UPGRADE] เปลี่ยนจาก text-lg เป็น text-xl */}
          <CardTitle className="text-xl font-semibold">สถานะทีมช่าง</CardTitle>
          <CardDescription className="text-sm">ภาพรวมช่างและงานที่ถืออยู่</CardDescription>
        </div>
        <Users className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] font-semibold text-sm">ช่าง</TableHead>
              {/* [UPGRADE] เพิ่ม font-semibold, text-sm และขยาย Icon */}
              <TableHead className="text-center font-semibold text-sm">
                <ClipboardList className="h-5 w-5 inline-block mr-1 text-muted-foreground" />
                งานที่ค้าง
              </TableHead>
              <TableHead className="text-center font-semibold text-sm">
                <Clock className="h-5 w-5 inline-block mr-1 text-muted-foreground" />
                กำลังทำงาน
              </TableHead>
              <TableHead className="text-center font-semibold text-sm">
                <CheckCircle2 className="h-5 w-5 inline-block mr-1 text-muted-foreground" />
                งานที่เสร็จ
              </TableHead>
              <TableHead className="font-semibold text-sm">สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {/* [UPGRADE] ขยาย Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={r.avatar} alt={r.name} />
                      <AvatarFallback>{r.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      {/* [UPGRADE] เพิ่มขนาดและความหนา (text-base font-semibold) */}
                      <div className="text-base font-semibold">{r.name}</div>
                    </div>
                  </div>
                </TableCell>
                
                {/* [UPGRADE] เปลี่ยนตัวเลขเป็น "Pills" ที่สวยงามและชัดเจน */}
                <TableCell className="text-center">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-base font-semibold text-gray-800">
                    {r.assigned}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-base font-semibold text-blue-800">
                    {r.inProgress}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-base font-semibold text-green-800">
                    {r.completed}
                  </span>
                </TableCell>
                
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}