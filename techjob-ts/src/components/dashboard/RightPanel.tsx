import React from 'react'
import { BarChart2, PlayCircle, Clock, CheckCircle } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts'

export default function RightPanel() {
  const activityFeed = [
    { id: 1, techName: 'นายสมชาย (ทีม A)', job: '#1026 - ติดตั้ง A/C', status: 'กำลังดำเนินการ', time: '10:30 น.' },
    { id: 2, techName: 'นายวิรัตน์ (ทีม B)', job: '#1025 - ซ่อมด่วน', status: 'งานเสร็จสิ้น', time: '10:28 น.' },
    { id: 3, techName: 'นายประยุทธ์ (ทีม C)', job: '#1027 - ซ่อมบำรุง', status: 'เริ่มงาน', time: '10:25 น.' },
    { id: 4, techName: 'นายมงคล (ทีม D)', job: '#1024 - Overdue', status: 'กำลังดำเนินการ', time: '09:15 น.' }
  ]

  const statusConfig: any = {
    'เริ่มงาน': { icon: <PlayCircle size={18} className="text-blue-500" />, color: 'text-blue-500' },
    'กำลังดำเนินการ': { icon: <Clock size={18} className="text-yellow-500" />, color: 'text-yellow-500' },
    'งานเสร็จสิ้น': { icon: <CheckCircle size={18} className="text-green-500" />, color: 'text-green-500' },
    'default': { icon: <Clock size={18} className="text-gray-500" />, color: 'text-gray-500' }
  }

  const THEME_COLORS = { PRIMARY: '#6C52FF', SECONDARY: '#00D4FF', TERTIARY: '#FF007A' }
  const COLORS = [THEME_COLORS.PRIMARY, THEME_COLORS.SECONDARY, THEME_COLORS.TERTIARY]
  const jobTypeData = [ { name: 'ติดตั้ง A/C', value: 45 }, { name: 'ซ่อมบำรุง', value: 30 }, { name: 'ซ่อมด่วน', value: 25 } ]

  const ffrData = [ { name: 'ติดตั้ง A/C', ffr: 85 }, { name: 'ซ่อมบำรุง', ffr: 95 }, { name: 'ซ่อมด่วน', ffr: 70 } ]
  const FFR_COLORS = ['#4f46e5', '#10b981', '#f59e0b']

  return (
    <>
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart2 size={20} className="text-indigo-500" /> สถานะงานช่าง (Live Feed)</h3>
        <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {activityFeed.map(activity => {
            const config = statusConfig[activity.status] || statusConfig.default
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <div className="mt-1 shrink-0">{config.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.techName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{activity.job}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${config.color}`}>{activity.status}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">สัดส่วนประเภทงาน (Job Type Mix)</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} formatter={(value: any, name: string) => [`${value}%`, name]} />
              <Pie data={jobTypeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value">
                {jobTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex justify-between items-center"><span><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[0] }}></span>1. ติดตั้ง A/C</span><span className="font-medium">45% (จำนวนงาน)</span></li>
          <li className="flex justify-between items-center"><span><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[1] }}></span>2. ซ่อมบำรุง</span><span className="font-medium">30% (จำนวนงาน)</span></li>
          <li className="flex justify-between items-center"><span><span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[2] }}></span>3. ซ่อมด่วน</span><span className="font-medium">25% (จำนวนงาน)</span></li>
        </ul>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Performed Tasks งานที่มีการดำเนินการบ่อย</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ffrData} layout="vertical" margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis type="number" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" tickFormatter={(value) => `${value}%`} />
              <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} stroke="#6b7280" width={80} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#333' }} formatter={(value: any) => [`${value}%`, "Task Rate"]} />
              <Bar dataKey="ffr" name="FFR Rate" radius={[0, 4, 4, 0]}>
                {ffrData.map((entry, index) => (<Cell key={`cell-${index}`} fill={FFR_COLORS[index % FFR_COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}
