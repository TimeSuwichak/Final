import React from 'react'
// [UPGRADE] 1. Import Icons ที่จำเป็น
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Timer 
} from 'lucide-react'

export default function TechnicianPerformance() {
  const techsData = [
    { name: 'ทีม A (นายสมชาย)', completed: 8, avgTime: '2 วัน', overdue: 2, active: 3 },
    { name: 'ทีม B (นายวิรัตน์)', completed: 12, avgTime: '3 วัน', overdue: 0, active: 1 }, // (ทดสอบ Overdue 0)
    { name: 'ทีม C (นายประยุทธ์)', completed: 5, avgTime: '5 วัน', overdue: 1, active: 2 },
    { name: 'ทีม D (นายมงคล)', completed: 23, avgTime: '7 วัน', overdue: 8, active: 5 },
    { name: 'ทีม E (ทดสอบ)', completed: 10, avgTime: '2 วัน', overdue: 3, active: 0 } // (ทดสอบ % ต่ำ)
  ]

  const techsWithStats = techsData.map(tech => {
    const totalFinished = tech.completed + tech.overdue
    const onTimeRate = totalFinished > 0 ? (tech.completed / totalFinished) * 100 : 100
    return { ...tech, onTimeRate: Math.round(onTimeRate) }
  })

  // [UPGRADE] 4. Helper Function สำหรับสี % ตรงเวลา (เพื่อความสะอาด)
  const getOnTimeRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400' // ดีมาก
    if (rate >= 75) return 'text-yellow-600 dark:text-yellow-400' // ปานกลาง
    return 'text-red-600 dark:text-red-400' // ต้องปรับปรุง
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      {/* [UPGRADE] 2. ปรับขนาด Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        ประสิทธิภาพทีมช่าง (Technician Performance)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="border-b border-gray-200 dark:border-slate-700">
            <tr>
              {/* [UPGRADE] 1. เพิ่ม Icon และปรับ Font Header */}
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4 inline-block mr-1.5 text-gray-400" />
                ทีม / ช่าง
              </th>
              {/* [UPGRADE] 3. จัดกลาง Header */}
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                <Clock className="h-4 w-4 inline-block mr-1.5 text-gray-400" />
                งานที่กำลังทำ
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                <CheckCircle2 className="h-4 w-4 inline-block mr-1.5 text-gray-400" />
                งานเสร็จแล้ว
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                <AlertTriangle className="h-4 w-4 inline-block mr-1.5 text-gray-400" />
                งานล่าช้า
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                <ShieldCheck className="h-4 w-4 inline-block mr-1.5 text-gray-400" />
                % ตรงเวลา
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                <Timer className="h-4 w-4 inline-block mr-1.5 text-gray-400" />
                เวลาเฉลี่ย
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {techsWithStats.map((tech) => (
              <tr key={tech.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                {/* [UPGRADE] 2. ปรับ Font ชื่อ และ Padding (py-4) */}
                <td className="py-4 px-4 text-base font-semibold text-gray-900 dark:text-white">
                  {tech.name}
                </td>
                {/* [UPGRADE] 2. ปรับ Font ตัวเลข (text-base font-medium) และ 3. จัดกลาง */}
                <td className="py-4 px-4 text-base font-medium text-blue-600 dark:text-blue-400 text-center">
                  {tech.active}
                </td>
                {/* [UPGRADE] 4. ปรับสี "เสร็จแล้ว" เป็นสีเขียว */}
                <td className="py-4 px-4 text-base font-medium text-green-600 dark:text-green-400 text-center">
                  {tech.completed}
                </td>
                {/* [UPGRADE] 4. ปรับ Logic สี "ล่าช้า" (0=เขียว, >0=แดง) */}
                <td className={`py-4 px-4 text-base font-medium text-center ${
                  tech.overdue === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {tech.overdue}
                </td>
                {/* [UPGRADE] 4. ใช้ Logic สี 3 ระดับ */}
                <td className={`py-4 px-4 text-base font-medium text-center ${getOnTimeRateColor(tech.onTimeRate)}`}>
                  {tech.onTimeRate}%
                </td>
                <td className="py-4 px-4 text-base text-gray-700 dark:text-gray-200 text-center">
                  {tech.avgTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}