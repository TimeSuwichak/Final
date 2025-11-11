"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { geocodeAddress, reverseGeocode } from "@/lib/geocoding"
import "leaflet/dist/leaflet.css"

// Dynamic imports for Leaflet to avoid SSR issues
const MapContainer = React.lazy(() => import("react-leaflet").then((mod) => ({ default: mod.MapContainer })))
const TileLayer = React.lazy(() => import("react-leaflet").then((mod) => ({ default: mod.TileLayer })))
const Marker = React.lazy(() => import("react-leaflet").then((mod) => ({ default: mod.Marker })))
const Popup = React.lazy(() => import("react-leaflet").then((mod) => ({ default: mod.Popup })))
const useMapEvents = React.lazy(() => import("react-leaflet").then((mod) => ({ default: mod.useMapEvents })))

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
  const [MapEvents, setMapEvents] = useState<any>(null)
  const [MarkerComponent, setMarkerComponent] = useState<any>(null)
  const [PopupComponent, setPopupComponent] = useState<any>(null)

  useEffect(() => {
    // Load react-leaflet components
    Promise.all([
      import("react-leaflet").then((mod) => mod.useMapEvents),
      import("react-leaflet").then((mod) => mod.Marker),
      import("react-leaflet").then((mod) => mod.Popup),
    ]).then(([useMapEventsHook, MarkerComp, PopupComp]) => {
      setMapEvents(() => useMapEventsHook)
      setMarkerComponent(() => MarkerComp)
      setPopupComponent(() => PopupComp)
    })
  }, [])

  if (!MapEvents || !MarkerComponent || !PopupComponent) {
    return null
  }

  const MapEventsComponent = () => {
    MapEvents({
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
    return null
  }

  return (
    <>
      <MapEventsComponent />
      {position && (
        <MarkerComponent position={position}>
          <PopupComponent>
            <div className="text-sm">
              <p className="font-semibold">{locationName || "ตำแหน่งที่เลือก"}</p>
              {locationName && (
                <p className="text-xs text-muted-foreground mt-1">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}
            </div>
          </PopupComponent>
        </MarkerComponent>
      )}
    </>
  )
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
      setMapCenter(initialPosition)
    }
  }, [initialPosition])

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
        <React.Suspense
          fallback={
            <div className="flex h-full items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">กำลังโหลดแผนที่...</p>
            </div>
          }
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            key={`${mapCenter[0]}-${mapCenter[1]}-${position?.[0]}-${position?.[1]}`}
            scrollWheelZoom={!readOnly}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker
              position={position}
              setPosition={handlePositionChange}
              onAddressFound={handleAddressFound}
              readOnly={readOnly}
              locationName={address}
            />
          </MapContainer>
        </React.Suspense>
      </div>

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
