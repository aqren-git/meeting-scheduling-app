import { useMemo } from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { DayCell } from './DayCell'
import type { Slot } from '@/types/slot'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface CalendarGridProps {
  slots: Slot[]
}

export function CalendarGrid({ slots }: CalendarGridProps) {
  const { currentYear, currentMonth } = useCalendarStore()
  const calendarDays = useCalendarMonth(currentYear, currentMonth)

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const existing = map.get(slot.date) ?? []
      existing.push(slot)
      map.set(slot.date, existing)
    }
    return map
  }, [slots])

  return (
    <div className="p-0">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-[11px] font-medium text-text-muted tracking-wide text-center border-r border-border last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {calendarDays.map((day, idx) => {
          const isWeekend = day.date ? [0, 6].includes(day.date.getDay()) : false
          const daySlots = day.dateStr ? (slotsByDate.get(day.dateStr) ?? []) : []
          return (
            <DayCell
              key={idx}
              dayNumber={day.dayNumber}
              isPadding={day.isPadding}
              isPast={day.isPast}
              isToday={day.isToday}
              isWeekend={isWeekend}
              slots={daySlots}
            />
          )
        })}
      </div>
    </div>
  )
}
