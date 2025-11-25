"use client";

import React, { useMemo, useState, useEffect } from "react"; 

// ✅ [แก้ไข] Import Icons: เพิ่ม CheckCircle และ Clock
import { 
    Zap, Users, TrendingUp, Package, BarChartBig, Gauge, Calendar, Crown, 
    Clock, CheckCircle, Award // ⭐️ เพิ่ม Award สำหรับอันดับ
} from 'lucide-react'; 

import { useJobs } from "@/contexts/JobContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { JobStatusChart } from "@/components/admin/charts/JobStatusChart"; 
import { TeamStatusPieChart } from "@/components/admin/charts/TeamStatusPieChart"; 

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// ... (MetricCard และ CustomLineTooltip components) ...

const MetricCard = ({ icon, title, value, description, colorClass = "text-indigo-400" }) => (
  <Card className="shadow-xl transition-transform duration-300 hover:scale-[1.02] dark:bg-card dark:border-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground dark:text-gray-300">{title}</CardTitle>
      {/* ⭐️ ใช้ React.cloneElement เพื่อส่ง className เข้าไปใน Icon */}
      {React.cloneElement(icon, { className: `h-6 w-6 ${colorClass}` })}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold dark:text-foreground">{value}</div>
      <p className="text-xs text-muted-foreground pt-1 dark:text-gray-400">{description}</p>
    </CardContent>
  </Card>
);

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const lineStrokeColor = payload[0].stroke || '#38BDF8';
    return (
      <div className="p-3 border rounded-lg shadow-md 
        dark:bg-card dark:border-border text-foreground bg-card" 
      >
        <p className="font-bold text-lg mb-1" style={{ color: lineStrokeColor }}>{label}</p>
        <p>
          <span className="text-muted-foreground">จำนวน:</span> 
          <span className="font-bold" style={{ color: lineStrokeColor }}> {payload[0].value} งาน</span>
        </p>
      </div>
    );
  }
  return null;
};

// ==========================================================
// ⭐ NEW Component: AdminHeaderCard (รวมการตกแต่งทั้งหมด) ⭐
// ==========================================================
function AdminHeaderCard() {
    const todayDate = new Date().toLocaleDateString('th-TH', { dateStyle: 'medium' });
    
    const cardStyle = "bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-xl dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 border border-gray-100 dark:border-[#2A2C40]";
    const titleStyle = "text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-snug";
    const descStyle = "pt-1 text-sm text-gray-500 dark:text-gray-400";

    // ✅ [UPDATED ICON STYLE] Glass Sphere with Complex Shadow
    const iconWrapperStyle = `
      w-14 h-14 md:w-16 md:h-16 flex items-center justify-center 
      rounded-full 
      bg-gradient-to-br from-indigo-500 to-violet-600  /* เปลี่ยนเป็นสีม่วง-น้ำเงิน */
      dark:from-indigo-700 dark:to-violet-800         /* สีเข้มขึ้นใน Dark Mode */
      shadow-[
        0_5px_15px_rgba(0,0,0,0.3), 
        0_0_0_1px_rgba(255,255,255,0.1), 
        inset_0_2px_5px_rgba(255,255,255,0.3), 
        inset_0_-2px_5px_rgba(0,0,0,0.2) 
      ]
      dark:shadow-[
        0_5px_15px_rgba(0,0,0,0.6), 
        0_0_0_1px_rgba(255,255,255,0.05),
        inset_0_2px_5px_rgba(255,255,255,0.1),
        inset_0_-2px_5px_rgba(0,0,0,0.3)
      ]
      transform transition-all duration-300 ease-in-out
    `;

    return (
      <div className={`relative overflow-hidden ${cardStyle}`}>
        
        {/* 1. Vertical Accent Line */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-2xl"></div>

        <CardHeader className="p-5 md:p-6">
          <div className="flex items-start justify-between">
            
            <div className="flex items-center gap-4">
               {/* 2. Glass Sphere Icon */}
              <div className={iconWrapperStyle}>
                {/* ✅ [แก้ไข Icon] ใช้ text-white และ drop-shadow-sm เพื่อความเข้ากัน */}
                <Gauge size={28} className="text-white drop-shadow-sm" /> 
              </div>
              
              <div className="flex flex-col">
                <CardTitle className={titleStyle}> 
                    Admin Dashboard: ภาพรวมระบบงาน
                </CardTitle>
                <CardDescription className={descStyle}>
                    ภาพรวมข้อมูลและสถิติสำคัญสำหรับการจัดการระบบ
                </CardDescription>
              </div>
            </div>
            
            {/* 3. Date Stamp */}
            <div className="flex items-center space-x-2 text-right pt-1 shrink-0">
              <Calendar size={16} className="text-muted-foreground dark:text-gray-400" />
              <p className="text-sm font-semibold text-muted-foreground dark:text-gray-400">
                ข้อมูลล่าสุด ณ {todayDate}
              </p>
            </div>
          </div>
        </CardHeader>
      </div>
    );
}
// ==========================================================


// ==========================================================
// ✨ ADMIN DASHBOARD PAGE (ใช้ Dark/Light Mode มาตรฐาน) ✨
// ==========================================================
export default function AdminDashboardPage() {
  const { jobs } = useJobs(); 
  const { user } = useAuth(); 
  
  // 💡 Hook สำหรับตรวจจับ Dark Mode จริงๆ
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const checkTheme = () => {
        // ตรวจสอบ class 'dark' บน html element เป็นหลัก
        setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    mediaQuery.addEventListener('change', checkTheme); 

    return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkTheme);
    };
  }, []);

  // 💡 ฟังก์ชันใหม่: คืนค่าสีข้อความที่ชัดเจนที่สุดในทุกโหมด
  const getAxisTextColor = () => {
      // Dark Mode (พื้นหลังเข้ม): ใช้สีขาว
      if (isDarkMode) {
          return '#E0E0E0'; 
      }
      // Light Mode (พื้นหลังสว่าง): ใช้สีดำ
      return '#000000'; 
  };

  // 💡 ฟังก์ชันใหม่: คืนค่าสีเส้นแกน (Grid และ Axis Lines)
  const getAxisLineColor = () => {
    if (isDarkMode) {
        return 'hsl(var(--border))'; // สี border ใน Dark Mode
    }
    return '#D0D0D0'; // สีเทาอ่อนมากสำหรับเส้นแกนใน Light Mode
  };
  
  // --- 1. LOGIC การเตรียมข้อมูลสำหรับกราฟ (จาก Firestore realtime) ---
  const jobStatusData = useMemo(() => {
    if (!jobs || jobs.length === 0) return { total: 0, new: 0, inProgress: 0, completed: 0 };
    
    const totalCount = jobs.length;
    const newCount = jobs.filter(j => j.status === 'new').length;
    const inProgressCount = jobs.filter(j => j.status === 'in-progress').length;
    const completedCount = jobs.filter(j => j.status === 'completed').length;
    return { total: totalCount, new: newCount, inProgress: inProgressCount, completed: completedCount };
  }, [jobs]);

  const teamStatusData = useMemo(() => {
    // สามารถดึงจาก context ผู้ใช้ได้ ตอนนี้ใช้ค่า hardcoded
    return [
        { name: 'พร้อมรับงาน', value: 12 }, 
        { name: 'กำลังทำงาน', value: 8 },  
        { name: 'ลาพักร้อน', value: 2 },   
    ];
  }, []); 

  const popularJobTypesData = useMemo(() => {
    if (!jobs || jobs.length === 0) {
      return {
        list: [
          { name: 'ม.ค.', count: 0 }, 
          { name: 'ก.พ.', count: 0 },
          { name: 'มี.ค.', count: 0 },
          { name: 'เม.ย.', count: 0 },
          { name: 'พ.ค.', count: 0 },
          { name: 'มิ.ย.', count: 0 },
        ],
        maxCount: 0
      };
    }

    // นับจำนวนงานตามเดือนของ startDate
    const monthCounts: { [key: number]: number } = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };
    
    jobs.forEach(job => {
      const startDate = new Date(job.startDate);
      const currentDate = new Date();
      const monthsDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (currentDate.getMonth() - startDate.getMonth());
      
      if (monthsDiff >= 0 && monthsDiff < 6) {
        const monthIndex = 5 - monthsDiff; // 0 = 6 months ago, 5 = this month
        if (monthIndex >= 0) monthCounts[monthIndex]++;
      }
    });

    const data = [
      { name: 'ม.ค.', count: monthCounts[0] }, 
      { name: 'ก.พ.', count: monthCounts[1] },
      { name: 'มี.ค.', count: monthCounts[2] },
      { name: 'เม.ย.', count: monthCounts[3] },
      { name: 'พ.ค.', count: monthCounts[4] },
      { name: 'มิ.ย.', count: monthCounts[5] },
    ];
    
    return {
        list: data,
        maxCount: data.reduce((max, item) => Math.max(max, item.count), 0)
    };
  }, [jobs]);

  // ⭐️ [แก้ไข]: เปลี่ยน Logic ให้เรียงข้อมูลตาม requested value
  const materialUsageData = useMemo(() => {
    const rawData = [
        { name: 'สาย LAN Cat6', requested: 25, unit: 'เมตร', lastUsed: '3 วันที่แล้ว' },
        { name: 'ท่อ PVC', requested: 10, unit: 'เส้น', lastUsed: 'เมื่อวาน' },
        { name: 'Access Point WiFi 6', requested: 8, unit: 'ตัว', lastUsed: '5 ชั่วโมงที่แล้ว' },
        { name: 'น็อต', requested: 50, unit: 'ตัว', lastUsed: '1 สัปดาห์ที่แล้ว' },
    ];
    // เรียงลำดับจากมากไปน้อย (Descending) ตาม 'requested'
    return rawData.sort((a, b) => b.requested - a.requested);
  }, []);

  const totalStaff = teamStatusData.reduce((sum, d) => sum + d.value, 0);
  const availableStaff = teamStatusData.find(d => d.name === 'พร้อมรับงาน')?.value || 0;
  const availableSupervisor = '2/5'; 

  if (!user) {
    return <div>Loading...</div>;
  }
  
  // --- 2. JSX (ส่วนแสดงผล) ---
  return (
    <div 
        className="flex-1 space-y-10 p-4 md:p-8 bg-background dark:bg-background"
    >
      
      {/* HEADER SECTION (ใช้ AdminHeaderCard ใหม่) */}
      <AdminHeaderCard />


      {/* KEY METRICS (แถวสรุปสถานะงานและบุคลากร) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={<Zap />} title="งานทั้งหมด" value={jobStatusData.total} description="รวมงานทั้งหมด" colorClass="text-indigo-400" />
        
        {/* ⭐️ งานใหม่: Icon Zap, สีแดง */}
        <MetricCard 
            icon={<Zap />} 
            title="งานใหม่" 
            value={jobStatusData.new} 
            description="งานใหม่ที่ได้รับมอบหมาย" 
            colorClass="text-red-500 dark:text-red-400" 
        />
        
        {/* ⭐️ กำลังทำ: Icon Clock, สีเหลือง */}
        <MetricCard 
            icon={<Clock />} 
            title="กำลังทำ" 
            value={jobStatusData.inProgress} 
            description="อยู่ระหว่างการปฏิบัติงาน" 
            colorClass="text-amber-500 dark:text-yellow-400" 
        />
        
        {/* ⭐️ เสร็จสิ้น: Icon CheckCircle, สีเขียว */}
        <MetricCard 
            icon={<CheckCircle />} 
            title="เสร็จสิ้น" 
            value={jobStatusData.completed} 
            description="งานที่เสร็จสิ้นทั้งหมด" 
            colorClass="text-emerald-500 dark:text-emerald-400" 
        />
        
        <MetricCard 
            icon={<Users />} 
            title="ช่างที่ว่าง" 
            value={`${availableStaff}/${totalStaff}`} 
            description={`พร้อมรับงาน (${availableStaff})`} 
            colorClass="text-blue-400" 
        />
        <MetricCard 
            icon={<Crown />} 
            title="หัวหน้างานว่าง" 
            value={availableSupervisor} 
            description="หัวหน้างานพร้อมดูแลช่าง" 
            colorClass="text-pink-400" 
        />
      </div>

      {/* CHART ROW 1 (JobStatusChart และ TeamStatusPieChart) */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <JobStatusChart data={jobStatusData} />
        <TeamStatusPieChart data={teamStatusData} />
      </div>

      {/* CHART/LIST ROW 2 */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* 1. 💡 LINE CHART: แนวโน้มจำนวนงานรายเดือน */}
        <Card className="shadow-2xl dark:bg-card dark:border-border">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold dark:text-foreground">
                <BarChartBig className="mr-3 h-5 w-5 text-indigo-400" /> 
                แนวโน้มจำนวนงานรายเดือน
            </CardTitle>
            <CardDescription className="dark:text-muted-foreground">แสดงปริมาณงานที่ถูกร้องขอในรอบ 6 เดือนล่าสุด</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* ... (LineChart code remains unchanged) ... */}
              <LineChart data={popularJobTypesData.list} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid 
                  stroke={getAxisLineColor()} strokeOpacity={0.5} vertical={false} 
                />
                <XAxis 
                  dataKey="name" fontSize={10} tickLine={false} axisLine={{ stroke: getAxisLineColor() }} stroke={getAxisLineColor()} tick={{ fill: getAxisTextColor() }} angle={-15} textAnchor="end" height={40} 
                />
                <YAxis 
                  dataKey="count" fontSize={12} tickLine={false} axisLine={false} stroke={getAxisLineColor()} tick={{ fill: getAxisTextColor() }} tickFormatter={(value) => `${value} งาน`}
                />
                <Tooltip
                  content={<CustomLineTooltip />}
                  cursor={{ stroke: '#38BDF8', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" dataKey="count" name="จำนวนงาน" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4, fill: '#38BDF8', stroke: 'hsl(var(--card))', strokeWidth: 2 }} activeDot={{ r: 7, stroke: '#38BDF8', fill: 'hsl(var(--card))', strokeWidth: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 2. ตารางการเบิกวัสดุ (Material Usage Rank) */}
        <Card className="shadow-2xl dark:bg-card dark:border-border">
            <CardHeader>
                <CardTitle className="flex items-center text-xl dark:text-foreground">
                    <Package className="mr-3 h-5 w-5 text-amber-400" />
                    รายการจำนวนเบิกวัสดุ (Material Priority) {/* ⭐️ แก้ไข Title */}
                </CardTitle>
                <CardDescription className="dark:text-muted-foreground">จำนวนวัสดุที่ถูกเบิกใช้งาน</CardDescription> {/* ⭐️ แก้ไข Description */}
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-muted/50 dark:bg-muted">
                        <TableRow className="dark:border-border">
                            <TableHead className="w-[15%] text-center dark:text-muted-foreground">อันดับ</TableHead> {/* ⭐️ เพิ่มคอลัมน์ Rank */}
                            <TableHead className="w-[45%] dark:text-muted-foreground">ชื่อวัสดุ</TableHead>
                            <TableHead className="text-center dark:text-muted-foreground">จำนวนที่เบิก</TableHead>
                            <TableHead className="text-right dark:text-muted-foreground">ใช้ล่าสุด</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materialUsageData.map((item, index) => {
                            const rank = index + 1;
                            const isTopRank = rank === 1;
                            const rowStyle = isTopRank ? 'bg-indigo-50 dark:bg-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60' : 'hover:bg-muted/20 dark:hover:bg-muted/50';
                            
                            return (
                                <TableRow key={item.name} className={`${rowStyle} dark:border-border transition-colors duration-200`}>
                                    
                                    {/* ⭐️ คอลัมน์ อันดับ */}
                                    <TableCell className="text-center font-extrabold">
                                        {isTopRank ? (
                                            <Award size={18} className="text-yellow-500 mx-auto drop-shadow-md" />
                                        ) : (
                                            <span className="text-lg text-gray-500 dark:text-gray-400">{rank}</span>
                                        )}
                                    </TableCell>
                                    
                                    {/* ชื่อวัสดุ */}
                                    <TableCell className={`font-medium ${isTopRank ? 'text-indigo-600 dark:text-indigo-300' : 'dark:text-foreground'}`}>
                                        {item.name}
                                    </TableCell>
                                    
                                    {/* จำนวนที่เบิก */}
                                    <TableCell className="text-center font-bold text-lg text-indigo-500 dark:text-indigo-400">
                                        {item.requested} <span className="text-sm font-normal text-muted-foreground dark:text-muted-foreground">{item.unit}</span>
                                    </TableCell>
                                    
                                    {/* ใช้ล่าสุด (ยังคงแสดงไว้) */}
                                    <TableCell className="text-right text-sm text-muted-foreground dark:text-muted-foreground">{item.lastUsed}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}