import React, { useState, useRef, useEffect } from 'react'
import { Download, Calendar, ChevronDown, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// Components (split)
import OverviewPanel from '../../components/dashboard/OverviewPanel'
import RightPanel from '../../components/dashboard/RightPanel'
import TechnicianPerformance from '../../components/dashboard/TechnicianPerformance'
import KpiCard from '../../components/dashboard/KpiCard'

// --- TimeRangeButton (kept in page) ---
function TimeRangeButton({ label, isActive, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
      {label}
    </button>
  )
}

// --- DashboardFilters (kept in page) ---
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

  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
    const startDayOfWeek = firstDayOfMonth.getDay()
    const today = new Date()
    const isToday = (day: number) => day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
    const isSelected = (day: number) => day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear()

    const days = [] as React.ReactNode[]
    for (let i = 0; i < startDayOfWeek; i++) days.push(<div key={`pad-${i}`} className="w-8 h-8" />)
    for (let i = 1; i <= daysInMonth; i++) {
      const dayClasses = `w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors ${isToday(i) ? 'border border-indigo-500 dark:border-indigo-400' : ''} ${isSelected(i) ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700'} ${!isSelected(i) ? (isToday(i) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300') : ''}`
      days.push(<div key={`day-${i}`} className={dayClasses} onClick={() => handleDateClick(i)}>{i}</div>)
    }
    return days
  }

  const filterBoxStyle = "bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg px-4 py-2 min-w-[180px] transition-colors hover:border-gray-400 dark:hover:border-slate-700"
  const labelStyle = "text-xs text-gray-500 dark:text-gray-400 block"
  const selectStyle = "bg-transparent text-sm font-semibold text-gray-900 dark:text-white w-full focus:outline-none appearance-none"
  const optionStyle = "bg-white text-black dark:bg-slate-900 dark:text-white"
  const iconStyle = "text-gray-500 dark:text-gray-400"

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg p-1 flex space-x-1">
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
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-xl p-4 w-[280px]">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"><ChevronLeft size={18} /></button>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"><ChevronRight size={18} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">{weekdays.map(day => (<div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400">{day}</div>))}</div>
            <div className="grid grid-cols-7 gap-1 text-center">{renderCalendarDays()}</div>
          </div>
        )}
      </div>

      <div className={filterBoxStyle}>
        <label htmlFor="services-filter" className={labelStyle}>Services</label>
        <div className="relative mt-1">
          <select id="services-filter" className={selectStyle}>
            <option className={optionStyle}>Work</option>
            <option className={optionStyle}>ติดตั้ง (Installation)</option>
            <option className="optionStyle">ซ่อมบำรุง (Maintenance)</option>
            <option className="optionStyle">ซ่อมด่วน (Urgent Repair)</option>
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

// --- DashboardActions (kept in page) ---
function DashboardActions({ onExportClick, isExporting }: any) {
  return (
    <div className="flex items-center gap-3">
  <button onClick={onExportClick} disabled={isExporting} className="flex items-center justify-center gap-2 text-sm bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-colors border border-gray-300 dark:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed w-40">
        {isExporting ? (
          <><Clock size={16} className="animate-spin" /><span>กำลัง Export</span></>
        ) : (
          <><Download size={16} /><span>Export PDF</span></>
        )}
      </button>
    </div>
  )
}

// --- Skeletons (kept in page) ---
function KpiCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-10 bg-gray-300 dark:bg-slate-600 rounded w-1/2"></div>
        </div>
        <div className="p-3 rounded-full bg-gray-200 dark:bg-slate-800 w-12 h-12"></div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
    </div>
  )
}
function ChartSkeleton() { return (<div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800"><div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/2 mb-4"></div><div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-lg"></div></div>) }
function TableSkeleton() { return (<div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800"><div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div><div className="space-y-3"><div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div><div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div><div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div><div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div></div></div>) }

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

    const options = { scale: 2, useCORS: true, backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f9fafb' }
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

  const baseContainerClass = 'flex-1 p-6 md:p-8 bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 min-h-screen'

  if (loading) {
    return (
      <div className={`${baseContainerClass} animate-pulse`}>
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
            <div>
              <div className="h-9 bg-gray-300 dark:bg-slate-700 rounded w-48 mb-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-72"></div>
            </div>
            <div className="h-12 bg-gray-300 dark:bg-slate-800 rounded-lg w-40"></div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-slate-800 rounded-lg w-full"></div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCardSkeleton />
                <KpiCardSkeleton />
                <KpiCardSkeleton />
              </div>
              <ChartSkeleton />
            </div>
            <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
              <KpiCardSkeleton />
            </div>
            <ChartSkeleton />
            <TableSkeleton />
          </div>
          <div className="lg:col-span-1 space-y-8">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={dashboardRef} className={baseContainerClass}>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">CEO Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">ภาพรวมสถิติการทำงานและสถานะทีมช่าง</p>
          </div>
          <div className="shrink-0"><DashboardActions onExportClick={handleExportPDF} isExporting={isExporting} /></div>
        </div>
        <div><DashboardFilters activeRange={activeRange} onRangeChange={setActiveRange} /></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <OverviewPanel activeRange={activeRange} />
          <TechnicianPerformance />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <RightPanel />
        </div>
      </div>
    </div>
  )
}