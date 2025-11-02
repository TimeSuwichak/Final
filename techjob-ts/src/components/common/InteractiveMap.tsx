"use client"; // ระบุว่าไฟล์นี้เป็น Client Component (จำเป็นสำหรับ React ที่มี state, useEffect)

// InteractiveMap.tsx

import type React from "react";
import { useState, useEffect } from "react";
// นำเข้าคอมโพเนนต์หลักจาก react-leaflet สำหรับแสดงแผนที่
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
// นำเข้า L (ตัวหลักของ Leaflet) และ Type LatLngExpression
import L, { type LatLngExpression } from "leaflet";
// นำเข้ารูปภาพสำหรับไอคอนหมุด
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// *** 1. นำเข้า CSS ***
// สำคัญ: ต้องนำเข้า CSS ของ Leaflet ก่อน เพื่อให้แผนที่แสดงผลถูกต้อง
import "leaflet/dist/leaflet.css";

// *** 2. แก้ไขปัญหาไอคอน Marker (ปัญหาที่พบบ่อย) ***
// โค้ดนี้ช่วยให้ไอคอน Marker มาตรฐานของ Leaflet แสดงผลในโปรเจกต์ React/Webpack ได้อย่างถูกต้อง
// หากไม่ใส่โค้ดนี้ หมุดอาจจะไม่แสดง
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,  // ใช้ตัวแปรที่ Import
  iconUrl: markerIcon,  // ใช้ตัวแปรที่ Import
  shadowUrl: markerShadow,  // ใช้ตัวแปรที่ Import
});

/**
 * ฟังก์ชันสำหรับแปลง "ที่อยู่" (String) ให้เป็น "พิกัด" [lat, lng]
 * @param address - ข้อความที่อยู่
 * @returns Promise ที่จะ resolve เป็น [lat, lng] หรือ null
 */
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  try {
    // ใช้ API ของ Nominatim (OpenStreetMap)
    // เพิ่ม countrycodes=th เพื่อจำกัดการค้นหาในไทย ทำให้แม่นยำขึ้น
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=th&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      // คืนค่า [lat, lng]
      return [Number.parseFloat(data[0].lat), Number.parseFloat(data[0].lon)];
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
};

/**
 * ฟังก์ชันสำหรับแปลง "พิกัด" [lat, lng] กลับเป็น "ที่อยู่" (String)
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise ที่จะ resolve เป็น String ที่อยู่ หรือ null
 */
const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    // ใช้ API ของ Nominatim แบบ reverse
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    if (data && data.display_name) {
      // คืนค่า display_name (ที่อยู่เต็ม)
      return data.display_name;
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }
  return null;
};

/**
 * คอมโพเนนต์ย่อยสำหรับจัดการ "การคลิก" บนแผนที่
 * จะทำงานเฉพาะเมื่อ interactive={true}
 */
function LocationMarker({ position, setPosition, onAddressFound }) {
  // useMapEvents คือ Hook จาก react-leaflet สำหรับดักจับ event บนแผนที่
  useMapEvents({
    // เมื่อผู้ใช้ "คลิก" บนแผนที่
    async click(e) {
      // 1. ดึงพิกัดที่คลิก
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      // 2. อัปเดตตำแหน่งหมุดใน state
      setPosition(newPos);

      // 3. ถ้ามีการส่งฟังก์ชัน onAddressFound มา (จากหน้าฟอร์ม)
      if (onAddressFound) {
        // 4. ให้ไปค้นหาที่อยู่จากพิกัดที่คลิก
        const address = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        if (address) {
          // 5. ส่งที่อยู่ที่หาได้ (String) กลับไปให้ Parent Component (หน้าฟอร์ม)
          onAddressFound(address);
        }
      }
    },
  });

  // ถ้ายังไม่มีตำแหน่ง (position) ก็ไม่ต้องแสดงหมุด
  return position === null ? null : (
    <Marker position={position}>
      <Popup>ตำแหน่งที่เลือก</Popup>
    </Marker>
  );
}

// --- 3. Typescript Interface ---
// กำหนด "พิมพ์เขียว" ของ Props ที่คอมโพเนนต์นี้จะรับเข้ามา
interface MapProps {
  center?: LatLngExpression; // จุดศูนย์กลางเริ่มต้น
  zoom?: number; // ระดับการซูมเริ่มต้น
  markerPosition?: LatLngExpression | null; // ตำแหน่งหมุด (สำหรับโหมดแสดงผล)
  onMarkerSet?: (position: [number, number]) => void; // Callback เมื่อมีการปักหมุด
  onAddressFound?: (address: string) => void; // Callback เมื่อหาที่อยู่เจอ
  interactive?: boolean; // โหมดคลิกได้ (true) หรือแค่แสดงผล (false)
  addressToGeocode?: string; // ที่อยู่ (String) ที่ส่งเข้ามาให้ค้นหา
}

// --- 4. Main Component ---
const InteractiveMap: React.FC<MapProps> = ({
  center = [13.7563, 100.5018], // Default: กรุงเทพ
  zoom = 13,
  markerPosition = null, // ตำแหน่งหมุดที่รับมา
  onMarkerSet, // ฟังก์ชันที่รับมาจาก Parent (AdminDashboardPage)
  onAddressFound, // ฟังก์ชันที่รับมาจาก Parent (AdminDashboardPage)
  interactive = true, // ค่า default คือโหมดคลิกได้
  addressToGeocode, // ที่อยู่ที่รับมาจาก Parent (AdminDashboardPage)
}) => {
  // State ภายในสำหรับเก็บตำแหน่งหมุดที่เลือก
  const [position, setPosition] = useState<[number, number] | null>(markerPosition as [number, number] | null);
  // State ภายในสำหรับเก็บจุดศูนย์กลางแผนที่
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(center);

  // --- 5. Geocoding Effect ---
  // useEffect นี้จะทำงาน "ทุกครั้ง" ที่ props `addressToGeocode` เปลี่ยนแปลง
  useEffect(() => {
    // ถ้ามี addressToGeocode ส่งมา และไม่ใชค่าว่าง
    if (addressToGeocode && addressToGeocode.trim()) {
      const geocode = async () => {
        // 1. เรียกฟังก์ชันแปลงที่อยู่เป็นพิกัด
        const coords = await geocodeAddress(addressToGeocode);
        if (coords) {
          // 2. ถ้าหาเจอ ให้ปักหมุดที่ตำแหน่งนั้น
          setPosition(coords);
          // 3. ย้ายศูนย์กลางแผนที่ไปที่ตำแหน่งนั้น
          setMapCenter(coords);
          // 4. ส่งค่าพิกัด [lat, lng] กลับไปให้ Parent (เผื่อต้องใช้)
          if (onMarkerSet) {
            onMarkerSet(coords);
          }
        }
      };
      geocode();
    }
  }, [addressToGeocode]); // [dependency array] ทำงานเมื่อค่านี้เปลี่ยน

  // ฟังก์ชันสำหรับอัปเดต state เมื่อ LocationMarker มีการคลิก
  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition);
    // ส่งพิกัดใหม่กลับไปให้ Parent (AdminDashboardPage)
    if (onMarkerSet) {
      onMarkerSet(newPosition);
    }
  };

  // --- 6. Render ---
  return (
    <div className="h-full w-full min-h-[300px]">
      <MapContainer
        // ถ้ามี 'position' (หมุด) ให้ใช้เป็น center, ถ้าไม่ ให้ใช้ 'mapCenter'
        center={position || mapCenter}
        zoom={zoom}
        style={{ height: "100%", width: "100%", cursor: interactive ? "crosshair" : "default" }}
        scrollWheelZoom={true}
        // [เทคนิค] ใส่ key เพื่อบังคับให้ MapContainer "Re-render"
        // เมื่อ position เปลี่ยน ไม่งั้นแผนที่อาจไม่ขยับตาม
        key={`${position?.[0]}-${position?.[1]}`}
      >
        {/* เลเยอร์แผนที่ (ใช้ของ OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* --- 7. โลจิกสำคัญ: เลือกโหมด --- */}
        {interactive ? (
          // 7a. ถ้าโหมด interactive = true (หน้าสร้าง/แก้ไขงาน)
          // ให้ใช้ LocationMarker ที่สามารถ "คลิก" เพื่อปักหมุด
          // และส่งฟังก์ชันสำหรับอัปเดตที่อยู่และพิกัดเข้าไป
          <LocationMarker position={position} setPosition={handlePositionChange} onAddressFound={onAddressFound} />
        ) : (
          // 7b. ถ้าโหมด interactive = false (หน้าดูรายละเอียด)
          // ให้แสดง <Marker> ธรรมดา (คลิกไม่ได้)
          // โดยจะแสดงต่อเมื่อมี `position` (หรือ `markerPosition`) ส่งมาเท่านั้น
          position && (
            <Marker position={position}>
              <Popup>ตำแหน่งที่เลือก</Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;