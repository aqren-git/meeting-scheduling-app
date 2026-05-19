import { useMemo, useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { useCalendarStore } from '@/store/calendarStore'
import { useCalendarMonth } from '@/hooks/useCalendarMonth'
import { SlotBadge } from './SlotBadge'
import type { Slot } from '@/types/slot'
import { ChevronDown } from 'lucide-react'

interface CalendarDayListProps {
  slots: Slot[]
}

export function CalendarDayList({ slots }: CalendarDayListProps) {
  const { currentYear, currentMonth } = useCalendarStore()
  const calendarDays = useCalendarMonth(currentYear, currentMonth)
  const today = useMemo(() => new Date(), [])
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const slot of slots) {
      const existing = map.get(slot.date) ?? []
      existing.push(slot)
      map.set(slot.date, existing)
    }
    return map
  }, [slots])

  const dayEntries = useMemo(() => {
    return calendarDays
      .filter((d) => !d.isPadding && !d.isPast)
      .map((d) => {
        const daySlots = (d.dateStr ? slotsByDate.get(d.dateStr) ?? [] : [])
          .sort((a, b) => a.start_time.localeCompare(b.start_time))
        return { ...d, daySlots }
      })
  }, [calendarDays, slotsByDate])

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="divide-y divide-border">
      {dayEntries.map((day) => {
        if (!day.date) return null
        const dow = day.date.getDay()
        const isToday = isSameDay(day.date, today)
        const hasSlots = day.daySlots.length > 0
        const isExpanded = expandedDay === day.dateStr

        return (
          <div
            key={day.dateStr}
            className={`transition-colors ${isToday ? 'bg-brand-light/30' : ''}`}
          >
            {/* Day header row */}
            <button
              onClick={() => setExpandedDay(isExpanded ? null : day.dateStr)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-hover ${
                isToday ? '' : ''
              }`}
            >
              {/* Date badge */}
              <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                isToday ? 'bg-brand text-white' : 'bg-surface border border-border'
              }`}>
                <span className={`text-[10px] font-semibold leading-tight ${
                  isToday ? 'text-white/80' : 'text-text-muted'
                }`}>
                  {weekdays[dow].slice(0, 3)}
                </span>
                <span className={`text-sm font-bold leading-tight ${
                  isToday ? 'text-white' : 'text-text-primary'
                }`}>
                  {day.dayNumber}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isToday ? 'text-brand' : 'text-text-primary'}`}>
                  {format(day.date, 'MMMM d, yyyy')}
                  {isToday && <span className="ml-2 text-xs font-semibold bg-brand/10 text-brand px-1.5 py-0.5 rounded">Today</span>}
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {hasSlots
                    ? `${day.daySlots.filter((s) => s.status === 'available').length} available \u00b7 ${day.daySlots.filter((s) => s.status === 'booked').length} booked`
                    : 'No slots scheduled'}
                </p>
              </div>

              {/* Slots summary */}
              {hasSlots && (
                <div className="flex gap-1 flex-shrink-0">
                  {day.daySlots.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className={`w-2 h-2 rounded-full ${
                        s.status === 'available' ? 'bg-available-dot' : s.status === 'booked' ? 'bg-booked-dot' : 'bg-blocked-dot'
                      }`}
                    />
                  ))}
                  {day.daySlots.length > 4 && (
                    <span className="text-[10px] text-text-muted font-medium">+{day.daySlots.length - 4}</span>
                  )}
                </div>
              )}

              <ChevronDown
                size={14}
                className={`text-text-muted transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expanded slots */}
            {isExpanded && (
              <div className="px-5 pb-4 pt-2 bg-surface/30 animate-[fade-in_0.15s_ease-out]">
                {!hasSlots && (
                  <div className="py-6 text-center">
                    <p className="text-sm text-text-muted">No time slots available for this day.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {day.daySlots.map((slot) => (
                    <SlotBadge key={slot.id} slot={slot} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
