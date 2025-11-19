"use client";

import React, { useMemo } from "react";
// ⚙️ สมมติว่ามีการติดตั้ง Icon library เช่น lucide-react แล้ว
import { Zap, Users, TrendingUp, Package, LineChart as LineChartIcon } from 'lucide-react'; 

import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JobStatusChart } from "@/components/admin/charts/JobStatusChart";
import { TeamStatusPieChart } from "@/components/admin/charts/TeamStatusPieChart"; 

// 💡 Import Recharts Components
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';


// ==========================================================
// ✨ ADMIN DASHBOARD PAGE (ฉบับมืออาชีพ) ✨
// ==========================================================
export default function AdminDashboardPage() {
  const { jobs } = useJobs();
  const { user } = useAuth();

  // --- 1. LOGIC การเตรียมข้อมูลสำหรับกราฟ (ใช้ค่าจำลองเพื่อให้ Chart ทำงานได้) ---
  
  // (Logic เดิม)
  const jobStatusData = useMemo(() => {
    // ใช้ค่าจำลองเพื่อให้ Metric Card ดูดี
    const newCount = 15;
    const inProgressCount = 8;
    const completedCount = 82;
    return [
      { name: 'สถานะ', "งานใหม่": newCount, "กำลังทำ": inProgressCount, "เสร็จสิ้น": completedCount },
    ];
  }, []);

  const teamStatusData = useMemo(() => {
    return [
        { name: 'พร้อมรับงาน', value: 12 }, 
        { name: 'กำลังทำงาน', value: 8 },  
        { name: 'ลาพักร้อน', value: 2 },   
    ];
  }, []); 

  const popularJobTypesData = useMemo(() => {
    // 💡 ใช้ข้อมูลจำลองสำหรับ Popular Job Types 
    const data = [
      { name: 'ติดตั้งเครือข่าย', count: 45 }, // ใช้เป็นแกน X
      { name: 'ซ่อมบำรุง', count: 32 },
      { name: 'แก้ไขฮาร์ดแวร์', count: 28 },
      { name: 'ให้คำปรึกษา', count: 18 },
      { name: 'วางแผนคลาวด์', count: 12 },
    ];
    
    return {
        list: data.slice(0, 5),
        maxCount: data[0]?.count || 1
    };
  }, []);


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
    <div className="flex-1 space-y-10 p-4 md:p-8 bg-gray-50 dark:bg-gray-900">
      
      {/* HEADER SECTION (ไม่เปลี่ยน) */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
           Admin Dashboard 
        </h2>
        <p className="text-gray-500 dark:text-gray-400">ข้อมูลล่าสุด ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
      </div>

      {/* KEY METRICS (ไม่เปลี่ยน) */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard icon={<Zap className="h-6 w-6 text-blue-500" />} title="งานทั้งหมด All Tasks" value={jobStatusData[0]['งานใหม่']} description="รออนุมัติ/จัดทีม" />
        <MetricCard icon={<Users className="h-6 w-6 text-emerald-500" />} title="ทีมพร้อมรับงาน Available Team" value={teamStatusData.find(d => d.name === 'พร้อมรับงาน')?.value || 0} description="ช่างที่ว่าง/พร้อมทำงาน" />
        <MetricCard icon={<TrendingUp className="h-6 w-6 text-yellow-500" />} title="งานเสร็จสิ้น Completed" value={jobStatusData[0]['เสร็จสิ้น']} description="สำเร็จในเดือนนี้" />
        <MetricCard icon={<Package className="h-6 w-6 text-amber-500" />} title="รายการเบิกวัสดุ" value={materialUsageData.length} description="รายการล่าสุดที่ถูกเบิก" />
      </div>

      {/* CHART ROW 1 (ไม่เปลี่ยน) */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <JobStatusChart data={jobStatusData} />
        <TeamStatusPieChart data={teamStatusData} />
      </div>

      {/* CHART/LIST ROW 2 */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* 1. 💡 LINE CHART: ประเภทงานยอดนิยม (ปรับปรุงการแสดงผล Label) */}
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                <LineChartIcon className="mr-3 h-5 w-5 text-indigo-500" />
                แนวโน้มคำขอแยกตามประเภท (Top 5)
            </CardTitle>
            <CardDescription className="text-gray-500">แสดงปริมาณงานที่ถูกร้องขอมากที่สุดในรอบเดือน</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            {/* โครงสร้าง Line Chart ที่สวยงามและมืออาชีพ */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={popularJobTypesData.list} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#6b7280" 
                  angle={-15} // 💡 เอียง Label 15 องศา
                  textAnchor="end" // 💡 จัดตำแหน่งข้อความที่ปลาย
                  height={40} // 💡 เพิ่มความสูงของแกน X เพื่อรองรับ Label ที่เอียง
                />
                <YAxis 
                  dataKey="count"
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#6b7280"
                  tickFormatter={(value) => `${value} งาน`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }}
                  labelStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                  formatter={(value) => [`${value} งาน`, "จำนวน"]}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="จำนวนงาน"
                  stroke="#6366f1" // สีม่วงเข้ม
                  strokeWidth={3}
                  dot={true} 
                  activeDot={{ r: 6, stroke: '#fff', fill: '#6366f1', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 2. ตารางการเบิกวัสดุ (ไม่เปลี่ยน) */}
        <Card className="shadow-2xl">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <Package className="mr-3 h-5 w-5 text-amber-500" />
                    รายการเบิกวัสดุล่าสุด (Material Usage)
                </CardTitle>
                <CardDescription>การเคลื่อนไหวของวัสดุคงคลังที่ถูกเบิกล่าสุด</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-muted/50">
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

// 📌 Component สำหรับ Key Metric Cards (ไม่เปลี่ยน)
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