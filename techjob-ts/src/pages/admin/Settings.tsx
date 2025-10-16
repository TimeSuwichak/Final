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
        </main>
      </div>
    </div>
  )
}

