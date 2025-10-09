import { useState } from "react"; // ✅ เพิ่ม useState
import { Link, useNavigate, Outlet } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { MdEngineering } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import { CgFileDocument } from "react-icons/cg";
import { BsBoxes } from "react-icons/bs";
import { TbAlertHexagon } from "react-icons/tb";
import { HiMenu, HiX } from "react-icons/hi"; // ✅ ไอคอนเปิด/ปิดเมนู
import { ModeToggle } from "../common/mode-toggle";


export default function AdminNavbar() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ✅ สร้าง state toggle sidebar

  const handleSignOut = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen ">
      {/* ✅ ปุ่มเปิดเมนู (เฉพาะมือถือ) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 text-white bg-[#222] rounded-md md:hidden"
      >
        {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
      </button>

      {/* ✅ Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 w-64 bg-[#111014] flex flex-col justify-between border-r border-[#222]
          transform transition-transform duration-300 z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static
        `}
      >
        {/* Logo + Menu */}
        <div>
          <div className=" lg:p-4 lg:pl-4  md:pl-30 p-5 pl-20  text-white text-xl font-bold ">TECH JOB</div>
          <nav className="flex flex-col gap-2 px-4">
            <Link
              to="/admin/admindashboard"
              className="bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222]"
            >
              <VscGraph className="inline mr-2" /> ข้อมูลภาพรวม
            </Link>

            <Link
              to="/admin/datauser"
              className="bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222]"
            >
              <MdEngineering className=" inline mr-2" /> ข้อมูลช่าง
            </Link>

            <Link
              to="/admin/workoders"
              className="bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222]"
            >
              <CgFileDocument className=" inline mr-2" /> ระบบใบงาน
            </Link>

            <Link
              to="/admin/datauser"
              className="bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222]"
            >
              <BsBoxes className=" inline mr-2" /> คลังอุปกรณ์/วัสดุ
            </Link>

            <Link
              to="/admin/report"
              className="bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222]"
            >
              <TbAlertHexagon className=" inline mr-2" /> การแจ้งปัญหา
            </Link>

            <Link
              to="/admin/settings"
              className="bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222]"
            >
              <FaCog className="inline mr-2" /> การตั้งค่า
            </Link>
          </nav>
        </div>

        <ModeToggle/>

        {/* Sign Out */}
        <div className="p-4">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 p-6 overflow-auto md:ml-0">
        <Outlet />
      </div>

      {/* ✅ คลิกพื้นที่นอก sidebar เพื่อปิดเมนูบนมือถือ */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black opacity-40 md:hidden z-30"
        ></div>
      )}
    </div>
  );
}
