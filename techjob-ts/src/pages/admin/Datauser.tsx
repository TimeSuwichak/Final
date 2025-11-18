// src/pages/Datauser.tsx (หรือ Path ที่คุณใช้งาน)
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FaImage } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ✨ Import useNavigate ✨
// ==========================================================
// ข้อมูล Mock Data (สมมติว่า import มาจากไฟล์อื่น)
// ==========================================================
import { user } from "@/Data/user"; // (ปรับ path ให้ตรงกับที่เก็บไฟล์)
import { leader } from "@/Data/leader"; // (ปรับ path ให้ตรงกับที่เก็บไฟล์)
import { executive } from "@/Data/executive";
import { admin } from "@/Data/admin";

// ==========================================================
// แปลพจนานุกรมแผนก (department mapping)
// ==========================================================
import { departmentMap } from "@/Data/departmentMapping"; // ✨ 1. Import พจนานุกรมเข้ามา
import { ScrollArea } from "@/components/ui/scroll-area";

// ==========================================================
// 1. เตรียมข้อมูลเริ่มต้น (ทำนอก Component)
// ==========================================================
const STORAGE_KEY = "techjob_personnel_data";

// ฟังก์ชันสำหรับโหลดข้อมูลจาก Local Storage
const loadPersonnelFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  return null;
};

// ฟังก์ชันสำหรับบันทึกข้อมูลลง Local Storage
const savePersonnelToStorage = (data: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event เพื่อแจ้งให้หน้าอื่นรู้ว่ามีการเปลี่ยนแปลง
    window.dispatchEvent(new Event("personnelDataChanged"));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

const allPersonnel = [...user, ...leader, ...executive, ...admin];
const initialFormattedPersonnel = allPersonnel.map((person, index) => {
  const fullName = `${person.fname} ${person.lname}`;
  const email = `${person.email}`;
  const iconProflie = `${person.avatarUrl}`;
  return {
    id: `${person.department.slice(0, 4)}-${person.id}-${index}`,
    originalId: person.id,
    name: fullName,
    email: email,
    position: person.position,
    department: person.department,
    urlImage: iconProflie,
    role: (person as any).role || "user",
    // เก็บข้อมูลเพิ่มเติมสำหรับแสดงในหน้า detail
    fname: person.fname,
    lname: person.lname,
    phone: person.phone,
    address: person.address,
    idCard: (person as any).idCard,
    startDate: (person as any).startDate,
    status: (person as any).status,
  };
});

const allDepartments = [
  ...new Set(initialFormattedPersonnel.map((p) => p.department)),
];

// สร้าง positionsByDepartment จากข้อมูลจริงใน mock data
const positionsByDepartment: { [key: string]: string[] } = {};
initialFormattedPersonnel.forEach((person) => {
  if (!positionsByDepartment[person.department]) {
    positionsByDepartment[person.department] = [];
  }
  if (!positionsByDepartment[person.department].includes(person.position)) {
    positionsByDepartment[person.department].push(person.position);
  }
});

// ==========================================================
// 2. COMPONENT: UserForm (สำหรับฟอร์มเพิ่ม/แก้ไข)
// ==========================================================
function UserForm({ initialData, onSubmit, onClose, allPersonnelData }) {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [religion, setReligion] = useState("");
  const [nationality, setNationality] = useState("");
  const [idCard, setIdCard] = useState("");
  const [startDate, setStartDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // สร้าง allDepartments และ positionsByDepartment จากข้อมูลจริง (รวมข้อมูลที่แก้ไขแล้ว)
  const allDepartmentsForForm = useMemo(() => {
    const departments = [...new Set(allPersonnelData.map((p) => p.department))] as string[];
    // ถ้ามี initialData และ department ของมันไม่อยู่ใน list ให้เพิ่มเข้าไปด้วย
    if (initialData?.department && !departments.includes(initialData.department)) {
      return [initialData.department, ...departments];
    }
    return departments;
  }, [allPersonnelData, initialData]);

  const positionsByDepartmentForForm = useMemo(() => {
    const positionsMap: { [key: string]: string[] } = {};
    allPersonnelData.forEach((person) => {
      if (!positionsMap[person.department]) {
        positionsMap[person.department] = [];
      }
      if (!positionsMap[person.department].includes(person.position)) {
        positionsMap[person.department].push(person.position);
      }
    });
    // ถ้ามี initialData ให้เพิ่ม position ของมันเข้าไปด้วย
    if (initialData?.department && initialData?.position) {
      if (!positionsMap[initialData.department]) {
        positionsMap[initialData.department] = [];
      }
      if (!positionsMap[initialData.department].includes(initialData.position)) {
        positionsMap[initialData.department].push(initialData.position);
      }
    }
    return positionsMap;
  }, [allPersonnelData, initialData]);

  useEffect(() => {
    if (initialData) {
      const [firstName, ...lastNameParts] = initialData.name.split(" ");
      setFname(firstName);
      setLname(lastNameParts.join(" "));
      setDepartment(initialData.department);
      setPosition(initialData.position);
      setImagePreview(initialData.urlImage);
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setReligion(initialData.religion || "");
      setNationality(initialData.nationality || "");
      setIdCard(initialData.idCard || "");
      setStartDate(initialData.startDate || "");
      setEmail(initialData.email || "");
      setPassword(""); // ไม่แสดงรหัสผ่านเดิมเพื่อความปลอดภัย
    } else {
      setFname("");
      setLname("");
      setDepartment("");
      setPosition("");
      setImagePreview(null);
      setPhone("");
      setAddress("");
      setReligion("");
      setNationality("");
      setIdCard("");
      setStartDate("");
      setEmail("");
      setPassword("");
    }
  }, [initialData]);

  const availablePositions = useMemo(() => {
    if (!department) return [];
    let positions = positionsByDepartmentForForm[department] || [];

    // ถ้ามี initialData และ department ตรงกัน ให้แน่ใจว่า position ของมันอยู่ใน list
    if (initialData && initialData.department === department && initialData.position) {
      if (!positions.includes(initialData.position)) {
        positions = [initialData.position, ...positions];
      }
    }

    return positions;
  }, [department, initialData, positionsByDepartmentForForm]);

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImagePreview(reader.result as null);
      };
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (!fname || !lname || !department || !position) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // ใช้ email จาก state หรือสร้างอัตโนมัติถ้าไม่มี
    let finalEmail = email;
    if (!finalEmail) {
      if (initialData?.id) {
        // ถ้าเป็นการแก้ไข ใช้ email เดิม หรือสร้างใหม่ถ้าไม่มี
        finalEmail = initialData.email || `${fname.toLowerCase()}.${lname.toLowerCase()}@techjob.com`;
      } else {
        // ถ้าเป็นการเพิ่มใหม่ สร้าง email ใหม่
        const timestamp = Date.now();
        finalEmail = `${fname.toLowerCase()}.${lname.toLowerCase()}.${timestamp}@techjob.com`;
      }
    }

    const finalUserData = {
      id: initialData?.id,
      originalId: initialData?.originalId,
      name: `${fname} ${lname}`,
      email: finalEmail,
      password: password || initialData?.password || "user1234", // ถ้าไม่กรอกรหัสผ่าน ใช้ default หรือรหัสเดิม
      department,
      position,
      urlImage: imagePreview || initialData?.urlImage || `https://api.dicebear.com/7.x/initials/svg?seed=${fname} ${lname}`,
      role: initialData?.role || "user",
      // เก็บข้อมูลเพิ่มเติม
      fname: fname,
      lname: lname,
      phone: phone,
      address: address,
      religion: religion,
      nationality: nationality,
      idCard: idCard,
      startDate: startDate,
      status: initialData?.status || "available",
    };
    onSubmit(finalUserData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        {/* 1. รูปโปรไฟล์ */}
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="picture" className="text-right pt-2">
            รูปโปรไฟล์
          </Label>
          <div className="col-span-3 flex items-center gap-4">
            <div className="w-24 h-24 border rounded-full flex items-center justify-center bg-muted/50 overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaImage className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <Label
              htmlFor="picture"
              className="cursor-pointer text-sm text-primary hover:underline"
            >
              เลือกรูปภาพ
            </Label>
          </div>
        </div>

        {/* 2. เลขบัตรประชาชน */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="idCard" className="text-right">
            บัตรประชาชน
          </Label>
          <Input
            id="idCard"
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            className="col-span-3"
            placeholder="เช่น 1101700202001"
          />
        </div>

        {/* 3. ชื่อจริง, นามสกุล (อยู่ในแนวเดียวกัน) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">ชื่อ-นามสกุล</Label>
          <div className="col-span-3 grid grid-cols-2 gap-4">
            <div>
              <Input
                id="fname"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                placeholder="ชื่อจริง"
              />
            </div>
            <div>
              <Input
                id="lname"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                placeholder="นามสกุล"
              />
            </div>
          </div>
        </div>

        {/* 4. สัญชาติ, ศาสนา (อยู่ในแนวเดียวกัน) */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">สัญชาติ-ศาสนา</Label>
          <div className="col-span-3 grid grid-cols-2 gap-4">
            <div>
              <Input
                id="nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="เช่น ไทย"
              />
            </div>
            <div>
              <Input
                id="religion"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                placeholder="เช่น พุทธ"
              />
            </div>
          </div>
        </div>

        {/* 5. ที่อยู่ */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="address" className="text-right">
            ที่อยู่
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="col-span-3"
            placeholder="ที่อยู่"
          />
        </div>

        {/* 6. เบอร์โทร */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            เบอร์โทรศัพท์
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="col-span-3"
            placeholder="เช่น 081-234-5678"
          />
        </div>

        {/* 7. วันที่เริ่มงาน */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="startDate" className="text-right">
            วันที่เริ่มงาน
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="col-span-3"
          />
        </div>

        {/* อีเมล */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            อีเมล
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="col-span-3"
            placeholder="เช่น user@techjob.com"
          />
        </div>

        {/* รหัสผ่าน */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            รหัสผ่าน
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="col-span-3"
            placeholder={initialData ? "เว้นว่างไว้เพื่อไม่เปลี่ยนรหัสผ่าน" : "เช่น user1234"}
          />
        </div>

        {/* แผนก */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">แผนก</Label>
          <Select
            key={`dept-${initialData?.id || 'new'}-${department}`}
            value={department || undefined}
            onValueChange={(value) => {
              setDepartment(value);
              // ถ้าเปลี่ยนแผนก ให้ตรวจสอบว่า position เดิมยังอยู่ในแผนกใหม่หรือไม่
              if (value !== department) {
                const newPositions = positionsByDepartmentForForm[value] || [];
                // ถ้า position เดิมไม่อยู่ในแผนกใหม่ หรือไม่มี position ให้ reset
                if (!position || !newPositions.includes(position)) {
                  setPosition("");
                }
              }
            }}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="เลือกแผนก..." />
            </SelectTrigger>
            <SelectContent>
              {allDepartmentsForForm.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {departmentMap[dept] || dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ตำแหน่ง */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">ตำแหน่ง</Label>
          <Select
            key={`pos-${initialData?.id || 'new'}-${department}-${position}`}
            value={position || undefined}
            onValueChange={setPosition}
            disabled={!department}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="เลือกตำแหน่ง..." />
            </SelectTrigger>
            <SelectContent>
              {availablePositions.length > 0 ? (
                availablePositions.map((pos: any) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  ไม่มีตำแหน่งในแผนกนี้
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button type="submit">บันทึกข้อมูล</Button>
      </DialogFooter>
    </form>
  );
}

// ==========================================================
// 3. COMPONENT หลัก: Datauser
// ==========================================================
export default function Datauser() {
  // โหลดข้อมูลจาก Local Storage หรือใช้ข้อมูลเริ่มต้น
  const [personnelData, setPersonnelData] = useState(() => {
    const storedData = loadPersonnelFromStorage();
    if (storedData && storedData.length > 0) {
      return storedData;
    }
    return initialFormattedPersonnel;
  });

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("ทั้งหมด");
  const [filterPosition, setFilterPosition] = useState("ทั้งหมด");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const pageSize = 10;

  // บันทึกข้อมูลลง Local Storage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    savePersonnelToStorage(personnelData);
  }, [personnelData]);

  const availablePositionsForFilter = useMemo(() => {
    if (filterDepartment === "ทั้งหมด")
      return [...new Set(personnelData.map((p) => p.position))] as string[];
    return [
      ...new Set(
        personnelData
          .filter((p) => p.department === filterDepartment)
          .map((p) => p.position)
      ),
    ] as string[];
  }, [filterDepartment, personnelData]);

  const filteredData = useMemo(() => {
    return personnelData.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase());
      const matchDepartment =
        filterDepartment === "ทั้งหมด" || item.department === filterDepartment;
      const matchPosition =
        filterPosition === "ทั้งหมด" || item.position === filterPosition;
      return matchQuery && matchDepartment && matchPosition;
    });
  }, [query, filterDepartment, filterPosition, personnelData]);

  const handleAddUser = (newUserData: any) => {
    const newUser = {
      ...newUserData,
      id: `NEW-${Date.now()}`,
      originalId: Date.now(), // สร้าง originalId สำหรับ user ใหม่
      // เก็บข้อมูลเพิ่มเติมตาม mock data
      fname: newUserData.fname || newUserData.name?.split(" ")[0] || "",
      lname: newUserData.lname || newUserData.name?.split(" ").slice(1).join(" ") || "",
      phone: newUserData.phone || "",
      address: newUserData.address || "",
      religion: newUserData.religion || "",
      nationality: newUserData.nationality || "",
      idCard: newUserData.idCard || "",
      startDate: newUserData.startDate || "",
      status: "available", // ตั้งเป็น default "available" เสมอ
      role: newUserData.role || "user",
    };
    setPersonnelData((prev) => {
      const updated = [...prev, newUser];
      // บันทึกทันที
      savePersonnelToStorage(updated);
      return updated;
    });
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = (updatedUserData: any) => {
    setPersonnelData((prev) => {
      const updated = prev.map((user) =>
        user.id === updatedUserData.id
          ? {
            ...user,
            ...updatedUserData,
            // เก็บข้อมูลเพิ่มเติม
            fname: updatedUserData.fname || user.fname || updatedUserData.name?.split(" ")[0] || "",
            lname: updatedUserData.lname || user.lname || updatedUserData.name?.split(" ").slice(1).join(" ") || "",
            phone: updatedUserData.phone !== undefined ? updatedUserData.phone : user.phone,
            address: updatedUserData.address !== undefined ? updatedUserData.address : user.address,
            religion: updatedUserData.religion !== undefined ? updatedUserData.religion : user.religion,
            nationality: updatedUserData.nationality !== undefined ? updatedUserData.nationality : user.nationality,
            idCard: updatedUserData.idCard !== undefined ? updatedUserData.idCard : user.idCard,
            startDate: updatedUserData.startDate !== undefined ? updatedUserData.startDate : user.startDate,
            // อัปเดต email ถ้ามีการเปลี่ยนแปลง
            email: updatedUserData.email !== undefined ? updatedUserData.email : user.email,
            // อัปเดต password เฉพาะเมื่อมีการกรอกใหม่ (ถ้าไม่กรอกจะเก็บรหัสเดิม)
            password: updatedUserData.password && updatedUserData.password !== "" ? updatedUserData.password : user.password,
            // เก็บ status เดิมไว้ ไม่ให้เปลี่ยน
            status: user.status,
          }
          : user
      );
      // บันทึกทันที
      savePersonnelToStorage(updated);
      return updated;
    });
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: any) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?")) {
      setPersonnelData((prev) => {
        const updated = prev.filter((user) => user.id !== userId);
        // บันทึกทันที
        savePersonnelToStorage(updated);
        return updated;
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pagedData = filteredData.slice(startIndex, startIndex + pageSize);
  // Simple client-side navigate helper to avoid depending on react-router in this file
  const navigate = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="w-full `max-w-screen-xl` mx-auto space-y-4 p-4 md:p-6 overflow-x-hidden">
      {/* ✅ ส่วนค้นหา / ฟิลเตอร์ */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ หรือ อีเมล..."
            className="pl-8 w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <Select
            value={filterDepartment}
            onValueChange={(v) => {
              setFilterDepartment(v);
              setFilterPosition("ทั้งหมด");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="เลือกแผนก" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">แผนก (ทั้งหมด)</SelectItem>
              {Object.keys(departmentMap).map((key) => (
                <SelectItem key={key} value={key}>
                  {departmentMap[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterPosition}
            onValueChange={(v) => {
              setFilterPosition(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-60">
              <SelectValue placeholder="เลือกตำแหน่ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ทั้งหมด">
                {filterDepartment === "ทั้งหมด"
                  ? "ตำแหน่ง (ทั้งหมด)"
                  : `ตำแหน่ง (${departmentMap[filterDepartment]})`}
              </SelectItem>
              {availablePositionsForFilter.map((pos) => (
                <SelectItem key={pos} value={pos}>
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={() => {
              setEditingUser(null);
              setIsDialogOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            เพิ่มผู้ใช้
          </Button>
        </div>
      </div>

      {/* ✅ ตาราง / รายการ */}
      <div className="rounded-xl border shadow-sm w-full overflow-hidden">
        {/* 📱 Mobile View */}
        <div className="flex flex-col gap-3 md:hidden p-2">
          {pagedData.length > 0 ? (
            pagedData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg p-3 shadow-sm border"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <img
                    src={item.urlImage}
                    className="w-8 h-8 rounded-full object-cover bg-muted"
                    alt={item.name}
                  />
                  <div className="overflow-hidden min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {item.email}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground truncate">
                      {item.position}
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground truncate">
                      {departmentMap[item.department] || item.department}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-1 shrink-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/admin/user-detail/${item.originalId}`)
                      }
                    >
                      ดูรายละเอียด
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingUser(item);
                        setIsDialogOpen(true);
                      }}
                    >
                      แก้ไข
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteUser(item.id)}
                    >
                      ลบ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-6">
              ไม่พบข้อมูล
            </div>
          )}
        </div>

        {/* 💻 Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="w-full min-w-full table-auto border-collapse">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[280px]">ชื่อ</TableHead>
                <TableHead>อีเมล</TableHead>
                <TableHead className="w-[280px]">แผนก</TableHead>
                <TableHead className="w-[280px]">บทบาท</TableHead>
                <TableHead className="text-right w-20">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedData.length > 0 ? (
                pagedData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.urlImage}
                          className="w-8 h-8 rounded-full object-cover bg-muted"
                          alt={item.name}
                        />
                        <span className="font-medium truncate">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-0 truncate">{item.email}</TableCell>
                    <TableCell className="min-w-0 truncate">
                      {departmentMap[item.department] || item.department}
                    </TableCell>
                    <TableCell className="min-w-0 truncate">{item.role}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/user-detail/${item.originalId}`)
                            }
                          >
                            ดูรายละเอียด
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingUser(item);
                              setIsDialogOpen(true);
                            }}
                          >
                            แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteUser(item.id)}
                          >
                            ลบ
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    ไม่พบข้อมูล
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagedData.length > 0 && (
        <PaginationDemo page={page} setPage={setPage} totalPages={totalPages} />
      )}

      {/* Dialog */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingUser(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              initialData={editingUser}
              onSubmit={editingUser ? handleUpdateUser : handleAddUser}
              onClose={() => {
                setIsDialogOpen(false);
                setEditingUser(null);
              }}
              allPersonnelData={personnelData}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );

}

function PaginationDemo({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}) {
  // Logic to create pagination items can be complex, this is a simplified version\

  const pageNumbers: number[] = [];
  // This logic can be improved to show ellipsis `...` for many pages
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.max(1, page - 1));
            }}
          />
        </PaginationItem>
        {pageNumbers.map((number) => (
          <PaginationItem key={number}>
            <PaginationLink
              href="#"
              isActive={page === number}
              onClick={(e) => {
                e.preventDefault();
                setPage(number);
              }}
            >
              {number}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(Math.min(totalPages, page + 1));
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
