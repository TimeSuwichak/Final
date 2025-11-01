import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { FaCog } from "react-icons/fa"
import { VscGraph } from "react-icons/vsc"
import { HiMenu, HiX } from "react-icons/hi"
import { ModeToggle } from "../common/mode-toggle"
import LogoutButton from "../auth/LogoutButton"
import { useAuth } from "@/contexts/AuthContext"

export default function LeaderSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const { user } = useAuth()

  const baseLinkClass =
    "bg-[#19182A] text-white py-2 px-4 rounded-lg hover:bg-[#222] flex items-center transition-all duration-200"
  const activeLinkClass = "border-l-4 border-purple-500"
  const inactiveLinkClass = "border-l-4 border-transparent"

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
            <NavLink
              to="/leader/LeaderDashboard"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <VscGraph className="inline mr-2" /> ข้อมูลภาพรวม
            </NavLink>
            <NavLink
              to="/leader/LeaderReport"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <VscGraph className="inline mr-2" /> การแจ้งปัญหา
            </NavLink>

            <NavLink
              to="/leader/setting"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <FaCog className="inline mr-2" /> การตั้งค่า
            </NavLink>

            <NavLink
              to="/leader/LeaderCalendar"
              className={({ isActive }) => `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <FaCog className="inline mr-2" /> ปฏิทินงาน
            </NavLink>
          </nav>
        </div>

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

      <div className="flex-1 p-6 overflow-auto md:ml-0">
        <Outlet />
      </div>

      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black opacity-40 md:hidden z-30"></div>
      )}
    </div>
  )
}