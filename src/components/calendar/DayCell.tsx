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
  if (isPadding) {
    return <div className="bg-surface-default min-h-[120px] max-sm:min-h-[80px] p-2 max-sm:p-1" />
  }

  return (
    <div
      className={`min-h-[120px] max-sm:min-h-[80px] p-3 max-sm:p-1 relative
        ${isWeekend ? 'bg-surface' : 'bg-surface-default'}
        ${!isPast ? 'hover:bg-surface-hover' : ''}`}
    >
      <div className="flex items-center mb-1 max-sm:mb-0.5">
        {isToday ? (
          <span className="w-7 h-7 rounded-full bg-brand text-text-inverse font-semibold flex items-center justify-center text-sm">
            {dayNumber}
          </span>
        ) : (
          <span className={`text-sm ${isPast ? 'text-text-muted' : 'text-text-primary'}`}>
            {dayNumber}
          </span>
        )}
      </div>
      {slots.length === 0 && !isPast && (
        <p className="text-[10px] text-text-muted">No availability</p>
      )}
      {slots.map((slot) => (
        <SlotBadge key={slot.id} slot={slot} />
      ))}
    </div>
  )
}
