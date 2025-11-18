import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
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

const MonthlyBarChart: React.FC<ChartProps> = ({ isDarkMode }) => {
  return (
    <div className="h-full p-6 transition-colors duration-300 bg-white border shadow-lg rounded-xl border-slate-200 dark:bg-[#1e1e2d] dark:border-slate-800">
      <div className="mb-6">
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">ผลงานรายเดือน</h4>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">จำนวนงานที่คุณทำสำเร็จในแต่ละเดือน</p>
      </div>
      
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
            {/* 1. นิยามการไล่สี (Gradient) */}
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={1}/> {/* สีม่วงอ่อน */}
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/> {/* สีม่วงเข้ม */}
              </linearGradient>
            </defs>

            {/* 2. Grid: ปรับสีเส้นตามโหมด */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDarkMode ? "#334155" : "#e2e8f0"} 
              vertical={false} 
            />

            {/* 3. แกน X: ปรับสีตัวหนังสือ */}
            <XAxis 
              dataKey="name" 
              stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />

            {/* 4. แกน Y: ปรับสีตัวหนังสือ */}
            <YAxis 
              stroke={isDarkMode ? "#94a3b8" : "#64748b"} 
              tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
              axisLine={false} 
              tickLine={false} 
            />

            {/* 5. Tooltip: ปรับพื้นหลังและสีตัวอักษร */}
            <Tooltip 
              cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9', opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#1e1e2d' : '#ffffff', 
                borderColor: isDarkMode ? '#334155' : '#e2e8f0', 
                color: isDarkMode ? '#fff' : '#1e293b', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />

            {/* 6. ตัวแท่งกราฟ (Bar) และ Label ด้านบน */}
            <Bar 
              dataKey="value" 
              fill="url(#purpleGradient)" 
              radius={[6, 6, 0, 0]} 
              barSize={32}
              label={{ 
                position: 'top', 
                fill: isDarkMode ? '#e2e8f0' : '#475569', // ปรับสีตัวเลขบนกราฟ
                fontSize: 12, 
                fontWeight: 'bold' 
              }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;