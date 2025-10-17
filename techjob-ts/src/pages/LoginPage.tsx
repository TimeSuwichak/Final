import { useState } from "react";
import { Wrench, UserCheck, UserCog } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

// กำหนดสีม่วงหลักที่ใช้ซ้ำๆ
const PRIMARY_COLOR = "#5F5AFF";
const HOVER_COLOR = "#4b48c7";

// กำหนด Mock Credentials สำหรับการสาธิต
const MOCK_CREDENTIALS = {
  ADMIN: { email: "admin@techjob.com", password: "adminpass", role: "ผู้ดูแล" },
  TECH: { email: "tech@techjob.com", password: "techpass", role: "ช่าง" },
};

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");

    // ตรวจสอบ Credentials และกำหนดเส้นทางตามบทบาท
    if (email === MOCK_CREDENTIALS.ADMIN.email && password === MOCK_CREDENTIALS.ADMIN.password) {
      // ผู้ดูแล (Admin): เชื่อมไปยังหน้า AdminDashboard
      navigate("/admin/AdminDashboard");
    } else if (email === MOCK_CREDENTIALS.TECH.email && password === MOCK_CREDENTIALS.TECH.password) {
      // ช่าง (Common/Technician): เชื่อมไปยังหน้า Notification (ตามโครงสร้างโฟลเดอร์)
      navigate("/common/Notification");
    } else {
      // Credentials ไม่ถูกต้อง
      setLoginError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
    }
  };

  return (
    // 1. ธีมสว่าง: พื้นหลังหลักเป็นสีขาว (bg-white)
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-[1100px] max-w-full p-4 md:p-0">
        
        {/* Left Side - Information Panel (Responsive: Hide on small screens) */}
        <div className="flex-1 flex-col justify-center pr-12 hidden md:flex">
          {/* Logo/Header Section */}
          <div className="flex items-center mb-2">
            <div className="bg-[#5F5AFF] rounded-xl p-3 mr-3 shadow-md">
              <Wrench className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-indigo-600 text-3xl font-bold">Tech Job</h1>
              <div className="text-indigo-500 text-lg">ระบบจัดการในงานช่าง</div>
            </div>
          </div>
          {/* Description */}
          <div className="text-gray-600 mb-8 mt-2">
            ระบบจัดการงานช่างที่ทันสมัย สำหรับการติดตามและจัดการในงานซ่อมบำรุงอย่างมีประสิทธิภาพ
          </div>
          
          {/* Feature Cards */}
          <div className="flex gap-6">
            <div className="bg-white rounded-xl p-6 flex-1 border border-gray-200 shadow-sm transition hover:shadow-lg">
              <div className="flex items-center mb-2">
                <UserCog className="text-[#5F5AFF] mr-2" />
                <span className="text-gray-800 font-semibold">สำหรับช่าง</span>
              </div>
              <div className="text-gray-500 text-sm">รับงาน ติดตาม อัปเดตสถานะ</div>
            </div>
            <div className="bg-white rounded-xl p-6 flex-1 border border-gray-200 shadow-sm transition hover:shadow-lg">
              <div className="flex items-center mb-2">
                <UserCheck className="text-[#5F5AFF] mr-2" />
                <span className="text-gray-800 font-semibold">สำหรับผู้ดูแล</span>
              </div>
              <div className="text-gray-500 text-sm">สร้างงาน มอบหมาย รายงาน</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form (Centered on mobile) */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="bg-white rounded-xl px-8 py-8 md:px-10 md:py-10 w-full max-w-md border border-gray-200 shadow-xl">
            
            {/* Header for Mobile/Form */}
            <div className="flex md:hidden items-center justify-center mb-6">
                <div className="bg-[#5F5AFF] rounded-xl p-2 mr-2 shadow-md">
                    <Wrench className="text-white text-2xl" />
                </div>
                <h2 className="text-indigo-600 text-2xl font-bold">Tech Job Login</h2>
            </div>
            
            <h2 className="text-gray-800 text-2xl font-bold text-center mb-2">เข้าสู่ระบบ</h2>
            <div className="text-gray-500 text-center mb-6 text-sm">
              กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบงานช่าง
            </div>

            {/* Error Message Display */}
            {loginError && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300 transition-all duration-300">
                    {loginError}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <label className="block text-gray-700 mb-1 font-medium">อีเมล</label>
              <input
                type="email"
                placeholder="เช่น admin@techjob.com"
                className={`w-full mb-4 px-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition duration-200`}
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                required
              />
              
              {/* Password Input */}
              <label className="block text-gray-700 mb-1 font-medium">รหัสผ่าน</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full mb-6 px-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition duration-200`}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
              />
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 bg-[${PRIMARY_COLOR}] text-white py-2 rounded-lg font-semibold shadow-md hover:bg-[${HOVER_COLOR}] transition transform hover:scale-[1.01]`}
                >
                  เข้าสู่ระบบ
                </button>
              </div>
              
              <div className="mt-6 text-center text-xs text-gray-400">
                (ตัวอย่างการเข้าสู่ระบบ: Admin = admin@techjob.com / adminpass, ช่าง = tech@techjob.com / techpass)
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}