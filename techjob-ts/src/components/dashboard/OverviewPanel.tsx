import React from 'react'
import KpiCard from './KpiCard'
import { CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react'
// (Import เหมือนเดิม)
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
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
      {/* --- ส่วน KpiRow 1 --- */}
      <div className="space-y-6">
        {/* [UPGRADE] 2. ขยาย Font หัวข้อหลัก */}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">ภาพรวมสถิติงาน Statistics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KpiCard title={`งานเสร็จ (${currentRangeText})`} numericValue={82} suffix=" งาน" icon={<CheckCircle size={22} />} color="green" change="+3 งาน (เทียบกับช่วงก่อนหน้า)" />
          <KpiCard title="เวลางานเฉลี่ย" numericValue={3.2} suffix=" ชม." icon={<Clock size={22} />} color="blue" change="-0.2 ชม. (เทียบกับช่วงก่อนหน้า)" />
          <KpiCard title="งานเกินดำหนด" numericValue={5} suffix=" งาน" icon={<AlertTriangle size={22} />} color="red" change="-0.5% จากเดือนที่แล้ว" />
        </div>

        {/* --- [UPGRADE] 1. เปลี่ยน LineChart เป็น AreaChart --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
          {/* [UPGRADE] 2. ขยาย Font หัวข้อการ์ด */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">แนวโน้มงานที่เข้ามา</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* เปลี่ยนเป็น AreaChart เพื่อความสวยงาม */}
              <AreaChart data={jobTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.install} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.install} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} formatter={(value) => [`${value} งาน`, "จำนวนงาน"]} />
                
                <Area 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke={COLORS.install}
                  fill="url(#colorJobs)" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, stroke: '#fff', fill: COLORS.install, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ส่วน KpiRow 2 --- */}
      <>
        {/* [UPGRADE] 2. ขยาย Font หัวข้อหลัก */}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">ภาพรวมการดำเนินงาน (Operations)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard title="งานทั้งหมด" numericValue={328} icon={<Briefcase size={22} />} color="default" change="+2.5% จากเดือนที่แล้ว" />
          <KpiCard title="งานกำลังดำเนิน" numericValue={85} icon={<Clock size={22} />} color="blue" change="+1.2% จากเดือนที่แล้ว" />
          <KpiCard title="งานเสร็จแล้ว" numericValue={77} icon={<CheckCircle size={22} />} color="green" change="+3.0% จากเดือนที่แล้ว" />
          <KpiCard title="งานค้าง / ล่าช้า" numericValue={5} icon={<AlertTriangle size={22} />} color="red" change="-0.5% จากเดือนที่แล้ว" />
        </div>

        {/* --- ส่วน "สถิติงาน" (AreaChart) --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
          {/* [UPGRADE] 2. ขยาย Font หัวข้อการ์ด */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">สถิติงาน (Job Type Statistics)</h3>
          <div className="h-64">
            {/* (โค้ดส่วนนี้ดีอยู่แล้ว ใช้ AreaChart ที่คุณชอบ) */}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyJobTypeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorInstall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.install} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.install} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.maintenance} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.maintenance} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorUrgent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.urgent} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS.urgent} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} formatter={(value, name) => [`${value} งาน`, name]} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
                <Area type="monotone" dataKey="install" name="ติดตั้ง" stackId="a" stroke={COLORS.install} fill="url(#colorInstall)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="maintenance" name="ซ่อมบำรุง" stackId="a" stroke={COLORS.maintenance} fill="url(#colorMaintenance)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="urgent" name="ซ่อมด่วน" stackId="a" stroke={COLORS.urgent} fill="url(#colorUrgent)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* --- [UPGRADE] 3. ปรับปรุงสถิติ 4 ช่องล่าง --- */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-800">
            
            <div className="py-4 md:py-2 px-4 text-center">
              <p className="text-base text-gray-500 dark:text-gray-400">เวลาปิดงานเฉลี่ย</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">3.5 วัน</p>
            </div>
            <div className="py-4 md:py-2 px-4 text-center">
              <p className="text-base text-gray-500 dark:text-gray-400">ส่งงานตรงเวลา</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">92%</p>
            </div>
            <div className="py-4 md:py-2 px-4 text-center">
              <p className="text-base text-gray-500 dark:text-gray-400">แก้จบในครั้งแรก (FFR)</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">88%</p>
</div>
            <div className="py-4 md:py-2 px-4 text-center">
              <p className="text-base text-gray-500 dark:text-gray-400">งานค้างบ่อยที่สุด</p>
              <p className="text-xl font-medium text-gray-900 dark:text-white">"ติดตั้ง A/C"</p>
            </div>
          </div>
        </div>
      </>
    </div>
  )
}