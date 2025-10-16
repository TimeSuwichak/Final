import React from 'react'

function Account() {
  return (
    <div className="space-y-8 text-white w-full p-6">
    <div className="mb-8">
        <h3 className="text-2xl font-extrabold text-white">ตั้งค่าบัญชี</h3>
        <p className="text-gray-400 text-lg pt-2 border-b border-gray-800 pb-4">
            จัดการภาษา การแจ้งเตือน และข้อมูลติดต่อฉุกเฉิน
        </p>
    </div>
    <div className="p-6 bg-neutral-900 rounded-xl shadow-xl space-y-4 border-l-4 border-[#5F5AFF]">
        <h3 className="text-xl font-bold border-b border-gray-800 pb-3 text-gray-200">ตั้งค่าโซนเวลา</h3>
        <div className="flex justify-between items-center py-2">
            <label htmlFor="timezone" className="text-lg w-1/3 text-gray-300">โซนเวลา</label>
            <select id="timezone" className="p-2 bg-black border border-gray-700 rounded-lg w-2/3 focus:ring-[#5F5AFF] focus:border-[#5F5AFF] text-white transition duration-200">
                <option className="bg-neutral-900">Asia/Bangkok (UTC+7)</option>
                <option className="bg-neutral-900">America/New York (UTC-5)</option>
                <option className="bg-neutral-900">Europe/London (UTC+0)</option>
                <option className="bg-neutral-900">Asia/Tokyo (UTC+9)</option>
            </select>
        </div>
    </div>

    <div className="p-6 bg-neutral-900 rounded-xl shadow-xl space-y-5 border-l-4 border-gray-700 hover:border-l-4 hover:border-[#5F5AFF] transition duration-300">
    <h3 className="text-2xl font-bold border-b border-gray-800 pb-3 text-white">การแจ้งเตือนและการสื่อสาร</h3>
    <div className="space-y-3 pt-2">
        <p className="text-gray-400 font-bold border-b border-gray-800 pb-2 text-base">ช่องทางการแจ้งเตือน</p>
        <div className="flex items-center space-x-10">
            <label className="flex items-center space-x-3 cursor-pointer group">
                <input 
                    type="checkbox" 
                    defaultChecked 
                    className="form-checkbox text-[#5F5AFF] bg-black border-gray-600 rounded-md h-5 w-5 focus:ring-[#5F5AFF] transition duration-150" 
                />
                <span className="text-gray-200 text-lg group-hover:text-white transition duration-150">อีเมล</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
                <input 
                    type="checkbox" 
                    defaultChecked 
                    className="form-checkbox text-[#5F5AFF] bg-black border-gray-600 rounded-md h-5 w-5 focus:ring-[#5F5AFF] transition duration-150" 
                />
                <span className="text-gray-200 text-lg group-hover:text-white transition duration-150">Push Notification</span>
            </label>
        </div>
    </div>
    <div className="space-y-3 pt-4 border-t border-gray-800">
        <p className="text-gray-400 font-bold border-b border-gray-800 pb-2 text-base">แจ้งเตือนเมื่อเกิดกิจกรรม</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox text-[#5F5AFF] bg-black border-gray-600 rounded-md focus:ring-[#5F5AFF]" />
                <span className="text-gray-300 group-hover:text-white transition">ผู้ใช้ใหม่/การลงทะเบียน</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="form-checkbox text-[#5F5AFF] bg-black border-gray-600 rounded-md focus:ring-[#5F5AFF]" />
                <span className="text-gray-300 group-hover:text-white transition">การแก้ไขข้อมูลสำคัญ</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="form-checkbox text-[#5F5AFF] bg-black border-gray-600 rounded-md focus:ring-[#5F5AFF]" />
                <span className="text-gray-300 group-hover:text-white transition">ปัญหาระบบ/ข้อผิดพลาด</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer group">
                <input type="checkbox" className="form-checkbox text-[#5F5AFF] bg-black border-gray-600 rounded-md focus:ring-[#5F5AFF]" />
                <span className="text-gray-300 group-hover:text-white transition">รายงานรายสัปดาห์</span>
            </label>
        </div>
    </div>
</div>
    <div className="p-6 bg-neutral-900 rounded-xl shadow-xl space-y-4">
        <h3 className="text-xl font-bold border-b border-gray-800 pb-3 text-gray-200">ข้อมูลติดต่อสำรอง/ฉุกเฉิน</h3>
        
        <div className="grid grid-cols-1 gap-5 pt-2">
            <div>
                <label htmlFor="emergency_email" className="block text-gray-400 font-medium mb-2">อีเมลสำรอง</label>
                <input 
                    type="email" 
                    id="emergency_email" 
                    defaultValue="backup@oreo.com" 
                    className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#5F5AFF] focus:border-transparent text-white transition duration-200" 
                />
            </div>
            <div>
                <label htmlFor="emergency_phone" className="block text-gray-400 font-medium mb-2">เบอร์โทรสำรอง</label>
                <input 
                    type="text" 
                    id="emergency_phone" 
                    defaultValue="08xxxxxxxx" 
                    className="w-full p-3 bg-black border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#5F5AFF] focus:border-transparent text-white transition duration-200" 
                />
            </div>
        </div>
        <div className="flex justify-end pt-3">
            <button className="px-6 py-2 bg-[#5F5AFF] text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 shadow-md">
                บันทึกข้อมูลติดต่อสำรอง
            </button>
        </div>
    </div>
</div>
  )
}

export default Account