// ฟังก์ชันสำหรับแปลชื่อภูมิภาค/ประเทศเป็นภาษาไทย
const thaiProvinceMap: Record<string, string> = {
  // ภาคกลาง
  Bangkok: "กรุงเทพมหานคร",
  "Amphoe Chatuchak": "เขตจตุจักร",
  "Chatuchak District": "เขตจตุจักร",
  "Lat Krabang": "ลัตตครับ",
  "Bang Na": "บางนา",
  "Samut Prakan": "สมุทรปราการ",
  Nonthaburi: "นนทบุรี",
  "Pathum Thani": "ปทุมธานี",
  "Samut Sakhon": "สมุทรสาคร",
  Lopburi: "ลพบุรี",
  Ayutthaya: "พระนครศรีอยุธยา",
  Chachoengsao: "ฉะเชิงเทรา",
  "Prachuap Khiri Khan": "ประจวบคีรีขันธ์",
  "Hua Hin": "หัวหิน",

  // ภาคเหนือ
  "Chiang Mai": "เชียงใหม่",
  "Chiang Rai": "เชียงราย",
  Lamphun: "ลำพูน",
  Nan: "น่าน",
  Phayao: "พะเยา",
  Phrae: "แพร่",
  Sukhothai: "สุโขทัย",
  Tak: "ตาก",
  "Kamphaeng Phet": "กำแพงเพชร",

  // ภาคตะวันออกเฉียงเหนือ
  "Khon Kaen": "ขอนแก่น",
  Kalasin: "กาฬสินธุ์",
  "Sakon Nakhon": "สกลนคร",
  "Nakhon Phanom": "นครพนม",
  Yasothon: "ยโสธร",
  "Amnat Charoen": "อำนาจเจริญ",
  Chaiyaphum: "ชัยภูมิ",
  Loei: "เลย",
  "Udon Thani": "อุดรธานี",
  "Nong Khai": "หนองคาย",

  // ภาคตะวันออก
  Rayong: "ระยอง",
  Chanthaburi: "จันทบุรี",
  Trat: "ตราด",
  Chumphon: "ชุมพร",

  // ภาคใต้
  Phuket: "ภูเก็ต",
  Krabi: "กระบี่",
  "Phang Nga": "พังงา",
  "Surat Thani": "สุราษฎร์ธานี",
  "Nakhon Si Thammarat": "นครศรีธรรมราช",
  Phatthalung: "พัทลุง",
  Satun: "สตูล",
  Songkhla: "สงขลา",
  Chumphom  : "ชุมพร",
  Ranong: "ระนอง",
  Yala: "ยะลา",
  Pattani: "ปัตตานี",

  // ภาคตะวันตก
  Kanchanaburi: "กาญจนบุรี",
  Ratchaburi: "ราชบุรี",
  Phetchaburi: "เพชรบุรี",
  "Samut Songkhram": "สมุทรสงคราม",

  // ภาคกลาง (ต่อ)
  "Nakhon Sawan": "นครสวรรค์",
  Phichit: "พิจิตร",
  Phetchabun: "เพชรบูรณ์",
  "Uthai Thani": "อุทัยธานี",
  "Sing Buri": "สิงห์บุรี",
  "Suphan Buri": "สุพรรณบุรี",
}

// ฟังก์ชันสำหรับแปลที่อยู่จากภาษาอังกฤษเป็นภาษาไทย
export function translateAddressToThai(address: string): string {
  if (!address) return ""

  let thaiAddress = address

  // แทนที่ชื่อภูมิภาคแบบ case-insensitive
  Object.entries(thaiProvinceMap).forEach(([en, th]) => {
    const regex = new RegExp(`\\b${en}\\b`, "gi")
    thaiAddress = thaiAddress.replace(regex, th)
  })

  // แทนที่ประเทศ
  thaiAddress = thaiAddress.replace(/Thailand/gi, "ไทย")
  thaiAddress = thaiAddress.replace(/Postcode:/gi, "รหัสไปรษณีย์:")

  return thaiAddress
}
