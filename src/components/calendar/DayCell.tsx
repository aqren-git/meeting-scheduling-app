import { useMemo } from 'react'
import type { Slot } from '@/types/slot'
import { SlotBadge } from './SlotBadge'

interface DayCellProps {
  dayNumber: number | null
  isPadding: boolean
  isPast: boolean
  isToday: boolean
  isWeekend: boolean
  slots: Slot[]
}

export function DayCell({ dayNumber, isPadding, isPast, isToday, isWeekend, slots }: DayCellProps) {
  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [slots]
  )

  if (isPadding) {
    return <div className="bg-surface-default min-h-[160px] max-sm:min-h-[100px] p-1.5 max-sm:p-1" />
  }

  return (
    <div
      className={`min-h-[160px] max-sm:min-h-[100px] p-1.5 max-sm:p-1 relative overflow-y-auto transition-colors duration-150
        ${isWeekend ? 'bg-surface' : 'bg-surface-default'}
        ${isToday ? 'ring-1 ring-brand/15 ring-inset' : ''}
        ${!isPast && !isWeekend ? 'hover:bg-surface-hover' : ''}`}
    >
      {/* Day Number */}
      <div className="flex items-center justify-center mb-1 max-sm:mb-0.5 sticky top-0 z-10">
        {isToday ? (
          <span className="w-7 h-7 rounded-full bg-brand text-text-inverse font-semibold flex items-center justify-center text-[13px] leading-none shadow-sm">
            {dayNumber}
          </span>
        ) : (
          <span className={`text-[13px] leading-none ${isPast ? 'text-text-muted' : 'text-text-secondary font-medium'}`}>
            {dayNumber}
          </span>
        )}
      </div>

      {/* Slot List */}
      {sortedSlots.length === 0 && !isPast && (
        <p className="text-[9px] text-text-muted text-center mt-2">\u2014</p>
      )}
      {sortedSlots.map((slot) => (
        <SlotBadge key={slot.id} slot={slot} />
      ))}
    </div>
  )
}
