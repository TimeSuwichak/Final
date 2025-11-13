import React, { useState, useEffect } from 'react'

export function useCountUp(end: number, duration = 1000) {
  const [count, setCount] = useState<number>(0)
  const frameRate = 1000 / 60 // 60 fps
  const totalFrames = Math.round(duration / frameRate)

  useEffect(() => {
    let frame = 0
    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const currentCount = end * progress // Linear easing

      if (frame === totalFrames) {
        clearInterval(counter)
        setCount(end)
      } else {
        setCount(currentCount)
      }
    }, frameRate)

    return () => clearInterval(counter)
  }, [end, duration, totalFrames])

  return count
}

export default function KpiCard({ title, numericValue, suffix = '', icon, color, change }: any) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    default: 'bg-gray-200 text-gray-700 dark:bg-slate-800/40 dark:text-slate-300'
  }
  const iconStyle = colorClasses[color] || colorClasses.default

  const animatedValue = useCountUp(numericValue, 1000)

  const displayValue = animatedValue.toLocaleString('th-TH', {
    minimumFractionDigits: numericValue % 1 ? 1 : 0,
    maximumFractionDigits: numericValue % 1 ? 1 : 0
  })

  return (
    <div className="group bg-white dark:bg-slate-900 p-5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 transition-all duration-300 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 hover:border-gray-300 dark:hover:border-slate-700 hover:scale-[1.03]">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
            {displayValue}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-full ${iconStyle} transition-transform duration-300 group-hover:scale-110`}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 22 } as any) : icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{change}</p>
    </div>
  )
}
