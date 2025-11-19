import React from 'react'
import { Badge } from "../ui/badge"; 
import { 
  BarChart2, PlayCircle, Clock, CheckCircle, 
  Wrench, Zap, Settings2,
  PieChart as PieChartIcon 
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

// [NEW] Custom Label สำหรับ Bar Chart เพื่อปรับปรุงการแสดงผล
const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value, index } = props;
  const color = PALETTE[index % PALETTE.length];
  
  return (
    <text 
      x={x + width + 5} // ขยับไปทางขวาของ Bar เล็กน้อย
      y={y + height / 2} 
      dy={4} 
      fill={color} // ใช้สีเดียวกับ Bar
      textAnchor="start" 
      className="text-sm font-bold"
    >
      {`${value}%`}
    </text>
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
  const ffrData = [ { name: 'ติดตั้ง A/C', Rate: 85 }, { name: 'ซ่อมบำรุง', Rate: 95 }, { name: 'ซ่อมด่วน', Rate: 70 } ]

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

      {/* --- Card 2: Pie Chart (ปรับปรุงให้ดูนุ่มนวลและมีมิติ) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChartIcon size={20} className="text-indigo-500" />
          สัดส่วนประเภทงาน (Job Type Mix)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* [NEW] เพิ่ม Drop Shadow Definition ใน Recharts */}
              <defs>
                <filter id="shadow" height="130%">
                  <feDropShadow 
                    dx="0" 
                    dy="4" 
                    stdDeviation="4" 
                    floodColor="#000000" 
                    floodOpacity="0.15" 
                  />
                </filter>
              </defs>

              <Tooltip 
                // ปรับ Tooltip Style ให้ดูสะอาดและมีขอบมนมากขึ้น
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '8px 12px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
                  color: '#333' 
                }} 
                formatter={(value: any, name: string) => [`${value}%`, name]} 
                labelStyle={{ fontWeight: 'bold', color: '#4f46e5' }}
              />
              <Pie data={jobTypeData} cx="50%" cy="50%" 
                innerRadius={70} 
                outerRadius={90} 
                fill="#8884d8" 
                paddingAngle={5} 
                dataKey="value"
                // [UPGRADE] ใช้ filter เพื่อใส่ Drop Shadow
                filter="url(#shadow)" 
              >
                {jobTypeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PALETTE[index % PALETTE.length]} 
                    // [UPGRADE] ทำให้เส้นขอบหายไป เพื่อความนุ่มนวล
                    stroke="none" 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend ปรับปรุงให้มี Icon และดูดีอยู่แล้ว */}
        <ul className="mt-6 space-y-4">
          {jobTypeData.map((entry, index) => {
            const color = PALETTE[index % PALETTE.length];
            const Icon = legendIconMap[entry.name] || Wrench; 
            
            return (
              <li key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
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

      {/* --- Card 3: Bar Chart (เหมือนเดิมจากการปรับปรุงก่อนหน้า) --- */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Wrench size={20} className="text-indigo-500" />
          Most Performed Tasks (งานที่ทำบ่อย)
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={ffrData} 
              layout="vertical" 
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }} 
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} horizontal={false} />
              
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                hide={true} 
              />
              
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                width={130}
                tick={<CustomYAxisTick />}
                interval={0}
              />
              
              <YAxis 
                yAxisId="right"
                orientation="right"
                type="number"
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: '12px' }}
                interval={0}
                label={{ value: 'Completion Rate (%)', angle: 0, position: 'top', dx: 30, dy: -5, fill: '#4f46e5', fontWeight: 'bold' }}
              />

              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} 
                formatter={(value: any) => [`${value}%`, "Completion Rate"]} 
              />
              
              <Bar 
                dataKey="Rate" 
                name="Completion Rate" 
                radius={[0, 10, 10, 0]} 
                barSize={20} 
              >
                {ffrData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
                
                <LabelList 
                  dataKey="Rate" 
                  content={<CustomBarLabel />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}