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


// --- TimeRangeButton (Adjusted for better fit) ---
function TimeRangeButton({ label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-600 text-white dark:bg-violet-600 shadow-sm hover:bg-indigo-700 dark:hover:bg-violet-700'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1f2133]'
      }`}>
      {label}
    </button>
  )
}

// --- DashboardFilters (Adjusted for better fit) ---
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
      const dayClasses = `w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-colors duration-150 ease-in-out 
        ${isToday(i) ? 'border-2 border-indigo-500 dark:border-violet-500' : ''} 
        ${isSelected(i) 
          ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-violet-600 dark:hover:bg-violet-700 font-bold'
          : 'hover:bg-gray-100 dark:hover:bg-[#1f2133]'} 
        ${!isSelected(i) 
          ? (isToday(i) 
            ? 'text-indigo-600 dark:text-violet-400'
            : 'text-gray-800 dark:text-gray-200')
          : ''}`
      days.push(<div key={`day-${i}`} className={dayClasses} onClick={() => handleDateClick(i)}>{i}</div>)
    }
    return days
  }, [currentMonth, selectedDate]) 

  const filterBoxStyle = "bg-white dark:bg-[#1a1c2e] border border-gray-200 dark:border-[#2A2C40] rounded-lg px-3 py-1.5 min-w-[170px] transition-all duration-200 hover:border-indigo-300 dark:hover:border-violet-500 shadow-sm"
  const labelStyle = "text-xs font-medium text-gray-500 dark:text-gray-400 block tracking-wider uppercase"
  const selectStyle = "bg-transparent text-sm font-bold text-gray-900 dark:text-white w-full focus:outline-none appearance-none cursor-pointer"
  const optionStyle = "bg-white text-black dark:bg-[#1a1c2e] dark:text-white"
  const iconStyle = "text-gray-400 dark:text-gray-500"

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Time Range Button Group */}
      <div className="bg-gray-50 dark:bg-[#1a1c2e] border border-gray-200 dark:border-[#2A2C40] rounded-lg p-1 flex space-x-1 shadow-inner">
        <TimeRangeButton label="รายวัน" isActive={activeRange === 'Daily'} onClick={() => onRangeChange('Daily')} />
        <TimeRangeButton label="รายเดือน" isActive={activeRange === 'Monthly'} onClick={() => onRangeChange('Monthly')} />
        <TimeRangeButton label="รายปี" isActive={activeRange === 'Yearly'} onClick={() => onRangeChange('Yearly')} />
      </div>

      <div className="relative" ref={calendarRef}>
        <div className={filterBoxStyle}>
          <span className={labelStyle}>Date range</span>
          <button className="flex items-center gap-2 mt-1 w-full text-left" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
            <Calendar size={16} className="text-indigo-500 dark:text-violet-400" /> 
            <span className="text-sm font-bold text-gray-900 dark:text-white flex-1">{selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <ChevronDown size={16} className={`${iconStyle} transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#1a1c2e] border border-gray-200 dark:border-[#2A2C40] rounded-lg shadow-xl p-4 w-[280px] transform origin-top-left animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f2133] text-gray-600 dark:text-gray-300 transition-colors"><ChevronLeft size={18} /></button>
              <span className="font-bold text-sm text-gray-900 dark:text-white">{currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#1f2133] text-gray-600 dark:text-gray-300 transition-colors"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {weekdays.map(day => (<div key={day} className="text-xs font-bold text-gray-500 dark:text-gray-400">{day}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays}</div> 
          </div>
        )}
      </div>

      <div className={filterBoxStyle}>
        <label htmlFor="services-filter" className={labelStyle}>Services</label>
        <div className="relative mt-1">
          <select id="services-filter" className={selectStyle}>
            <option className={optionStyle}>All Services</option>
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
            <option className={optionStyle}>All Technician</option>
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
      <button onClick={onExportClick} disabled={isExporting} className="flex items-center justify-center gap-2 text-sm bg-indigo-600 dark:bg-violet-600 hover:bg-indigo-700 dark:hover:bg-violet-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed min-w-[140px]">
        {isExporting ? (
          <><Clock size={16} className="animate-spin text-white" /><span>กำลัง Export</span></>
        ) : (
          <><Download size={16} className="text-white" /><span>Export PDF</span></>
        )}
      </button>
    </div>
  )
}

// --- DashboardHeaderCard (รวม Icon Style ใหม่) ---
function DashboardHeaderCard({ 
    activeRange, 
    onRangeChange, 
    onExportClick, 
    isExporting 
}: any) {
  
  const cardStyle = "bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-xl dark:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 border border-gray-100 dark:border-[#2A2C40]";
  const titleStyle = "text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug";
  const descStyle = "text-sm text-gray-500 dark:text-gray-400 mt-0.5 font-medium";
  
  // ✅ [UPDATED ICON STYLE] Glass Sphere with Complex Shadow
  const iconWrapperStyle = `
    w-14 h-14 md:w-16 md:h-16 flex items-center justify-center 
    rounded-full 
    bg-gradient-to-br from-indigo-500 to-violet-600 
    dark:from-indigo-700 dark:to-violet-800 
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
    <header className={`mb-8 ${cardStyle} relative overflow-hidden`}>
      
      {/* 1. Vertical Accent Line (สอดคล้องกับ Card Style) */}
      {/* ✅ [ADDED] Vertical Accent Line */}
      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-l-2xl"></div>

      {/* 2. Header Row (Title & Action) */}
      {/* ✅ [ADJUSTED] p-5 md:p-6 p-6 -> p-5 md:p-6 (เพื่อไม่ให้ซ้ำกับ padding ของ cardStyle) */}
      <div className="p-5 md:p-6 border-b border-gray-100 dark:border-[#2A2C40]">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            {/* ✅ [UPDATED ICON] ใช้ Glass Sphere Style */}
            <div className={iconWrapperStyle}>
              <Briefcase size={28} className="text-white drop-shadow-sm" /> 
            </div>
            
            <div>
              <h1 className={titleStyle}>
                CEO Dashboard
              </h1>
              <p className={descStyle}>
                ภาพรวมสถิติการทำงานและสถานะทีมช่าง
              </p>
            </div>
          </div>
          
          <div className="shrink-0">
            <DashboardActions 
              onExportClick={onExportClick} 
              isExporting={isExporting} 
            />
          </div>
          
        </div>
      </div>
      
      {/* 3. Filters Row (Bottom Layer) */}
      <div className="p-5 md:p-6 pt-4"> 
        <DashboardFilters 
          activeRange={activeRange} 
          onRangeChange={onRangeChange} 
        />
      </div>
      
    </header>
  )
}

// --- Skeletons (ปรับปรุงให้เข้ากับขนาดใหม่) ---
function KpiCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1c2e] p-5 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]">
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
  return (<div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]"><div className="h-6 bg-gray-300 dark:bg-[#383a54] rounded w-1/2 mb-4"></div><div className="h-64 bg-gray-200 dark:bg-[#2A2C40] rounded-lg"></div></div>) 
}
function TableSkeleton() { 
  return (<div className="bg-white dark:bg-[#1a1c2e] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]"><div className="h-6 bg-gray-300 dark:bg-[#383a54] rounded w-1/3 mb-4"></div><div className="space-y-3"><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div><div className="h-8 bg-gray-200 dark:bg-[#2A2C40] rounded"></div></div></div>) 
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

    const options = { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: document.documentElement.classList.contains('dark') ? '#0A0B11' : '#ffffff' 
    }
    html2canvas(input, options).then(canvas => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4') 
      const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width; const imgHeight = canvas.height
      const ratio = pdfWidth / imgWidth
      const imgScaledHeight = imgHeight * ratio
      
      let y = 0
      let pageNumber = 1
      while (y < imgScaledHeight) {
          if (pageNumber > 1) {
              pdf.addPage()
          }
          pdf.addImage(imgData, 'PNG', 0, -y, pdfWidth, imgScaledHeight)
          y += pdfHeight
          pageNumber++
      }
      
      pdf.save('executive-dashboard-export.pdf')
    }).catch(err => { console.error('Error exporting PDF:', err); alert('เกิดข้อผิดพลาดในการ Export PDF:\n\n' + err.message) }).finally(() => setIsExporting(false))
  }

  const baseContainerClass = 'flex-1 p-6 md:p-8 bg-gray-50 dark:bg-[#0D0E15] text-gray-900 dark:text-gray-100 min-h-screen'

  if (loading) {
    // 💡 [ปรับปรุง] Skeleton Header เพื่อให้เข้ากับ Header Card ใหม่ (กระชับขึ้น)
    return (
      <div className={`${baseContainerClass} animate-pulse`}>
        <div className="mb-8 bg-white dark:bg-[#1a1c2e] rounded-2xl shadow-xl border border-gray-100 dark:border-[#2A2C40]">
           {/* เพิ่ม Skeleton สำหรับ Vertical Accent Line */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gray-300 dark:bg-[#383a54] rounded-l-2xl"></div> 

          <div className="p-5 md:p-6 border-b border-gray-100 dark:border-[#2A2C40] flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              {/* ปรับขนาด Skeleton Icon ให้ตรงกับ Glass Sphere Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-300 dark:bg-[#2A2C40]"></div> 
              <div>
                <div className="h-7 bg-gray-300 dark:bg-[#2A2C40] rounded w-52 mb-1.5"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#383a54] rounded w-64"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-300 dark:bg-[#2A2C40] rounded-lg w-36"></div>
          </div>
          <div className="p-5 md:p-6 pt-4">
            <div className="h-10 bg-gray-200 dark:bg-[#2A2C40] rounded-lg w-full"></div>
          </div>
        </div>
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
    <ThemeProvider>
      <div ref={dashboardRef} className={baseContainerClass}>
        
        {/* ✅ ใช้ DashboardHeaderCard ที่รวม Glass Sphere Icon Style และ Vertical Accent Line แล้ว */}
        <DashboardHeaderCard 
          activeRange={activeRange} 
          onRangeChange={setActiveRange}
          onExportClick={handleExportPDF} 
          isExporting={isExporting}
        />

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