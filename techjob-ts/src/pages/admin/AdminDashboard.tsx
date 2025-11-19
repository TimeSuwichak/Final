"use client";

import React, { useMemo } from "react";
// ⚙️ สมมติว่ามีการติดตั้ง Icon library เช่น lucide-react แล้ว
import { Zap, Users, TrendingUp, Package } from 'lucide-react'; 

import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JobStatusChart } from "@/components/admin/charts/JobStatusChart";
import { TeamStatusPieChart } from "@/components/admin/charts/TeamStatusPieChart"; 
// 💡 CardDescription ถูกเพิ่มในการ Import

// ==========================================================
// ✨ ADMIN DASHBOARD PAGE (ฉบับมืออาชีพ) ✨
// ==========================================================
export default function AdminDashboardPage() {
  const { jobs } = useJobs();
  const { user } = useAuth();

  // --- 1. LOGIC การเตรียมข้อมูลสำหรับกราฟ (ไม่ต้องเปลี่ยน) ---
  
  // (Logic เดิม)
  const jobStatusData = useMemo(() => {
    const now = new Date();
    const currentMonthJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
    });

    const newCount = currentMonthJobs.filter(j => j.status === 'new' && !j.acknowledgedByLeader).length;
    const inProgressCount = currentMonthJobs.filter(j => (j.status === 'new' && j.acknowledgedByLeader) || j.status === 'in-progress').length;
    const completedCount = currentMonthJobs.filter(j => j.status === 'completed').length;

    return [
      { name: 'สถานะ', "งานใหม่": newCount, "กำลังทำ": inProgressCount, "เสร็จสิ้น": completedCount },
    ];
  }, [jobs]);

  const teamStatusData = useMemo(() => {
    return [
        { name: 'พร้อมรับงาน', value: 12 }, 
        { name: 'กำลังทำงาน', value: 8 },  
        { name: 'ลาพักร้อน', value: 2 },   
    ];
  }, []); 

  const popularJobTypesData = useMemo(() => {
    const now = new Date();
    const typeCounts: { [key: string]: number } = {};
    
    jobs.forEach(job => {
        const jobDate = new Date(job.createdAt);
        if (jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()) {
            typeCounts[job.jobType] = (typeCounts[job.jobType] || 0) + 1;
        }
    });

    const data = Object.entries(typeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    
    // 💡 หาค่าสูงสุดเพื่อใช้ในการคำนวณ Progress Bar (เพิ่มประสิทธิภาพ)
    const maxCount = data[0]?.count || 1;

    return {
        list: data.slice(0, 5),
        maxCount: maxCount
    };
  }, [jobs]);


  const materialUsageData = useMemo(() => {
    return [
        { name: 'สาย LAN Cat6', requested: 25, unit: 'เมตร', lastUsed: '3 วันที่แล้ว' },
        { name: 'ท่อ PVC', requested: 10, unit: 'เส้น', lastUsed: 'เมื่อวาน' },
        { name: 'Access Point WiFi 6', requested: 8, unit: 'ตัว', lastUsed: '5 ชั่วโมงที่แล้ว' },
        { name: 'น็อต', requested: 50, unit: 'ตัว', lastUsed: '1 สัปดาห์ที่แล้ว' },
    ];
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }
  
  // --- 2. JSX (ส่วนแสดงผล) ---
  return (
    <div className="flex-1 space-y-10 p-4 md:p-8 bg-gray-50 dark:bg-gray-900"> {/* 💡 เพิ่มพื้นหลังเบาๆ */}
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
           Admin Dashboard 
        </h2>
        <p className="text-gray-500 dark:text-gray-400">ข้อมูลล่าสุด ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* 💡 เพิ่ม Card สรุปตัวเลข (Key Metrics) */}
        <MetricCard icon={<Zap className="h-6 w-6 text-blue-500" />} title="งานค้าง" value={jobStatusData[0]['งานใหม่']} description="รออนุมัติ/จัดทีม" />
        <MetricCard icon={<Users className="h-6 w-6 text-emerald-500" />} title="ทีมพร้อมรับ" value={teamStatusData.find(d => d.name === 'พร้อมรับงาน')?.value || 0} description="ช่างที่ว่าง/พร้อมทำงาน" />
        <MetricCard icon={<TrendingUp className="h-6 w-6 text-yellow-500" />} title="งานเสร็จสิ้น" value={jobStatusData[0]['เสร็จสิ้น']} description="สำเร็จในเดือนนี้" />
        {/* เพิ่ม Metric Card ที่ 4 ได้หากมีข้อมูล เช่น ยอดใช้จ่ายวัสดุ */}
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {/* กราฟสถานะงาน */}
        <JobStatusChart data={jobStatusData} />
        {/* กราฟสถานะทีมช่าง (Donut Chart ที่ตกแต่งแล้ว) */}
        <TeamStatusPieChart data={teamStatusData} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* กราฟประเภทงานยอดนิยม (ปรับปรุงให้ดูเป็น List/Bar Chart) */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
                <TrendingUp className="mr-3 h-5 w-5 text-purple-600" />
                5 ประเภทงานยอดนิยมในเดือนนี้
            </CardTitle>
            <CardDescription>แสดงสัดส่วนงานที่ถูกร้องขอมากที่สุดในรอบเดือน</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-5">
              {popularJobTypesData.list.map((item, index) => (
                <div key={item.name} className="relative">
                  {/* ตำแหน่ง */}
                  <span className={`absolute -left-6 top-1/2 -translate-y-1/2 text-lg font-bold ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`}>{index + 1}.</span>
                  <div className="flex justify-between items-center pl-6 mb-1">
                      <div className="text-sm font-medium text-foreground">{item.name}</div>
                      <div className="text-right font-semibold text-primary">{item.count} งาน</div>
                  </div>
                  <div className="h-3 rounded-full bg-muted">
                      {/* Progress Bar ที่สวยงาม */}
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-600 shadow-md transition-all duration-500" 
                        style={{ width: `${(item.count / popularJobTypesData.maxCount) * 100}%`}} 
                      />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* ตารางการเบิกวัสดุ (ปรับปรุงให้ดูเป็นมืออาชีพ) */}
        <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <Package className="mr-3 h-5 w-5 text-amber-500" />
                    รายการเบิกวัสดุล่าสุด (จำลอง)
                </CardTitle>
                <CardDescription>การเคลื่อนไหวของวัสดุคงคลังที่ถูกเบิกล่าสุด</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-muted/50"> {/* 💡 เพิ่มสีพื้นหลัง Header */}
                        <TableRow>
                            <TableHead className="w-[60%]">ชื่อวัสดุ</TableHead>
                            <TableHead className="text-center">จำนวนที่เบิก</TableHead>
                            <TableHead className="text-right">ใช้ล่าสุด</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materialUsageData.map(item => (
                            <TableRow key={item.name} className="hover:bg-muted/20">
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-center font-bold text-lg text-primary/80">{item.requested} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span></TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">{item.lastUsed}</TableCell>
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

// 📌 Component สำหรับ Key Metric Cards
const MetricCard = ({ icon, title, value, description }) => (
  <Card className="shadow-xl transition-transform duration-300 hover:scale-[1.02]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground pt-1">{description}</p>
    </CardContent>
  </Card>
);