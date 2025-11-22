import React, { useState, useEffect } from 'react'

// Hook useCountUp ไม่มีการเปลี่ยนแปลง (ยังคงใช้งานได้ดี)
export function useCountUp(end: number, duration = 1000) {
  const [count, setCount] = useState<number>(0)
  const frameRate = 1000 / 60 // 60 fps
  const totalFrames = Math.round(duration / frameRate)

  // Fix dependency list
  const dependencyTotalFrames = Math.round(duration / frameRate) 

  useEffect(() => {
    setCount(0);
    let frame = 0
    const counter = setInterval(() => {
      frame++
      const progress = frame / dependencyTotalFrames
      const currentCount = end * progress // Linear easing

      if (frame >= dependencyTotalFrames) {
        clearInterval(counter)
        setCount(end)
      } else {
        setCount(currentCount)
      }
    }, frameRate)

    return () => clearInterval(counter)
  }, [end, duration, dependencyTotalFrames])

  return count
}

export default function KpiCard({ title, numericValue, suffix = '', icon, color, change }: any) {
  // 💡 [ปรับปรุง] ใช้สี Accent ที่รองรับ Light Mode (Indigo/Cyan/Emerald) และ Dark Mode (Violet/Cyan/Emerald-400)
  const colorClasses: Record<string, string> = {
    // Light: Indigo, Dark: Violet/Purple accent (ใช้สำหรับ "งานทั้งหมด")
    default: 'bg-indigo-100 text-indigo-600 dark:bg-violet-900/40 dark:text-violet-400', 
    // Light: Blue, Dark: Cyan accent (ใช้สำหรับ "กำลังดำเนินงาน")
    blue: 'bg-blue-100 text-blue-600 dark:bg-cyan-900/40 dark:text-cyan-400',
    // Light: Green, Dark: Emerald accent (ใช้สำหรับ "งานเสร็จแล้ว")
    green: 'bg-green-100 text-green-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    // fallback
    red: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  }
  const iconStyle = colorClasses[color] || colorClasses.default

  const animatedValue = useCountUp(numericValue, 1000)

  // ปรับการ format ให้รองรับจำนวนเต็มและทศนิยม 1 ตำแหน่งอย่างสวยงาม
  const displayValue = animatedValue.toLocaleString('th-TH', {
    minimumFractionDigits: numericValue % 1 !== 0 && animatedValue >= 1 ? 1 : 0,
    maximumFractionDigits: 1
  })

  return (
    // 💡 [ปรับปรุง] พื้นหลัง Light: white, Dark: #131422 และขอบ Light: gray-200, Dark: #2A2C40
    <div className="group bg-white dark:bg-[#131422] p-6 rounded-xl shadow-lg border border-gray-200 dark:border-[#2A2C40] transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-[#1f2133] hover:border-gray-300 dark:hover:border-[#383a54] hover:scale-[1.03] cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div>
          {/* 💡 [ปรับปรุง] สี Title Light: gray-500, Dark: gray-400 */}
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          {/* 💡 [ปรับปรุง] สี Value Light: gray-900, Dark: white */}
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
            {displayValue}{suffix}
          </p>
        </div>
        {/* 💡 ใช้ Icon Style ที่ปรับปรุงแล้ว */}
        <div className={`p-3 rounded-full ${iconStyle} transition-transform duration-300 group-hover:scale-110`}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 } as any) // เพิ่มขนาด icon เป็น 24
            : icon}
        </div>
      </div>
      {/* 💡 [ปรับปรุง] สี Change text Light: gray-500, Dark: gray-500 */}
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{change}</p>
    </div>
  )
}