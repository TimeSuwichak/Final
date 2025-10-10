// WorkOrdersPage.tsx

import React, { useState } from 'react';

// (1) กำหนด Type ของข้อมูลใบงานด้วย TypeScript Interface
// เพื่อให้ข้อมูลของเรามีโครงสร้างที่แน่นอนและป้องกันข้อผิดพลาด
interface WorkOrder {
  id: number;
  title: string;
  description: string;
  category: 'ซ่อมบำรุง' | 'ติดตั้ง' | 'ทั่วไป';
  imageUrl: string; // URL ของรูปภาพ
  fullDetails: string; // รายละเอียดฉบับเต็ม
}

// (2) สร้างข้อมูลใบงานตัวอย่างขึ้นมา
// ในสถานการณ์จริง ข้อมูลนี้อาจจะมาจาก API
const sampleWorkOrders: WorkOrder[] = [
  {
    id: 1,
    title: 'ซ่อมเครื่องปรับอากาศ',
    description: 'แอร์ไม่เย็นที่ห้องประชุม 1',
    category: 'ซ่อมบำรุง',
    imageUrl: 'https://pixorator.com/wp-content/uploads/2022/01/a5133aafa806da3cef7e432b785e2da3-jpg.webp', // รูปภาพตัวอย่าง
    fullDetails: 'รายละเอียดเต็มๆ ของการซ่อมเครื่องปรับอากาศ: แอร์มีเสียงดังและไม่ให้ความเย็น ตรวจสอบพบว่าคอมเพรสเซอร์ไม่ทำงาน'
  },
  {
    id: 2,
    title: 'ติดตั้งโปรเจคเตอร์',
    description: 'ติดตั้งโปรเจคเตอร์ใหม่ในห้องอบรม',
    category: 'ติดตั้ง',
    imageUrl: 'https://via.placeholder.com/150',
    fullDetails: 'รายละเอียดเต็มๆ ของการติดตั้งโปรเจคเตอร์: ติดตั้งโปรเจคเตอร์ยี่ห้อ ABC รุ่น XYZ พร้อมเดินสายไฟและสายสัญญาณ'
  },
  {
    id: 3,
    title: 'เปลี่ยนหลอดไฟ',
    description: 'หลอดไฟห้องโถงขาด',
    category: 'ซ่อมบำรุง',
    imageUrl: 'https://via.placeholder.com/150',
    fullDetails: 'รายละเอียดเต็มๆ ของการเปลี่ยนหลอดไฟ: เปลี่ยนหลอดไฟ LED T8 จำนวน 5 หลอดที่บริเวณห้องโถงกลาง'
  },
  {
    id: 4,
    title: 'ทำความสะอาดทั่วไป',
    description: 'ทำความสะอาดพื้นที่ส่วนกลาง',
    category: 'ทั่วไป',
    imageUrl: 'https://via.placeholder.com/150',
    fullDetails: 'รายละเอียดเต็มๆ ของการทำความสะอาด: ทำความสะอาดพื้น, เช็ดกระจก และทิ้งขยะในพื้นที่ส่วนกลางทั้งหมด'
  },
    {
    id: 5,
    title: 'ติดตั้งกล้องวงจรปิด',
    description: 'ติดตั้งกล้องเพิ่มเติมที่ทางเข้า',
    category: 'ติดตั้ง',
    imageUrl: 'https://via.placeholder.com/150',
    fullDetails: 'รายละเอียดเต็มๆ ของการติดตั้งกล้องวงจรปิด: ติดตั้งกล้องยี่ห้อ ZZZ เพิ่ม 2 ตัวบริเวณประตูทางเข้าหลัก'
  },
];

// (3) สร้างประเภทของหมวดหมู่ทั้งหมด เพื่อใช้สร้างปุ่มฟิลเตอร์
const categories: WorkOrder['category'][] = ['ซ่อมบำรุง', 'ติดตั้ง', 'ทั่วไป'];


const WorkOrdersPage = () => {
  // (4) สร้าง State เพื่อจัดการข้อมูลใน Component
  // selectedWorkOrder: เก็บใบงานที่ถูกเลือกเพื่อแสดงรายละเอียดฝั่งขวา
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  // selectedCategory: เก็บหมวดหมู่ที่ถูกเลือกเพื่อใช้กรอง (filter) รายการใบงาน
  const [selectedCategory, setSelectedCategory] = useState<WorkOrder['category'] | 'ทั้งหมด'>('ทั้งหมด');


  // (5) ฟังก์ชันสำหรับจัดการเมื่อมีการคลิกเลือกใบงาน
  // จะทำการอัปเดต state `selectedWorkOrder`
  const handleSelectWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
  };
  
  // (6) กรองรายการใบงานตามหมวดหมู่ที่เลือก
  // ถ้าเลือก 'ทั้งหมด' ให้แสดงทุกรายการ, มิฉะนั้นให้กรองตาม category
  const filteredWorkOrders = selectedCategory === 'ทั้งหมด'
    ? sampleWorkOrders
    : sampleWorkOrders.filter(order => order.category === selectedCategory);


  return (
    <div className="border h-screen"> {/* h-screen ทำให้ component สูงเต็มหน้าจอ */}
      <div>
        <p className="text-center border p-2">หน้าระบบใบงาน</p>
      </div>

      {/* (7) แบ่ง Layout เป็น 2 ส่วนด้วย Flexbox */}
      <div className="flex h-[calc(100vh-48px)]"> {/* คำนวณความสูงที่เหลือหลังจากหัก Header ออกไป */}
        
        {/* === ส่วนที่ 1: ฝั่งซ้าย (รายการใบงาน) === */}
        <div className="border w-1/3 flex flex-col"> {/* กำหนดความกว้าง 1/3 และใช้ flex-col เพื่อจัดเรียงแนวตั้ง */}
          
          {/* ส่วนของ Filter */}
          <div className="p-2 border-b">
            <p className="font-bold mb-2">หมวดหมู่</p>
            <div className="flex flex-wrap gap-2"> {/* gap-2 เพิ่มระยะห่างระหว่างปุ่ม */}
              <button onClick={() => setSelectedCategory('ทั้งหมด')} className="border px-2 py-1">
                ทั้งหมด
              </button>
              {categories.map(category => (
                <button key={category} onClick={() => setSelectedCategory(category)} className="border px-2 py-1">
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* ส่วนของรายการใบงาน (Scrollable) */}
          <div className="overflow-y-auto flex-grow"> {/* overflow-y-auto ทำให้เลื่อนได้เมื่อเนื้อหาเกิน และ flex-grow ทำให้ยืดเต็มพื้นที่ที่เหลือ */}
            <p className="p-2 font-bold border-b">ใบงานทั้งหมด</p>
            {filteredWorkOrders.map((workOrder) => (
              <div
                key={workOrder.id}
                className="flex items-center p-2 border-b cursor-pointer hover:bg-gray-100" // cursor-pointer และ hover effect
                onClick={() => handleSelectWorkOrder(workOrder)}
              >
                <img src={workOrder.imageUrl} alt={workOrder.title} className="w-16 h-16 mr-4" /> {/* รูปภาพเล็กๆ */}
                <div>
                  <p className="font-bold">{workOrder.title}</p>
                  <p className="text-sm text-gray-600">{workOrder.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === ส่วนที่ 2: ฝั่งขวา (รายละเอียด) === */}
        <div className="border w-2/3 p-4"> {/* กำหนดความกว้าง 2/3 และเพิ่ม padding */}
          <p className="font-bold text-lg mb-4">รายละเอียดใบงาน</p>
          {selectedWorkOrder ? (
            // (8) แสดงรายละเอียดถ้ามีใบงานถูกเลือก
            <div>
              <img src={selectedWorkOrder.imageUrl} alt={selectedWorkOrder.title} className="w-1/2 mb-4"/>
              <h2 className="text-xl font-bold mb-2">{selectedWorkOrder.title}</h2>
              <p className="text-md mb-1"><span className="font-semibold">หมวดหมู่:</span> {selectedWorkOrder.category}</p>
              <p className="text-md"><span className="font-semibold">รายละเอียด:</span> {selectedWorkOrder.fullDetails}</p>
            </div>
          ) : (
            // (9) แสดงข้อความถ้ายังไม่มีใบงานถูกเลือก
            <p>กรุณาเลือกใบงานจากรายการด้านซ้าย</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrdersPage;