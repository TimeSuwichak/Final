import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import { user as usersData } from '../../Data/user'; // นำเข้าข้อมูล user
import { AlertTriangle, Flame } from 'lucide-react'; // เพิ่ม Icons ที่เข้ากัน

// --- Types (เพื่อขจัด 'as any' และทำให้โค้ดอ่านง่ายขึ้น) ---
type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
};

type Job = {
  id: string;
  title: string;
  subject?: string;
  name?: string;
  status: string;
  assignedTo?: string[]; // สมมติว่าเป็น array ของ user IDs
  techName?: string; // เผื่อไว้สำหรับ jobs ที่ไม่มี assignedTo
  dueDate?: string | Date;
  priority?: 'high' | 'normal' | 'low' | 'urgent'; // ใช้ Type สำหรับ Priority
  prio?: number; // หากมีการใช้ค่าตัวเลขสำหรับ priority
  isUrgent?: boolean;
};

// สร้าง Map ของ User เพื่อให้ค้นหาได้เร็ว (O(1)) ถ้าต้องการดึงข้อมูลช่างมาแสดง
const userMap: Map<string, User> = new Map(
  usersData.map((u: any) => [u.id, u as User])
);

// --- Helper function สำหรับ format ข้อความ (ปรับปรุงให้รองรับ Type) ---
function formatJobLine(j: Job) {
  const title = j.title || j.subject || j.name || 'งานไม่ระบุ';
  let techNames: string[] = [];

  // ลองดึงจาก assignedTo ก่อน
  if (j.assignedTo && j.assignedTo.length > 0) {
    techNames = j.assignedTo
      .map(id => userMap.get(id)?.name)
      .filter((name): name is string => name !== undefined); // กรองชื่อที่หาเจอ
  }
  // ถ้าไม่มี assignedTo หรือหาไม่เจอ ให้ใช้ techName
  if (techNames.length === 0 && j.techName) {
    techNames.push(j.techName);
  }

  const tech = techNames.join(', ');
  const due = j.dueDate ? new Date(j.dueDate).toLocaleDateString('th-TH') : '';
  
  // ปรับปรุง format ให้ดูเป็นระเบียบขึ้น: Title (โดยช่าง) • กำหนด X/Y/Z
  return `${title}${tech ? ` โดย ${tech}` : ''}${due ? ` • กำหนด ${due}` : ''}`;
}

// --- Main Component ---
export default function UrgentSection() {
  const { jobs = [] } = useJobs() as { jobs: Job[] }; // ใช้ Type ที่ชัดเจน

  const { overdue, urgent } = useMemo(() => {
    const now = Date.now();
    const overdueJobs: Job[] = [];
    const urgentJobs: Job[] = [];

    for (const j of jobs) {
      const dueTs = j.dueDate ? new Date(j.dueDate).getTime() : null;
      const priority = j.priority || (j.prio ? (j.prio > 0 ? 'high' : 'normal') : 'normal'); // จัดการ priority ที่เป็นตัวเลข

      // เงื่อนไขสำหรับงาน Overdue
      if (dueTs && dueTs < now && j.status !== 'done' && j.status !== 'completed' && j.status !== 'cancelled') {
        overdueJobs.push(j);
      } 
      // เงื่อนไขสำหรับงาน Urgent (ไม่รวมงานที่เสร็จแล้วหรือถูกยกเลิก)
      else if ((priority === 'high' || priority === 'urgent' || j.isUrgent) && 
               j.status !== 'done' && j.status !== 'completed' && j.status !== 'cancelled') {
        urgentJobs.push(j);
      }
    }

    // Sort Overdue: เรียงตาม Due Date จากน้อยไปมาก (เก่าที่สุดอยู่บน)
    overdueJobs.sort((a, b) => 
      (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - 
      (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)
    );
    
    // Sort Urgent: เรียงตาม Due Date จากน้อยไปมาก (ใกล้ถึงก่อนอยู่บน)
    // หรือถ้าไม่มี Due Date ให้เรียงตาม Priority (ถ้ามี)
    urgentJobs.sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aDue - bDue;
    });

    return { overdue: overdueJobs.slice(0, 6), urgent: urgentJobs.slice(0, 6) };
  }, [jobs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* --- Card: งานเลยกำหนด (Overdue) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">งานเลยกำหนด</CardTitle>
            <CardDescription className="text-sm">งานที่ยังไม่เสร็จและเลยกำหนด</CardDescription>
          </div>
          {/* Icon สำหรับงานเลยกำหนด - สีแดงเตือน */}
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </CardHeader>
        <CardContent>
          {overdue.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              ไม่มีงานเลยกำหนดในขณะนี้
            </p>
          ) : (
            <ul className="space-y-2">
              {overdue.map((j) => (
                <li key={j.id} className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{j.title || j.subject || 'งานไม่ระบุ'}</p>
                    <p className="text-xs text-muted-foreground truncate">{formatJobLine(j)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* --- Card: งานด่วน (Urgent) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-semibold">งานด่วน</CardTitle>
            <CardDescription className="text-sm">งานที่ถูกตั้งค่าว่าเร่งด่วน</CardDescription>
          </div>
          {/* Icon สำหรับงานด่วน - สีส้มสว่าง */}
          <Flame className="h-6 w-6 text-orange-500" />
        </CardHeader>
        <CardContent>
          {urgent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              ไม่มีงานด่วนในขณะนี้
            </p>
          ) : (
            <ul className="space-y-2">
              {urgent.map((j) => (
                <li key={j.id} className="text-sm flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{j.title || j.subject || 'งานไม่ระบุ'}</p>
                    <p className="text-xs text-muted-foreground truncate">{formatJobLine(j)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}