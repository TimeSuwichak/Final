import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

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

const MonthlyAreaChart: React.FC<ChartProps> = ({ isDarkMode }) => {
  return (
    <div className="h-full p-6 bg-white border shadow-sm rounded-2xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800">
      <div className="flex items-end justify-between mb-6">
        <div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Trends</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">แนวโน้มปริมาณงาน (6 เดือน)</p>
        </div>
        <div className="text-2xl font-bold text-indigo-500">
            32 <span className="text-sm font-normal text-slate-400">งานรวม</span>
        </div>
      </div>
      
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/> {/* Indigo-500 */}
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
            
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
                contentStyle={{ 
                    backgroundColor: isDarkMode ? '#1e1e2d' : '#ffffff', 
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <Area 
                type="monotone" // ทำให้เส้นโค้ง
                dataKey="value" 
                stroke="#6366f1" // สีเส้น
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorValue)" // สีพื้นที่ไล่ระดับ
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyAreaChart;