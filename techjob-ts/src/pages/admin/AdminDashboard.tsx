"use client";

import React, { useMemo } from "react";
import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JobStatusChart } from "@/components/admin/charts/JobStatusChart";
import { TeamStatusPieChart } from "@/components/admin/charts/TeamStatusPieChart";

// --- ✨ Import กราฟที่เราเพิ่งสร้าง ✨ ---

// (Import กราฟอื่นๆ ที่นี่)

// ==========================================================
// ✨ ADMIN DASHBOARD PAGE (ฉบับกราฟ) ✨
// ==========================================================
export default function AdminDashboardPage() {
  const { jobs } = useJobs();
  const { user } = useAuth();

  // --- 1. LOGIC การเตรียมข้อมูลสำหรับกราฟ ---
  
  // กราฟที่ 1: ข้อมูลสถานะงานในเดือนนี้
  const jobStatusData = useMemo(() => {
    const now = new Date();
    const currentMonthJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
    });

    const newCount = currentMonthJobs.filter(j => j.status === 'new' && !j.acknowledgedByLeader).length;
    const inProgressCount = currentMonthJobs.filter(j => (j.status === 'new' && j.acknowledgedByLeader) || j.status === 'in-progress').length;
    const completedCount = currentMonthJobs.filter(j => j.status === 'completed').length;

    // Recharts ต้องการข้อมูลในรูปแบบ Array of Objects
    return [
      { name: 'สถานะ', "งานใหม่": newCount, "กำลังทำ": inProgressCount, "เสร็จสิ้น": completedCount },
    ];
  }, [jobs]);


  // กราฟที่ 2: ข้อมูลสถานะทีมช่าง (จำลอง)
  const teamStatusData = useMemo(() => {
    // ในอนาคต คุณสามารถดึงข้อมูลจริงของ 'users' มา filter ตาม status ได้
    return [
        { name: 'พร้อมรับงาน', value: 12 }, // สมมติว่ามีช่างว่าง 12 คน
        { name: 'กำลังทำงาน', value: 8 },  // สมมติว่ากำลังทำงาน 8 คน
        { name: 'ลาพักร้อน', value: 2 },   // สมมติว่าลา 2 คน
    ];
  }, []); // `[]` หมายถึงให้คำนวณแค่ครั้งแรก


  // กราฟที่ 3: ประเภทงานยอดนิยม (ดึงข้อมูลจริง)
  const popularJobTypesData = useMemo(() => {
    const now = new Date();
    const typeCounts: { [key: string]: number } = {};
    
    jobs.forEach(job => {
        const jobDate = new Date(job.createdAt);
        if (jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()) {
            typeCounts[job.jobType] = (typeCounts[job.jobType] || 0) + 1;
        }
    });

    return Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // เอาแค่ 5 อันดับแรก
  }, [jobs]);


  // กราฟที่ 4: การเบิกวัสดุ (จำลอง)
  const materialUsageData = useMemo(() => {
    return [
        { name: 'สาย LAN Cat6', requested: 25, unit: 'เมตร' },
        { name: 'ท่อ PVC', requested: 10, unit: 'เส้น' },
        { name: 'Access Point WiFi 6', requested: 8, unit: 'ตัว' },
        { name: 'น็อต', requested: 50, unit: 'ตัว' },
    ];
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }
  
  // --- 2. JSX (ส่วนแสดงผล) ---
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard ภาพรวม</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* กราฟสถานะงาน */}
        <JobStatusChart data={jobStatusData} />
        {/* กราฟสถานะทีมช่าง */}
        <TeamStatusPieChart data={teamStatusData} />
      </div>

      <div className="grid gap-6">
        {/* กราฟประเภทงานยอดนิยม (ใช้ Card + Table ธรรมดา) */}
        <Card>
          <CardHeader>
            <CardTitle>5 ประเภทงานยอดนิยมในเดือนนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularJobTypesData.map(item => (
                <div key={item.name} className="flex items-center">
                  <div className="flex-1 text-sm font-medium">{item.name}</div>
                  <div className="w-16 text-right font-semibold">{item.count} งาน</div>
                  <div className="w-1/2 ml-4">
                    {/* ใช้ div เป็น Progress bar ง่ายๆ */}
                    <div className="h-2 rounded-full bg-secondary">
                        <div 
                          className="h-2 rounded-full bg-primary" 
                          style={{ width: `${(item.count / (popularJobTypesData[0]?.count || 1)) * 100}%`}} 
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6">
        {/* ตารางการเบิกวัสดุ */}
        <Card>
            <CardHeader><CardTitle>รายการเบิกวัสดุล่าสุด (จำลอง)</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อวัสดุ</TableHead>
                            <TableHead className="text-right">จำนวนที่เบิก</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materialUsageData.map(item => (
                            <TableRow key={item.name}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">{item.requested} {item.unit}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}