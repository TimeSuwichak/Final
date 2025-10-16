import { useState } from "react"

export default function Settings() {
  const [activeMenu, setActiveMenu] = useState("")

  return (
    <div className="bg-black min-h-screen text-gray-300">
      <header className="flex justify-between items-center px-6 py-4 bg-neutral-950 border-b border-gray-800">
        <h2 className="text-2xl font-bold text-white">Setting Dashboard</h2>
      </header>
      <div className="flex">
        <div
          className="w-64 bg-neutral-950 p-4 flex flex-col justify-between border-r border-gray-800"
          style={{ height: "calc(100vh - 68px)" }}
        >
          <div>
            <input
              type="text"
              placeholder="search..."
              className="w-full p-2 bg-black border border-gray-800 rounded-lg text-lg text-white focus:outline-none focus:border-gray-600 mb-4"
            />
            <ul className="space-y-1">
              {[
                "ตั้งค่าโปรไฟล์",
                "ตั้งค่าบัญชี",
                "UI Theme",
                "ความปลอดภัย",
                "การตั้งค่าระบบ",
                "การตั้งค่าการแจ้งเตือน",
              ].map((item) => (
                <li
                  key={item}
                  onClick={() => setActiveMenu(item)}
                  className={`p-2 rounded-lg text-lg cursor-pointer transition ${
                    activeMenu === item
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-800">
            <button className="w-full bg-red-600 text-white p-2 rounded-lg hover:bg-red-800 transition">
              ลบบัญชี
            </button>
          </div>
        </div>
        <main className="flex-1 p-6 bg-black text-white">
          {activeMenu === "" && (
            <div className="flex justify-center items-center h-full text-center text-gray-600">
              <div>
                <svg
                  className="w-20 h-20 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg text-gray-400">
                  หน้าว่างเปล่า โปรดเลือกเมนู หรือค้นหาการตั้งค่า
                </p>
              </div>
            </div>
          )}

          {activeMenu === "ตั้งค่าโปรไฟล์" && (
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
          )}

          {activeMenu === "ตั้งค่าบัญชี" && (
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
          )}

          {activeMenu === "UI Theme" && (
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
          )}
          {activeMenu === "ความปลอดภัย" && (
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
          )}
          {activeMenu === "การตั้งค่าระบบ" && (
            <div className="space-y-8 text-white w-full p-6">
    <div className="mb-10">
      <h3 className="text-4xl font-extrabold text-white">การตั้งค่าระบบ</h3>
      <p className="text-gray-400 text-lg pt-2 border-b border-gray-800 pb-4">
        จัดการการตั้งค่าพื้นฐานของระบบ TechJob เพื่อประสิทธิภาพสูงสุด
      </p>
    </div> 
    <div className="bg-neutral-900 p-5 rounded-xl shadow-xl flex justify-between items-center transition duration-300 hover:bg-neutral-800 border-l-4 border-[#5F5AFF]">
        <p className="text-xl font-bold text-gray-200">เปลี่ยนชื่อระบบ</p>
        <button className="px-6 py-2 border border-[#5F5AFF] text-[#5F5AFF] font-semibold rounded-lg text-base hover:bg-[#5F5AFF] hover:text-white transition duration-200 shadow-md">
            แก้ไข
        </button>
    </div>
    <div className="bg-neutral-900 p-5 rounded-xl shadow-xl flex justify-between items-center transition duration-300 hover:bg-neutral-800 border-l-4 border-[#5F5AFF]">
        <p className="text-xl font-bold text-gray-200">ตั้งค่าความปลอดภัย</p>
        <button className="px-6 py-2 border border-[#5F5AFF] text-[#5F5AFF] font-semibold rounded-lg text-base hover:bg-[#5F5AFF] hover:text-white transition duration-200 shadow-md">
            แก้ไข
        </button>
    </div>
    <div className="bg-neutral-900 p-5 rounded-xl shadow-xl flex justify-between items-center transition duration-300 hover:bg-neutral-800 border-l-4 border-[#5F5AFF]">
        <p className="text-xl font-bold text-gray-200">ตรวจสอบ Log ระบบ</p>
        <button className="px-6 py-2 border border-[#5F5AFF] text-[#5F5AFF] font-semibold rounded-lg text-base hover:bg-[#5F5AFF] hover:text-white transition duration-200 shadow-m">
            ดู Log
        </button>
    </div>
</div>
          )}
          {activeMenu === "การตั้งค่าการแจ้งเตือน" && (
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
          )}
        </main>
      </div>
    </div>
  )
}

