import React, { useState, useRef, useEffect } from 'react'

// (Imports ทั้งหมดเหมือนเดิม)
import { 
  Briefcase, Clock, CheckCircle, AlertTriangle, Users, BarChart2, TrendingUp,
  Plus, Download, Calendar, ChevronDown, ChevronLeft, ChevronRight,
  DollarSign, UserCheck, PieChart as PieChartIcon, MessageSquareWarning, 
  PlayCircle 
  // [!! ลบ !!] Star ถูกลบออกจาก import
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts'


// --- 1. useCountUp (คงเดิม) ---
function useCountUp(end, duration = 1000) {
  const [count, setCount] = useState(0);
  const frameRate = 1000 / 60; // 60 fps
  const totalFrames = Math.round(duration / frameRate);

  useEffect(() => {
    let frame = 0;
    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = end * progress; // Linear easing

      if (frame === totalFrames) {
        clearInterval(counter);
        setCount(end);
      } else {
        setCount(currentCount);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [end, duration, totalFrames]);

  return count;
}


// --- [!! แก้ไข !!] 2. OverallWorkKpis (แทนที่ CSAT) ---
function OverallWorkKpis({ activeRange }) { 
  
  const rangeTextMap = {
    Daily: 'วันนี้',
    Monthly: 'เดือนนี้',
    Yearly: 'ปีนี้',
  };
  const currentRangeText = rangeTextMap[activeRange] || 'เดือนนี้';

  const jobTrendData = [
    { month: 'ม.ค.', jobs: 40 }, { month: 'ก.พ.', jobs: 30 }, { month: 'มี.ค.', jobs: 50 },
    { month: 'เม.ย.', jobs: 45 }, { month: 'พ.ค.', jobs: 60 }, { month: 'มิ.ย.', jobs: 55 },
    { month: 'ก.ค.', jobs: 70 },
  ];

  return (
    <div className="space-y-6"> 
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">ภาพรวมสถิติงาน Statistics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard 
          title={`งานเสร็จ (${currentRangeText})`}
          numericValue={82}
          suffix=" งาน"
          icon={<CheckCircle size={22} />}
          color="green" 
          change="+3 งาน (เทียบกับช่วงก่อนหน้า)"
        />
        <KpiCard 
          title="เวลางานเฉลี่ย"
          numericValue={3.2}
          suffix=" ชม."
          icon={<Clock size={22} />}
          color="blue" 
          change="-0.2 ชม. (เทียบกับช่วงก่อนหน้า)"
        />
        
        {/* [!! แทนที่ !!] เปลี่ยนจาก CSAT เป็น "งานค้าง" */}
        <KpiCard 
          title="งานเกินดำหนด"
          numericValue={5} // (ดึงค่ามาจาก OperationalKpiCards)
          suffix=" งาน"
          icon={<AlertTriangle size={22} />}
          color="red" 
          change="-0.5% จากเดือนที่แล้ว"
        />
      </div>

      {/* Line Chart (คงเดิม) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          แนวโน้มงานที่เข้ามา
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={jobTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333'
                }}
                formatter={(value) => [`${value} งาน`, "จำนวนงาน"]}
              />
              <Line type="monotone" dataKey="jobs" stroke="#4f46e5" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// --- 3. Operational KpiCards (คงเดิม) ---
function OperationalKpiCards() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">ภาพรวมการดำเนินงาน (Operations)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="งานทั้งหมด" 
          numericValue={328}
          icon={<Briefcase size={22} />} 
          color="default" 
          change="+2.5% จากเดือนที่แล้ว"
        />
        <KpiCard 
          title="งานกำลังดำเนินการ" 
          numericValue={85}
          icon={<Clock size={22} />} 
          color="blue" 
          change="+1.2% จากเดือนที่แล้ว"
        />
        <KpiCard 
          title="งานเสร็จแล้ว" 
          numericValue={77}
          icon={<CheckCircle size={22} />} 
          color="green" 
          change="+3.0% จากเดือนที่แล้ว"
        />
        <KpiCard 
          title="งานค้าง / ล่าช้า" 
          numericValue={5}
          icon={<AlertTriangle size={22} />} 
          color="red" 
          change="-0.5% จากเดือนที่แล้ว"
        />
      </div>
    </>
  )
}

// --- 4. KpiCard (คงเดิม) ---
function KpiCard({ title, numericValue, suffix = '', icon, color, change }) {
  const colorClasses = {
    blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green:  'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    red:    'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    default:'bg-gray-200 text-gray-700 dark:bg-slate-800/40 dark:text-slate-300'
  }
  const iconStyle = colorClasses[color] || colorClasses.default;
  
  const animatedValue = useCountUp(numericValue, 1000);
  
  const displayValue = animatedValue.toLocaleString('th-TH', { 
    minimumFractionDigits: numericValue % 1 ? 1 : 0, 
    maximumFractionDigits: numericValue % 1 ? 1 : 0 
  });

  return (
    <div className="group bg-white dark:bg-slate-900 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-700 hover:scale-[1.03]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
            {displayValue}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-full ${iconStyle} transition-transform duration-300 group-hover:scale-110`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{change}</p>
    </div>
  )
}


// --- 5. WorkStatisticsChart (คงเดิม) ---
function WorkStatisticsChart() {
  const monthlyJobTypeData = [
    { month: 'ม.ค.', install: 40, maintenance: 20, urgent: 10 },
    { month: 'ก.พ.', install: 35, maintenance: 25, urgent: 15 },
    { month: 'มี.ค.', install: 50, maintenance: 30, urgent: 10 },
    { month: 'เม.ย.', install: 45, maintenance: 20, urgent: 20 },
    { month: 'พ.ค.', install: 55, maintenance: 25, urgent: 10 },
    { month: 'มิ.ย.', install: 60, maintenance: 30, urgent: 15 },
  ];
  const COLORS = { install: '#4f46e5', maintenance: '#10b981', urgent: '#f59e0b' };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        สถิติงาน (Job Type Statistics)
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyJobTypeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} งาน`} stroke="#6b7280" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333'
              }}
              formatter={(value, name) => [`${value} งาน`, name]}
            />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
            <Bar dataKey="install" name="ติดตั้ง" fill={COLORS.install} stackId="a" />
            <Bar dataKey="maintenance" name="ซ่อมบำรุง" fill={COLORS.maintenance} stackId="a" />
            <Bar dataKey="urgent" name="ซ่อมด่วน" fill={COLORS.urgent} stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-800">
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">เวลาปิดงานเฉลี่ย</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">3.5 วัน</p>
        </div>
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">ส่งงานตรงเวลา</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">92%</p>
        </div>
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">แก้จบในครั้งแรก (FFR)</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">88%</p>
        </div>
        <div className="py-2 md:py-0 px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">งานค้างบ่อยที่สุด</p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">"ติดตั้ง A/C"</p>
        </div>
      </div>
    </div>
  )
}

// --- 6. TechnicianPerformance (คงเดิม) ---
function TechnicianPerformance() {
  
  const techsData = [
    { name: 'ทีม A (นายสมชาย)', completed: 8, avgTime: '2 วัน', overdue: 2, active: 3 },
    { name: 'ทีม B (นายวิรัตน์)', completed: 12, avgTime: '3 วัน', overdue: 5, active: 1 },
    { name: 'ทีม C (นายประยุทธ์)', completed: 5, avgTime: '5 วัน', overdue: 1, active: 2 },
    { name: 'ทีม D (นายมงคล)', completed: 23, avgTime: '7 วัน', overdue: 8, active: 5 },
  ];

  const techsWithStats = techsData.map(tech => {
    const totalFinished = tech.completed + tech.overdue;
    const onTimeRate = totalFinished > 0 ? (tech.completed / totalFinished) * 100 : 100;
    return {
      ...tech,
      onTimeRate: onTimeRate.toFixed(0) // 8 / (8 + 2) = 80%
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ประสิทธิภาพทีมช่าง รายบุคคล (Technician Performance)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">ทีม / ช่าง</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">งานที่กำลังทำ</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">งานเสร็จแล้ว</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">งานล่าช้า</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">% ตรงเวลา</th>
              <th className="py-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">เวลาเฉลี่ย</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {techsWithStats.map((tech) => (
              <tr key={tech.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{tech.name}</td>
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                  {tech.active}
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{tech.completed}</td>
                <td className={`py-3 px-4 font-bold ${tech.overdue > 3 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {tech.overdue}
                </td>
                <td className={`py-3 px-4 font-medium ${tech.onTimeRate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {tech.onTimeRate}%
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{tech.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- 7. TechnicianActivityFeed (คงเดิม) ---
function TechnicianActivityFeed() {
  
  const activityFeed = [
    { 
      id: 1, 
      techName: 'นายสมชาย (ทีม A)', 
      job: '#1026 - ติดตั้ง A/C', 
      status: 'กำลังดำเนินการ', 
      time: '10:30 น.' 
    },
    { 
      id: 2, 
      techName: 'นายวิรัตน์ (ทีม B)', 
      job: '#1025 - ซ่อมด่วน', 
      status: 'งานเสร็จสิ้น', 
      time: '10:28 น.' 
    },
    { 
      id: 3, 
      techName: 'นายประยุทธ์ (ทีม C)', 
      job: '#1027 - ซ่อมบำรุง', 
      status: 'เริ่มงาน', 
      time: '10:25 น.' 
    },
    { 
      id: 4, 
      techName: 'นายมงคล (ทีม D)', 
      job: '#1024 - Overdue', 
      status: 'กำลังดำเนินการ', 
      time: '09:15 น.' 
    },
  ];

  const statusConfig = {
    'เริ่มงาน': {
      icon: <PlayCircle size={18} className="text-blue-500" />,
      color: 'text-blue-500'
    },
    'กำลังดำเนินการ': {
      icon: <Clock size={18} className="text-yellow-500" />,
      color: 'text-yellow-500'
    },
    'งานเสร็จสิ้น': {
      icon: <CheckCircle size={18} className="text-green-500" />,
      color: 'text-green-500'
    },
    'default': {
      icon: <Clock size={18} className="text-gray-500" />,
      color: 'text-gray-500'
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart2 size={20} className="text-indigo-500" />
        สถานะงานช่าง (Live Feed)
      </h3>
      
      <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {activityFeed.map((activity) => {
          const config = statusConfig[activity.status] || statusConfig.default;
          
          return (
            <li key={activity.id} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                {config.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.techName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {activity.job}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${config.color}`}>{activity.status}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  )
}


// --- 8. JobTypeAnalysis (คงเดิม) ---
function JobTypeAnalysis() {
  const THEME_COLORS = {
    PRIMARY: '#6C52FF',
    SECONDARY: '#00D4FF',
    TERTIARY: '#FF007A',
  };
  const COLORS = [THEME_COLORS.PRIMARY, THEME_COLORS.SECONDARY, THEME_COLORS.TERTIARY];

  const jobTypeData = [
    { name: 'ติดตั้ง A/C', value: 45 },
    { name: 'ซ่อมบำรุง', value: 30 },
    { name: 'ซ่อมด่วน', value: 25 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        สัดส่วนประเภทงาน (Job Type Mix)
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333'
              }}
              formatter={(value, name) => [`${value}%`, name]}
            />
            <Pie data={jobTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
              {jobTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <li className="flex justify-between items-center">
          <span><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></span>1. ติดตั้ง A/C</span> 
          <span className="font-medium">45% (จำนวนงาน)</span>
        </li>
        <li className="flex justify-between items-center">
          <span><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></span>2. ซ่อมบำรุง</span> 
          <span className="font-medium">30% (จำนวนงาน)</span>
        </li>
        <li className="flex justify-between items-center">
          <span><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[2] }}></span>3. ซ่อมด่วน</span> 
          <span className="font-medium">25% (จำนวนงาน)</span>
        </li>
      </ul>
    </div>
  )
}

// --- 9. FfrAnalysisChart (คงเดิม) ---
function FfrAnalysisChart() {
  const ffrData = [
    { name: 'ติดตั้ง A/C', ffr: 85 },
    { name: 'ซ่อมบำรุง', ffr: 95 },
    { name: 'ซ่อมด่วน', ffr: 70 },
  ];
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Most Performed Tasks งานที่มีการดำเนินการบ่อย
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ffrData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              stroke="#6b7280"
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              stroke="#6b7280"
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', border: 'none', borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333'
              }}
              formatter={(value) => [`${value}%`, "Task Rate"]}
            />
            <Bar dataKey="ffr" name="FFR Rate" radius={[0, 4, 4, 0]}>
              {ffrData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


// --- 10. TimeRangeButton (คงเดิม) ---
function TimeRangeButton({ label, isActive, onClick }) { 
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-200
        ${isActive 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
        }
      `}
    >
      {label}
    </button>
  );
}

// --- 11. DashboardFilters (คงเดิม) ---
function DashboardFilters({ activeRange, onRangeChange }) { 
  
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
            <span className="text-sm font-semibold text-gray-900 dark:text-white flex-1">
              {selectedDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
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
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {weekdays.map(day => (<div key={day} className="text-xs font-medium text-gray-500 dark:text-gray-400">{day}</div>))}
            </div>
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

// --- 12. DashboardActions (คงเดิม) ---
function DashboardActions({ onExportClick, isExporting }) { 
  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={onExportClick} 
        disabled={isExporting} 
        className="flex items-center justify-center gap-2 text-sm bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg transition-colors border border-gray-300 dark:border-slate-700
                   disabled:opacity-50 disabled:cursor-not-allowed w-[160px]"
      >
        {isExporting ? (
          <>
            <Clock size={16} className="animate-spin" /> 
            <span>กำลัง Export</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>Export PDF</span>
          </>
        )}
      </button>
    </div>
  )
}


// --- 13. Skeleton Components (คงเดิม) ---
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
  );
}
function ChartSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
      <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <div className="h-6 bg-gray-300 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded"></div>
      </div>
    </div>
  );
}

// --- [!! ปรับโครงสร้าง !!] 14. Component หลัก (ExDashboard) ---
function ExDashboard() {

  const dashboardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeRange, setActiveRange] = useState('Monthly');
  const [loading, setLoading] = useState(true);

  // (logic... เหมือนเดิม)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 
    
    return () => clearTimeout(timer);
  }, []); 

  const handleExportPDF = () => {
    if (isExporting) return;
    setIsExporting(true); 

    const input = dashboardRef.current;
    if (!input) {
      setIsExporting(false);
      return;
    }
    
    const options = {
      scale: 2, 
      useCORS: true, 
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f9fafb',
    };

    html2canvas(input, options)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4'); 
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2; 
        const imgY = (pdfHeight - imgHeight * ratio) / 2;
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save('executive-dashboard-export.pdf'); 
      })
      .catch(err => {
        console.error("Error exporting PDF:", err);
        alert("เกิดข้อผิดพลาดในการ Export PDF:\n\n" + err.message); 
      })
      .finally(() => {
        setIsExporting(false);
      });
  };
  
  const baseContainerClass = "flex-1 p-6 md:p-8 bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-gray-100 min-h-screen";

  // (Skeleton JSX... เหมือนเดิม)
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
            {/* Skeletons for left column */}
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
            {/* Skeletons for right column */}
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }
  
  // [!! ปรับโครงสร้าง !!] นี่คือ Dashboard จริงที่จะแสดงหลัง loading เสร็จ
  return (
    <div ref={dashboardRef} className={baseContainerClass}>
      
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">CEO Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">ภาพรวมสถิติการทำงานและสถานะทีมช่าง</p>
          </div>
          <div className="flex-shrink-0">
            <DashboardActions 
              onExportClick={handleExportPDF} 
              isExporting={isExporting} 
            />
          </div>
        </div>
        <div>
          <DashboardFilters 
            activeRange={activeRange} 
            onRangeChange={setActiveRange} 
          />
        </div>
      </header>
      
      {/* เนื้อหา Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <OverallWorkKpis activeRange={activeRange} /> 
          <OperationalKpiCards />
          <WorkStatisticsChart />
          <TechnicianPerformance />
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* [!! ปรับโครงสร้าง !!] 
              แทนที่ <InsightsAndAlerts /> 
              ด้วย Component ใหม่ที่คุณขอ
          */}
          <TechnicianActivityFeed /> {/* 1. [!! ใหม่ !!] นี่คือตัว Live Feed ที่คุณขอ */}
          <JobTypeAnalysis />        {/* 2. กราฟ Pie (ของเดิม) */}
          <FfrAnalysisChart />       {/* 3. กราฟ FFR (ของเดิม) */}
        </div>
      </div>
    </div>
  )
}

export default ExDashboard 