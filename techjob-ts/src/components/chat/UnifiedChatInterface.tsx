// src/components/chat/UnifiedChatInterface.tsx
// Component หลักสำหรับระบบแชทแบบรวม (Unified Chat Interface)
// ทำหน้าที่แสดงรายการแชท, ค้นหาผู้ใช้, และแสดงหน้าต่างแชท

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
// Import ข้อมูลผู้ใช้จำลอง (Mock Data) จากไฟล์ต่างๆ
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserChat from "./UserChat";

// --- Interfaces ---

// โครงสร้างข้อมูลของห้องแชท
interface Chat {
  id: string; // ID ของห้องแชท (Firestore Doc ID)
  participants: string[]; // Array ของ User IDs ที่อยู่ในห้องแชท
  lastMessage?: string; // ข้อความล่าสุด (สำหรับแสดง preview)
  lastSender?: string; // ผู้ส่งข้อความล่าสุด
  updatedAt: any; // เวลาที่อัปเดตล่าสุด (Firestore Timestamp)
}

// โครงสร้างข้อมูลผู้ใช้ (สำหรับแสดงในรายการค้นหา)
interface UserItem {
  id: number | string;
  fname: string;
  lname: string;
  role: string;
  position?: string;
  department?: string;
  avatarUrl?: string;
  status?: string;
}

interface UnifiedChatInterfaceProps {
  currentUserId: string; // ID ของผู้ใช้ปัจจุบันที่กำลังใช้งาน
}

// --- Constants ---

// แปลง Role เป็นภาษาไทย
const roleLabels: { [key: string]: string } = {
  user: "ช่างเทคนิค",
  leader: "หัวหน้า",
  admin: "แอดมิน",
  executive: "ผู้บริหาร",
};

// แปลง Department เป็นภาษาไทย
const departmentLabels: { [key: string]: string } = {
  network_security: "ความปลอดภัยเครือข่าย",
  smart_building_multimedia: "อาคารอัตโนมัติและมัลติมีเดีย",
  infrastructure_electrical: "โครงสร้างพื้นฐาน/ไฟฟ้า",
  project_management: "จัดการโครงการ",
  administration: "บริหารทั่วไป",
  executive: "ผู้บริหาร",
};

export default function UnifiedChatInterface({
  currentUserId,
}: UnifiedChatInterfaceProps) {
  // --- State Management ---
  const [chats, setChats] = useState<Chat[]>([]); // รายการแชททั้งหมด
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null); // ID ของคู่สนทนาที่เลือก
  const [searchText, setSearchText] = useState(""); // ข้อความค้นหา
  const [selectedRole, setSelectedRole] = useState<string | null>(null); // ตัวกรอง Role
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  ); // ตัวกรองแผนก
  const [showUserList, setShowUserList] = useState(false); // สลับโหมดแสดงรายการแชท / รายชื่อผู้ใช้

  // --- Data Preparation ---
  // รวมข้อมูลผู้ใช้ทั้งหมดจาก Mock Data เข้าด้วยกันเพื่อใช้ในการค้นหาและแสดงผล
  const allUsers = useMemo(
    () => [
      ...userData.map((u) => ({
        ...u,
        id: String(u.id),
        role: u.role || "user",
      })),
      ...leaderData.map((u) => ({
        ...u,
        id: String(u.id),
        role: u.role || "leader",
      })),
      ...adminData.map((u) => ({
        ...u,
        id: String(u.id),
        role: u.role || "admin",
      })),
      ...executiveData.map((u) => ({
        ...u,
        id: String(u.id),
        role: u.role || "executive",
      })),
    ],
    []
  );

  // --- Effects ---
  // โหลดรายการแชทจาก Firestore และจัดการ Caching
  useEffect(() => {
    if (!currentUserId) return;

    // 1. โหลดจาก sessionStorage ก่อนเพื่อความเร็ว (Optimistic UI)
    const cacheKey = `chat_list_${currentUserId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedChats = JSON.parse(cached);
        console.log(
          "[UnifiedChatInterface] Loaded from cache:",
          cachedChats.length,
          "chats"
        );
        setChats(cachedChats);
      } catch (e) {
        console.error(
          "[UnifiedChatInterface] Failed to parse cached chats:",
          e
        );
      }
    }

    // 2. Subscribe ข้อมูล Realtime จาก Firestore
    // Query หาแชทที่มี currentUserId อยู่ใน participants
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", String(currentUserId))
    );

    const unsub = onSnapshot(q, (snap) => {
      const chatList: Chat[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Chat, "id">),
      }));

      // เรียงลำดับตามเวลาอัปเดตล่าสุด (ใหม่ -> เก่า)
      // ทำใน Memory เพราะ Firestore Index อาจยังไม่พร้อมในบางกรณี
      chatList.sort((a, b) => {
        const timeA = a.updatedAt || 0;
        const timeB = b.updatedAt || 0;
        return timeB - timeA;
      });

      console.log(
        "[UnifiedChatInterface] Loaded from Firestore:",
        chatList.length,
        "chats"
      );
      setChats(chatList);

      // 3. อัปเดต Cache ใน sessionStorage
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(chatList));
      } catch (e) {
        console.error(
          "[UnifiedChatInterface] Failed to save chats to cache:",
          e
        );
      }
    });

    return () => unsub();
  }, [currentUserId]);

  // --- Filtering Logic ---

  // กรองรายชื่อผู้ใช้สำหรับ "เพิ่มผู้สนทนาใหม่"
  const filteredUsers = useMemo(() => {
    console.log(
      "[UnifiedChatInterface] Filtering users. Current user ID:",
      currentUserId
    );
    console.log("[UnifiedChatInterface] Total users:", allUsers.length);

    const filtered = allUsers.filter((u) => {
      // 1. ไม่แสดงตัวเอง
      const userId = String(u.id);
      const currentId = String(currentUserId);

      if (userId === currentId) {
        return false;
      }

      // 2. กรองตามชื่อ (Search Text)
      const fullName = `${u.fname} ${u.lname}`.toLowerCase();
      if (searchText.trim() && !fullName.includes(searchText.toLowerCase())) {
        return false;
      }

      // 3. กรองตาม Role
      if (selectedRole && u.role !== selectedRole) return false;

      // 4. กรองตาม Department
      if (selectedDepartment && u.department !== selectedDepartment)
        return false;

      return true;
    });

    console.log(
      "[UnifiedChatInterface] Filtered users count:",
      filtered.length
    );
    return filtered;
  }, [allUsers, currentUserId, searchText, selectedRole, selectedDepartment]);

  // ดึงรายการ Roles ทั้งหมดที่มีอยู่ (สำหรับสร้างตัวกรอง)
  const availableRoles = useMemo(
    () => [...new Set(allUsers.map((u) => u.role))],
    [allUsers]
  );

  // ดึงรายการ Departments ทั้งหมดที่มีอยู่ (ตาม Role ที่เลือก)
  const availableDepartments = useMemo(
    () => [
      ...new Set(
        allUsers
          .filter((u) => !selectedRole || u.role === selectedRole)
          .map((u) => u.department)
          .filter(Boolean)
      ),
    ],
    [allUsers, selectedRole]
  );

  // เตรียมข้อมูลแชทสำหรับแสดงผล (Mapping ข้อมูลคู่สนทนา)
  const filteredChats = useMemo(() => {
    const uniqueChatsMap = new Map<string, any>();

    // 1. Map ข้อมูล Chat เข้ากับข้อมูล User และ Deduplicate
    chats.forEach((chat) => {
      // หา ID ของคู่สนทนา (คนที่ไม่ใช่เรา)
      const otherUserId = chat.participants.find(
        (p) => p !== String(currentUserId)
      );
      if (!otherUserId) return;

      // ดึงข้อมูล User ของคู่สนทนา
      const otherUser = allUsers.find((u) => String(u.id) === otherUserId);
      const displayName = otherUser
        ? `${otherUser.fname} ${otherUser.lname}`
        : otherUserId;

      const processedChat = {
        ...chat,
        otherUserId,
        otherUser,
        displayName,
      };

      // ถ้ามีแชทซ้ำกับคนเดิม ให้เลือกอันที่อัปเดตล่าสุด
      if (uniqueChatsMap.has(otherUserId)) {
        const existing = uniqueChatsMap.get(otherUserId);
        const existingTime = existing.updatedAt || 0;
        const newTime = processedChat.updatedAt || 0;
        if (newTime > existingTime) {
          uniqueChatsMap.set(otherUserId, processedChat);
        }
      } else {
        uniqueChatsMap.set(otherUserId, processedChat);
      }
    });

    // 2. Filter ตามคำค้นหา และ Sort ตามเวลา
    return Array.from(uniqueChatsMap.values())
      .filter((chat) => {
        if (
          searchText.trim() &&
          !chat.displayName.toLowerCase().includes(searchText.toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [chats, currentUserId, allUsers, searchText]);

  const handleSelectChat = (otherUserId: string) => {
    setSelectedUserId(otherUserId);
    setShowUserList(false);
  };

  const handleSelectUser = (user: UserItem) => {
    setSelectedUserId(String(user.id));
    setShowUserList(false);
    setSearchText("");
    setSelectedRole(null);
    setSelectedDepartment(null);
  };

  const selectedUser = allUsers.find((u) => String(u.id) === selectedUserId);

  return (
    <div className="grid grid-cols-3 gap-6 h-full">
      {/* --- Left Panel: Chat List & User Selection --- */}
      {/* ส่วนแสดงรายการแชทและรายชื่อผู้ใช้สำหรับเลือกสนทนา */}
      <div className="flex flex-col h-full bg-white dark:bg-slate-950 border rounded-lg overflow-hidden">
        {/* Header ของ Left Panel */}
        <div className="p-4 border-b dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {showUserList ? "เลือกผู้ใช้" : "ข้อความ"}
            </h2>
            <Button
              variant={showUserList ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUserList(!showUserList)}
            >
              {showUserList ? (
                <X className="h-4 w-4 mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              {showUserList ? "ปิด" : "เพิ่มผู้สนทนาใหม่"}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={showUserList ? "ค้นหาผู้ใช้งาน..." : "ค้นหาแชท..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Content Area: User List or Chat List */}
        {showUserList ? (
          // --- User List View (โหมดเลือกผู้ใช้ใหม่) ---
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* ตัวกรอง Role (ตำแหน่ง) */}
            <div>
              <label className="text-sm font-medium">กรองตามตำแหน่ง</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => setSelectedRole(null)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    selectedRole === null
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  ทั้งหมด
                </button>
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1 rounded text-sm transition ${
                      selectedRole === role
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {roleLabels[role] || role}
                  </button>
                ))}
              </div>
            </div>

            {/* ตัวกรอง Department (แผนก) - แสดงเฉพาะเมื่อมีข้อมูล */}
            {availableDepartments.length > 0 && (
              <div>
                <label className="text-sm font-medium">กรองตามแผนก</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={() => setSelectedDepartment(null)}
                    className={`px-3 py-1 rounded text-sm transition ${
                      selectedDepartment === null
                        ? "bg-green-600 text-white"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {availableDepartments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => setSelectedDepartment(dept || null)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        selectedDepartment === dept
                          ? "bg-green-600 text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {dept && departmentLabels[dept as string]
                        ? departmentLabels[dept as string]
                        : dept}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* รายชื่อผู้ใช้ที่ผ่านการกรอง */}
            <div className="space-y-2 pt-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <Card
                    key={u.id}
                    className="p-3 cursor-pointer hover:shadow-md transition"
                    onClick={() => handleSelectUser(u)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={`${u.fname} ${u.lname}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold text-sm ${
                            u.avatarUrl ? "hidden" : ""
                          }`}
                        >
                          {u.fname.charAt(0)}
                          {u.lname.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {u.fname} {u.lname}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {u.position || roleLabels[u.role] || u.role}
                        </div>
                        {u.department && (
                          <div className="text-xs text-muted-foreground">
                            {departmentLabels[u.department]
                              ? departmentLabels[u.department]
                              : u.department}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>ไม่พบผู้ใช้งาน</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // --- Chat List View (โหมดรายการแชทปกติ) ---
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>ไม่มีแชท</p>
                <p className="text-xs mt-1">
                  คลิก "เพิ่มผู้สนทนาใหม่" เพื่อเริ่มการสนทนา
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                if (!chat) return null;
                const isSelected = selectedUserId === chat.otherUserId;
                const avatarUrl = chat.otherUser?.avatarUrl;

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.otherUserId)}
                    className={`
                      p-4 border-b dark:border-slate-800 cursor-pointer
                      hover:bg-slate-50 dark:hover:bg-slate-900
                      transition-colors
                      ${isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={chat.displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold text-sm ${
                            avatarUrl ? "hidden" : ""
                          }`}
                        >
                          {chat.displayName
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")
                            .substring(0, 2)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">
                          {chat.displayName}
                        </p>
                        {chat.otherUser && (
                          <p className="text-xs text-muted-foreground">
                            {chat.otherUser.position ||
                              (chat.otherUser.role &&
                                roleLabels[chat.otherUser.role]) ||
                              chat.otherUser.role}
                          </p>
                        )}
                        {chat.lastMessage && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* --- Right Panel: Chat Window --- */}
      {/* ส่วนแสดงหน้าต่างแชท */}
      <div className="col-span-2 border rounded-lg bg-white dark:bg-slate-950 overflow-hidden">
        {selectedUserId ? (
          <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                  {selectedUser?.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={`${selectedUser.fname} ${selectedUser.lname}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (
                          e.target as HTMLImageElement
                        ).nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-blue-600 text-white font-bold text-sm ${
                      selectedUser?.avatarUrl ? "hidden" : ""
                    }`}
                  >
                    {selectedUser
                      ? `${selectedUser.fname.charAt(
                          0
                        )}${selectedUser.lname.charAt(0)}`
                      : "?"}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {selectedUser
                      ? `${selectedUser.fname} ${selectedUser.lname}`
                      : selectedUserId}
                  </h3>
                  {selectedUser && (
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.position ||
                        (selectedUser.role && roleLabels[selectedUser.role]) ||
                        selectedUser.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-hidden">
              <UserChat userId={currentUserId} targetUserId={selectedUserId} />
            </div>
          </div>
        ) : (
          // Empty State (ยังไม่ได้เลือกแชท)
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">เลือกแชทเพื่อเริ่มการสนทนา</p>
              <p className="text-sm mt-2">
                หรือคลิก "เพิ่มผู้สนทนาใหม่" เพื่อเริ่มการสนทนาใหม่
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
