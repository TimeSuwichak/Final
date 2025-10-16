import React from 'react'

function Theme() {
  return (
    <div className="space-y-8 w-full p-6"> 
    <div className="mb-8">
        <h3 className="text-4xl font-extrabold text-white">การตั้งค่าธีม</h3>
        <p className="text-gray-400 text-lg pt-2 border-b border-gray-800 pb-4">
            ปรับสีพื้นหลังหรือธีมของระบบได้ที่นี่ เพื่อความสบายตาในการทำงาน
        </p>
    </div> 
    <div className="p-6 bg-neutral-900 rounded-xl shadow-2xl shadow-black/50 space-y-6 border-l-4 border-[#5F5AFF] transition duration-300 hover:bg-neutral-800 hover:shadow-gray-900">
        <h4 className="text-2xl font-bold border-b border-gray-800 pb-3 text-white">โหมดธีม</h4>
        <div className="flex items-center space-x-6 pt-2">
            <p className="text-lg text-gray-400 font-medium w-32">โหมดสว่าง (Light)</p>
            <div
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 bg-[#5F5AFF] shadow-inner shadow-black/70`}
            >
                <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 translate-x-7 shadow-lg`}
                />
            </div>
            
            <p className="text-lg text-white font-medium">โหมดมืด (Dark)</p>
        </div>
    </div>
</div>
  )
}

export default Theme