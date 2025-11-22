import React from 'react'
import KpiCard from './KpiCard'
import { CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react'
import { 
  ResponsiveContainer, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  BarChart, Bar, 
  AreaChart, Area
} from 'recharts'

// Custom Tooltip Component (เพิ่มเข้ามาเพื่อให้ Tooltip ดูเป็นมืออาชีพขึ้น)
const CustomBarChartTooltip = ({ active, payload, label, COLORS }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-gray-900 dark:text-white mb-1">{`เดือน: ${label}`}</p>
          <ul className="list-none p-0 m-0 space-y-1">
            {payload.map((item: any, index: number) => (
              <li key={`item-${index}`} className="flex justify-between items-center">
                <span style={{ color: item.fill, fontWeight: 'bold' }}>{item.name}:</span>
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{`${item.value} งาน`}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
  
    return null
}


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
  
  // ปรับสีให้ดูสวยงามและเป็นมืออาชีพยิ่งขึ้น
  const COLORS = { 
    install: '#3b82f6', // Indigo/Blue
    maintenance: '#10b981', // Emerald/Green
    urgent: '#f97316' // Orange/Amber
  }
  const BAR_OPACITY = 0.9;

  return (
    <div className="space-y-8">
      {/* --- ส่วน KpiRow 1: ภาพรวมสถิติงาน (Statistics Overview) (ตัวเลขใหม่) --- */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">ภาพรวมสถิติงาน Statistics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 💡 Card 1: งานทั้งหมด (พร้อม activeRange) - ตัวเลขใหม่ */}
          <KpiCard 
            title={`งานทั้งหมด (${currentRangeText})`} 
            numericValue={120} // ปรับตัวเลข
            icon={<Briefcase size={22} />} 
            color="default" 
            change="+5.0% จากช่วงก่อนหน้า" // ปรับข้อความ
          />
          
          {/* 💡 Card 2: กำลังดำเนินงาน (พร้อม activeRange) - ตัวเลขใหม่ */}
          <KpiCard 
            title={`กำลังดำเนินงาน (${currentRangeText})`} 
            numericValue={35} // ปรับตัวเลข
            icon={<Clock size={22} />} 
            color="blue" 
            change="-2 งาน (เทียบกับช่วงก่อนหน้า)" // ปรับข้อความ
          />
          
          {/* 💡 Card 3: งานเสร็จ (พร้อม activeRange) - ตัวเลขใหม่ */}
          <KpiCard 
            title={`งานเสร็จ (${currentRangeText})`} 
            numericValue={45} // ปรับตัวเลข
            icon={<CheckCircle size={22} />} 
            color="green" 
            change="+10 งาน (เทียบกับช่วงก่อนหน้า)" // ปรับข้อความ
          />
        </div>

        {/* --- แนวโน้มงานที่เข้ามา (LineChart เดิม) --- */}
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

      {/* --- ส่วน KpiRow 2: ภาพรวมการดำเนินงาน (Operations) (ตัวเลขเดิม/ภาพรวม) --- */}
      <>
        {/* 💡 ปรับปรุงหัวข้อ: ใช้ Border Bottom, Icon และสีเน้น */}
        {/* ปรับ h2 ให้อยู่ใน div เพื่อให้สามารถใส่ Border Bottom ได้ง่ายขึ้น */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-slate-700">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                {/* ใช้ไอคอน Clock และใช้สีเขียว/ฟ้าเพื่อให้ดูสอดคล้องกับสถานะ "กำลังดำเนินงาน" */}
                <Clock size={20} className="inline mr-2 text-green-500 dark:text-green-400" /> 
                ภาพรวมการดำเนินงาน (Operations)
            </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
          
          {/* Card 1: งานทั้งหมด */}
          <KpiCard 
            title="งานทั้งหมด" 
            numericValue={328} // ตัวเลขเดิม
            icon={<Briefcase size={22} />} 
            color="default" 
            change="+2.5% จากเดือนที่แล้ว" 
          />
          
          {/* Card 2: กำลังดำเนินงาน */}
          <KpiCard 
            title="กำลังดำเนินงาน" 
            numericValue={85} // ตัวเลขเดิม
            icon={<Clock size={22} />} 
            color="blue" 
            change="+1.2% จากเดือนที่แล้ว" 
          />
          
          {/* Card 3: งานเสร็จแล้ว */}
          <KpiCard 
            title="งานเสร็จแล้ว" 
            numericValue={77} // ตัวเลขเดิม
            icon={<CheckCircle size={22} />} 
            color="green" 
            change="+3.0% จากเดือนที่แล้ว" 
          />
        </div>

        {/* --- ส่วน "สถิติงาน" (Grouped Bar Chart) - ปรับปรุงหัวข้อแล้ว --- */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
          
          {/* 💡 หัวข้อ: ใช้ Border Bottom, Icon และสีเน้น */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                <Briefcase size={18} className="inline mr-2 text-blue-500 dark:text-blue-400" />
                สถิติงาน (Job Type Statistics)
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {/* ปรับ BarGap ให้ดูมีพื้นที่หายใจมากขึ้น */}
              <BarChart data={monthlyJobTypeData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }} barGap={8} barCategoryGap="20%"> 
                
                {/* ปรับเส้น Grid ให้จางลง และเอาเส้น Y ออก */}
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} /> 
                
                {/* เพิ่ม label ให้แกน X และปรับ tick/axis style */}
                <XAxis 
                    dataKey="month" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }} // เส้นแกน X 
                    stroke="#6b7280" 
                    label={{ value: 'เดือน', position: 'bottom', offset: 0, fill: '#6b7280', fontSize: 12 }}
                />
                
                {/* ปรับ tick/axis style ของแกน Y */}
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value} งาน`} 
                    stroke="#6b7280" 
                />
                
                {/* ใช้ Custom Tooltip Component ที่สร้างขึ้นใหม่ */}
                <Tooltip 
                    content={<CustomBarChartTooltip COLORS={COLORS} />}
                />
                
                {/* ปรับ Legend ให้อยู่ด้านบนซ้าย และจัดรูปแบบให้ดูดีขึ้น */}
                <Legend 
                    verticalAlign="top" 
                    align="right"
                    height={36} 
                    iconType="square" // เปลี่ยน icon เป็นสี่เหลี่ยม
                    wrapperStyle={{ fontSize: '14px', color: '#6b7280', paddingBottom: '10px' }} 
                />
                
                {/* ปรับสีและเพิ่ม Opacity */}
                <Bar 
                    dataKey="install" 
                    name="ติดตั้ง" 
                    fill={COLORS.install} 
                    fillOpacity={BAR_OPACITY}
                    radius={[4, 4, 0, 0]} 
                />
                
                <Bar 
                    dataKey="maintenance" 
                    name="ซ่อมบำรุง" 
                    fill={COLORS.maintenance}
                    fillOpacity={BAR_OPACITY}
                    radius={[4, 4, 0, 0]} 
                />
                
                <Bar 
                    dataKey="urgent" 
                    name="ซ่อมด่วน" 
                    fill={COLORS.urgent} 
                    fillOpacity={BAR_OPACITY}
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