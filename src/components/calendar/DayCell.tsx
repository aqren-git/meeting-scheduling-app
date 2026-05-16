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
    return <div className="bg-surface-default sm:min-h-[120px]" />
  }

  return (
    <div
      className={`overflow-y-auto transition-colors duration-150
        ${isWeekend ? 'bg-surface' : 'bg-surface-default'}
        ${isToday ? 'ring-1 ring-brand/15 ring-inset' : ''}
        ${!isPast && !isWeekend && !isToday ? 'hover:bg-surface-hover' : ''}`}
    >
      {/* Day Number — top-left per spec 6.5 */}
      <div className="sticky top-0 z-10 bg-inherit px-2 pt-2 pb-1 sm:px-3 sm:pt-3 sm:pb-1.5">
        {isToday ? (
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-brand text-text-inverse font-semibold inline-flex items-center justify-center text-xs sm:text-sm leading-none shadow-sm">
            {dayNumber}
          </span>
        ) : (
          <span className={`text-xs sm:text-sm leading-none ${isPast ? 'text-text-muted' : 'text-text-primary'}`}>
            {dayNumber}
          </span>
        )}
      </div>

      {/* Slots — stacked by start_time asc per spec 6.5 */}
      <div className="px-2 pb-2 sm:px-3 sm:pb-3">
        {sortedSlots.length === 0 && !isPast && (
          <p className="text-[10px] sm:text-xs text-text-muted/60 leading-tight">No availability</p>
        )}
        {sortedSlots.map((slot) => (
          <SlotBadge key={slot.id} slot={slot} />
        ))}
      </div>
    </div>
  )
}
