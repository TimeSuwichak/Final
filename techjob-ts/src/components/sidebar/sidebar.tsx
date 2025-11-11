import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { MdEngineering } from "react-icons/md";
import { VscGraph } from "react-icons/vsc";
import { CgFileDocument } from "react-icons/cg";
import { BsBoxes } from "react-icons/bs";
import { TbAlertHexagon } from "react-icons/tb";
import { HiMenu, HiX } from "react-icons/hi";
import { FiBell } from "react-icons/fi";
import { ModeToggle } from "../common/mode-toggle";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import techJobLogo from "@/assets/techjob-logo.png"; // ตัวอย่าง path
import { JobProvider } from "@/contexts/JobContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const baseLinkClass =
    "bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222] flex items-center transition-all duration-200";
  const activeLinkClass = "border-l-4 border-purple-500";
  const inactiveLinkClass = "border-l-4 border-transparent";

  const menuConfig = {
    user: [
      { path: "/user/UserDashboard", icon: <VscGraph />, label: "ข้อมูลภาพรวม" },
      { path: "/user/userworks", icon: <MdEngineering />, label: "การเข้างานช่าง" },
      { path: "/user/report-problem", icon: <TbAlertHexagon />, label: "แจ้งปัญหา" },
      { path: "/notification", icon: <FiBell />, label: "การแจ้งเตือน" },
      { path: "/user/setting", icon: <FaCog />, label: "การตั้งค่า" },
    ],
    admin: [
      { path: "/admin/admindashboard", icon: <VscGraph />, label: "ข้อมูลภาพรวม" },
      { path: "/admin/datauser", icon: <MdEngineering />, label: "จัดการบัญชี" },
      { path: "/admin/workoders", icon: <CgFileDocument />, label: "ระบบใบงาน" },
      { path: "/admin/material", icon: <BsBoxes />, label: "คลังอุปกรณ์/วัสดุ" },
      { path: "/admin/report", icon: <TbAlertHexagon />, label: "การแจ้งปัญหา" },
      { path: "/notification", icon: <FiBell />, label: "การแจ้งเตือน" },
      { path: "/admin/setting", icon: <FaCog />, label: "การตั้งค่า" },
    ],
    leader: [
      { path: "/leader/laderdashboard", icon: <VscGraph />, label: "ข้อมูลภาพรวม" },
      { path: "/leader/leaderworks", icon: <VscGraph />, label: "การเข้างาน" },
      { path: "/notification", icon: <FiBell />, label: "การแจ้งเตือน" },
    ],

    executive: [
      { path: "/executive/exdashboard", icon: <VscGraph />, label: "ข้อมูลภาพรวม" },
      { path: "/notification", icon: <FiBell />, label: "การแจ้งเตือน" },
    ],

  };

  const role = user?.role?.toLowerCase() || "user";
  const menuItems = menuConfig[role] || menuConfig.user;

  return (
    <NotificationProvider>
      <JobProvider>
        <div className="flex h-screen">
        {/* ปุ่มเปิด/ปิด sidebar สำหรับ mobile */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 left-4 z-50 p-2 text-white bg-[#222] rounded-md md:hidden"
        >
          {isSidebarOpen ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 w-64 bg-[#111014] flex flex-col justify-between border-r border-[#222]
          transform transition-transform duration-300 z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static
        `}
      >
        {/* Header */}
        <div>
          <div className="p-5 pl-8 text-white text-xl font-bold flex items-center gap-3">
            <img
              src={techJobLogo}
              alt="TechJob Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <nav className="flex flex-col gap-2 px-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${baseLinkClass} ${
                    isActive ? activeLinkClass : inactiveLinkClass
                  }`
                }
              >
                <span className="mr-2">{item.icon}</span> {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#222] space-y-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/50 flex items-center justify-center font-bold text-purple-200">
                  {user.fname.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.fname} {user.lname}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.role}</p>
                </div>
                <ModeToggle />
              </div>
            )}

            <div className="w-full">
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* เนื้อหาหลัก */}
        <div className="relative flex-1 md:ml-0">
          {/* Floating notification bell (kept off layout flow to avoid header artifacts) */}
          <div className="absolute right-6 top-6 z-30">
            <NotificationBell />
          </div>
          <main className="h-full overflow-auto p-6 pt-20">
            <Outlet />
          </main>
        </div>

        {/* Overlay (mobile) */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black opacity-40 md:hidden z-30"
          ></div>
        )}
      </div>
      </JobProvider>
    </NotificationProvider>
  );
}

