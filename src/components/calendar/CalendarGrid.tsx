import { useMemo } from 'react'
import { useCalendarStore } from '@/store/calendarStore'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { DayCell } from './DayCell'
import type { Slot } from '@/types/slot'

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

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
    <div>
      {/* Spec 6.3: Day-of-week header — text-xs, font-medium, text-secondary, tracking-wide, uppercase */}
      <div className="grid grid-cols-7 border-b border-border bg-surface/50">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-2 text-xs font-medium text-text-secondary tracking-wide uppercase text-center"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Spec 6.4: Grid with gap-px, bg-border for grid lines */}
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
