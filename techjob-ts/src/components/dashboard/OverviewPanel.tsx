import React from 'react'
import KpiCard from './KpiCard'
import { CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react'
// (Import เหมือนเดิม)
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  BarChart, Bar, // ใช้ BarChart และ Bar
  AreaChart, Area
} from 'recharts'

export default function OverviewPanel({ activeRange }: { activeRange: string }) {
  const rangeTextMap: Record<string, string> = { Daily: 'วันนี้', Monthly: 'เดือนนี้', Yearly: 'ปีนี้' }
  const currentRangeText = rangeTextMap[activeRange] || 'เดือนนี้'

  const jobTrendData = [
    { month: 'ม.ค.', jobs: 40 }, { month: 'ก.พ.', jobs: 30 }, { month: 'มี.ค.', jobs: 50 },
    { month: 'เม.ย.', jobs: 45 }, { month: 'พ.ค.', jobs: 60 }, { month: 'มิ.ย.', jobs: 55 },
    { month: 'ก.ค.', jobs: 70 },
  ]

  const monthlyJobTypeData = [
    { month: 'ม.ค.', install: 40, maintenance: 20, urgent: 10 },
    { month: 'ก.พ.', install: 35, maintenance: 25, urgent: 15 },
    { month: 'มี.ค.', install: 50, maintenance: 30, urgent: 10 },
    { month: 'เม.ย.', install: 45, maintenance: 20, urgent: 20 },
    { month: 'พ.ค.', install: 55, maintenance: 25, urgent: 10 },
    { month: 'มิ.ย.', install: 60, maintenance: 30, urgent: 15 },
  ]
  const COLORS = { install: '#4f46e5', maintenance: '#10b981', urgent: '#f59e0b' }

  return (
    <div className="space-y-8">
      {/* --- ส่วน KpiRow 1 (ไม่เปลี่ยน) --- */}
      <div className="space-y-6">
        {/* [UPGRADE] 2. ขยาย Font หัวข้อหลัก */}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">ภาพรวมสถิติงาน Statistics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard title={`งานเสร็จ (${currentRangeText})`} numericValue={82} suffix=" งาน" icon={<CheckCircle size={22} />} color="green" change="+3 งาน (เทียบกับช่วงก่อนหน้า)" />
          <KpiCard title="เวลางานเฉลี่ย" numericValue={3.2} suffix=" ชม." icon={<Clock size={22} />} color="blue" change="-0.2 ชม. (เทียบกับช่วงก่อนหน้า)" />
          <KpiCard title="งานเกินดำหนด" numericValue={5} suffix=" งาน" icon={<AlertTriangle size={22} />} color="red" change="-0.5% จากเดือนที่แล้ว" />
        </div>

        {/* --- [ปรับปรุง] แนวโน้มงานที่เข้ามา (LineChart เดิม) --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">แนวโน้มงานที่เข้ามา</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jobTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} formatter={(value) => [`${value} งาน`, "จำนวนงาน"]} />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke={COLORS.install} 
                  strokeWidth={3}
                  dot={true} 
                  activeDot={{ r: 6, stroke: '#fff', fill: COLORS.install, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ส่วน KpiRow 2 (ไม่เปลี่ยน) --- */}
      <>
        {/* [UPGRADE] 2. ขยาย Font หัวข้อหลัก */}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">ภาพรวมการดำเนินงาน (Operations)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="งานทั้งหมด" numericValue={328} icon={<Briefcase size={22} />} color="default" change="+2.5% จากเดือนที่แล้ว" />
          <KpiCard title="งานกำลังดำเนิน" numericValue={85} icon={<Clock size={22} />} color="blue" change="+1.2% จากเดือนที่แล้ว" />
          <KpiCard title="งานเสร็จแล้ว" numericValue={77} icon={<CheckCircle size={22} />} color="green" change="+3.0% จากเดือนที่แล้ว" />
        </div>

        {/* --- ส่วน "สถิติงาน" (Grouped Bar Chart) --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">สถิติงาน (Job Type Statistics)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* ใช้ BarChart */}
              <BarChart data={monthlyJobTypeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} barGap={5}> {/* 💡 เพิ่ม barGap */}
                
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" />
                
                <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} 
                    formatter={(value, name) => [`${value} งาน`, name]} 
                />
                
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
                
                {/* 💡 Bar 1: ติดตั้ง (ลบ stackId) */}
                <Bar 
                    dataKey="install" 
                    name="ติดตั้ง" 
                    fill={COLORS.install} 
                    radius={[4, 4, 0, 0]} // ทำให้แท่งมีมุมมนด้านบน
                />
                
                {/* 💡 Bar 2: ซ่อมบำรุง (ลบ stackId) */}
                <Bar 
                    dataKey="maintenance" 
                    name="ซ่อมบำรุง" 
                    fill={COLORS.maintenance}
                    radius={[4, 4, 0, 0]} 
                />
                
                {/* 💡 Bar 3: ซ่อมด่วน (ลบ stackId) */}
                <Bar 
                    dataKey="urgent" 
                    name="ซ่อมด่วน" 
                    fill={COLORS.urgent} 
                    radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    </div>
  )
}