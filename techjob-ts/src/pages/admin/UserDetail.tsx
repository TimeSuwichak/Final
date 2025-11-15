import { useParams } from "react-router-dom";
import { user } from "@/Data/user";
import { leader } from "@/Data/leader";
import { executive } from "@/Data/executive";
import { admin } from "@/Data/admin";
import { MdEmail } from "react-icons/md";
import { HiPhone } from "react-icons/hi";

// ----------------------------
// โหลดข้อมูลจาก localStorage
// ----------------------------
const loadPersonnelFromStorage = () => {
  try {
    const stored = localStorage.getItem("techjob_personnel_data");
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("❌ Error loading localStorage:", err);
    return [];
  }
};

// ----------------------------
// Normalize ให้ข้อมูลเป็นรูปแบบเดียวกัน
// ----------------------------
const normalizeUser = (p: any) => ({
  id: p.id,
  fname: p.fname || "",
  lname: p.lname || "",
  email: p.email || "",
  position: p.position || "พนักงาน",
  department: p.department || "",
  phone: p.phone || "",
  status: p.status || "available",
  avatarUrl: p.urlImage || p.avatarUrl || "",
  idCard: p.idCard || "",
  startDate: p.startDate || "",
});

const UserDetail = () => {
  const { id } = useParams(); // รับ ID จาก URL เช่น /user/5

  // 1) โหลดข้อมูลจาก localStorage ก่อน
  // ค้นหาทั้ง id และ originalId เพราะ Datauser.tsx ส่ง originalId มา
  const localData = loadPersonnelFromStorage();
  let userData =
    localData.find((item: any) =>
      String(item.originalId) === String(id) || String(item.id) === String(id)
    );

  // 2) ถ้าไม่เจอ → fallback ไปที่ mock data
  if (!userData) {
    userData =
      user.find((u) => u.id === Number(id)) ||
      leader.find((u) => u.id === Number(id)) ||
      executive.find((u) => u.id === Number(id)) ||
      admin.find((u) => u.id === Number(id));
  }

  // 3) ถ้าหาไม่เจอจริง ๆ → แสดงข้อความ
  if (!userData) {
    return <div className="p-6">ไม่พบข้อมูลผู้ใช้</div>;
  }

  const person = normalizeUser(userData);

  return (
    <div className="border p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">รายละเอียดผู้ใช้</h2>

      <div className="flex gap-5">
        <div className="border rounded-2xl bg-gray-700">
          <p className="p-2 text-gray-400">
            <strong>ID:</strong> {person.idCard || person.id}
          </p>

          <div className="p-5 text-white">
            <img
              src={person.avatarUrl}
              alt={`${person.fname} ${person.lname}`}
              className="mt-4 rounded-full w-25 h-25 object-cover mx-auto"
            />

            <div className="pt-3">
              <p className="text-center">
                {person.fname} {person.lname}
              </p>

              <div className="flex items-center gap-1 justify-center border-b pb-3 border-gray-600">
                <p>สถานะ:</p>
                <p
                  className={`border rounded-4xl px-3 text-center ${person.status === "available"
                    ? "bg-green-400 text-gray-700"
                    : "bg-red-400 text-gray-200"
                    }`}
                >
                  {person.status}
                </p>
              </div>

              <div className="pt-3">
                <p><strong>ตำแหน่ง:</strong> {person.position}</p>
                <p className="border-b pb-1 border-gray-600">
                  <strong>แผนก:</strong> {person.department}
                </p>

                <p className="flex gap-2 text-gray-200 pt-1">
                  <MdEmail className="text-white" />
                  {person.email}
                </p>

                <p className="flex gap-2 text-gray-200 border-b pb-3 border-gray-600">
                  <HiPhone className="text-white" />
                  {person.phone}
                </p>

                <p className="pt-2 text-gray-300">
                  <strong>วันที่เริ่มงาน:</strong> {person.startDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5">{/* เพิ่ม Detail เพิ่มเติมได้ภายหลัง */}</div>
      </div>
    </div>
  );
};

export default UserDetail;
