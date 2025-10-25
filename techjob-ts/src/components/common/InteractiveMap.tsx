// InteractiveMap.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// *** 1. นำเข้า CSS ***
// สำคัญ: ต้องนำเข้า CSS ของ Leaflet ก่อน เพื่อให้แผนที่แสดงผลถูกต้อง
import 'leaflet/dist/leaflet.css';

// *** 2. แก้ไขปัญหาไอคอน Marker (ปัญหาที่พบบ่อย) ***
// โค้ดนี้ช่วยให้ไอคอน Marker มาตรฐานของ Leaflet แสดงผลในโปรเจกต์ React/Webpack ได้อย่างถูกต้อง
// หากไม่ใส่โค้ดนี้ หมุดอาจจะไม่แสดง
// *** โค้ดสำหรับแก้ไขปัญหาไอคอน Marker ***
// 2. กำหนดพาธของไฟล์ไอคอนใหม่ให้ Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x, // ใช้ตัวแปรที่ Import
  iconUrl: markerIcon,       // ใช้ตัวแปรที่ Import
  shadowUrl: markerShadow,   // ใช้ตัวแปรที่ Import
});

// ----------------------------------------------------------------------
// กำหนด Props สำหรับ Component (ถ้าคุณต้องการให้ Component นี้ปรับเปลี่ยนได้)
interface MapProps {
  // ตำแหน่งศูนย์กลางเริ่มต้นของแผนที่ (Latitude, Longitude)
  center?: LatLngExpression; 
  // ระดับการซูมเริ่มต้น
  zoom?: number; 
  // ตำแหน่ง Marker ที่ต้องการแสดง
  markerPosition?: LatLngExpression;
  // ข้อความใน Popup ของ Marker
  popupText?: string;
}

// ----------------------------------------------------------------------

const InteractiveMap: React.FC<MapProps> = ({ 
  center = [13.7563, 100.5018], // ค่าเริ่มต้น: กรุงเทพมหานคร
  zoom = 13,
  markerPosition,
  popupText = 'ตำแหน่งที่น่าสนใจ'
}) => {
  // ใช้ center เป็นตำแหน่ง marker หากไม่ได้กำหนด markerPosition มาให้
  const finalMarkerPosition = markerPosition || center;

  return (
    // 3. ตัวห่อ (Wrapper DIV): ต้องกำหนดความสูง/กว้างของ div นี้เสมอ
    // สามารถใช้ Tailwind CSS class เพื่อกำหนดความสูงได้ เช่น 'h-[500px] w-full'
    <div style={{ height: '500px', width: '100%' }}> 
      <MapContainer
        center={center} // กำหนดจุดศูนย์กลางของแผนที่
        zoom={zoom}     // กำหนดระดับการซูม (ค่า 13 เหมาะสำหรับมุมมองในเมือง) 
        style={{ height: '100%', width: '100%' }} // MapContainer ต้องสูง 100% ตามตัวห่อ
      >
        {/* 4. TileLayer: เลเยอร์แผนที่หลัก */}
        <TileLayer
          // OpenStreetMap เป็น Tile Provider ยอดนิยมและใช้งานฟรี
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 5. Marker: หมุดบนแผนที่ */}
        <Marker position={finalMarkerPosition}>
          {/* 6. Popup: ข้อความที่จะแสดงเมื่อคลิกหมุด */}
          <Popup>{popupText}</Popup>
        </Marker>

      </MapContainer>
    </div>
  );
};

export default InteractiveMap;