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
    return <div className="bg-surface-default min-h-[160px] max-sm:min-h-[100px] p-[6px] max-sm:p-[3px]" />
  }

  return (
    <div
      className={`min-h-[160px] max-sm:min-h-[100px] p-[6px] max-sm:p-[3px] relative overflow-y-auto transition-colors duration-150
        ${isWeekend ? 'bg-surface' : 'bg-surface-default'}
        ${isToday ? 'ring-1 ring-brand/20 ring-inset' : ''}
        ${!isPast && !isWeekend && !isToday ? 'hover:bg-surface-hover' : ''}`}
    >
      {/* Day Number — top-left per spec 6.5 */}
      <div className="mb-1">
        {isToday ? (
          <span className="w-7 h-7 rounded-full bg-brand text-text-inverse font-semibold inline-flex items-center justify-center text-sm leading-none shadow-sm">
            {dayNumber}
          </span>
        ) : (
          <span className={`text-sm leading-none ${isPast ? 'text-text-muted' : 'text-text-primary'}`}>
            {dayNumber}
          </span>
        )}
      </div>

      {/* Slots — stacked by start_time asc per spec 6.5 */}
      {sortedSlots.length === 0 && !isPast && (
        <p className="text-[10px] text-text-muted/60 mt-1">No slots</p>
      )}
      {sortedSlots.map((slot) => (
        <SlotBadge key={slot.id} slot={slot} />
      ))}
    </div>
  )
}
