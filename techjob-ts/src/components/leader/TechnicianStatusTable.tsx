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

// --- Types (ปรับปรุง) ---
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
  status: JobStatus; // ใช้ JobStatus ที่เข้มงวดขึ้น
  assignedTo?: string[];
  techId?: string;
  techs?: string[];
};

// *** 1. อัปเดต Type สถานะใหม่ตามที่ขอ ***
type DisplayStatus = 'available' | 'on-job' | 'completed' | 'offline' | 'unknown';

type TechRow = {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  assigned: number;
  inProgress: number;
  completed: number;
  status: DisplayStatus; // ใช้ Type ใหม่
};

// --- *** 2. อัปเดต Helper: Status Badge *** ---
const StatusBadge = ({ status }: { status: DisplayStatus }) => {
  const statusStyles: Record<DisplayStatus, { text: string; className: string }> = {
    available: { text: 'ว่าง', className: 'bg-green-100 text-green-800 border-green-200' },
    'on-job': { text: 'กำลังทำงาน', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    completed: { text: 'งานเสร็จสิ้น', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' }, // สถานะใหม่
    offline: { text: 'ออฟไลน์', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    unknown: { text: 'ไม่ทราบ', className: 'bg-red-100 text-red-800 border-red-200' }, // เปลี่ยนสีให้ชัด
  };
  
  const style = statusStyles[status] || statusStyles.unknown;
  
  return <Badge variant="outline" className={`font-semibold ${style.className}`}>{style.text}</Badge>;
};

// --- Main Component ---
export default function TechnicianStatusTable() {
  const { jobs = [] } = useJobs() as { jobs: Job[] };
  const users = usersData as User[];

  const rows = useMemo(() => {
    const map: Record<string, TechRow> = {};

    // 1. โหลดช่างทั้งหมด
    for (const u of users) {
      // แปลง 'traveling' เป็น 'available' (หรือ 'on-job' ถ้า Logic ต้องการ)
      // สถานะพื้นฐานคือ 'available' หรือ 'offline'
      const baseStatus = u.status === 'offline' ? 'offline' : 'available';
      
      map[u.id] = {
        id: u.id,
        name: `${u.fname} ${u.lname}`,
        avatar: u.avatar,
        initials: u.initials || `${u.fname[0] || ''}${u.lname[0] || ''}`,
        status: baseStatus, // ใช้ baseStatus
        assigned: 0,
        inProgress: 0,
        completed: 0,
      };
    }

    // 2. นับจำนวนงานจาก 'jobs'
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

      // นับเฉพาะงานที่ยังไม่เสร็จสำหรับ 'assigned' และ 'inProgress'
      const isJobActive = status !== 'done' && status !== 'completed' && status !== 'cancelled';
      
      for (const id of techIds) {
        if (!map[id]) {
          map[id] = { id, name: `ช่าง (ID: ${id})`, initials: '??', status: 'unknown', assigned: 0, inProgress: 0, completed: 0 };
        }
        
        // นับงานที่เสร็จ
        if (status === 'done' || status === 'completed') {
          map[id].completed++;
        }
        
        // นับงานที่ Active
        if (isJobActive) {
          map[id].assigned++; // นับเฉพาะ 'assigned' ที่ยังไม่เสร็จ
          if (status === 'in-progress' || status === 'working') {
            map[id].inProgress++;
          }
        }
      }
    }

    // *** 3. อัปเดต Logic การคำนวณสถานะจริง ***
    const finalRows = Object.values(map).map(row => {
      let finalStatus: DisplayStatus = row.status; // 'available' หรือ 'offline' จาก user data

      if (finalStatus === 'unknown') {
        // ปล่อยไว้
      } else if (finalStatus === 'offline') {
        // ปล่อยไว้
      } else if (row.inProgress > 0) {
        finalStatus = 'on-job'; // กำลังทำงาน
      } else if (row.inProgress === 0 && row.assigned === 0 && row.completed > 0) {
        // ไม่มีงานค้าง และเคยทำงานเสร็จ (อาจจะตีเป็น 'completed' หรือ 'available' ก็ได้)
        // ถ้าตีความว่า "งานเสร็จสิ้น" คือ "ไม่มีงานค้างเลย"
        finalStatus = 'completed';
      } else {
        finalStatus = 'available'; // ว่าง (ยังมีงาน assigned แต่ไม่ได้ in-progress)
      }
      
      return { ...row, status: finalStatus };
    });

    // เรียงตามงานที่มอบหมาย (ที่ยัง Active)
    return finalRows.sort((a, b) => b.assigned - a.assigned).slice(0, 12);
  }, [jobs, users]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">สถานะทีมช่าง</CardTitle>
          <CardDescription className="text-sm">ภาพรวมช่างและงานที่ถืออยู่</CardDescription>
        </div>
        <Users className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">ช่าง</TableHead>
              <TableHead className="text-center">
                <ClipboardList className="h-4 w-4 inline-block mr-1 text-muted-foreground" />
                งานที่ค้าง
              </TableHead>
              <TableHead className="text-center">
                <Clock className="h-4 w-4 inline-block mr-1 text-muted-foreground" />
                กำลังทำงาน
              </TableHead>
              <TableHead className="text-center">
                <CheckCircle2 className="h-4 w-4 inline-block mr-1 text-muted-foreground" />
                งานที่เสร็จ
              </TableHead>
              <TableHead>สถานะ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={r.avatar} alt={r.name} />
                      <AvatarFallback>{r.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{r.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center font-medium text-base">{r.assigned}</TableCell>
                <TableCell className="text-center text-base">{r.inProgress}</TableCell>
                <TableCell className="text-center text-base">{r.completed}</TableCell>
                <TableCell>
                  {/* --- ใช้ Logic จริง --- */}
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