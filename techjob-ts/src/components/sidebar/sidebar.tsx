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
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { ModeToggle } from "../common/mode-toggle";
import LogoutButton from "../auth/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import techJobLogo from "@/assets/techjob-logo.png";
import { JobProvider } from "@/contexts/JobContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { MaterialProvider } from "@/contexts/MaterialContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import { ChatBadge } from "@/components/chat/ChatBadge";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  const role = user?.role?.toLowerCase() || "user";
  const unreadChat = useUnreadChatCount(user?.uid || "", role);

  // 🎨 Modern styled classes with gradient highlight
  const baseLinkClass =
    "relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out hover:scale-[1.02] text-sm font-medium";
  
  const activeLinkClass = 
    "bg-gradient-to-r from-purple-500/20 to-blue-500/20 dark:from-purple-500/30 dark:to-blue-500/30 text-purple-600 dark:text-purple-400 shadow-lg shadow-purple-500/20";
  
  const inactiveLinkClass = 
    "text-gray-600 dark:text-sidebar-foreground/70 hover:bg-gray-100 dark:hover:bg-sidebar-accent/50 hover:text-gray-900 dark:hover:text-sidebar-foreground";

  const menuConfig = {
    user: [
      { path: "/user/UserDashboard", icon: <VscGraph className="w-5 h-5" />, label: "ข้อมูลภาพรวม" },
      { path: "/user/userworks", icon: <MdEngineering className="w-5 h-5" />, label: "การเข้างานช่าง" },
      { path: "/user/report-problem", icon: <TbAlertHexagon className="w-5 h-5" />, label: "แจ้งปัญหา" },
      { path: "/chat", icon: <IoChatbubbleEllipsesOutline className="w-5 h-5" />, label: "แชทสนทนา", isChat: true },
      { path: "/notification", icon: <FiBell className="w-5 h-5" />, label: "การแจ้งเตือน" },
      { path: "/user/setting", icon: <FaCog className="w-5 h-5" />, label: "การตั้งค่า" },
    ],
    admin: [
      { path: "/admin/admindashboard", icon: <VscGraph className="w-5 h-5" />, label: "ข้อมูลภาพรวม" },
      { path: "/admin/datauser", icon: <MdEngineering className="w-5 h-5" />, label: "จัดการบัญชี" },
      { path: "/admin/workoders", icon: <CgFileDocument className="w-5 h-5" />, label: "ระบบใบงาน" },
      { path: "/admin/material", icon: <BsBoxes className="w-5 h-5" />, label: "คลังอุปกรณ์/วัสดุ" },
      { path: "/admin/report", icon: <TbAlertHexagon className="w-5 h-5" />, label: "การแจ้งปัญหา" },
      { path: "/admin/chat", icon: <IoChatbubbleEllipsesOutline className="w-5 h-5" />, label: "แชทผู้ใช้งาน", isChat: true },
      { path: "/notification", icon: <FiBell className="w-5 h-5" />, label: "การแจ้งเตือน" },
      { path: "/admin/setting", icon: <FaCog className="w-5 h-5" />, label: "การตั้งค่า" },
    ],
    leader: [
      { path: "/leader/leaderdashboard", icon: <VscGraph className="w-5 h-5" />, label: "ข้อมูลภาพรวม" },
      { path: "/leader/leaderworks", icon: <MdEngineering className="w-5 h-5" />, label: "การเข้างานช่าง" },
      { path: "/leader/report-problem", icon: <TbAlertHexagon className="w-5 h-5" />, label: "แจ้งปัญหา" },
      { path: "/leader/setting", icon: <FaCog className="w-5 h-5" />, label: "การตั้งค่า" },
      { path: "/notification", icon: <FiBell className="w-5 h-5" />, label: "การแจ้งเตือน" },
    ],
    executive: [
      { path: "/executive/exdashboard", icon: <VscGraph className="w-5 h-5" />, label: "ข้อมูลภาพรวม" },
      { path: "/chat", icon: <IoChatbubbleEllipsesOutline className="w-5 h-5" />, label: "แชทสนทนา", isChat: true },
      { path: "/notification", icon: <FiBell className="w-5 h-5" />, label: "การแจ้งเตือน" },
    ],
  };

  const menuItems = menuConfig[role] || menuConfig.user;

  return (
    <NotificationProvider>
      <MaterialProvider>
        <JobProvider>
        <div className="flex h-screen bg-background">

          {/* 📱 Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white dark:bg-card shadow-lg border border-gray-200 dark:border-border text-gray-700 dark:text-foreground hover:bg-gray-50 dark:hover:bg-accent transition-all md:hidden"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>

          {/* 🎨 Sidebar - White in Light Mode */}
          <aside
            className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-sidebar flex flex-col border-r border-gray-200 dark:border-sidebar-border
            transform transition-transform duration-300 ease-in-out z-40
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static shadow-xl md:shadow-none`}
          >
            {/* ✨ Logo Section - Centered on Mobile */}
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-sidebar-border">
              <div className="flex items-center justify-center md:justify-start">
                <img 
                  src={techJobLogo} 
                  alt="TechJob Logo" 
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* 📋 Navigation Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-muted">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `${baseLinkClass} ${isActive ? activeLinkClass : inactiveLinkClass}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* 🎯 Active Indicator Line - Gradient */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full" />
                      )}

                      {/* 🎨 Icon Container */}
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      
                      {/* 📝 Label */}
                      <span className="flex-1">{item.label}</span>

                      {/* 💬 Chat Badge */}
                      {item.isChat && <ChatBadge count={unreadChat} />}

                      {/* ✨ Hover Gradient Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all pointer-events-none" />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* 👤 User Profile Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-sidebar-border space-y-3">
              {user && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-sidebar-accent/30 border border-gray-200 dark:border-sidebar-border transition-all hover:shadow-md">
                  {/* Avatar with Gradient */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
                    {user.fname.charAt(0)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-gray-900 dark:text-sidebar-foreground truncate">
                      {user.fname} {user.lname}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-muted-foreground truncate capitalize">
                      {user.role}
                    </p>
                  </div>

                  {/* Theme Toggle */}
                  <ModeToggle />
                </div>
              )}

              {/* Logout Button */}
              <LogoutButton />
            </div>
          </aside>

          {/* 📄 Main Content Area */}
          <div className="relative flex-1 md:ml-0">
            {/* 🔔 Notification Bell */}
            <div className="absolute right-6 top-6 z-30">
              <NotificationBell />
            </div>

            {/* 📃 Page Content */}
            <main className="h-full overflow-auto p-6 pt-20 bg-background">
              <Outlet />
            </main>
          </div>

          {/* 🌑 Mobile Overlay */}
          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-background/80 backdrop-blur-sm md:hidden z-30 animate-in fade-in duration-300"
            />
          )}
        </div>
        </JobProvider>
      </MaterialProvider>
    </NotificationProvider>
  );
}