// src/lib/geocoding.ts
// ไลบรารีสำหรับ Geocoding และ Reverse Geocoding

/**
 * แปลงที่อยู่ (string) เป็นพิกัด [lat, lng]
 * ใช้ Nominatim API จาก OpenStreetMap
 */
export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "User-Agent": "TechJob-TS-App",
        },
      },
    )
    const data = await response.json()

    if (data && data.length > 0) {
      return [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)]
    }
    return null
  } catch (error) {
    console.error("[v0] Geocoding error:", error)
    return null
  }
}

/**
 * แปลงพิกัด [lat, lng] เป็นที่อยู่ (string)
 * ใช้ Nominatim API จาก OpenStreetMap
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
      headers: {
        "User-Agent": "TechJob-TS-App",
      },
    })
    const data = await response.json()

    if (data && data.display_name) {
      return data.display_name
    }
    return null
  } catch (error) {
    console.error("[v0] Reverse geocoding error:", error)
    return null
  }
}
