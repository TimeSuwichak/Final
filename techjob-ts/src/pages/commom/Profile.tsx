import React from 'react'

function Profile() {
  return (
     <div>          
<div className="space-y-8 text-white w-full p-6"> 
    <div className="p-6 bg-neutral-900 rounded-xl shadow-2xl space-y-4 border-t-4 border-[#5F5AFF]">
        <h3 className="text-2xl font-bold border-b border-gray-800 pb-3 text-white">โปรไฟล์ Admin</h3>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
                <div className="w-28 h-28 bg-gray-700 rounded-full flex-shrink-0 border-4 border-[#5F5AFF] shadow-lg"></div>
                <div>
                    <p className="text-3xl font-extrabold text-white">-</p>
                    <p className="text-lg text-gray-400 font-medium">แผนก</p>
                </div>
            </div>
            <button className="px-5 py-2 border border-[#5F5AFF] text-[#5F5AFF] font-semibold rounded-lg text-base hover:bg-[#5F5AFF] hover:text-white transition duration-200 shadow-md">
                แก้ไขโปรไฟล์
            </button>
        </div>
    </div>
    <div className="p-6 bg-neutral-900 rounded-xl shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-2xl font-bold text-white">ข้อมูลส่วนบุคคล</h3>
            <button className="px-5 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg text-base hover:bg-gray-800 transition duration-200 shadow-sm">
                แก้ไขโปรไฟล์
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm pt-2">
            <div className="p-2 border-l-4 border-[#5F5AFF]">
                <p className="text-gray-400 text-sm">ชื่อจริง</p>
                <p className="text-white text-xl font-medium">ภาณุวิชญ์</p>
            </div>
            <div className="p-2 border-l-4 border-[#5F5AFF]">
                <p className="text-gray-400 text-sm">นามสกุล</p>
                <p className="text-white text-xl font-medium">บุตตะวงษ์</p>
            </div>
            <div className="p-2 border-l-4 border-[#5F5AFF]">
                <p className="text-gray-400 text-sm">อีเมล</p>
                <p className="text-white text-xl font-medium">infoTechJob@gmail.com</p>
            </div>
            <div className="p-2 border-l-4 border-[#5F5AFF]">
                <p className="text-gray-400 text-sm">เบอร์โทร</p>
                <p className="text-white text-xl font-medium">0621027538</p>
            </div>
            <div className="p-2 border-l-4 border-[#5F5AFF]">
                <p className="text-gray-400 text-sm">แผนก</p>
                <p className="text-white text-xl font-medium">เทคโนโลยีสารสนเทศ</p>
            </div>
            
        </div>
    </div>
</div>
    <div className="p-6 bg-neutral-900 rounded-xl shadow-xl space-y-4">
    <div className="flex justify-between items-center border-b border-gray-800 pb-3">
        <h3 className="text-xl font-bold text-gray-200">ผลงานที่ผ่านมา</h3>
        <button className="px-3 py-1 bg-[#5F5AFF] hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow-md transition duration-200">
            + เพิ่มผลงาน
        </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="relative h-40 bg-gray-800 rounded-lg overflow-hidden transition duration-300 transform hover:scale-[1.03] hover:shadow-2xl">
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
                <button title="แก้ไข" className="p-1 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-md transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.409a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z"></path></svg>
                </button>
                <button title="ลบ" className="p-1 bg-red-600 bg-opacity-70 hover:bg-opacity-100 text-white rounded-md transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: 'url(https://via.placeholder.com/300/4B5563/FFFFFF?text=Project+A)' }}></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-70 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white truncate">โปรเจกต์การจัดการลูกค้า</p>
                <p className="text-sm text-[#5F5AFF]">สถานะ: เสร็จสมบูรณ์</p>
            </div>
        </div>
        <div className="relative h-40 bg-gray-800 rounded-lg overflow-hidden transition duration-300 transform hover:scale-[1.03] hover:shadow-2xl">
            <div className="absolute top-2 right-2 flex space-x-2 z-10">
                <button title="แก้ไข" className="p-1 bg-black bg-opacity-50 hover:bg-opacity-80 text-white rounded-md transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.409a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z"></path></svg>
                </button>
                <button title="ลบ" className="p-1 bg-red-600 bg-opacity-70 hover:bg-opacity-100 text-white rounded-md transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: 'url(https://via.placeholder.com/300/4B5563/FFFFFF?text=Project+B)' }}></div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-70 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white truncate">ระบบวิเคราะห์ข้อมูล (Dashboard)</p>
                <p className="text-sm text-yellow-500">สถานะ: อยู่ระหว่างพัฒนา</p>
            </div>
        </div>
    </div>
</div>
    <div className="p-6 bg-neutral-900 rounded-lg shadow-lg space-y-4">
        <h3 className="text-xl font-semibold border-b border-gray-800 pb-3">ข้อมูลสถานะและสิทธิ์การเข้าถึง</h3>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
                <p className="text-gray-400 text-base">บทบาทในระบบ</p>
                <p className="text-lg font-semibold text-green-400">Admin/ผู้ดูแลระบบหลัก</p>
            </div>
            <div>
                <p className="text-gray-400 text-base">วันที่เข้าร่วมทีม</p>
                <p className="text-white text-lg">14 ตุลาคม 2568</p>
            </div>
            <div className="col-span-2">
                <p className="text-gray-400 text-base">สิทธิ์การเข้าถึง</p>
                <div className="flex space-x-2 mt-1">
                    <span className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">จัดการผู้ใช้</span>
                    <span className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">ดู Log ระบบ</span>
                    <span className="bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">แก้ไขการตั้งค่า</span>
                </div>
            </div>
        </div>
    </div>
</div>
  )
}

export default Profile