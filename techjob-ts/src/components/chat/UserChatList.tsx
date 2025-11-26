"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { user as userData } from "@/Data/user";
import { leader as leaderData } from "@/Data/leader";
import { admin as adminData } from "@/Data/admin";
import { executive as executiveData } from "@/Data/executive";

interface Chat {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastSender?: string;
    updatedAt: any;
}

interface UserChatListProps {
    currentUserId: string;
    onSelectChat: (otherUserId: string) => void;
    selectedUserId?: string;
}

export default function UserChatList({ currentUserId, onSelectChat, selectedUserId }: UserChatListProps) {
    const [chats, setChats] = useState<Chat[]>([]);

    // รวมผู้ใช้ทั้งหมด
    const allUsers = [
        ...userData.map((u) => ({ ...u, id: String(u.id) })),
        ...leaderData.map((u) => ({ ...u, id: String(u.id) })),
        ...adminData.map((u) => ({ ...u, id: String(u.id) })),
        ...executiveData.map((u) => ({ ...u, id: String(u.id) })),
    ];

    useEffect(() => {
        if (!currentUserId) return;

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", String(currentUserId))
        );

        const unsub = onSnapshot(q, (snap) => {
            const chatList: Chat[] = snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as Omit<Chat, "id">),
            }));

            // Sort in memory to avoid missing index issues
            chatList.sort((a, b) => {
                const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt || 0);
                const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt || 0);
                return timeB - timeA;
            });

            setChats(chatList);
        });

        return () => unsub();
    }, [currentUserId]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            <div className="p-4 border-b dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">ข้อความ</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                        ไม่มีแชท
                    </div>
                ) : (
                    chats.map((chat) => {
                        // หาคนที่คุยด้วย (คนที่ไม่ใช่ currentUserId)
                        const otherUserId = chat.participants.find((p) => p !== String(currentUserId));
                        if (!otherUserId) return null;

                        const otherUser = allUsers.find((u) => String(u.id) === otherUserId);
                        const displayName = otherUser
                            ? `${otherUser.fname} ${otherUser.lname}`
                            : otherUserId;

                        // Use avatarUrl from user data or fallback
                        const avatarUrl = otherUser?.avatarUrl;

                        const isSelected = selectedUserId === otherUserId;

                        return (
                            <div
                                key={chat.id}
                                onClick={() => onSelectChat(otherUserId)}
                                className={`
                  p-4 border-b dark:border-slate-800 cursor-pointer
                  hover:bg-slate-50 dark:hover:bg-slate-900
                  transition-colors
                  ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback if image fails to load
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-sm ${avatarUrl ? 'hidden' : ''}`}>
                                            {displayName.charAt(0)}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">
                                            {displayName}
                                        </p>
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
        </div>
    );
}
