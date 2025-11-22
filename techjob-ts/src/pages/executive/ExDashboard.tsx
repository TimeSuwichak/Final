import React, { useState, useRef, useEffect, useMemo, createContext, useContext } from 'react'
import { Download, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock, BarChart2, Briefcase } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// Components (split) - Assuming these are accessible
import OverviewPanel from '../../components/dashboard/OverviewPanel'
import RightPanel from '../../components/dashboard/RightPanel'
import TechnicianPerformance from '../../components/dashboard/TechnicianPerformance'

// --- ThemeProvider Code (Included for context) ---
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
      setTheme(theme)
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


// --- TimeRangeButton ---
function TimeRangeButton({ label, isActive, onClick }: any) {
  // 💡 ปรับปรุง: Dark mode ใช้ Deep Navy Accent, Light Mode ใช้ Indigo/Violet
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white dark:bg-[#7c3aed] shadow-sm' // Light: Indigo-600, Dark: Violet-600 (#7c3aed)
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A2C40]' // Light: Gray Hover, Dark: Deep Navy Hover
      }`}>
      {label}
    </button>
  )
}

// --- DashboardFilters ---
function DashboardFilters({ activeRange, onRangeChange }: any) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth()))
  const calendarRef = useRef<HTMLDivElement | null>(null)
  const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setIsCalendarOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeMonth = (offset: number) => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(newDate)
    setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth()))
    setIsCalendarOpen(false)
  }

  const renderCalendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const startDayOfWeek = firstDayOfMonth.getDay()
    const today = new Date()
    const isToday = (day: number) => day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
    const isSelected = (day: number) => day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear()

    const days = [] as React.ReactNode[]
    for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`pad-${i}`} className="w-8 h-8" />)
    for (let i = 1; i <= daysInMonth; i++) {
      // 💡 [ปรับปรุง] Calendar day classes ให้รองรับ Light/Deep Navy Theme
      const dayClasses = `w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors 
        ${isToday(i) ? 'border border-indigo-500 dark:border-violet-500' : ''} 
        ${isSelected(i) 
          ? 'bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-[#7c3aed] dark:hover:bg-violet-500' // Selected State
          : 'hover:bg-gray-100 dark:hover:bg-[#2A2C40]'} 
        ${!isSelected(i) 
          ? (isToday(i) 
            ? 'text-indigo-600 dark:text-violet-400' // Today, Not Selected
            : 'text-gray-700 dark:text-gray-300') // Default Day
          : ''}`
      days.push(<div key={`day-${i}`} className={dayClasses} onClick={() => handleDateClick(i)}>{i}</div>)
    }
    return days
  }, [currentMonth, selectedDate]) 

  // 💡 [ปรับปรุง] Filter Box Styles สำหรับ Dark/Light Mode
  const filterBoxStyle = "bg-white dark:bg-[#131422] border border-gray-300 dark:border-[#2A2C40] rounded-lg px-4 py-2 min-w-[180px] transition-colors hover:border-gray-400 dark:hover:border-[#383a54]"
  const labelStyle = "text-xs text-gray-500 dark:text-gray-400 block"
  const selectStyle = "bg-transparent text-sm font-semibold text-gray-900 dark:text-white w-full focus:outline-none appearance-none"
  const optionStyle = "bg-white text-black dark:bg-[#131422] dark:text-white" // Options need explicit Light/Dark
  const iconStyle = "text-gray-500 dark:text-gray-400"

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* 💡 [ปรับปรุง] Background ของ Time Range Button Group */}
      <div className="bg-white dark:bg-[#131422] border border-gray-300 dark:border-[#2A2C40] rounded-lg p-1 flex space-x-1">
        <TimeRangeButton label="รายวัน" isActive={activeRange === 'Daily'} onClick={() => onRangeChange('Daily')} />
        <TimeRangeButton label="รายเดือน" isActive={activeRange === 'Monthly'} onClick={() => onRangeChange('Monthly')} />
        <TimeRangeButton label="รายปี" isActive={activeRange === 'Yearly'} onClick={() => onRangeChange('Yearly')} />
      </div>

      <div className="relative" ref={calendarRef}>
        <div className={filterBoxStyle}>
          <span className={labelStyle}>Date range</span>
          <button className="flex items-center gap-2 mt-1 w-full text-left" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
            <Calendar size={16} className={iconStyle} />
            <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">{selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <ChevronDown size={16} className={`${iconStyle} transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isCalendarOpen && (
          // 💡 [ปรับปรุง] Calendar Box Background/Border
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#131422] border border-gray-300 dark:border-[#2A2C40] rounded-lg shadow-xl p-4 w-[280px]">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2C40] text-gray-600 dark:text-gray-300"><ChevronLeft size={18} /></button>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2C40] text-gray-600 dark:text-gray-300"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">{weekdays.map(day => (<div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400">{day}</div>))}</div>
            <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays}</div> 
          </div>
        )}
      </div>

      <div className={filterBoxStyle}>
        <label htmlFor="services-filter" className={labelStyle}>Services</label>
        <div className="relative mt-1">
          <select id="services-filter" className={selectStyle}>
            <option className={optionStyle}>Work</option>
            <option className={optionStyle}>ติดตั้ง (Installation)</option>
            <option className={optionStyle}>ซ่อมบำรุง (Maintenance)</option>
            <option className={optionStyle}>ซ่อมด่วน (Urgent Repair)</option>
          </select>
          <ChevronDown size={16} className={`${iconStyle} absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none`} />
        </div>
      </div>

      <div className={filterBoxStyle}>
        <label htmlFor="teams-filter" className={labelStyle}>Artisan</label>
        <div className="relative mt-1">
          <select id="teams-filter" className={selectStyle}>
            <option className={optionStyle}>Technician</option>
            <option className={optionStyle}>ช่าง A</option>
            <option className={optionStyle}>ช่าง B</option>
            <option className={optionStyle}>ช่าง C</option>
          </select>
          <ChevronDown size={16} className={`${iconStyle} absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none`} />
        </div>
      </div>
    </div>
  )
}

// --- DashboardActions ---
function DashboardActions({ onExportClick, isExporting }: any) {
  return (
    <div className="flex items-center gap-3">
      {/* 💡 [ปรับปรุง] Export Button Style */}
      <button onClick={onExportClick} disabled={isExporting} className="flex items-center justify-center gap-2 text-sm bg-white dark:bg-[#131422] hover:bg-gray-100 dark:hover:bg-[#1f2133] text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-colors border border-gray-300 dark:border-[#2A2C40] disabled:opacity-50 disabled:cursor-not-allowed w-40">
        {isExporting ? (
          <><Clock size={16} className="animate-spin text-indigo-600 dark:text-violet-400" /><span>กำลัง Export</span></>
        ) : (
          <><Download size={16} className="text-indigo-600 dark:text-violet-400" /><span>Export PDF</span></>
        )}
      </button>
    </div>
  )
}

// --- Skeletons ---
function KpiCardSkeleton() {
  return (
    // 💡 [ปรับปรุง] Skeleton Background/Border ให้เข้ากับธีม Light/Deep Navy
    <div className="bg-white dark:bg-[#131422] p-5 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-[#2A2C40] rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-300 dark:bg-[#383a54] rounded w-1/2"></div>
        </div>
        <div className="p-3 rounded-full bg-gray-200 dark:bg-[#2A2C40] w-12 h-12"></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-[#2A2C40] rounded w-full"></div>
    </div>
  )
}
function ChartSkeleton() { 
  // 💡 [ปรับปรุง] Skeleton Background/Border ให้เข้ากับธีม Light/Deep Navy
  return (<div className="bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]"><div className="h-6 bg-gray-300 dark:bg-[#383a54] rounded w-1/2 mb-4"></div><div className="h-64 bg-gray-200 dark:bg-[#2A2C40] rounded-lg"></div></div>) 
}
function TableSkeleton() { 
  // 💡 [ปรับปรุง] Skeleton Background/Border ให้เข้ากับธีม Light/Deep Navy
  return (<div className="bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]"><div className="h-6 bg-gray-300 dark:bg-[#383a54] rounded w-1/3 mb-4"></div><div className="space-y-3"><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div></div></div>) 
}

// --- ExDashboard page ---
export default function ExDashboard() {
  const dashboardRef = useRef<HTMLDivElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [activeRange, setActiveRange] = useState('Monthly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const handleExportPDF = () => {
    if (isExporting) return
    setIsExporting(true)
    const input = dashboardRef.current
    if (!input) { setIsExporting(false); return }

    // [แก้ไข] เปลี่ยนสีพื้นหลังในการ Export PDF ให้รองรับ Light/Dark mode
    const options = { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0D0E15' : '#f9fafb' 
    }
    html2canvas(input, options).then(canvas => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width; const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2; const imgY = (pdfHeight - imgHeight * ratio) / 2
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save('executive-dashboard-export.pdf')
    }).catch(err => { console.error('Error exporting PDF:', err); alert('เกิดข้อผิดพลาดในการ Export PDF:\n\n' + err.message) }).finally(() => setIsExporting(false))
  }

  // 💡 [ปรับปรุง] baseContainerClass: Light Mode bg-gray-100, Dark Mode bg-[#0D0E15]
  const baseContainerClass = 'flex-1 p-6 md:p-8 bg-gray-100 dark:bg-[#0D0E15] text-gray-900 dark:text-gray-100 min-h-screen'

  if (loading) {
    return (
      <div className={`${baseContainerClass} animate-pulse`}>
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
            <div>
              <div className="h-9 bg-gray-300 dark:bg-[#2A2C40] rounded w-48 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-[#383a54] rounded w-72"></div>
            </div>
            <div className="h-12 bg-gray-300 dark:bg-[#2A2C40] rounded-lg w-40"></div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-[#2A2C40] rounded-lg w-full"></div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="h-6 bg-gray-300 dark:bg-[#2A2C40] rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </div>
              <ChartSkeleton />
            </div>
            <TableSkeleton />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    // 💡 Wrapper component with ThemeProvider
    <ThemeProvider>
      <div ref={dashboardRef} className={baseContainerClass}>
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
            <div className="flex items-center gap-3">
              {/* 💡 [ปรับปรุง] Icon สีม่วงสว่าง */}
              <Briefcase size={36} className="text-indigo-600 dark:text-violet-400" /> 
              <div>
                {/* [UPGRADE] ปรับขนาดและสีของหัวข้อ */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                  CEO Dashboard
                </h1>
                {/* [UPGRADE] ปรับสีและขนาดคำอธิบาย */}
                <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                  ภาพรวมสถิติการทำงานและสถานะทีมช่าง
                </p>
              </div>
            </div>
            <div className="shrink-0">
                <DashboardActions onExportClick={handleExportPDF} isExporting={isExporting} />
            </div>
          </div>
          <div><DashboardFilters activeRange={activeRange} onRangeChange={setActiveRange} /></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <OverviewPanel activeRange={activeRange} />
            {/* <TechnicianPerformance /> */}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <RightPanel />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}