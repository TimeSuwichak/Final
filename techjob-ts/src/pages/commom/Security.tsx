import React from 'react'

function Security() {
  return (
    <div className="space-y-8 text-white w-full p-6">
    <div className="mb-10">
      <h3 className="text-4xl font-extrabold text-white">ความปลอดภัยของบัญชี</h3>
      <p className="text-gray-400 text-lg pt-2 border-b border-gray-800 pb-4">
        จัดการการตั้งค่ารหัสผ่าน, การยืนยันตัวตน, และตรวจสอบกิจกรรมล่าสุด
      </p>
    </div> 

    <div className="bg-neutral-900 p-6 rounded-xl shadow-xl flex justify-between items-center transition duration-300 hover:bg-neutral-800 border-l-4 border-[#5F5AFF]">
        <div className="w-3/4">
            <h4 className="text-2xl font-bold text-gray-200">เปลี่ยนรหัสผ่าน</h4>
            <p className="text-gray-400 text-base">อัปเดตและเปลี่ยนรหัสผ่านปัจจุบันของคุณเป็นระยะ</p>
        </div>
        <button className="px-6 py-3 bg-[#5F5AFF] hover:bg-blue-700 text-white font-semibold rounded-lg text-base shadow-md transition duration-200">
            เปลี่ยน
        </button>
    </div>

    <div className="bg-neutral-900 p-6 rounded-xl shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h4 className="text-2xl font-bold text-gray-200">การยืนยันตัวตนสองชั้น (2FA)</h4>
            <button className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg text-base hover:bg-gray-700 transition duration-200 shadow-md">
                ตั้งค่า
            </button>
        </div>
        
        <div className="pt-2">
    <p className="text-lg font-medium text-gray-300 mb-2">สถานะความปลอดภัยปัจจุบัน:</p>
    
    <span className="inline-block bg-red-800 text-red-300 text-base font-semibold px-4 py-1 rounded-lg shadow-md transition duration-200">
        <i className="fa fa-lock mr-2"></i> ปิดใช้งาน
    </span>
    
    <p className="text-red-400 text-base mt-3 border-l-2 border-red-700 pl-3">
        ⚠️ คำเตือน: บัญชีของคุณเพื่อความปลอดภัยสูงสุด โปรดเปิดใช้งาน 2FA 
    </p>
</div>
    </div>
    <div className="bg-neutral-900 p-6 rounded-xl shadow-xl space-y-5">
        <h4 className="text-2xl font-bold border-b border-gray-800 pb-3 text-gray-200">ประวัติการเข้าสู่ระบบ</h4>
        <div className="flex justify-between text-gray-500 font-semibold text-sm border-b border-gray-700 pb-2">
            <span className="w-1/3">อุปกรณ์/ตำแหน่ง</span>
            <span className="w-1/3">เวลาเข้าสู่ระบบ</span>
            <span className="w-1/3 text-right">IP Address</span>
        </div>
        <div className="flex justify-between text-white py-2 border-b border-gray-800">
            <span className="w-1/3 text-green-400 font-semibold">✅ Desktop (ปัจจุบัน)</span>
            <span className="w-1/3 text-gray-300">14 ต.ค. 2568, 18:05</span>
            <span className="w-1/3 text-right text-gray-400">203.0.113.44</span>
        </div>
        <div className="flex justify-between text-white py-2">
            <span className="w-1/3 text-white">Mobile Chrome</span>
            <span className="w-1/3 text-gray-300">13 ต.ค. 2568, 22:10</span>
            <span className="w-1/3 text-right text-gray-400">198.51.100.1</span>
        </div>

        <button className="text-[#5F5AFF] hover:text-blue-400 text-base font-medium mt-4 pt-3 border-t border-gray-800 block w-full text-left">
            ดูประวัติทั้งหมด &gt;
        </button>
    </div>
</div>
  )
}

export default Security