import React, { useState } from 'react';
import { Package, Bell, TrendingDown, Layers, Search, Plus, MinusCircle } from 'lucide-react';

// ===============================================
// 1. TypeScript Interfaces
// ===============================================

/**
 * Interface สำหรับโครงสร้างข้อมูลของวัสดุแต่ละรายการ
 */
interface Material {
    id: string;
    name: string;
    category: 'Electrical' | 'Plumbing' | 'HVAC' | 'General';
    stock: number; // จำนวนคงคลังปัจจุบัน
    minStock: number; // ระดับต่ำสุดที่ต้องแจ้งเตือน
    unit: string;
}

/**
 * Interface สำหรับ Props ของ MaterialRow
 */
interface MaterialRowProps {
    material: Material;
    onWithdraw: (materialId: string) => void;
}

// ===============================================
// 2. Mock Data
// ===============================================

const initialMaterials: Material[] = [
    { id: 'M001', name: 'สายไฟ THW 1.5 sq.mm.', category: 'Electrical', stock: 150, minStock: 50, unit: 'เมตร' },
    { id: 'M002', name: 'ท่อ PVC 4 นิ้ว', category: 'Plumbing', stock: 3, minStock: 5, unit: 'เส้น' }, // ใกล้หมด
    { id: 'M003', name: 'น้ำยาแอร์ R32', category: 'HVAC', stock: 12, minStock: 10, unit: 'กระป๋อง' },
    { id: 'M004', name: 'ตะปูเกลียว 2 นิ้ว', category: 'General', stock: 900, minStock: 1000, unit: 'ตัว' }, // ใกล้หมด
    { id: 'M005', name: 'เทปพันเกลียว', category: 'Plumbing', stock: 85, minStock: 30, unit: 'ม้วน' },
];

// ===============================================
// 3. Components
// ===============================================

// Component แถวของตารางวัสดุ
const MaterialRow: React.FC<MaterialRowProps> = ({ material, onWithdraw }) => {
    // Logic: ตรวจสอบว่าวัสดุใกล้หมดหรือไม่
    const isLowStock = material.stock < material.minStock;

    // กำหนดสีตามประเภทวัสดุ
    const categoryColors = {
        'Electrical': 'bg-yellow-500',
        'Plumbing': 'bg-blue-500',
        'HVAC': 'bg-green-500',
        'General': 'bg-gray-500',
    };

    return (
        <tr className="border-b border-neutral-700 hover:bg-neutral-800 transition duration-150">
            <td className="px-6 py-4 text-sm font-medium">{material.id}</td>
            <td className="px-6 py-4 text-sm">{material.name}</td>
            <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${categoryColors[material.category]} text-white`}>
                    {material.category}
                </span>
            </td>
            <td className={`px-6 py-4 text-sm font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                {material.stock.toLocaleString()} {material.unit}
            </td>
            <td className="px-6 py-4">
                {isLowStock ? (
                    <span className="flex items-center text-xs font-semibold text-red-500 bg-red-900/50 p-1 rounded-full border border-red-500">
                        <Bell size={14} className="mr-1 animate-pulse" />
                        ใกล้หมด!
                    </span>
                ) : (
                    <span className="text-xs font-medium text-green-400">ปกติ</span>
                )}
            </td>
            <td className="px-6 py-4 text-right text-sm font-medium">
                <button
                    onClick={() => onWithdraw(material.id)}
                    className="flex items-center justify-center bg-[#5F5AFF] hover:bg-[#4b48c7] text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md shadow-[#5F5AFF]/40"
                >
                    <TrendingDown size={16} className="mr-2" />
                    เบิกของ
                </button>
            </td>
        </tr>
    );
};

// Component สรุปข้อมูล (Card)
interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className="flex-1 min-w-[250px] bg-neutral-900 p-6 rounded-xl border border-neutral-800 shadow-lg flex items-center justify-between">
        <div>
            <p className="text-neutral-400 text-sm">{title}</p>
            <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
            {React.cloneElement(icon as React.ReactElement, { size: 28, className: color.replace('bg-', 'text-') })}
        </div>
    </div>
);

// ===============================================
// 4. Main Component: MaterialPage
// ===============================================

const MaterialPage: React.FC = () => {
    const [materials, setMaterials] = useState<Material[]>(initialMaterials);
    const [searchTerm, setSearchTerm] = useState('');

    const lowStockItems = materials.filter(m => m.stock < m.minStock);
    const totalUniqueItems = materials.length;
    const totalQuantity = materials.reduce((sum, m) => sum + m.stock, 0);

    const handleWithdraw = (materialId: string) => {
        // ในโปรเจกต์จริงต้องมีการเปิด Modal เพื่อระบุจำนวนที่ต้องการเบิก
        // และอัพเดตข้อมูลผ่าน API หรือ Firestore
        console.log(`ดำเนินการเบิกวัสดุ ID: ${materialId}`);
        // ตัวอย่าง: ลดจำนวนคงคลังของวัสดุนั้นลง 10 หน่วย
        setMaterials(prev => prev.map(m =>
            m.id === materialId
                ? { ...m, stock: Math.max(0, m.stock - 10) } // ป้องกันไม่ให้สต็อกติดลบ
                : m
        ));
    };

    const filteredMaterials = materials.filter(material =>
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 min-h-screen bg-black text-white">
            <h2 className="text-3xl font-extrabold mb-2">ระบบคลังวัสดุ (Inventory)</h2>
            <p className="text-neutral-400 mb-10">ภาพรวมสถานะวัสดุคงคลังและการแจ้งเตือนเมื่อใกล้หมด</p>

            {/* Statistics Cards */}
            <div className="flex flex-wrap gap-6 mb-12">
                <StatCard
                    title="จำนวนวัสดุทั้งหมด (SKU)"
                    value={totalUniqueItems.toLocaleString()}
                    icon={<Layers />}
                    color="text-[#5F5AFF] bg-[#5F5AFF]"
                />
                <StatCard
                    title="รวมจำนวนหน่วยคงคลัง"
                    value={totalQuantity.toLocaleString()}
                    icon={<Package />}
                    color="text-yellow-500 bg-yellow-500"
                />
                <StatCard
                    title="รายการที่ใกล้หมด (Alert)"
                    value={lowStockItems.length.toLocaleString()}
                    icon={<Bell />}
                    color="text-red-500 bg-red-500"
                />
            </div>

            {/* Control Panel and Search */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500" size={20} />
                    <input
                        type="text"
                        placeholder="ค้นหาตามชื่อวัสดุ หรือ ID..."
                        className="w-full bg-neutral-900 border border-neutral-700 text-white rounded-lg py-2 pl-10 pr-4 focus:border-[#5F5AFF] focus:ring focus:ring-[#5F5AFF]/50 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* ปุ่มเพิ่มวัสดุใหม่ (New Material) */}
                <button
                    onClick={() => console.log('Open Add New Material Modal')}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 shadow-md shadow-green-600/40 ml-4"
                >
                    <Plus size={16} className="mr-2" />
                    เพิ่มวัสดุใหม่
                </button>
            </div>


            {/* Material Table */}
            <div className="bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                <table className="min-w-full divide-y divide-neutral-700">
                    <thead className="bg-neutral-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">ชื่อวัสดุ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">ประเภท</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">จำนวนคงคลัง</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">สถานะ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">การดำเนินการ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {filteredMaterials.length > 0 ? (
                            filteredMaterials.map((material) => (
                                <MaterialRow
                                    key={material.id}
                                    material={material}
                                    onWithdraw={handleWithdraw}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
                                    <MinusCircle size={24} className="mx-auto mb-2" />
                                    ไม่พบรายการวัสดุที่ตรงกับคำค้นหา
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MaterialPage;