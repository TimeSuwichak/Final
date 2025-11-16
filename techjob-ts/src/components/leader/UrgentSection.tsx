import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { useJobs } from '../../contexts/JobContext';
import { user as usersData } from '../../Data/user'; 
import { AlertTriangle, Flame } from 'lucide-react'; 

// --- Types (เหมือนเดิม) ---
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
  assignedTo?: string[]; 
  techName?: string; 
  dueDate?: string | Date;
  priority?: 'high' | 'normal' | 'low' | 'urgent';
  prio?: number; 
  isUrgent?: boolean;
};

const userMap: Map<string, User> = new Map(
  usersData.map((u: any) => [u.id, u as User])
);

// --- Helper function (เหมือนเดิม) ---
function formatJobLine(j: Job) {
  const title = j.title || j.subject || j.name || 'งานไม่ระบุ';
  let techNames: string[] = [];

  if (j.assignedTo && j.assignedTo.length > 0) {
    techNames = j.assignedTo
      .map(id => userMap.get(id)?.name)
      .filter((name): name is string => name !== undefined);
  }
  if (techNames.length === 0 && j.techName) {
    techNames.push(j.techName);
  }

  const tech = techNames.join(', ');
  const due = j.dueDate ? new Date(j.dueDate).toLocaleDateString('th-TH') : '';
  
  return `${title}${tech ? ` โดย ${tech}` : ''}${due ? ` • กำหนด ${due}` : ''}`;
}

// --- Main Component ---
export default function UrgentSection() {
  const { jobs = [] } = useJobs() as { jobs: Job[] }; 

  const { overdue, urgent } = useMemo(() => {
    // ... (Logic การคำนวณเหมือนเดิม) ...
    const now = Date.now();
    const overdueJobs: Job[] = [];
    const urgentJobs: Job[] = [];

    for (const j of jobs) {
      const dueTs = j.dueDate ? new Date(j.dueDate).getTime() : null;
      const priority = j.priority || (j.prio ? (j.prio > 0 ? 'high' : 'normal') : 'normal');

      if (dueTs && dueTs < now && j.status !== 'done' && j.status !== 'completed' && j.status !== 'cancelled') {
        overdueJobs.push(j);
      } 
      else if ((priority === 'high' || priority === 'urgent' || j.isUrgent) && 
               j.status !== 'done' && j.status !== 'completed' && j.status !== 'cancelled') {
        urgentJobs.push(j);
      }
    }

    overdueJobs.sort((a, b) => 
      (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - 
      (b.dueDate ? new Date(b.dueDate).getTime() : Infinity)
    );
    
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
            {/* [UPGRADE] เปลี่ยนจาก text-lg เป็น text-xl */}
            <CardTitle className="text-xl font-semibold">งานเลยกำหนด</CardTitle>
            <CardDescription className="text-sm">งานที่ยังไม่เสร็จและเลยกำหนด</CardDescription>
          </div>
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </CardHeader>
        <CardContent>
          {overdue.length === 0 ? (
            // [UPGRADE] ขยายขนาด font "ไม่มีงาน" ให้อ่านง่ายขึ้น
            <p className="text-base text-muted-foreground text-center py-4">
              ไม่มีงานเลยกำหนดในขณะนี้
            </p>
          ) : (
            // [UPGRADE] เพิ่มระยะห่างระหว่างรายการ (space-y-3)
            <ul className="space-y-3">
              {overdue.map((j) => (
                <li key={j.id} className="text-sm flex items-center gap-2">
                  {/* [UPGRADE] ขยาย Icon ให้สมดุล (h-5 w-5) */}
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {/* [UPGRADE] 
                      - Key Change: เพิ่มขนาดและความหนา (text-base font-semibold)
                    */}
                    <p className="text-base font-semibold truncate">{j.title || j.subject || 'งานไม่ระบุ'}</p>
                    {/* [UPGRADE] 
                      - Key Change: เพิ่มขนาดจาก xs เป็น sm (text-sm) 
                    */}
                    <p className="text-sm text-muted-foreground truncate">{formatJobLine(j)}</p>
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
            {/* [UPGRADE] เปลี่ยนจาก text-lg เป็น text-xl */}
            <CardTitle className="text-xl font-semibold">งานด่วน</CardTitle>
            <CardDescription className="text-sm">งานที่ถูกตั้งค่าว่าเร่งด่วน</CardDescription>
          </div>
          <Flame className="h-6 w-6 text-orange-500" />
        </CardHeader>
        <CardContent>
          {urgent.length === 0 ? (
            // [UPGRADE] ขยายขนาด font "ไม่มีงาน" ให้อ่านง่ายขึ้น
            <p className="text-base text-muted-foreground text-center py-4">
              ไม่มีงานด่วนในขณะนี้
            </p>
          ) : (
            // [UPGRADE] เพิ่มระยะห่างระหว่างรายการ (space-y-3)
            <ul className="space-y-3">
              {urgent.map((j) => (
                <li key={j.id} className="text-sm flex items-center gap-2">
                  {/* [UPGRADE] ขยาย Icon ให้สมดุล (h-5 w-5) */}
                  <Flame className="h-5 w-5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {/* [UPGRADE] 
                      - Key Change: เพิ่มขนาดและความหนา (text-base font-semibold)
                    */}
                    <p className="text-base font-semibold truncate">{j.title || j.subject || 'งานไม่ระบุ'}</p>
                    {/* [UPGRADE] 
                      - Key Change: เพิ่มขนาดจาก xs เป็น sm (text-sm) 
                    */}
                    <p className="text-sm text-muted-foreground truncate">{formatJobLine(j)}</p>
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