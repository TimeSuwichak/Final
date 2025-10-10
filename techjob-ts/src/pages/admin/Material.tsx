// MaterialPage.tsx

import React, { useState, useMemo } from 'react';

// (1) กำหนด Type ของหมวดหมู่วัสดุ เพื่อให้เลือกใช้ได้สะดวกและไม่ผิดพลาด
type MaterialCategory = 'วัสดุโครงสร้าง' | 'วัสดุก่อและฉาบ' | 'วัสดุหลังคาและฝ้าเพดาน' | 'วัสดุประตูและหน้าต่าง' | 'วัสดุตกแต่งและพื้นผิว' | 'วัสดุงานระบบไฟฟ้า' | 'วัสดุงานระบบประปาและสุขาภิบาล' | 'เครื่องมือและวัสดุสิ้นเปลือง';

// (2) กำหนด Type (Interface) ของข้อมูลวัสดุแต่ละชิ้น
// เปรียบเสมือนพิมพ์เขียวข้อมูลว่าวัสดุ 1 ชิ้นต้องมีข้อมูลอะไรบ้าง
interface Material {
  id: number;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string; // หน่วยนับ เช่น ชิ้น, เมตร, ถุง, กล่อง
  lowStockThreshold: number; // จำนวนที่แจ้งเตือนว่าของใกล้หมด
}

// (3) สร้างข้อมูลวัสดุตัวอย่าง (Mock Data)
// ในสถานการณ์จริง ข้อมูลส่วนนี้จะมาจากฐานข้อมูลหรือ API
const sampleMaterials: Material[] = [
  { id: 1, name: 'ปูนซีเมนต์', category: 'วัสดุโครงสร้าง', quantity: 80, unit: 'ถุง', lowStockThreshold: 50 },
  { id: 2, name: 'อิฐมอญ', category: 'วัสดุก่อและฉาบ', quantity: 4500, unit: 'ก้อน', lowStockThreshold: 5000 },
  { id: 3, name: 'สายไฟ VAF 2x2.5', category: 'วัสดุงานระบบไฟฟ้า', quantity: 8, unit: 'ม้วน', lowStockThreshold: 10 },
  { id: 4, name: 'สีทาภายใน', category: 'วัสดุตกแต่งและพื้นผิว', quantity: 15, unit: 'ถัง', lowStockThreshold: 20 },
  { id: 5, name: 'สกรูเกลียวปล่อย 1 นิ้ว', category: 'เครื่องมือและวัสดุสิ้นเปลือง', quantity: 45, unit: 'กล่อง', lowStockThreshold: 50 },
  { id: 6, name: 'ท่อ PVC 4 หุน', category: 'วัสดุงานระบบประปาและสุขาภิบาล', quantity: 120, unit: 'เส้น', lowStockThreshold: 100 },
];

// (4) สร้าง Array ของหมวดหมู่ทั้งหมด เพื่อนำไปสร้างปุ่ม Filter
const categories: MaterialCategory[] = ['วัสดุโครงสร้าง', 'วัสดุก่อและฉาบ', 'วัสดุหลังคาและฝ้าเพดาน', 'วัสดุประตูและหน้าต่าง', 'วัสดุตกแต่งและพื้นผิว', 'วัสดุงานระบบไฟฟ้า', 'วัสดุงานระบบประปาและสุขาภิบาล', 'เครื่องมือและวัสดุสิ้นเปลือง'];


const MaterialPage = () => {

  // (5) สร้าง State สำหรับจัดการข้อมูลในหน้านี้
  // materials: เก็บรายการวัสดุทั้งหมด
  const [materials, setMaterials] = useState<Material[]>(sampleMaterials);
  // selectedCategory: เก็บหมวดหมู่ที่ผู้ใช้เลือกสำหรับกรองข้อมูล
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'ทั้งหมด'>('ทั้งหมด');
  
  // (6) สร้าง State สำหรับเก็บข้อมูลจากฟอร์ม "เพิ่มวัสดุ"
  // ใช้ object เดียวเพื่อจัดการ state ของฟอร์มทั้งหมดให้ง่ายขึ้น
  const [newMaterialForm, setNewMaterialForm] = useState({
      name: '',
      category: categories[0], // ตั้งค่าเริ่มต้นเป็นหมวดหมู่แรก
      quantity: '0',
      unit: '',
      lowStockThreshold: '10'
  });
  
  // (7) ฟังก์ชันสำหรับจัดการการเปลี่ยนแปลงข้อมูลในฟอร์ม
  // เมื่อผู้ใช้พิมพ์หรือเลือกข้อมูลในฟอร์ม มันจะอัปเดต state `newMaterialForm`
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setNewMaterialForm(prevState => ({
          ...prevState,
          [name]: value
      }));
  };
  
  // (8) ฟังก์ชันสำหรับเพิ่มวัสดุใหม่เมื่อกดปุ่ม "เพิ่ม"
  const handleAddMaterial = (e: React.FormEvent) => {
      e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บโหลดใหม่เมื่อกด submit form
      
      const newMaterial: Material = {
          id: Date.now(), // ใช้ timestamp ปัจจุบันเป็น ID ชั่วคราว (ในแอปจริงควรใช้ ID จากฐานข้อมูล)
          name: newMaterialForm.name,
          category: newMaterialForm.category as MaterialCategory,
          quantity: parseInt(newMaterialForm.quantity, 10), // แปลง string เป็น number
          unit: newMaterialForm.unit,
          lowStockThreshold: parseInt(newMaterialForm.lowStockThreshold, 10),
      };
      
      // เพิ่มวัสดุใหม่เข้าไปใน state `materials`
      setMaterials(prevMaterials => [...prevMaterials, newMaterial]);
      
      // ล้างค่าในฟอร์ม (ยังไม่ได้ทำในโค้ดนี้เพื่อให้ง่าย)
  };

  // (9) กรองข้อมูลวัสดุตามหมวดหมู่ที่เลือก
  // ใช้ useMemo เพื่อให้การกรองนี้ทำงานเมื่อ `materials` หรือ `selectedCategory` เปลี่ยนแปลงเท่านั้น
  // ช่วยเพิ่มประสิทธิภาพ (Performance) ไม่ให้ต้องกรองใหม่ทุกครั้งที่ re-render
  const filteredMaterials = useMemo(() => {
    if (selectedCategory === 'ทั้งหมด') {
      return materials;
    }
    return materials.filter(material => material.category === selectedCategory);
  }, [materials, selectedCategory]);


  return (
    <div className="p-4">
      <p className="text-center border p-2 text-xl font-bold mb-4">หน้าคลังวัสดุ</p>

      {/* === ส่วนฟอร์มสำหรับเพิ่มวัสดุ === */}
      <div className="border p-4 mb-4">
          <h2 className="text-lg font-bold mb-2">เพิ่มวัสดุใหม่</h2>
          <form onSubmit={handleAddMaterial} className="flex flex-wrap gap-4 items-end">
              <input name="name" onChange={handleFormChange} placeholder="ชื่อวัสดุ" className="border p-1"/>
              <select name="category" onChange={handleFormChange} className="border p-1">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input name="quantity" type="number" onChange={handleFormChange} placeholder="จำนวน" className="border p-1"/>
              <input name="unit" onChange={handleFormChange} placeholder="หน่วยนับ" className="border p-1"/>
              <input name="lowStockThreshold" type="number" onChange={handleFormChange} placeholder="จุดแจ้งเตือน" className="border p-1"/>
              <button type="submit" className="border px-4 py-1 bg-gray-200">เพิ่ม</button>
          </form>
      </div>
      
      {/* === ส่วนสำหรับ Filter หมวดหมู่ === */}
      <div className="mb-4">
        <p className="font-bold mb-2">เลือกหมวดหมู่:</p>
        <div className="flex flex-wrap gap-2">
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

      {/* === ส่วนตารางแสดงผล === */}
      <div className="border">
        <table className="w-full">
          {/* หัวตาราง */}
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2 text-left">ชื่อวัสดุ</th>
              <th className="p-2 text-left">หมวดหมู่</th>
              <th className="p-2 text-left">จำนวนคงเหลือ</th>
              <th className="p-2 text-left">หน่วยนับ</th>
              <th className="p-2 text-left">สถานะ</th>
            </tr>
          </thead>
          {/* เนื้อหาตาราง */}
          <tbody>
            {/* (10) วน Loop ข้อมูลที่ผ่านการกรองแล้วเพื่อสร้างแถวของตาราง */}
            {filteredMaterials.map(material => {
              
              // (11) ตรวจสอบเงื่อนไขว่าวัสดุใกล้หมดสต็อกหรือไม่
              const isLowStock = material.quantity <= material.lowStockThreshold;

              // (12) กำหนด class ให้กับแถวเมื่อของใกล้หมด เพื่อให้เห็นเด่นชัด
              const rowClass = isLowStock ? 'bg-red-100' : '';

              return (
                <tr key={material.id} className={`border-b ${rowClass}`}>
                  <td className="p-2">{material.name}</td>
                  <td className="p-2">{material.category}</td>
                  <td className="p-2">{material.quantity}</td>
                  <td className="p-2">{material.unit}</td>
                  <td className="p-2">
                    {/* (13) แสดงข้อความแจ้งเตือนในคอลัมน์ "สถานะ" */}
                    {isLowStock ? (
                      <span className="text-red-600 font-bold">ใกล้หมด</span>
                    ) : (
                      <span>ปกติ</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialPage;