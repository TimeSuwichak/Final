import { useParams } from "react-router-dom"
import { user } from "@/Data/user"
import { leader } from "@/Data/leader"
import { executive } from "@/Data/executive"
import { admin } from "@/Data/admin"

const UserDetail = () => {
  const { id } = useParams() // ดึง id จาก URL
  const userData = user.find((item) => item.id === Number(id)) // หาใน array
    || leader.find((item) => item.id === Number(id))
    || executive.find((item) => item.id === Number(id))
    || admin.find((item) => item.id === Number(id))

  if (!userData) {
    return <div className="p-6">ไม่พบข้อมูลผู้ใช้</div>
  }

  return (

    <div className=" border p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">รายละเอียดผู้ใช้</h2>
      <div className="flex gap-5">
        <img
          src={userData.avatarUrl}
          alt={`${userData.fname} ${userData.lname}`}
          className="mt-4 rounded-lg w-40 h-40 object-cover"
        />

        <div className="pt-5">
          <p><strong>ชื่อ:</strong> {userData.fname} {userData.lname}</p>
          <p><strong>ตำแหน่ง:</strong> {userData.position}</p>
          <p><strong>แผนก:</strong> {userData.department}</p>
          <p><strong>อีเมล:</strong> {userData.email}</p>
          
          <p><strong>เบอร์มือถือ:</strong> {userData.phone}</p>
          <p><strong>ที่อยู่:</strong> {userData.address}</p>
        </div>
      </div>
    </div>
  )
}

export default UserDetail
