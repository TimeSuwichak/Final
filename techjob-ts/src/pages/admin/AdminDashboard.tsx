

export default function AdminDashboard() {
  return (
    <div className="">
      <div className="flex-1 p-8 bg-[#1a1a1f]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Setting Dashboard</h2>
          <button className="bg-[#5F5AFF] px-4 py-2 rounded-lg hover:bg-[#4b48c7] transition-colors">
            + CREATE JOB
          </button>
        </div>

        {/* Main content area */}
        <div className="bg-[#111014] border border-[#222] rounded-xl h-[600px] p-6">
          {/* Grid 4 ช่อง */}
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="border border-[#333] rounded-lg flex items-center justify-center text-gray-400">
              ช่องที่ 1
            </div>
            <div className="border border-[#333] rounded-lg flex items-center justify-center text-gray-400">
              ช่องที่ 2
            </div>
            <div className="border border-[#333] rounded-lg flex items-center justify-center text-gray-400">
              ช่องที่ 3
            </div>
            <div className="border border-[#333] rounded-lg flex items-center justify-center text-gray-400">
              ช่องที่ 4
            </div>
          </div>
        </div>
        <div className="border border-[#fff] flex justify-between p-6">
          <div className="text-white border">งานใหม่</div>
          <div className="text-white border">กำลังดำเนินการ</div>
          <div className="text-white border">เสร็จแล้ว</div>
        </div>
      </div>
      
    </div>
  );
}