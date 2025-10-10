import { useState } from "react";
// ✅ 1. แก้ไข: นำเข้า NavLink แทน Link
// NavLink เป็น Component พิเศษจาก react-router-dom ที่รู้ว่า "ตอนนี้ฉันถูกเลือกอยู่หรือเปล่า"
import { NavLink, useNavigate, Outlet } from "react-router-dom"; 
import { FaCog } from "react-icons/fa";
import { MdEngineering } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import { CgFileDocument } from "react-icons/cg";
import { BsBoxes } from "react-icons/bs";
import { TbAlertHexagon } from "react-icons/tb";
import { HiMenu, HiX } from "react-icons/hi";
import { ModeToggle } from "../common/mode-toggle";


export default function AdminNavbar() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleSignOut = () => {
    navigate("/login", { replace: true });
  };

  // ✅ 2. สร้างตัวแปรเก็บ class พื้นฐานของปุ่ม เพื่อให้โค้ดสะอาดขึ้น
  // เราจะใช้ class เหล่านี้กับทุกปุ่มเหมือนกัน
  const baseLinkClass = "bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222] flex items-center transition-all duration-200";

  // ✅ 3. สร้างตัวแปรสำหรับ class ของปุ่มที่ถูกเลือก (active) และไม่ถูกเลือก (inactive)
  // เราจะใช้ Logic นี้ในการใส่ไฮไลท์
  const activeLinkClass = "border-l-4 border-purple-500"; // เมื่อถูกเลือก: เพิ่มเส้นขอบซ้ายสีม่วง
  const inactiveLinkClass = "border-l-4 border-transparent"; // เมื่อไม่ถูกเลือก: ทำให้เส้นขอบโปร่งใส เพื่อป้องกัน layout ขยับ

  return (
    <div className="flex h-screen ">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 text-white bg-[#222] rounded-md md:hidden"
      >
        {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      <div
        className={`
          fixed inset-y-0 left-0 w-64 bg-[#111014] flex flex-col justify-between border-r border-[#222]
          transform transition-transform duration-300 z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static
        `}
      >
        <div>
          <div className=" lg:p-4 lg:pl-4  md:pl-30 p-5 pl-20  text-white text-xl font-bold ">TECH JOB</div>
          <nav className="flex flex-col gap-2 px-4">
            
            {/* ✅ 4. แก้ไข: เปลี่ยนจาก <Link> เป็น <NavLink> ทั้งหมด และใช้ className แบบฟังก์ชัน */}
            <NavLink
              to="/admin/admindashboard"
              // className จะรับฟังก์ชันที่ส่งค่า { isActive } มาให้
              // เราใช้ Ternary Operator (เงื่อนไข ? 'ถ้าจริง' : 'ถ้าเท็จ') เพื่อเปลี่ยน class ตามสถานะ
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}` }
            >
              <VscGraph className="inline mr-2" /> ข้อมูลภาพรวม
            </NavLink>

            <NavLink
              to="/admin/datauser"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}` }
            >
              <MdEngineering className=" inline mr-2" /> จัดการบัญชี
            </NavLink>

            <NavLink
              to="/admin/workoders"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}` }
            >
              <CgFileDocument className=" inline mr-2" /> ระบบใบงาน
            </NavLink>

            <NavLink
              to="/admin/material"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}` }
            >
              <BsBoxes className=" inline mr-2" /> คลังอุปกรณ์/วัสดุ
            </NavLink>

            <NavLink
              to="/admin/report"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}` }
            >
              <TbAlertHexagon className=" inline mr-2" /> การแจ้งปัญหา
            </NavLink>

            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}` }
            >
              <FaCog className="inline mr-2" /> การตั้งค่า
            </NavLink>
          </nav>
        </div>

        <ModeToggle/>

        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto md:ml-0">
        <Outlet />
      </div>

      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-40 md:hidden z-30"
        ></div>
      )}
    </div>
  );
}