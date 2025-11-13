"use client"

import React, { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { geocodeAddress, reverseGeocode } from "@/lib/geocoding"
import "leaflet/dist/leaflet.css"

// Use direct imports from react-leaflet to avoid Suspense/lazy timing issues

interface AdminMapProps {
  initialAddress?: string
  initialPosition?: [number, number]
  onPositionChange?: (position: [number, number]) => void
  onAddressChange?: (address: string) => void
  readOnly?: boolean
}

// Component for handling map clicks
function LocationMarker({
  position,
  setPosition,
  onAddressFound,
  readOnly = false,
  locationName, // เพิ่ม prop สำหรับชื่อสถานที่
}: {
  position: [number, number] | null
  setPosition: (pos: [number, number]) => void
  onAddressFound?: (address: string) => void
  readOnly?: boolean
  locationName?: string // เพิ่ม prop สำหรับชื่อสถานที่
}) {
  // useMapEvents hook (direct import) สำหรับดักจับการคลิกบนแผนที่
  useMapEvents({
    async click(e: any) {
      if (readOnly) return

      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng]
      setPosition(newPos)

      if (onAddressFound) {
        const address = await reverseGeocode(e.latlng.lat, e.latlng.lng)
        if (address) {
          onAddressFound(address)
        }
      }
    },
  })

  return (
    <>
      {position && (
        <Marker position={position}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{locationName || "ตำแหน่งที่เลือก"}</p>
              {locationName && (
                <p className="text-xs text-muted-foreground mt-1">
                  พิกัด: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}
              {!locationName && (
                <p className="text-xs text-muted-foreground mt-1">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

// Child component to set mapRef using react-leaflet's useMap()
function MapRefSetter({ mapRef }: { mapRef: React.MutableRefObject<any | null> }) {
  const map = useMapEvents({}) as any
  useEffect(() => {
    mapRef.current = map
    return () => {
      // clear reference on unmount
      if (mapRef.current === map) mapRef.current = null
    }
  }, [map, mapRef])
  return null
}

export function AdminMap({
  initialAddress = "",
  initialPosition,
  onPositionChange,
  onAddressChange,
  readOnly = false,
}: AdminMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [mapCenter, setMapCenter] = useState<[number, number]>(initialPosition || [13.7563, 100.5018])
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null)
  const [address, setAddress] = useState(initialAddress)
  const [isSearching, setIsSearching] = useState(false)
  // ref เก็บ instance ของแผนที่เพื่อนำไปเรียก setView ได้โดยไม่ต้อง remount
  const mapRef = useRef<any | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
      setMapCenter(initialPosition)
    }
  }, [initialPosition])

  // ถ้ามี mapRef ให้ใช้ setView/ panTo เพื่ออัปเดตมุมมองของแผนที่
  useEffect(() => {
    if (!mapRef.current) return
    try {
      const target = position || mapCenter
      mapRef.current.setView(target, 13)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[AdminMap] failed to setView', e)
    }
  }, [mapCenter, position])

  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition)
    if (onPositionChange) {
      onPositionChange(newPosition)
    }
  }

  const handleAddressFound = (foundAddress: string) => {
    setAddress(foundAddress)
    if (onAddressChange) {
      onAddressChange(foundAddress)
    }
  }

  const handleSearchAddress = async () => {
    if (!address.trim()) {
      alert("กรุณากรอกที่อยู่ที่ต้องการค้นหา")
      return
    }

    setIsSearching(true)
    try {
      const coords = await geocodeAddress(address)
      if (coords) {
        setPosition(coords)
        setMapCenter(coords)
        if (onPositionChange) {
          onPositionChange(coords)
        }
      } else {
        alert("ไม่พบที่อยู่ที่ค้นหา กรุณาลองใหม่อีกครั้ง")
      }
    } catch (error) {
      console.error("[v0] Search error:", error)
      alert("เกิดข้อผิดพลาดในการค้นหา")
    } finally {
      setIsSearching(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="space-y-4">
        {!readOnly && (
          <div className="space-y-2">
            <Label htmlFor="address">ที่อยู่สถานที่ปฏิบัติงาน</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรอกที่อยู่..."
              disabled
            />
          </div>
        )}
        <div className="h-[400px] w-full flex items-center justify-center rounded-md border bg-muted">
          <p className="text-sm text-muted-foreground">กำลังโหลดแผนที่...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="space-y-2">
          <Label htmlFor="address">ที่อยู่สถานที่ปฏิบัติงาน</Label>
          <div className="flex gap-2">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="กรอกที่อยู่ เช่น 1693 ถ. พหลโยธิน จตุจักร กรุงเทพมหานคร"
              className="flex-1"
            />
            <Button type="button" onClick={handleSearchAddress} disabled={isSearching} variant="outline">
              {isSearching ? "กำลังค้นหา..." : "ค้นหาบนแผนที่"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">คลิกที่แผนที่เพื่อเลือกตำแหน่ง หรือกรอกที่อยู่แล้วกดปุ่มค้นหา</p>
        </div>
      )}

      {readOnly && address && (
        <div className="space-y-2">
          <Label>สถานที่ปฏิบัติงาน</Label>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
      )}

      <div className="h-[400px] w-full overflow-hidden rounded-md border">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          // ไม่กำหนด key อีกต่อไป (หลีกเลี่ยง remount สั้น ๆ)
          scrollWheelZoom={!readOnly}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* ตั้งค่า mapRef ผ่าน child component ที่ใช้ useMap() */}
          <MapRefSetter mapRef={mapRef} />
          <LocationMarker
            position={position}
            setPosition={handlePositionChange}
            onAddressFound={handleAddressFound}
            readOnly={readOnly}
            locationName={address}
          />
        </MapContainer>
      </div>

      {/* mapRef ใช้งานผ่าน useEffect ด้านบน เพื่ออัปเดตมุมมองโดยไม่ต้อง remount */}

      {position && !readOnly && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p>
            <strong>พิกัดที่เลือก:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
