"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Users, Plus, X } from "lucide-react"
import { user as ALL_USERS } from "@/Data/user"

interface TeamManagementSectionProps {
  currentTeamCount: number
  assignedTechs: any[]
  onAddTech?: () => void
  onRemoveTech?: (techId: string) => void
}

export function Teamuser({  currentTeamCount,
  assignedTechs,
  onAddTech,
  onRemoveTech,
}: TeamManagementSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const getTechDetails = (techId: string) => {
    return ALL_USERS.find((u) => String(u.id) === techId)
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">จัดการทีมงาน</CardTitle>
          </div>
          <Badge variant="secondary" className="text-sm px-2.5 py-0.5">
            {currentTeamCount} คน
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search/Selection Area */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="ทำงาน: ค้นหาช่าง..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm"
            />
            {onAddTech && (
              <Button
                onClick={onAddTech}
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shrink-0"
              >
                <Plus className="h-4 w-4" />
                นำเข้า
              </Button>
            )}
          </div>
          <div className="text-xs text-muted-foreground">เลือกทีมงาน</div>
        </div>

        <Separator />

        {/* Team Roles & Skills Section */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-foreground mb-2">แนนงานสมาชิกทีมและความสามารถ</h4>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-xs gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <span>⚙️</span>
                จริงจุณัยดัชสอน
              </Badge>
              <Badge variant="outline" className="text-xs gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <span>🔧</span>
                สิทร์ยัดธัรมี
              </Badge>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">กรุณาเลือกแนนนกเศษส่วนหาร่าง...</div>

        {/* Assigned Team List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">สมาชิกทีมที่จัดสรร</h4>
          <ScrollArea className="h-48 pr-4">
            <div className="space-y-2">
              {assignedTechs.length > 0 ? (
                assignedTechs.map((tech) => {
                  const techDetails = getTechDetails(tech)
                  if (!techDetails) return null
                  return (
                    <div
                      key={tech}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={techDetails.avatarUrl || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{techDetails.fname[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {techDetails.fname} {techDetails.lname}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">{techDetails.position}</p>
                        </div>
                      </div>
                      {onRemoveTech && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveTech(tech)}
                          className="h-6 w-6 p-0 shrink-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">ยังไม่มีสมาชิกทีม</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
