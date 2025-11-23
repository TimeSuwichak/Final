import React from 'react'
import { Badge } from "../ui/badge"; 
import { 
  BarChart2, PlayCircle, Clock, CheckCircle, 
  Wrench, Zap, Settings2, Shield, Truck, RefreshCw, 
  PieChart as PieChartIcon 
} from 'lucide-react'
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, 
  BarChart, Bar, CartesianGrid, XAxis, YAxis, 
  LabelList 
} from 'recharts'

// 💡 [อัปเดต] ขยาย iconMap สำหรับ Bar Chart เพื่อรองรับ 6 งาน
// 💡 ปรับสี Icon ใน Y-Axis ให้รองรับ Light/Dark Mode
const iconMap: Record<string, React.ReactNode> = {
  // Light: gray-500 | Dark: gray-300
  'ติดตั้ง A/C': <Settings2 className="h-5 w-5 text-gray-500 dark:text-gray-300" />,
  'ซ่อมบำรุง': <Wrench className="h-5 w-5 text-gray-500 dark:text-gray-300" />,
  'ซ่อมด่วน': <Zap className="h-5 w-5 text-gray-500 dark:text-gray-300" />,
  'ตรวจเช็คประจำปี': <Shield className="h-5 w-5 text-gray-500 dark:text-gray-300" />, 
  'ขนย้ายอุปกรณ์': <Truck className="h-5 w-5 text-gray-500 dark:text-gray-300" />, 
  'เปลี่ยนอะไหล่': <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-300" />, 
}

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const { value } = payload;
  return (
    <g transform={`translate(${x},${y})`}>
      <svg x={-125} y={-10} width={24} height={24}>
        {/* 💡 Icon เป็นสีเทาอ่อนใน Dark Mode, เทาเข้มใน Light Mode */}
        {iconMap[value] || <Wrench className="h-5 w-5 text-gray-500 dark:text-gray-300" />}
      </svg>
      {/* 💡 สีตัวอักษร Y-Axis Light: #6b7280 | Dark: #a0aec0 */}
      <text x={-95} y={0} dy={4} textAnchor="start" fill="#6b7280" className="dark:fill-[#a0aec0] text-sm font-medium"> 
        {value}
      </text>
    </g>
  );
};

// Custom Label สำหรับ Bar Chart เพื่อปรับปรุงการแสดงผล
const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value, index } = props;
  const color = PALETTE[index % PALETTE.length]; 
  
  return (
    <text 
      x={x + width + 8} // ขยับไปทางขวาของ Bar ให้มีพื้นที่มากขึ้น
      y={y + height / 2} 
      dy={4} 
      fill={color} // ใช้สีเดียวกับ Bar
      textAnchor="start" 
      className="text-sm font-bold"
    >
      {`${value} งาน`} 
    </text>
  );
};


// 💡 [ปรับปรุง] ขยาย PALETTE เพื่อรองรับ 6 สี และเปลี่ยนสีม่วงหลักเป็น #7c3aed
const PALETTE = [
  '#7c3aed', // Violet-600 (ม่วงเข้มขึ้น)
  '#10b981', // Emerald-500
  '#f59e0b', // Amber-500
  '#06b6d4', // Cyan-500
  '#ef4444', // Red-500
  '#a855f7'  // Purple-500
]; 

// (statusConfig ไม่ได้ถูกใช้ใน RightPanel จึงไม่จำเป็นต้องปรับ)
const statusConfig: any = {
  'เริ่มงาน': { icon: <PlayCircle size={18} className="text-blue-500" />, className: 'bg-blue-100 text-blue-800 border-blue-200' },
  'กำลังดำเนินการ': { icon: <Clock size={18} className="text-yellow-600" />, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'งานเสร็จสิ้น': { icon: <CheckCircle size={18} className="text-green-500" />, className: 'bg-green-100 text-green-800 border-green-200' },
  'default': { icon: <Clock size={18} className="text-gray-500" />, className: 'bg-gray-100 text-gray-800 border-gray-200' }
}

// 💡 [อัปเดต] ขยาย Icon Map สำหรับ Legend ของ Pie Chart เพื่อรองรับ 6 งาน
const legendIconMap: Record<string, React.ElementType> = {
  'ติดตั้ง A/C': Settings2,
  'ซ่อมบำรุง': Wrench,
  'ซ่อมด่วน': Zap,
  'ตรวจเช็คประจำปี': Shield,
  'ขนย้ายอุปกรณ์': Truck,
  'เปลี่ยนอะไหล่': RefreshCw,
};

// Custom Tooltip Component (เพื่อควบคุมกรอบ Tooltip ได้ด้วย Tailwind CSS)
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // 💡 [ปรับปรุง]: ใช้ min-w-max เพื่อให้กรอบขยายตามเนื้อหา
    return (
      // 💡 Light: bg-white, border-gray-300 | Dark: bg-[#282b3d], border-[#3d4158]
      <div className="p-3 bg-white dark:bg-[#282b3d] border border-gray-300 dark:border-[#3d4158] rounded-lg shadow-xl text-sm min-w-max">
        {/* Pie Chart Tooltip ไม่มี Label (Category) แต่ Bar Chart มี */}
        {label && <p className="font-bold text-gray-900 dark:text-white mb-1">{`Category: ${label}`}</p>}
        <ul className="list-none p-0 m-0 space-y-1">
          {payload.map((item: any, index: number) => (
            <li key={`item-${index}`} className="flex justify-between items-center">
              <span style={{ color: item.fill, fontWeight: 'bold' }}>{item.name}:</span>
              {/* 💡 Light: text-gray-800 | Dark: text-gray-200 */}
              <span className="ml-2 font-medium text-gray-800 dark:text-gray-200">{`${item.value} ${label ? 'งาน' : '%'}`}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};


export default function RightPanel() {
  
  // Mock Data สำหรับ 6 ประเภทงาน (Pie Chart)
  const jobTypeData = [ 
    { name: 'ติดตั้ง A/C', value: 25 }, 
    { name: 'ซ่อมบำรุง', value: 20 }, 
    { name: 'ซ่อมด่วน', value: 15 }, 
    { name: 'ตรวจเช็คประจำปี', value: 15 }, 
    { name: 'ขนย้ายอุปกรณ์', value: 12 }, 
    { name: 'เปลี่ยนอะไหล่', value: 13 } 
  ] 

  // Mock Data สำหรับ 6 ประเภทงาน (Bar Chart - Completed Works)
  const completedWorksData = [ 
    { name: 'ติดตั้ง A/C', Completed: 45 }, 
    { name: 'ซ่อมบำรุง', Completed: 30 },
    { name: 'ซ่อมด่วน', Completed: 15 },
    { name: 'ตรวจเช็คประจำปี', Completed: 20 }, 
    { name: 'ขนย้ายอุปกรณ์', Completed: 10 }, 
    { name: 'เปลี่ยนอะไหล่', Completed: 18 } 
  ]

  return (
    <>
      {/* --- Card 2: Pie Chart (สัดส่วนประเภทงาน) --- */}
      {/* 💡 [ปรับปรุง] พื้นหลัง Light: white, border-gray-200 | Dark: #131422, border-[#2A2C40] */}
      <div className="bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]">
        {/* 💡 [ปรับปรุง] Icon Light: indigo-500 | Dark: violet-400 */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <PieChartIcon size={20} className="text-indigo-500 dark:text-violet-400" /> 
          สัดส่วนประเภทงาน (Job Type Distribution)
        </h3>
        <div className="h-56"> 
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="shadow" height="130%">
                  <feDropShadow 
                    dx="0" 
                    dy="4" 
                    stdDeviation="4" 
                    floodColor="#000000" 
                    floodOpacity="0.25" 
                  />
                </filter>
              </defs>

              <Tooltip 
                // 💡 [แก้ไข] ใช้ Custom Tooltip Component ที่รองรับ Tailwind CSS Width
                content={<CustomChartTooltip />}
                // 💡 Label color Light: #4f46e5 (Indigo)
                labelStyle={{ fontWeight: 'bold', color: '#4f46e5' }} 
              />
              <Pie data={jobTypeData} cx="50%" cy="50%" 
                innerRadius={70} 
                outerRadius={90} 
                fill="#8884d8" 
                paddingAngle={3} 
                dataKey="value"
                filter="url(#shadow)" 
              >
                {jobTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} 
                    stroke="none" 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        {/* 💡 [ปรับปรุง]: ใช้ grid-cols-2 และเพิ่ม gap-x ให้มากขึ้น เพื่อให้คำยาวๆ ไม่ถูกบีบ */}
        <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"> {/* เพิ่ม gap-x เป็น 8 */}
          {jobTypeData.map((entry, index) => {
            const color = PALETTE[index % PALETTE.length];
            const Icon = legendIconMap[entry.name] || Wrench; 
            
            return (
              <li key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color }} /> 
                  {/* 💡 Text Light: gray-700 | Dark: gray-200 */}
                  <span className="text-base font-medium text-gray-700 dark:text-gray-200"> 
                    {entry.name}
                  </span>
                </div>
                {/* 💡 Value Light: gray-900 | Dark: white */}
                <span className="text-lg font-bold text-gray-900 dark:text-white"> 
                  {entry.value}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* --- Card 3: Bar Chart (Completed Works) --- */}
      {/* 💡 [ปรับปรุง] พื้นหลัง Light: white, border-gray-200 | Dark: #131422, border-[#2A2C40] */}
      <div className="bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40]">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500 dark:text-emerald-400" /> 
          Completed Works (จำนวนงานที่ทำเสร็จ)
        </h3>
        <div className="h-80 pt-4"> 
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={completedWorksData} 
              layout="vertical" 
              // 💡 [แก้ไข]: ปรับ margin right เป็น 40 และ bottom เป็น 40 เพื่อให้ X-axis label ไม่ตกขอบและเพิ่มพื้นที่ว่างด้านล่าง
              margin={{ top: 10, right: 40, left: 20, bottom: 40 }} 
            >
              {/* 💡 ปรับเส้น Grid Light: #e5e7eb, strokeOpacity 0.1 | Dark: #3d4158, strokeOpacity 0.15 */}
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke="#e5e7eb" className="dark:stroke-[#3d4158] dark:stroke-opacity-[0.15]" horizontal={false} />
              
              <XAxis 
                type="number" 
                tickLine={false}
                axisLine={false}
                // 💡 [แก้ไข]: กำหนด Domain และ Ticks ให้ชัดเจน
                domain={[0, 60]} // กำหนดขอบเขตสูงสุดที่ 60
                ticks={[0, 15, 30, 45, 60]} // บังคับให้แสดงเฉพาะตัวเลขที่ต้องการ
                
                // 💡 Tick color Light: #6b7280 | Dark: #a0aec0
                tick={{ fill: '#6b7280', fontSize: '12px' }} 
                className="dark:fill-[#a0aec0]" // Apply dark mode to tick text
                tickFormatter={(value) => `${value} งาน`} 
                // 💡 Label color Light: #4f46e5 (Indigo) | Dark: #7c3aed (Violet)
                label={{ value: 'จำนวนงานที่ทำเสร็จ', position: 'bottom', offset: 0, fill: '#4f46e5', className: 'dark:fill-[#7c3aed]', fontWeight: 'bold', fontSize: 12 }} 
              />
              
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                width={130} 
                tick={<CustomYAxisTick />} // CustomYAxisTick ใช้สี Light/Dark แล้ว
                interval={0}
              />
              
              <Tooltip 
                // 💡 [แก้ไข] ใช้ Custom Tooltip Component ที่รองรับ Tailwind CSS Width
                content={<CustomChartTooltip />}
              />
              
              <Bar 
                dataKey="Completed" 
                name="Completed Works" 
                radius={[0, 10, 10, 0]} 
                barSize={15} 
              >
                {completedWorksData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                ))}
                
                <LabelList 
                  dataKey="Completed" 
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