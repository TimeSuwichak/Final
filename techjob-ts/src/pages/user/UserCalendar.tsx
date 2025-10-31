import React from 'react'
import { Calendar } from "@/components/ui/calendar"
const UserCalendar = () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
        <div>
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-lg border"
            />
        </div>
    )
}

export default UserCalendar