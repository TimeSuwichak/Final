import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';
// [UPGRADE] 1. Import Icon ที่เกี่ยวข้อง
import { BarChart2 } from 'lucide-react'; 

const data = [
  { name: 'มิ.ย.', value: 4 },
  { name: 'ก.ค.', value: 6 },
  { name: 'ส.ค.', value: 5 },
  { name: 'ก.ย.', value: 8 },
  { name: 'ต.ค.', value: 7 },
  { name: 'พ.ย.', value: 2 },
];

interface ChartProps {
  isDarkMode: boolean;
}

const MonthlyBarChart: React.FC<ChartProps> = ({ isDarkMode }) => {
  return (
    <div className="h-full p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex items-end justify-between mb-6">
        <div>
            {/* [UPGRADE] 2. ปรับ h4 โดยเพิ่ม Icon และใช้ flex จัดวาง */}
            <h4 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart2 size={20} className="text-indigo-500" /> {/* เพิ่ม Icon */}
                Monthly Trends
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">ปริมาณงานรายเดือน (6 เดือน)</p> {/* ปรับ text-xs เป็น text-sm ให้ใหญ่ขึ้นเล็กน้อย */}
        </div>
        <div className="text-right">
            <div className="text-3xl font-extrabold text-indigo-500"> {/* ปรับเป็น text-3xl และ font-extrabold */}
                32
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Jobs</span>
        </div>
      </div>
      
      {/* Chart Section (เหมือนเดิม) */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              {/* Gradient สำหรับแท่งกราฟ */}
              <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/> {/* Indigo-400 */}
                <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/> {/* Indigo-500 */}
              </linearGradient>
              {/* Gradient สำหรับแท่งกราฟตอน Hover (สว่างขึ้น) */}
              <linearGradient id="colorBarHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a5b4fc" stopOpacity={1}/> 
                <stop offset="100%" stopColor="#818cf8" stopOpacity={1}/> 
              </linearGradient>
            </defs>
            
            <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={isDarkMode ? "#334155" : "#f1f5f9"} 
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
            />
            
            <Tooltip 
                cursor={{ fill: isDarkMode ? '#334155' : '#f8fafc', opacity: 0.4 }}
                contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e1e2d' : '#ffffff', 
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    color: isDarkMode ? '#fff' : '#0f172a',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '8px 12px'
                }}
                itemStyle={{ color: '#6366f1', fontWeight: 600 }}
            />
            
            <Bar 
                dataKey="value" 
                fill="url(#colorBar)" 
                radius={[6, 6, 0, 0]} // ทำให้หัวมน
                barSize={28} // ขนาดความกว้างของแท่ง
                animationDuration={1500}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorBar)" />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;