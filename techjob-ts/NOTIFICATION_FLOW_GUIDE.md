# 📋 คู่มือ: การไหลของ Notification System

## 🎯 ภาพรวมการทำงาน

เมื่อ **Admin สร้างใบงานใหม่ และเลือก Leader** → ระบบจะส่ง notification ให้ Leader คนนั้น

```
Admin สร้างงาน (leadId=101)
        ↓
  ส่งไป addJob()
        ↓
  ตรวจสอบ leadId มีค่าไหม?
        ↓
   ค่ะ! มี leadId=101
        ↓
  สร้าง notification object
  {
    recipientRole: "leader",
    recipientId: "101",
    ...
  }
        ↓
  เรียก addNotification()
        ↓
  เก็บลงใน localStorage (NotificationContext)
        ↓
Leader (ID=101) เข้ามาดูหน้า Notification
        ↓
ค้นหา notification ที่มี:
- recipientRole = "leader"
- recipientId = "101"
        ↓
แสดงการแจ้งเตือนให้ Leader ดู! ✅
```

---

## 🔧 ขั้นตอนที่ 1: สร้าง Notification ใน `addJob()`

**ไฟล์**: `src/contexts/JobContext.tsx`

### โค้ด:
```typescript
// ขั้นตอนที่ 1: สร้าง array เปล่า
const notificationsToSend: Parameters<typeof addNotification>[0][] = [];

// ขั้นตอนที่ 2: ตรวจสอบ leadId
if (newJobData.leadId && newJobData.leadId !== null && newJobData.leadId !== undefined) {
  // leadId มีค่า → ตัวอย่าง leadId = 101
  
  // ขั้นตอนที่ 3: ค้นหาชื่อ Leader
  const leaderName = findLeaderName(newJobData.leadId) ?? "หัวหน้างานใหม่";
  // leaderName = "บุญมี" (ตัวอย่าง)
  
  // ขั้นตอนที่ 4: สร้าง notification object
  notificationsToSend.push({
    title: "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่",
    message: `คุณได้รับมอบหมายให้ดูแลงาน "ติดตั้ง Network" จาก Admin`
    recipientRole: "leader",     // ← บอก NotificationContext ว่า "ส่งให้ Leader"
    recipientId: String(101),    // ← แปลง 101 (Number) เป็น "101" (String)
    relatedJobId: "JOB-20250111-ABC1",
    metadata: { type: "leader_assignment_new" },
  });
}

// ขั้นตอนที่ 5: ส่งไปให้ NotificationContext เก็บ
notificationsToSend.forEach(addNotification);
// ตอนนี้ notification ไปอยู่ใน localStorage แล้ว
```

### ขั้นตอนการตรวจ ID:
| ขั้น | ทำอะไร | ตัวอย่าง |
|-----|--------|---------|
| 1 | สร้าง array เปล่า | `[]` |
| 2 | ตรวจสอบ `leadId` มีค่าหรือไม่ | `if (101)` ✓ |
| 3 | ค้นหาชื่อ Leader จาก ID | `findLeaderName(101)` → "บุญมี" |
| 4 | สร้าง object notification | object ที่มี `recipientRole="leader"`, `recipientId="101"` |
| 5 | ส่งไปให้ NotificationContext | เรียก `addNotification()` |

---

## 🔧 ขั้นตอนที่ 2: ตรวจสอบและกรอง Notification ใน NotificationContext

**ไฟล์**: `src/contexts/NotificationContext.tsx` → ฟังก์ชัน `getNotificationsForUser()`

### โค้ด:
```typescript
const getNotificationsForUser = (role, recipientId) => {
  return notifications.filter((notification) => {
    // ✅ ขั้นตอนที่ 1: ตรวจสอบ role (บทบาท)
    if (notification.recipientRole !== role) return false;
    // ตัวอย่าง:
    // - notification.recipientRole = "leader"
    // - role = "leader"
    // → PASS ✅

    // ✅ ขั้นตอนที่ 2: ตรวจสอบ recipientId เป็น optional ไหม?
    if (!notification.recipientId) return true;
    // ถ้า recipientId ไม่มี → notification ส่งให้ทุกคน → PASS ✅

    // ✅ ขั้นตอนที่ 3: ถ้า recipientId มี แต่ user.id ไม่มี
    if (!recipientId) return false;
    // ถ้า user ไม่มี ID → FAIL ❌

    // ✅ ขั้นตอนที่ 4: ตรวจสอบ recipientId ตรงกันไหม?
    return String(notification.recipientId) === String(recipientId);
    // ตัวอย่าง:
    // - notification.recipientId = "101" (String)
    // - recipientId = "101" (String)
    // → String("101") === String("101") → true → PASS ✅
  });
};
```

### ขั้นตอนการกรอง:
```
notifications array ใน localStorage:
[
  {
    recipientRole: "leader",
    recipientId: "101",  // ← target
    title: "คุณได้รับมอบหมายเป็นหัวหน้างานใหม่",
    ...
  },
  {
    recipientRole: "user",
    recipientId: "201",
    title: "ได้รับมอบหมายงานใหม่",
    ...
  }
]

ตรวจสอบ notification แรก:
- role="leader" → ตรงไหม? → ใช่ ✅
- recipientId="101" → ตรงไหม? → ใช่ ✅
- ให้เข้า array ผลลัพธ์

ตรวจสอบ notification ที่สอง:
- role="leader" → ตรงไหม? → ไม่ ❌ (เป็น "user")
- ไม่ให้เข้า

ผลลัพธ์: [notification แรก]
```

---

## 🔧 ขั้นตอนที่ 3: แสดงผลใน Notification.tsx

**ไฟล์**: `src/pages/commom/Notification.tsx`

### โค้ด:
```typescript
// ขั้นตอนที่ 1: ดึงข้อมูล user จาก AuthContext
const { user } = useAuth();
// user = { id: 101, role: "Leader", fname: "บุญมี", ... }

// ขั้นตอนที่ 2: เตรียมตัวแปร role (ต้อง lowercase)
const role = (user.role || "user").toLowerCase();
// "Leader" → toLowerCase() → "leader" ✅

// ขั้นตอนที่ 3: เตรียมตัวแปร recipientId (ต้อง String)
const recipientId = user.id ? String(user.id) : undefined;
// 101 → String(101) → "101" ✅

// ขั้นตอนที่ 4: เรียก getNotificationsForUser() เพื่อค้นหา notification
const notifications = useMemo(() =>
  getNotificationsForUser(role, recipientId)  // ("leader", "101")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
);

// ✅ ตอนนี้ notifications = [ notification ที่ส่งให้ leader ID=101 ]
// แล้ว component จะแสดงผล!
```

### Flow ของการค้นหา:
```
Leader (ID=101) เข้าหน้า Notification
        ↓
อ่าน user.id = 101 → แปลงเป็น recipientId = "101"
        ↓
อ่าน user.role = "Leader" → แปลงเป็น role = "leader"
        ↓
เรียก getNotificationsForUser("leader", "101")
        ↓
ลูป filter ทั้งหมด notification ใน localStorage
        ↓
ตรวจทีละอัน:
  - recipientRole="leader" ✓ AND recipientId="101" ✓ → ให้เข้า ✅
  - recipientRole="user" ✗ → ไม่ให้เข้า ❌
  - recipientRole="leader" ✓ แต่ recipientId="102" ✗ → ไม่ให้เข้า ❌
        ↓
ผลลัพธ์: [ notification ที่ตรงกัน ]
        ↓
แสดงให้ Leader เห็น! 🎉
```

---

## 📝 เปรียบเทียบการเก็บ ID

| ที่ | data ที่เก็บ | Type | ตัวอย่าง |
|----|-------------|------|---------|
| `leadId` (ใน Job) | Number | `101` |
| `recipientId` (ใน Notification) | String | `"101"` |
| `user.id` (ใน Leader/User data) | Number | `101` |
| `recipientId` (หลัง String conversion) | String | `"101"` |

**ดังนั้น** เมื่อเปรียบเทียบต้อง convert ให้เป็นประเภทเดียวกัน:
```typescript
String(notification.recipientId) === String(recipientId)
// "101" === "101" → true ✅
```

---

## 🐛 Debug: ใช้ Console.log

เมื่อไม่แสดง notification ให้ตรวจสอบ:

### 1️⃣ ตรวจสอบ addJob ส่ง notification ไหม
```javascript
// Console ควรแสดง:
// [addJob] Adding notification for leadId: 101, leaderName: บุญมี
```

### 2️⃣ ตรวจสอบ role และ recipientId ถูกต้องไหม
```javascript
// Console ควรแสดง:
// [Notification] role: leader, recipientId: 101, user.role: Leader, user.id: 101
```

### 3️⃣ ตรวจสอบจำนวน notification ที่พบ
```javascript
// Console ควรแสดง:
// [Notification] found 1 notifications: [...]
```

---

## 🎯 สรุป

| ขั้น | ไฟล์ | ทำอะไร |
|-----|-----|--------|
| 1 | `JobContext.tsx` | ตรวจ `leadId` มีค่า → สร้าง notification → ส่งไปให้ NotificationContext |
| 2 | `NotificationContext.tsx` | ตรวจ role & recipientId → กรอง notification → เก็บใน localStorage |
| 3 | `Notification.tsx` | อ่าน `user.id` & `user.role` → เรียก getNotificationsForUser() → แสดงผล |

**ปัญหาที่อาจเกิด:**
- ❌ `leadId` เป็น null/undefined → notification ไม่ถูกสร้าง
- ❌ `user.role` ไม่ใช่ "leader" (ไม่เป็น lowercase) → ไม่ match recipientRole
- ❌ `user.id` ไม่ตรงกับ `leadId` → ไม่ match recipientId
- ❌ localStorage ถูกล้าง → notification หายไป
