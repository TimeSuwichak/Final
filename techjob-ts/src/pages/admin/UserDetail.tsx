import { user } from "@/Data/user"

 

const UserDetail = () => {

  return (
    <div>
      {user.slice(0, 1).map((item) => (
        <div key={item.id} className="p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-2xl font-bold mb-4">รายละเอียดผู้ใช้</h2>
          <p><strong>ชื่อ:</strong> {item.fname} {item.lname}</p>
          <p><strong>อีเมล:</strong> {item.email}</p>
          <p><strong>ตำแหน่ง:</strong> {item.position}</p>
          <p><strong>แผนก:</strong> {item.department}</p>
          <img src={item.avatarUrl} alt={`${item.fname} ${item.lname}`} className="mt-4 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export default UserDetail