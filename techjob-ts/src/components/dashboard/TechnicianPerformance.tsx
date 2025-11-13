import React from 'react'

export default function TechnicianPerformance() {
  const techsData = [
    { name: 'ทีม A (นายสมชาย)', completed: 8, avgTime: '2 วัน', overdue: 2, active: 3 },
    { name: 'ทีม B (นายวิรัตน์)', completed: 12, avgTime: '3 วัน', overdue: 5, active: 1 },
    { name: 'ทีม C (นายประยุทธ์)', completed: 5, avgTime: '5 วัน', overdue: 1, active: 2 },
    { name: 'ทีม D (นายมงคล)', completed: 23, avgTime: '7 วัน', overdue: 8, active: 5 }
  ]

  const techsWithStats = techsData.map(tech => {
    const totalFinished = tech.completed + tech.overdue
    const onTimeRate = totalFinished > 0 ? (tech.completed / totalFinished) * 100 : 100
    return { ...tech, onTimeRate: Math.round(onTimeRate) }
  })

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ประสิทธิภาพทีมช่าง รายบุคคล (Technician Performance)</h3>
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
                <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{tech.active}</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{tech.completed}</td>
                <td className={`py-3 px-4 font-bold ${tech.overdue > 3 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{tech.overdue}</td>
                <td className={`py-3 px-4 font-medium ${tech.onTimeRate >= 90 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>{tech.onTimeRate}%</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-200">{tech.avgTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
