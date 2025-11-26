"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { showWarning } from "@/lib/sweetalert"

interface AddTaskSectionProps {
  onTaskAdd?: (task: { title: string; description: string }) => void
}

export function AddTask({ onTaskAdd }: AddTaskSectionProps) {
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      showWarning("กรุณากรอกหัวข้อ Task")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      if (onTaskAdd) {
        onTaskAdd({
          title: taskTitle,
          description: taskDescription,
        })
      }

      // Reset form
      setTaskTitle("")
      setTaskDescription("")
      setIsSubmitting(false)
    }, 300)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAddTask()
    }
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">เพิ่ม Task ใหม่</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task Title */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            หัวข้อ Task <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="เช่น: ความสอบเบิกไทยให้ฝั่ว"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
            disabled={isSubmitting}
          />
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">รายละเอียด Task</label>
          <Textarea
            placeholder="อธิบายงานวัตถุประสงค์ของงานและขั้นตอนการทำ"
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            className="text-sm resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleAddTask}
          disabled={isSubmitting || !taskTitle.trim()}
          className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white h-10"
        >
          <Plus className="h-4 w-4" />
          {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่ม Task"}
        </Button>
      </CardContent>
    </Card>
  )
}
