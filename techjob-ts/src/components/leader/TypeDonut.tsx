import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const data = [
  { name: 'ซ่อมบำรุง', value: 6, color: '#3b82f6' }, // Blue
  { name: 'ติดตั้งระบบ', value: 4, color: '#10b981' }, // Emerald
  { name: 'ตรวจเช็คสภาพ', value: 5, color: '#f59e0b' }, // Amber
];

interface ChartProps {
  isDarkMode: boolean;
}

const TypeDonutModern: React.FC<ChartProps> = ({ isDarkMode }) => {
  // คำนวณยอดรวมเพื่อเอาไปแสดงตรงกลาง
  const total = useMemo(() => data.reduce((acc, cur) => acc + cur.value, 0), []);

  return (
    <div className="flex flex-col h-full p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800">
      
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">สัดส่วนงาน</h4>
        <button className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            ...
        </button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">แยกตามประเภทงานที่ทำสำเร็จ</p>

      <div className="relative flex-1 min-h-[200px]">
        {/* Center Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{total}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">งานทั้งหมด</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              innerRadius={65} 
              outerRadius={85} 
              paddingAngle={4} 
              dataKey="value" 
              stroke="none" 
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1e1e2d' : '#ffffff', 
                borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                color: isDarkMode ? '#fff' : '#1e293b',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ fontSize: '14px', fontWeight: 500 }}
              formatter={(value: number) => [`${value} งาน`, 'จำนวน']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend Table */}
      <div className="mt-6 space-y-3">
        {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800 dark:text-white">{item.value}</span>
                    <span className="text-xs text-slate-400 w-8 text-right">
                        {Math.round((item.value / total) * 100)}%
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default TypeDonutModern;