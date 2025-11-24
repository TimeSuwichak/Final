// ------------------------------------------------------------------------------------------------------------------
// ✅ โค้ดที่แก้ไข: รวมการนำเข้า Lucide Icons ทั้งหมดไว้ในบรรทัดเดียว และลบการนำเข้าซ้ำซ้อนออก
// ------------------------------------------------------------------------------------------------------------------
import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from 'react'
// รวม Download, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Briefcase, CheckCircle, AlertTriangle ไว้ที่นี่
import { 
    Download, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, Briefcase, 
    CheckCircle, AlertTriangle 
} from 'lucide-react' 

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// Components (split) - Assuming these are accessible
import RightPanel from '../../components/dashboard/RightPanel'

// --- ThemeProvider Code (Included for context) ---
// ... (ThemeProvider code remains unchanged) ...
type Theme = "dark" | "light" | "system"
type ThemeProviderProps = { children: React.ReactNode; defaultTheme?: Theme; storageKey?: string }
type ThemeProviderState = { theme: Theme; setTheme: (theme: Theme) => void }
const initialState: ThemeProviderState = { theme: "system", setTheme: () => null }
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(setTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
// --- END ThemeProvider Code ---


// ----------------------------------------------------------------------------------
// ✅ [แก้ไข] KpiCard เวอร์ชันที่ปรับขนาดตัวเลข (text-4xl md:text-5xl -> text-3xl md:text-4xl)
// ----------------------------------------------------------------------------------
type KpiCardProps = {
    title: string;
    numericValue: number;
    icon: React.ReactNode;
    color: 'default' | 'blue' | 'green' | 'red';
    change: string;
}

// Map color prop to Tailwind CSS classes
const colorMap: Record<KpiCardProps['color'], { background: string; text: string; iconBg: string }> = {
    default: { // Violet/Purple
        background: 'bg-indigo-600 dark:bg-violet-600',
        text: 'text-indigo-600 dark:text-violet-400',
        iconBg: 'bg-indigo-500/10 dark:bg-violet-500/20'
    },
    blue: { // Cyan/Blue
        background: 'bg-cyan-600 dark:bg-cyan-500',
        text: 'text-cyan-600 dark:text-cyan-400',
        iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/20'
    },
    green: { // Emerald/Green
        background: 'bg-emerald-600 dark:bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20'
    },
    red: { // Red/Orange
        background: 'bg-red-600 dark:bg-red-500',
        text: 'text-red-600 dark:text-red-400',
        iconBg: 'bg-red-500/10 dark:bg-red-500/20'
    }
}

function KpiCard({ title, numericValue, icon, color, change }: KpiCardProps) {
    // ไม่มี Hook สำหรับ Animation การนับตัวเลข: แสดงค่าจริงทันที
    const valueDisplay = numericValue.toLocaleString('en-US'); 
    
    const { text, iconBg } = colorMap[color] || colorMap.default;
    
    // Determine change text color
    const isPositive = change.startsWith('+');
    const changeColor = isPositive 
        ? 'text-emerald-500 dark:text-emerald-400' 
        : 'text-red-500 dark:text-red-400';

    return (
        <div className="bg-white dark:bg-[#1a1c2e] p-5 rounded-xl shadow-lg border border-gray-100 dark:border-[#2A2C40] transition-shadow hover:shadow-2xl">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
                    {/* ✅ แก้ไขขนาดตัวเลข: text-3xl สำหรับมือถือ, md:text-4xl สำหรับเดสก์ท็อป */}
                    <p className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white leading-none">
                        {valueDisplay}
                    </p>
                </div>
                
                {/* Simplified Icon Wrapper - No Glass Sphere */}
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${iconBg} ${text} shrink-0`}>
                    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
                </div>
            </div>
            
            <p className={`mt-3 text-xs font-semibold ${changeColor}`}>
                {change}
            </p>
        </div>
    )
}
// ----------------------------------------------------------------------------------


// ❌ ลบการนำเข้าซ้ำซ้อน Clock, CheckCircle, Briefcase ออก
// import { CheckCircle, Clock, AlertTriangle, Briefcase } from 'lucide-react' 

import { 
  ResponsiveContainer, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, 
  BarChart, Bar, 
  AreaChart, Area
} from 'recharts'

// Custom Tooltip Component (ปรับปรุงสำหรับ Dark/Light Mode)
const CustomBarChartTooltip = ({ active, payload, label, COLORS }: any) => {
    if (active && payload && payload.length) {
      return (
        // 💡 Light: bg-white, border-gray-300 | Dark: bg-[#282b3d], border-[#3d4158]
        <div className="p-3 bg-white dark:bg-[#282b3d] border border-gray-300 dark:border-[#3d4158] rounded-lg shadow-xl text-sm">
          {/* 💡 Light: text-gray-900 | Dark: text-white */}
          <p className="font-bold text-gray-900 dark:text-white mb-1">{`เดือน: ${label}`}</p>
          <ul className="list-none p-0 m-0 space-y-1">
            {payload.map((item: any, index: number) => (
              <li key={`item-${index}`} className="flex justify-between items-center">
                <span style={{ color: item.fill, fontWeight: 'bold' }}>{item.name}:</span>
                {/* 💡 Light: text-gray-800 | Dark: text-gray-200 */}
                <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{`${item.value} งาน`}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return null
}


// ----------------------------------------------------------------------------------
// ✅ export default function OverviewPanel ... (ไม่มีการ import ซ้ำซ้อนแล้ว)
// ----------------------------------------------------------------------------------
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
  
  // 💡 [ปรับปรุง] เปลี่ยน install เป็นโทนม่วงเข้ม (#7c3aed)
  const COLORS = { 
    install: '#7c3aed', // Violet-600 (ม่วงเข้มขึ้น)
    maintenance: '#10b981', // Emerald/Green
    urgent: '#f97316' // Orange/Amber
  }
  const BAR_OPACITY = 0.9;

  return (
    <div className="space-y-8">
      {/* --- ส่วน KpiRow 1: ภาพรวมสถิติงาน (Statistics Overview) --- */}
      <div className="space-y-6">
        {/* 💡 [ปรับปรุง] ตัวอักษรหัวข้อ Light: gray-700 | Dark: gray-300 */}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">ภาพรวมสถิติงาน Statistics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* ✅ KpiCard ที่ถูกประกาศใหม่: ไม่มี Animation ตัวเลข */}
          <KpiCard 
            title={`งานทั้งหมด (${currentRangeText})`} 
            numericValue={120}
            icon={<Briefcase size={22} />} 
            color="default" // จะถูกตีความเป็น Violet/Purple Accent
            change="+5.0% จำนวนงาน "
          />
          
          {/* ✅ KpiCard ที่ถูกประกาศใหม่: ไม่มี Animation ตัวเลข */}
          <KpiCard 
            title={`กำลังดำเนินงาน (${currentRangeText})`} 
            numericValue={35}
            icon={<Clock size={22} />} 
            color="blue" // จะถูกตีความเป็น Cyan Accent
            change="กำลังดำเนินงาน "
          />
          
          {/* ✅ KpiCard ที่ถูกประกาศใหม่: ไม่มี Animation ตัวเลข */}
          <KpiCard 
            title={`งานเสร็จ (${currentRangeText})`} 
            numericValue={45}
            icon={<CheckCircle size={22} />} 
            color="green" // จะถูกตีความเป็น Emerald Accent
            change="+10 งานทั้งหมดที่เสร็จ "
          />
        </div>

        {/* --- แนวโน้มงานที่เข้ามา (LineChart) --- */}
        {/* 💡 [ปรับปรุง] พื้นหลัง Light: white, border-gray-300 | Dark: #131422, border-[#2A2C40] */}
        <div className="bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-300 dark:border-[#2A2C40]">
          {/* 💡 [ปรับปรุง] ตัวอักษรหัวข้อ Light: gray-900 | Dark: white */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">แนวโน้มงานที่เข้ามา</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jobTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                {/* 💡 ปรับปรุง: Grid Light: #e5e7eb, strokeOpacity 0.2 | Dark: #3d4158, strokeOpacity 0.15 */}
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} stroke="#e5e7eb" className="dark:stroke-[#3d4158] dark:stroke-opacity-[0.15]" vertical={false} />
                
                {/* 💡 [แก้ไข] ใช้ Light Mode Stroke และ className สำหรับ Dark Mode Tick/Label */}
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" className="dark:stroke-[#9ca3af] dark:fill-[#9ca3af]" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" className="dark:stroke-[#9ca3af] dark:fill-[#9ca3af]" />
                
                {/* 💡 [แก้ไข] ใช้ Light Mode Style ปกติสำหรับ Tooltip Style Prop */}
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333'
                  }} 
                  formatter={(value) => [`${value} งาน`, "จำนวนงาน"]} 
                />
                <Line 
                  type="monotone" 
                  dataKey="jobs" 
                  stroke={COLORS.install} // 💡 ใช้สีม่วงเข้ม #7c3aed
                  strokeWidth={3}
                  dot={true} 
                  activeDot={{ r: 6, stroke: '#fff', fill: COLORS.install, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ส่วน KpiRow 2: ภาพรวมการดำเนินงาน (Operations) --- */}
      <>
        {/* 💡 [ปรับปรุง] ตัวอักษรหัวข้อ Light: gray-700 | Dark: gray-300 */}
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">ภาพรวมการดำเนินงาน (Operations)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
          
          {/* ✅ KpiCard ที่ถูกประกาศใหม่: ไม่มี Animation ตัวเลข */}
          <KpiCard 
            title="งานทั้งหมด" 
            numericValue={328} 
            icon={<Briefcase size={22} />} 
            color="default" 
            change="+2.5% งานเติบโตจากเดือนที่แล้ว" 
          />
          
          {/* ✅ KpiCard ที่ถูกประกาศใหม่: ไม่มี Animation ตัวเลข */}
          <KpiCard 
            title="กำลังดำเนินงาน" 
            numericValue={85}
            icon={<Clock size={22} />} 
            color="blue" 
            change="+1.2% กำลังดำเนินงานเติบโตจากเดือนที่แล้ว" 
          />
          
          {/* ✅ KpiCard ที่ถูกประกาศใหม่: ไม่มี Animation ตัวเลข */}
          <KpiCard 
            title="งานเสร็จแล้ว" 
            numericValue={77}
            icon={<CheckCircle size={22} />} 
            color="green" 
            change="+3.0% งานเสร็จเติบโตจากเดือนที่แล้ว" 
          />
        </div>

        {/* --- ส่วน "สถิติงาน" (Grouped Bar Chart) --- */}
        {/* 💡 [ปรับปรุง] พื้นหลัง Light: white, border-gray-300 | Dark: #131422, border-[#2A2C40] */}
        <div className="bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-300 dark:border-[#2A2C40]">
          
          {/* 💡 [ปรับปรุง] ใช้ border Light: gray-200 | Dark: #3d4158 */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-[#3d4158]">
            {/* 💡 ปรับปรุง: ตัวอักษรหัวข้อ Light: gray-900 | Dark: white และ Icon Light: violet-500 | Dark: violet-400 */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                <Briefcase size={18} className="inline mr-2 text-violet-500 dark:text-violet-400" />
                สถิติงาน (Job Type Statistics)
            </h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyJobTypeData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }} barGap={8} barCategoryGap="20%"> 
                
                {/* 💡 ปรับปรุง: Grid Light: gray-200, strokeOpacity 0.1 | Dark: #3d4158, strokeOpacity 0.15 */}
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke="#e5e7eb" className="dark:stroke-[#3d4158] dark:stroke-opacity-[0.15]" vertical={false} /> 
                
                <XAxis 
                    dataKey="month" 
                    fontSize={12} 
                    tickLine={false} 
                    // 💡 [แก้ไข] ใช้ Light Mode Stroke และ className
                    axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }} 
                    // 💡 [แก้ไข] ใช้ Light Mode Stroke และ className
                    stroke="#6b7280" className="dark:stroke-[#9ca3af] dark:fill-[#9ca3af]"
                    label={{ value: 'เดือน', position: 'bottom', offset: 0, fill: '#6b7280', className: 'dark:fill-[#9ca3af]', fontSize: 12 }}
                />
                
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value} งาน`} 
                    stroke="#6b7280" className="dark:stroke-[#9ca3af] dark:fill-[#9ca3af]"
                />
                
                {/* 💡 ใช้ Custom Tooltip ที่รับคลาส Tailwind CSS (จึงรองรับ Dark Mode) */}
                <Tooltip content={<CustomBarChartTooltip COLORS={COLORS} />} />
                
                <Legend 
                    verticalAlign="top" 
                    align="right"
                    height={36} 
                    iconType="square"
                    // 💡 [แก้ไข] ลบ dark:color ที่ทำให้เกิด error และใช้ color (light mode default)
                    wrapperStyle={{ fontSize: '14px', color: '#6b7280', paddingBottom: '10px' }} 
                    className="dark:text-[#9ca3af]" // 💡 [แก้ไข] ใช้ className เพื่อเปลี่ยนสีใน Dark Mode
                />
                
                <Bar 
                    dataKey="install" 
                    name="ติดตั้ง" 
                    fill={COLORS.install} // 💡 ม่วงเข้ม #7c3aed
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