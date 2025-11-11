import { useParams } from "react-router-dom"
import { user } from "@/Data/user"
import { leader } from "@/Data/leader"
import { executive } from "@/Data/executive"
import { admin } from "@/Data/admin"
import { MdEmail } from "react-icons/md"
import { Phone } from "lucide-react"
import { TbFilePhone } from "react-icons/tb"
import { HiPhone } from "react-icons/hi"

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
        <div className="border rounded-2xl bg-gray-700">
          <p className="p-2 text-gray-400"><strong>id:</strong> {userData.idCard}</p>
          <div className="p-5 text-white">

            <img
              src={userData.avatarUrl}
              alt={`${userData.fname} ${userData.lname}`}
              className="mt-4 rounded-full w-25 h-25 object-cover mx-auto"
            />

            <div className="pt-3">
              <p className="text-center ">{userData.fname} {userData.lname}</p>

              <div className="flex items-center gap-1 justify-center border-b pb-3 border-gray-600">
                <p>สถานะ:</p>
                <p
                  className={`border rounded-4xl px-3 text-center ${userData.status === "available"
                    ? "bg-green-400 text-gray-500"
                    : "bg-red-400 text-gray-200"
                    }`}
                >
                  {userData.status}
                </p>
              </div>


              <div className="pt-3 ">

                <p><strong>ตำแหน่ง:</strong> {userData.position}</p>
                <p className="border-b pb-1 border-gray-600"><strong>แผนก:</strong> {userData.department}</p>
                <p className="flex gap-2 text-gray-200 pt-1"><strong><MdEmail className="text-white" /></strong> {userData.email}</p>
                <p className="flex gap-2 text-gray-200 border-b pb-3 border-gray-600"><strong><HiPhone className="text-white" /></strong> {userData.phone}</p>
                <p className="pt-2 text-gray-300"><strong>วันที่เริ่มงาน:</strong> {userData.startDate}</p>
              </div>
            </div>

          </div>
        </div>

        <div className="pt-5">

          



        </div>
      </div>
    </div>
  )
}

export default UserDetail

{/* {'religion' in userData ? <p><strong>ศาสนา:</strong> {userData.religion}</p> : null} ใช้ในกรณีที่มีข้อมูลไม่ตรงกันทุกโรล*/ }