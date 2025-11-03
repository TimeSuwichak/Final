import React, { useState, useRef, useEffect } from 'react'

import { 
  Briefcase, 
  Clock, // เราจะใช้ไอคอนนี้สำหรับ animate-spin
  CheckCircle, 
  AlertTriangle, 
  Users, 
  BarChart2, 
  TrendingUp,
  Plus,
  Download,
  Calendar, 
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// [เพิ่ม] Import ไลบรารีสำหรับ Export PDF



// --- 1. KpiCards (โค้ดเดิม) ---
function KpiCards() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">ภาพรวมงานทั้งหมด</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="งานทั้งหมด" 
          value="1,420" 
          icon={<Briefcase size={22} />} 
          color="default" 
          change="+2.5% จากเดือนที่แล้ว"
        />
        <KpiCard 
          title="งานกำลังดำเนินการ" 
          value="85" 
          icon={<Clock size={22} />} 
          color="blue" 
          change="+1.2% จากเดือนที่แล้ว"
        />
        <KpiCard 
          title="งานเสร็จแล้ว" 
          value="1,290" 
          icon={<CheckCircle size={22} />} 
          color="green" 
          change="+3.0% จากเดือนที่แล้ว"
        />
        <KpiCard 
          title="งานค้าง / ล่าช้า" 
          value="45" 
          icon={<AlertTriangle size={22} />} 
          color="red" 
          change="-0.5% จากเดือนที่แล้ว"
        />
      </div>
    </>
  )
}

function KpiCard({ title, value, icon, color, change }) {
  // (โค้ดเดิม)
  const colorClasses = {
    blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green:  'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    red:    'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    default:'bg-gray-200 text-gray-700 dark:bg-slate-800/40 dark:text-slate-300'
  }
  const iconStyle = colorClasses[color] || colorClasses.default;
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-700">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${iconStyle}`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{change}</p>
    </div>
  )
}

// --- 2. WorkStatisticsChart (โค้ดเดิม) ---
function WorkStatisticsChart() {
  // (โค้ดเดิม)
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">สถิติการทำงาน (Jobs per Month)</h3>
      <div className="h-64 bg-gray-100 dark:bg-slate-800/50 rounded-lg flex items-center justify-center border border-dashed border-gray-300 dark:border-slate-700">
        <BarChart2 size={48} className="text-gray-400 dark:text-slate-600" />
        <p className="text-gray-500 dark:text-slate-600 ml-4">(Placeholder for Line Chart)</p>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-800">
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Job Duration</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3.5 วัน</p>
        </div>
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">On-time Completion</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">92%</p>
        </div>
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Top Overdue Type</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">"ติดตั้ง A/C"</p>
        </div>
      </div>
    </div>
  )
}

// --- 3. TechnicianPerformance (โค้ดเดิม) ---
function TechnicianPerformance() {
  // (โค้ดเดิม)
  const techs = [
    { name: 'ทีม A (นายสมชาย)', completed: 8, avgTime: '2 วัน', overdue: 2,},
    { name: 'ทีม B (นายวิรัตน์)', completed: 12, avgTime: '3 วัน', overdue: 5,},
    { name: 'ทีม C (นายประยุทธ์)', completed: 5, avgTime: '5 วัน', overdue: 1,},
    { name: 'ทีม D (นายมงคล)', completed: 23, avgTime: '7 วัน', overdue: 8,},
  ];
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ประสิทธิภาพทีมช่าง</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ทีม / ช่าง</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">งานเสร็จแล้ว</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">เวลาเฉลี่ย</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">งานล่าช้า</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {techs.map((tech) => (
              <tr key={tech.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{tech.name}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{tech.completed}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{tech.avgTime}</td>
                <td className={`py-3 px-4 font-bold ${tech.overdue > 3 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {tech.overdue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- 4. & 5. InsightsAndAlerts (โค้ดเดิม) ---
function InsightsAndAlerts() {
  // (โค้ดเดิม)
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="text-red-500 dark:text-red-400" />
           Alerts / Notifications
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 rounded-lg">
            <AlertTriangle className="text-red-500 dark:text-red-400 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium text-red-800 dark:text-white">Job #1024 Overdue</p>
              <p className="text-sm text-red-700 dark:text-red-200">ทีม A - เกินกำหนด 2 วัน</p>
            </div>
          </li>
          <li className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <Clock className="text-yellow-500 dark:text-yellow-400 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="font-medium text-yellow-800 dark:text-white">ทีม B Overloaded</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-200">มี 15 งานที่กำลังทำ</p>
            </div>
          </li>
        </ul>
      </div>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-500 dark:text-green-400" />
           High-level Insights
        </h3>
        <ul className="space-y-3 list-disc list-inside text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-medium text-gray-900 dark:text-white">ทีม C</span> มีประสิทธิภาพสูงที่สุด (On-time 99%)
          </li>
          <li>
            งานประเภท <span className="font-medium text-gray-900 dark:text-white">"ซ่อมด่วน"</span> มักล่าช้า
          </li>
          <li>
            Workload <span className="font-medium text-gray-900 dark:text-white">เพิ่มขึ้น 15%</span> ใน Q4
          </li>
          <li className="text-green-600 dark:text-green-300">
            <span className="font-medium">ข้อเสนอแนะ:</span> เพิ่มช่างสำหรับทีม A
          </li>
        </ul>
      </div>
    </div>
  )
}

// --- DashboardFilters (โค้ดเดิม) ---
function DashboardFilters() {
  // (โค้ดเดิม)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth()));
  const calendarRef = useRef(null);
  const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);
  const changeMonth = (offset) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + offset, 1);
      return newMonth;
    });
  };
  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth()));
    setIsCalendarOpen(false);
  };
  const renderCalendarDays = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const startDayOfWeek = firstDayOfMonth.getDay(); 
    const today = new Date();
    const isToday = (day) => 
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear();
    const isSelected = (day) =>
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear();
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`pad-${i}`} className="w-8 h-8"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const dayClasses = `
        w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors
        ${isToday(i) ? 'border border-indigo-500 dark:border-indigo-400' : ''}
        ${isSelected(i) ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}
        ${!isSelected(i) ? (isToday(i) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300') : ''}
      `;
      days.push(
        <div key={`day-${i}`} className={dayClasses} onClick={() => handleDateClick(i)}>
          {i}
        </div>
      );
    }
    return days;
  };
  const filterBoxStyle = "bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg px-4 py-2 min-w-[180px] transition-colors hover:border-gray-400 dark:hover:border-slate-700"
  const labelStyle = "text-xs text-gray-500 dark:text-gray-400 block"
  const selectStyle = "bg-transparent text-sm font-semibold text-gray-900 dark:text-white w-full focus:outline-none appearance-none"
  const optionStyle = "bg-white text-black dark:bg-slate-900 dark:text-white"
  const iconStyle = "text-gray-500 dark:text-gray-400"
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative" ref={calendarRef}>
        <div className={filterBoxStyle}>
          <span className={labelStyle}>Date range</span>
          <button 
            className="flex items-center gap-2 mt-1 w-full text-left"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <Calendar size={16} className={iconStyle} />
            <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
              {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <ChevronDown size={16} className={`${iconStyle} transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {isCalendarOpen && (
          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg shadow-xl p-4 w-[280px]">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => changeMonth(-1)} 
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {currentMonth.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {weekdays.map(day => (
                <div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {renderCalendarDays()}
            </div>
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

// --- [แก้ไข] Component สำหรับปุ่ม Actions (เพิ่ม Loading State) ---
function DashboardActions({ onExportClick, isExporting }) { // [แก้ไข] รับ 'isExporting' prop
  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={onExportClick} 
        disabled={isExporting} // [แก้ไข] ปิดปุ่มเมื่อกำลัง export
        className="flex items-center justify-center gap-2 text-sm bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-colors border border-gray-300 dark:border-slate-700
                   disabled:opacity-50 disabled:cursor-not-allowed w-[130px]" // [แก้ไข] เพิ่มสไตล์ตอน disable
      >
        {/* [แก้ไข] สลับ UI ตาม isExporting */}
        {isExporting ? (
          <>
            <Clock size={16} className="animate-spin" /> 
            <span>กำลัง Export...</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>Export</span>
          </>
        )}
      </button>
    </div>
  )
}


// --- [แก้ไข] Component หลัก (เพิ่ม Logic การ Export) ---
function ExDashboard() {

  const dashboardRef = useRef(null);
  
  // [เพิ่ม] 1. สร้าง State สำหรับ Loading
  const [isExporting, setIsExporting] = useState(false);

  // [แก้ไข] 2. ปรับปรุงฟังก์ชัน Export
  const handleExportPDF = () => {
    if (isExporting) return; // กันกดซ้ำ
    setIsExporting(true); // เริ่ม Loading

    const input = dashboardRef.current;
    if (!input) {
      setIsExporting(false);
      return;
    }

    html2canvas(input, { scale: 2, useCORS: true })
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = imgWidth / imgHeight;
        let calculatedHeight = pdfWidth / ratio;
        let calculatedWidth = pdfWidth;

        if (calculatedHeight > pdfHeight) {
          calculatedHeight = pdfHeight;
          calculatedWidth = pdfHeight * ratio;
        }

        pdf.addImage(imgData, 'PNG', 0, 0, calculatedWidth, calculatedHeight);
        pdf.save('dashboard-export.pdf');
      })
      .catch(err => {
        console.error("Error exporting PDF:", err);
        
        // [ --- นี่คือจุดที่แก้ไข --- ]
        // เปลี่ยน alert ธรรมดา ให้แสดงข้อความ Error จริง
        // เราใช้ \n เพื่อขึ้นบรรทัดใหม่ใน alert
        alert("เกิดข้อผิดพลาดในการ Export PDF:\n\n" + err.message); 
        // [ --- จบจุดที่แก้ไข --- ]

      })
      .finally(() => {
        setIsExporting(false); // หยุด Loading เสมอ
      });
  };


  return (
    // [แก้ไข] 3. ผูก Ref เข้ากับ Div หลักของ Dashboard
    <div 
      ref={dashboardRef} 
      className="flex-1 p-6 md:p-8 bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 min-h-screen"
    >
      
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CEO Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">ภาพรวมองค์กรและประสิทธิภาพทีมช่าง</p>
          </div>
          <div className="flex-shrink-0">
            {/* [แก้ไข] 4. ส่ง State 'isExporting' ไปให้ปุ่ม */}
            <DashboardActions 
              onExportClick={handleExportPDF} 
              isExporting={isExporting} 
            />
          </div>
        </div>
        
        <div>
          <DashboardFilters />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <KpiCards />
          <WorkStatisticsChart />
          <TechnicianPerformance />
        </div>

        <div className="lg:col-span-1 space-y-8">
          <InsightsAndAlerts />
        </div>

      </div>
    </div>
  )
}

export default ExDashboard