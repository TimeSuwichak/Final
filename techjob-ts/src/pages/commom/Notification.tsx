import React from 'react'

function Notification() {
  return (
    <div className="space-y-8 text-white w-full p-6">
    <div className="mb-8">
      <h3 className="text-4xl font-extrabold text-white">การแจ้งเตือน</h3>
      <p className="text-gray-400 text-lg pt-2 border-b border-gray-800 pb-4">
        ตั้งค่ากิจกรรมและช่องทางการแจ้งเตือนที่คุณต้องการ เพื่อไม่พลาดข้อมูลสำคัญ
      </p>
    </div> 
    <div className="bg-neutral-900 p-6 rounded-xl shadow-xl shadow-black/50 space-y-2 border-l-4 border-[#5F5AFF] transition duration-300 hover:bg-neutral-800">
        <h3 className="text-2xl font-bold border-b border-gray-800 pb-3 text-white">การแจ้งเตือนทั้งหมด</h3>
        <div className="flex justify-between items-center py-3 pt-4">
            <p className="text-xl font-medium text-gray-200">เปิดใช้งานการแจ้งเตือนทั้งหมด</p>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
    </div>
    <div className="bg-neutral-900 p-6 rounded-xl shadow-xl shadow-black/50 space-y-2">
        <h3 className="text-2xl font-bold border-b border-gray-800 pb-3 text-white">การแจ้งเตือนทั่วไป</h3>
        <div className="flex justify-between items-center py-3 border-b border-gray-800 transition duration-150 hover:bg-gray-800 rounded-lg px-2 -mx-2 hover:border-l-2 hover:border-green-500">
            <p className="text-lg font-medium text-green-400">มีงานใหม่เข้ามา</p> 
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-800 transition duration-150 hover:bg-gray-800 rounded-lg px-2 -mx-2 hover:border-l-2 hover:border-red-500">
            <p className="text-lg font-medium text-red-400">งานเร่งด่วน</p> 
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-800 transition duration-150 hover:bg-gray-800 rounded-lg px-2 -mx-2 hover:border-l-2 hover:border-yellow-500">
            <p className="text-lg font-medium text-yellow-400">งานล่าช้า เกินกำหนด</p> 
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-800 transition duration-150 hover:bg-gray-800 rounded-lg px-2 -mx-2 hover:border-l-2 hover:border-blue-500">
            <p className="text-lg font-medium text-blue-400">งานเสร็จสิ้น</p> 
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-800 transition duration-150 hover:bg-gray-800 rounded-lg px-2 -mx-2 hover:border-l-2 hover:border-gray-500">
            <p className="text-lg font-medium text-gray-300">ความคิดเห็น</p> 
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
        <div className="flex justify-between items-center py-3 transition duration-150 hover:bg-gray-800 rounded-lg px-2 -mx-2 hover:border-l-2 hover:border-gray-500">
            <p className="text-lg font-medium text-gray-300">บัญชีถูกล็อก</p>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 bg-gray-700">
                <span className="text-xs font-semibold text-white absolute inset-y-0 flex items-center pr-1 pl-1">ปิด</span>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 translate-x-1" />
            </div>
        </div>
    </div>
</div>
  )
}

export default Notification