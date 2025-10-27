// src/components/auth/LogoutButton.tsx (ฉบับแก้ไข)
"use client"

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutButton = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // ▼▼▼ แก้ไข className ตรงนี้ ▼▼▼
        <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-slate-800 hover:text-white"
            onClick={handleLogout}
        >
            <LogOut className="mr-2 h-4 w-4" />
            <span>ออกจากระบบ</span>
        </Button>
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    );
};

export default LogoutButton;