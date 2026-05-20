import { useMemo, useEffect, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const existing = map.get(slot.date) ?? []
      existing.push(slot)
      map.set(slot.date, existing)
    }
    return map
  }, [slots])

  // Scroll today's row into focus on mount / date change
  useEffect(() => {
    if (containerRef.current) {
      const todayElement = containerRef.current.querySelector('#today-cell') as HTMLElement
      if (todayElement) {
        const container = containerRef.current
        const todayRect = todayElement.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const relativeTop = todayRect.top - containerRect.top + container.scrollTop
        const headerOffset = 38 // Height of the sticky week day header
        container.scrollTop = Math.max(0, relativeTop - headerOffset)
      }
    }
  }, [calendarDays])

  return (
    /* On mobile (<640px), the grid is horizontally scrollable with 130px-wide columns
       so each cell has room for the day number and slot times.
       On tablet+, the grid fills available width naturally.
       Added max-h-[600px] and overflow-y-auto to allow vertical scrolling of the grid. */
    <div 
      ref={containerRef}
      className="overflow-x-auto max-h-[600px] overflow-y-auto relative scroll-smooth"
    >
      <div className="min-w-[910px] sm:min-w-0">
        {/* Day-of-week header — sticky top-0, text-xs, font-medium, text-secondary, tracking-wide, uppercase */}
        <div className="grid grid-cols-7 border-b border-border bg-surface/95 sticky top-0 z-20 backdrop-blur-xs">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-2 text-xs font-semibold text-text-secondary tracking-wide uppercase text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid with gap-px, bg-border for grid lines */}
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
                colIndex={idx % 7}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
