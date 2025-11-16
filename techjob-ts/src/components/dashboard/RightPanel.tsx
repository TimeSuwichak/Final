import React from 'react'
import { Badge } from "../ui/badge"; 
import { 
  BarChart2, PlayCircle, Clock, CheckCircle, 
  Wrench, Zap, Settings2,
  PieChart as PieChartIcon // [UPGRADE] 1. Import PieChartIcon
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, CartesianGrid, XAxis, YAxis, 
  LabelList 
} from 'recharts'

// (CustomYAxisTick และ iconMap สำหรับ Bar Chart - เหมือนเดิม)
const iconMap: Record<string, React.ReactNode> = {
  'ติดตั้ง A/C': <Settings2 className="h-5 w-5 text-gray-400" />,
  'ซ่อมบำรุง': <Wrench className="h-5 w-5 text-gray-400" />,
  'ซ่อมด่วน': <Zap className="h-5 w-5 text-gray-400" />,
}
const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const { value } = payload;
  return (
    <g transform={`translate(${x},${y})`}>
      <svg x={-125} y={-10} width={24} height={24}>
        {iconMap[value] || <Wrench className="h-5 w-5 text-gray-400" />}
      </svg>
      <text x={-95} y={0} dy={4} textAnchor="start" fill="#6b7280" className="text-sm font-medium">
        {value}
      </text>
    </g>
  );
};

// (PALETTE และ statusConfig เหมือนเดิม)
const PALETTE = ['#4f46e5', '#10b981', '#f59e0b'];
const statusConfig: any = {
  'เริ่มงาน': { icon: <PlayCircle size={18} className="text-blue-500" />, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'กำลังดำเนินการ': { icon: <Clock size={18} className="text-yellow-600" />, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'งานเสร็จสิ้น': { icon: <CheckCircle size={18} className="text-green-500" />, className: 'bg-green-100 text-green-800 border-green-200' },
  'default': { icon: <Clock size={18} className="text-gray-500" />, className: 'bg-gray-100 text-gray-800 border-gray-200' }
}

// [UPGRADE] 2. สร้าง Icon Map สำหรับ Legend ของ Pie Chart
const legendIconMap: Record<string, React.ElementType> = {
  'ติดตั้ง A/C': Settings2,
  'ซ่อมบำรุง': Wrench,
  'ซ่อมด่วน': Zap,
};

export default function RightPanel() {
  const activityFeed = [
    { id: 1, techName: 'นายสมชาย (ทีม A)', job: '#1026 - ติดตั้ง A/C', status: 'กำลังดำเนินการ' },
    { id: 2, techName: 'นายวิรัตน์ (ทีม B)', job: '#1025 - ซ่อมด่วน', status: 'งานเสร็จสิ้น' },
    { id: 3, techName: 'นายประยุทธ์ (ทีม C)', job: '#1027 - ซ่อมบำรุง', status: 'เริ่มงาน' },
    { id: 4, techName: 'นายมงคล (ทีม D)', job: '#1024 - Overdue', status: 'กำลังดำเนินการ' }
  ]

  const jobTypeData = [ { name: 'ติดตั้ง A/C', value: 45 }, { name: 'ซ่อมบำรุง', value: 30 }, { name: 'ซ่อมด่วน', value: 25 } ]
  const ffrData = [ { name: 'ติดตั้ง A/C', ffr: 85 }, { name: 'ซ่อมบำรุง', ffr: 95 }, { name: 'ซ่อมด่วน', ffr: 70 } ]

  return (
    <>
      {/* --- Card 1: Live Feed (เหมือนเดิม) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-indigo-500" /> สถานะงานช่าง (Live Feed)
        </h3>
        <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {activityFeed.map(activity => {
            const config = statusConfig[activity.status] || statusConfig.default
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <div className="mt-1 shrink-0">{config.icon}</div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{activity.techName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activity.job}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="outline" className={`font-semibold ${config.className}`}>
                    {activity.status}
                  </Badge>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* --- [UPGRADE] Card 2: Pie Chart (อัปเกรดใหม่) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        {/* [UPGRADE] 1. เพิ่ม Icon ที่ Header */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChartIcon size={20} className="text-indigo-500" />
          สัดส่วนประเภทงาน (Job Type Mix)
        </h3>
        {/* (ความสูง h-56 เหมือนเดิม) */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} formatter={(value: any, name: string) => [`${value}%`, name]} />
              <Pie data={jobTypeData} cx="50%" cy="50%" 
                // [UPGRADE] 3. ขยายขนาด Donut Chart
                innerRadius={70} 
                outerRadius={90} 
                fill="#8884d8" 
                paddingAngle={5} 
                dataKey="value"
              >
                {jobTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* [UPGRADE] 2. สร้าง Legend ใหม่แบบมี Icon */}
        <ul className="mt-6 space-y-4">
          {jobTypeData.map((entry, index) => {
            const color = PALETTE[index % PALETTE.length];
            // ดึง Icon component จาก map
            const Icon = legendIconMap[entry.name] || Wrench; 
            
            return (
              <li key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* แสดง Icon พร้อมใส่สีแบบ dynamic */}
                  <Icon className="h-5 w-5" style={{ color }} />
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                    {entry.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {entry.value}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* --- Card 3: Bar Chart (เหมือนเดิม) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wrench size={20} className="text-indigo-500" />
          Most Performed Tasks (งานที่ทำบ่อย)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ffrData} layout="vertical" margin={{ top: 5, right: 50, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide={true} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                width={130}
                tick={<CustomYAxisTick />}
                interval={0}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} 
                formatter={(value: any) => [`${value}%`, "Task Rate"]} 
              />
              <Bar dataKey="ffr" name="FFR Rate" radius={[0, 8, 8, 0]}>
                {ffrData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
                <LabelList 
                  dataKey="ffr" 
                  position="right" 
                  formatter={(value: number) => `${value}%`}
                  style={{ fill: '#fff', fontSize: '14px', fontWeight: '600' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}