import { useParams } from "react-router-dom"
import { user } from "@/Data/user"

const UserDetail = () => {
  const { id } = useParams() // ดึง id จาก URL
  const userData = user.find((item) => item.id === Number(id)) // หาใน array

  if (!userData) {
    return <div className="p-6">ไม่พบข้อมูลผู้ใช้</div>
  }

  return (
    <div className="p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">รายละเอียดผู้ใช้</h2>
      <p><strong>ชื่อ:</strong> {userData.fname} {userData.lname}</p>
      <p><strong>อีเมล:</strong> {userData.email}</p>
      <p><strong>ตำแหน่ง:</strong> {userData.position}</p>
      <p><strong>แผนก:</strong> {userData.department}</p>
      <img
        src={userData.avatarUrl}
        alt={`${userData.fname} ${userData.lname}`}
        className="mt-4 rounded-lg w-40 h-40 object-cover"
      />
    </div>
  )
}

export default UserDetail
