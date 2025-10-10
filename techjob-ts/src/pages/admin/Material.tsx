// MaterialPage.tsx

import React, { useState, useMemo, useEffect, useRef } from 'react';

// (1) กำหนด Type ของหมวดหมู่วัสดุ เพิ่ม 'วัสดุอื่นๆ' สำหรับของที่ผู้ใช้เพิ่มเอง
type MaterialCategory = 'วัสดุโครงสร้าง' | 'วัสดุก่อและฉาบ' | 'วัสดุหลังคาและฝ้าเพดาน' | 'วัสดุประตูและหน้าต่าง' | 'วัสดุตกแต่งและพื้นผิว' | 'วัสดุงานระบบไฟฟ้า' | 'วัสดุงานระบบประปาและสุขาภิบาล' | 'เครื่องมือและวัสดุสิ้นเปลือง' | 'วัสดุอื่นๆ';

// (2) Interface ของ Material ยังคงเหมือนเดิม
interface Material {
  id: number;
  name: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}

// (3) *** ใหม่: สร้างรายการวัสดุที่กำหนดไว้ล่วงหน้าตามแต่ละหมวดหมู่ ***
// นี่คือฐานข้อมูลความรู้ของแอปเรา ทำให้ผู้ใช้เลือกจากรายการได้เลย
const predefinedMaterials: Record<Exclude<MaterialCategory, 'วัสดุอื่นๆ'>, string[]> = {
    'วัสดุโครงสร้าง': ['ปูนซีเมนต์ TPI (แดง)', 'ทรายหยาบ', 'หินคลุก', 'เหล็กเส้น DB12', 'เหล็กกล่อง 4x2 นิ้ว'],
    'วัสดุก่อและฉาบ': ['อิฐมอญ', 'อิฐมวลเบา G4', 'ปูนก่อสำเร็จ', 'ปูนฉาบสำเร็จ'],
    'วัสดุหลังคาและฝ้าเพดาน': ['กระเบื้องลอนคู่', 'แผ่นเมทัลชีท', 'ฉนวนกันความร้อน Stay Cool', 'แผ่นยิปซัม 9มม.', 'โครงซีลายน์'],
    'วัสดุประตูและหน้าต่าง': ['วงกบไม้สังเคราะห์', 'บานประตู HDF', 'หน้าต่างอลูมิเนียมสำเร็จรูป', 'ลูกบิดประตู', 'บานพับ'],
    'วัสดุตกแต่งและพื้นผิว': ['สีทาภายใน TOA', 'สีทาภายนอก Jotun', 'กระเบื้องแกรนิตโต้ 60x60', 'กาวซีเมนต์ (ปูกระเบื้อง)', 'ยาแนว'],
    'วัสดุงานระบบไฟฟ้า': ['สายไฟ VAF 2x2.5', 'ท่อร้อยสายไฟ PVC (เหลือง)', 'สวิตช์ไฟ', 'ปลั๊กไฟ', 'ตู้คอนซูมเมอร์'],
    'วัสดุงานระบบประปาและสุขาภิบาล': ['ท่อ PVC 4 หุน (ฟ้า)', 'ก๊อกน้ำ', 'ข้องอ 90 องศา', 'สามทาง', 'โถสุขภัณฑ์'],
    'เครื่องมือและวัสดุสิ้นเปลือง': ['สกรูเกลียวปล่อย 1 นิ้ว', 'ตะปู', 'ใบตัดเหล็ก 4 นิ้ว', 'ถุงมือผ้า', 'แปรงทาสี'],
};

// (4) สร้าง Array ของหมวดหมู่ทั้งหมดสำหรับใช้ใน Dropdown
const categories = Object.keys(predefinedMaterials) as Exclude<MaterialCategory, 'วัสดุอื่นๆ'>[];

// ข้อมูลเริ่มต้นบางส่วน
const initialMaterials: Material[] = [
  { id: 1, name: 'ปูนซีเมนต์ TPI (แดง)', category: 'วัสดุโครงสร้าง', quantity: 80, unit: 'ถุง', lowStockThreshold: 50 },
  { id: 2, name: 'อิฐมอญ', category: 'วัสดุก่อและฉาบ', quantity: 4500, unit: 'ก้อน', lowStockThreshold: 5000 },
  { id: 3, name: 'สายไฟ VAF 2x2.5', category: 'วัสดุงานระบบไฟฟ้า', quantity: 8, unit: 'ม้วน', lowStockThreshold: 10 },
  { id: 4, name: 'สีทาภายใน TOA', category: 'วัสดุตกแต่งและพื้นผิว', quantity: 15, unit: 'ถัง', lowStockThreshold: 20 },
];

const MaterialPage = () => {
  // (5) State จัดการข้อมูลหลัก และการกรอง
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<MaterialCategory | 'ทั้งหมด'>('ทั้งหมด');
  
  // (6) *** ใหม่: State ที่ซับซ้อนขึ้นสำหรับจัดการฟอร์มเพิ่มวัสดุ ***
  const [formCategory, setFormCategory] = useState<Exclude<MaterialCategory, 'วัสดุอื่นๆ'>>(categories[0]);
  const [formMaterialName, setFormMaterialName] = useState<string>(predefinedMaterials[categories[0]][0]);
  const [customMaterialName, setCustomMaterialName] = useState('');
  const [formQuantity, setFormQuantity] = useState('10');
  const [formUnit, setFormUnit] = useState('ชิ้น');
  const [formThreshold, setFormThreshold] = useState('5');
  
  // (7) *** ใหม่: State สำหรับระบบจำลอง ***
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2000); // ms (2 วินาที)
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null); // useRef สำหรับเก็บ ID ของ interval

  // (8) ฟังก์ชันสำหรับเพิ่มวัสดุใหม่ (ปรับปรุงให้รองรับทั้งแบบเลือกและแบบกำหนดเอง)
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ตรวจสอบว่ากำลังเพิ่มวัสดุแบบกำหนดเองหรือไม่
    const isCustom = formMaterialName === 'CUSTOM';
    const name = isCustom ? customMaterialName : formMaterialName;
    const category = isCustom ? 'วัสดุอื่นๆ' : formCategory;

    if (!name.trim()) {
        alert("กรุณากรอกชื่อวัสดุ");
        return;
    }

    const newMaterial: Material = {
      id: Date.now(),
      name,
      category,
      quantity: parseInt(formQuantity, 10) || 0,
      unit: formUnit,
      lowStockThreshold: parseInt(formThreshold, 10) || 0,
    };
    
    setMaterials(prev => [...prev, newMaterial]);
  };

  // (9) *** ใหม่: ฟังก์ชันสำหรับกดปุ่ม "เบิก/สั่งซื้อ" ***
  // ในที่นี้จะทำการจำลองการเติมสต็อกให้เต็ม
  const handleRestockMaterial = (materialId: number) => {
    setMaterials(prevMaterials =>
      prevMaterials.map(material =>
        material.id === materialId
          ? { ...material, quantity: material.lowStockThreshold + 50 } // เติมของให้มากกว่าจุดแจ้งเตือน 50 หน่วย
          : material
      )
    );
  };
  
  // (10) *** ใหม่: Logic ของระบบจำลองการใช้สต็อกด้วย useEffect ***
  useEffect(() => {
    // ถ้า isSimulationRunning เป็น false ให้เคลียร์ interval แล้วหยุดการทำงาน
    if (!isSimulationRunning) {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      return;
    }

    // ถ้า isSimulationRunning เป็น true ให้สร้าง interval ขึ้นมา
    simulationIntervalRef.current = setInterval(() => {
      setMaterials(prev => {
        if (prev.length === 0) return [];
        // สุ่ม index ของวัสดุที่จะลดจำนวน
        const randomIndex = Math.floor(Math.random() * prev.length);
        // สุ่มจำนวนที่จะลด (1-5 หน่วย)
        const amountToDecrease = Math.floor(Math.random() * 5) + 1;

        return prev.map((material, index) => {
          if (index === randomIndex) {
            const newQuantity = Math.max(0, material.quantity - amountToDecrease); // ไม่ให้ติดลบ
            return { ...material, quantity: newQuantity };
          }
          return material;
        });
      });
    }, simulationSpeed);

    // *** Cleanup Function: ส่วนที่สำคัญมาก ***
    // ฟังก์ชันนี้จะถูกเรียกเมื่อ component ถูก unmount หรือเมื่อ dependencies (isSimulationRunning, simulationSpeed) เปลี่ยนไป
    // เพื่อป้องกัน memory leak จาก interval ที่ทำงานค้างอยู่
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, [isSimulationRunning, simulationSpeed]);


  // (11) กรองข้อมูลสำหรับแสดงในตาราง (เหมือนเดิม)
  const filteredMaterials = useMemo(() => {
    if (selectedCategoryFilter === 'ทั้งหมด') return materials;
    return materials.filter(m => m.category === selectedCategoryFilter);
  }, [materials, selectedCategoryFilter]);
  
  // (12) *** ใหม่: รายการวัสดุใน Dropdown จะเปลี่ยนตามหมวดหมู่ที่เลือกในฟอร์ม ***
  const materialOptions = useMemo(() => {
      return predefinedMaterials[formCategory] || [];
  }, [formCategory]);

  return (
    <div className="p-4">
      <p className="text-center border p-2 text-xl font-bold mb-4">หน้าคลังวัสดุ (เวอร์ชันปรับปรุง)</p>

      {/* === ส่วนฟอร์มสำหรับเพิ่มวัสดุ (ปรับปรุงใหม่) === */}
      <div className="border p-4 mb-4">
          <h2 className="text-lg font-bold mb-2">เพิ่มวัสดุใหม่</h2>
          <form onSubmit={handleAddMaterial} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
              {/* เลือกหมวดหมู่ */}
              <div>
                  <label className="block text-sm font-medium">หมวดหมู่</label>
                  <select value={formCategory} onChange={e => {
                      setFormCategory(e.target.value as Exclude<MaterialCategory, 'วัสดุอื่นๆ'>);
                      setFormMaterialName(predefinedMaterials[e.target.value as keyof typeof predefinedMaterials][0]); // ตั้งค่า default ของวัสดุ
                  }} className="border p-1 w-full">
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
              </div>

              {/* เลือกชื่อวัสดุ (หรือกำหนดเอง) */}
              <div>
                  <label className="block text-sm font-medium">ชื่อวัสดุ</label>
                  <select value={formMaterialName} onChange={e => setFormMaterialName(e.target.value)} className="border p-1 w-full">
                      {materialOptions.map(name => <option key={name} value={name}>{name}</option>)}
                      <option value="CUSTOM">-- เพิ่มวัสดุอื่น ๆ --</option>
                  </select>
              </div>
              
              {/* ช่องกรอกชื่อวัสดุเอง (จะแสดงเมื่อเลือก 'เพิ่มวัสดุอื่นๆ') */}
              {formMaterialName === 'CUSTOM' && (
                  <div>
                      <label className="block text-sm font-medium">ระบุชื่อวัสดุเอง</label>
                      <input value={customMaterialName} onChange={e => setCustomMaterialName(e.target.value)} placeholder="เช่น 'กระเบื้องลายหินอ่อน'" className="border p-1 w-full"/>
                  </div>
              )}
              
              {/* กรอกจำนวน, หน่วย, และจุดแจ้งเตือน */}
              <input value={formQuantity} onChange={e => setFormQuantity(e.target.value)} type="number" placeholder="จำนวน" className="border p-1"/>
              <input value={formUnit} onChange={e => setFormUnit(e.target.value)} placeholder="หน่วยนับ" className="border p-1"/>
              <input value={formThreshold} onChange={e => setFormThreshold(e.target.value)} type="number" placeholder="จุดแจ้งเตือน" className="border p-1"/>

              <button type="submit" className="border px-4 py-1 bg-gray-200 hover:bg-gray-300 col-span-full md:col-span-1">เพิ่ม</button>
          </form>
      </div>
      
      {/* === ส่วนควบคุมระบบจำลอง *** */}
      <div className="border p-4 mb-4">
        <h3 className="text-md font-bold mb-2">ระบบจำลองการเบิกจ่ายวัสดุ</h3>
        <div className="flex items-center gap-4">
            <button onClick={() => setIsSimulationRunning(prev => !prev)} className="border px-4 py-1 bg-blue-100">
                {isSimulationRunning ? 'หยุดจำลอง' : 'เริ่มจำลอง'}
            </button>
            <div>
                <label>ความเร็ว: </label>
                <select value={simulationSpeed} onChange={e => setSimulationSpeed(Number(e.target.value))} className="border p-1">
                    <option value={3000}>ช้า (3 วินาที)</option>
                    <option value={2000}>ปกติ (2 วินาที)</option>
                    <option value={500}>เร็ว (0.5 วินาที)</option>
                </select>
            </div>
            <p>สถานะ: {isSimulationRunning ? 'ทำงาน' : 'หยุด'}</p>
        </div>
      </div>

      {/* === Filter (ใช้หมวดหมู่ทั้งหมดรวมถึง 'วัสดุอื่นๆ') === */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setSelectedCategoryFilter('ทั้งหมด')} className="border px-2 py-1">ทั้งหมด</button>
        {[...categories, 'วัสดุอื่นๆ'].map(cat => <button key={cat} onClick={() => setSelectedCategoryFilter(cat)} className="border px-2 py-1">{cat}</button>)}
      </div>

      {/* === ตารางแสดงผล (ปรับปรุงเรื่องสีและปุ่ม) === */}
      <div className="border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50"> {/* ใช้สีจาก shadcn theme: muted */}
              <th className="p-2 text-left">ชื่อวัสดุ</th>
              <th className="p-2 text-left">หมวดหมู่</th>
              <th className="p-2 text-left">จำนวนคงเหลือ</th>
              <th className="p-2 text-left">สถานะ</th>
              <th className="p-2 text-left">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map(material => {
              const isLowStock = material.quantity <= material.lowStockThreshold;
              // *** ใหม่: ใช้ class ที่อิงกับ theme ของ shadcn ***
              // bg-destructive/10 คือสีแดงโปร่งแสง 10%, text-destructive คือสีตัวอักษรแดง
              const rowClass = isLowStock ? 'bg-destructive/10' : '';

              return (
                <tr key={material.id} className={`border-b ${rowClass}`}>
                  <td className="p-2">{material.name}</td>
                  <td className="p-2">{material.category}</td>
                  <td className="p-2">{material.quantity} {material.unit}</td>
                  <td className="p-2">
                    {isLowStock ? (
                      <span className="font-bold text-destructive">ใกล้หมด</span>
                    ) : (
                      <span className="text-green-600">ปกติ</span>
                    )}
                  </td>
                  <td className="p-2">
                    {isLowStock && (
                      <button onClick={() => handleRestockMaterial(material.id)} className="border px-2 py-1 text-sm bg-blue-500 text-white">
                        เบิก/สั่งซื้อ
                      </button>
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