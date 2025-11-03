// src/pages/LoginPage.tsx (ฉบับอัปเกรด)

import { useState, useEffect } from "react";
import { Wrench, UserCheck, UserCog } from "lucide-react"; 
import { useNavigate } from "react-router-dom";

// ▼▼▼ 1. IMPORT "โทรศัพท์สายตรง" เข้ามา ▼▼▼
import { useAuth } from '@/contexts/AuthContext'; 

const PRIMARY_COLOR = "#5F5AFF";
const HOVER_COLOR = "#4b48c7";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // ▼▼▼ 2. ดึง "เครื่องมือ" ที่จำเป็นมาจาก "สมอง" ▼▼▼
    const { login, user, loading } = useAuth();

    // === ฟังก์ชันเมื่อกดปุ่ม "เข้าสู่ระบบ" ===
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 3. ใช้ฟังก์ชัน login จาก "สมอง" โดยตรง
        login(email, password);
    };

    // === Logic: คอยจับตาดูว่า Login สำเร็จหรือยัง (เหมือนเดิม) ===
    useEffect(() => {
        // ถ้า "สมอง" ตรวจสอบเสร็จแล้ว และ "มี" user login อยู่
        if (!loading && user) { 
            console.log("Redirecting user:", user.fname, "Role:", user.role);

            // เช็ค role แล้วส่งไปหน้า Dashboard ที่ถูกต้อง
            switch (user.role) {
                case 'admin':
                    navigate('/admin/AdminDashboard');
                    break;
                case 'leader':
                    navigate('/leader/LeaderDashboard');
                    break;
                case 'user':
                    navigate('/user/UserDashboard');
                    break;
                case 'executive':
                    navigate('/executive/ExDashboard'); // (สมมติ path นี้)
                    break;
                default:
                    navigate('/'); 
            }
        }
    }, [user, loading, navigate]);

    // ==========================================================
    // 4. เพิ่ม Logic "รอ" (หัวใจของการแก้จอกระพริบ)
    // ==========================================================
    // ถ้า "สมอง" กำลังตรวจสอบข้อมูลอยู่
    if (loading) {
        // ให้แสดงหน้าว่างๆ รอไปก่อน
        return <div className="min-h-screen w-full bg-gray-50" />; 
    }

    // ถ้าตรวจสอบเสร็จแล้ว และ "มี" user login อยู่แล้ว
    if (!loading && user) {
        // ไม่ต้องทำอะไรเลย เพราะ useEffect ข้างบนกำลังจะพาไปหน้าอื่น
        return <div className="min-h-screen w-full bg-gray-50" />;
    }
    
    // ==========================================================
    // 5. ถ้าไม่มีใคร Login อยู่ ค่อยแสดงฟอร์ม
    // ==========================================================
    return (
        // --- โค้ด JSX ส่วนแสดงผลทั้งหมดของคุณ (ไม่ต้องแก้ไข) ---
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex w-[1100px] max-w-full p-4 md:p-0">
                
                {/* Left Side */}
                <div className="flex-1 flex-col justify-center pr-12 hidden md:flex">
                    <div className="flex items-center mb-2">
                        <div className="bg-[#5F5AFF] rounded-xl p-3 mr-3 shadow-md">
                            <Wrench className="text-white text-3xl" />
                        </div>
                        <div>
                            <h1 className="text-indigo-600 text-3xl font-bold">Tech Job</h1>
                            <div className="text-indigo-500 text-lg">ระบบจัดการในงานช่าง</div>
                        </div>
                    </div>
                    <div className="text-gray-600 mb-8 mt-2">
                        ระบบจัดการงานช่างที่ทันสมัย สำหรับการติดตามและจัดการในงานซ่อมบำรุงอย่างมีประสิทธิภาพ
                    </div>
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

                {/* Right Side - Login Form */}
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="bg-white rounded-xl px-8 py-8 md:px-10 md:py-10 w-full max-w-md border border-gray-200 shadow-xl">
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

                        <form onSubmit={handleSubmit}>
                            <label className="block text-gray-700 mb-1 font-medium">อีเมล</label>
                            <input
                                type="email"
                                placeholder="เช่น admin@techjob.com"
                                className={`w-full mb-4 px-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition duration-200`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            
                            <label className="block text-gray-700 mb-1 font-medium">รหัสผ่าน</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className={`w-full mb-6 px-4 py-2 rounded-lg bg-gray-50 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-transparent transition duration-200`}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                (ตัวอย่าง: admin@techjob.com / admin1234)
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}