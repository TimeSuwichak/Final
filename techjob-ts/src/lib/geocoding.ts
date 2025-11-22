// src/lib/geocoding.ts
// ไลบรารีสำหรับ Geocoding และ Reverse Geocoding

import { translateAddressToThai } from "./thai-address-translator"

/**
 * แปลงที่อยู่ (string) เป็นพิกัด [lat, lng]
 * ใช้ Nominatim API จาก OpenStreetMap
 */
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=th&limit=1`,
      {
        headers: {
          "User-Agent": "TechJob-TS-App",
          "Accept-Language": "th,en;q=0.9", // เพิ่มส่วนหัวเพื่อขอให้ Nominatim คืนค่าผลลัพธ์เป็นภาษาไทย
        },
      },
    )
    const data = await response.json()

    if (data && data.length > 0) {
      return [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)]
    }
    return null
  } catch (error) {
    console.error(error)  
    return null
  }
}

/**
 * แปลงพิกัด [lat, lng] เป็นที่อยู่ (string)
 * ใช้ Nominatim API จาก OpenStreetMap
 * เพิ่มการแปลชื่อเป็นภาษาไทยโดยอัตโนมัติ
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "TechJob-TS-App",
          "Accept-Language": "th,en;q=0.9",
        },
      },
    )
    const data = await response.json()

    if (data && data.display_name) {
      const thaiAddress = translateAddressToThai(data.display_name)
      return thaiAddress
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

