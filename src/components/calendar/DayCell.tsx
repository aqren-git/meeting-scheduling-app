import { useMemo } from 'react'
import type { Slot } from '@/types/slot'
import { SlotBadge } from './SlotBadge'
import { Tooltip } from '@/components/ui/tooltip/Tooltip'
import { isSlotInPast } from '@/lib/dateUtils'

interface DayCellProps {
  dayNumber: number | null
  isPadding: boolean
  isPast: boolean
  isToday: boolean
  isWeekend: boolean
  slots: Slot[]
  colIndex: number
}

export function DayCell({ dayNumber, isPadding, isPast, isToday, isWeekend, slots, colIndex }: DayCellProps) {
  const sortedSlots = useMemo(
    () => [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [slots]
  )

  const hasNoAvailableSlots = useMemo(() => {
    if (isPast) return true
    return slots.length === 0 || slots.every((s) => s.status !== 'available' || isSlotInPast(s.date, s.start_time))
  }, [slots, isPast])

  if (isPadding) {
    return <div className="bg-surface-default sm:min-h-[120px]" />
  }

  const tooltipPosition = dayNumber && dayNumber <= 7 ? 'bottom' : 'top'
  const tooltipAlign = colIndex === 0 ? 'left' : colIndex === 6 ? 'right' : 'center'
  const tooltipContent = isToday ? 'No slots available today' : 'No slots available'

  return (
    <Tooltip
      content={tooltipContent}
      disabled={!hasNoAvailableSlots}
      position={tooltipPosition}
      align={tooltipAlign}
    >
      <div
        id={isToday ? 'today-cell' : undefined}
        className={`overflow-y-auto min-h-[90px] sm:min-h-[130px] transition-colors duration-150 h-full w-full
          ${isWeekend ? 'bg-surface' : 'bg-surface-default'}
          ${isToday ? 'ring-1 ring-brand/15 ring-inset' : ''}
          ${!isPast && !isWeekend && !isToday ? 'hover:bg-surface-hover' : ''}`}
      >
        {/* Day Number — top-left per spec 6.5 */}
        <div className="sticky top-0 z-10 bg-inherit px-2 pt-2 pb-1 sm:px-3 sm:pt-3 sm:pb-1.5">
          {isToday ? (
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-none bg-brand text-text-inverse font-black inline-flex items-center justify-center text-xs sm:text-sm leading-none shadow-sm">
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
    </Tooltip>
  )
}
