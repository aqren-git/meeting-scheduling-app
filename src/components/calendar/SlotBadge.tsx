import { useCalendarStore } from '@/store/calendarStore'
import { formatTimeRange, isSlotInPast } from '@/lib/dateUtils'
import type { Slot } from '@/types/slot'

interface SlotBadgeProps {
  slot: Slot
}

export function SlotBadge({ slot }: SlotBadgeProps) {
  const openModal = useCalendarStore((s) => s.openModal)
  const crew = slot.crews
  const isAvailable = slot.status === 'available'
  const isBooked = slot.status === 'booked'
  const isPast = isAvailable && isSlotInPast(slot.date, slot.start_time)

  const baseClass = 'flex flex-col gap-0.5 px-1 py-0.5 rounded-[4px] border transition-all duration-150 mb-0.5 select-none w-full sm:px-1.5 sm:py-1 sm:rounded-md'
  const stateClass = isPast
    ? 'bg-blocked-bg border-blocked-border text-blocked-text cursor-not-allowed'
    : isAvailable
    ? 'bg-available-bg border-available-border text-available-text hover:bg-available-hover hover:shadow-sm cursor-pointer active:scale-[0.98]'
    : isBooked
    ? 'bg-booked-bg border-booked-border text-booked-text cursor-not-allowed opacity-85'
    : 'bg-blocked-bg border-blocked-border text-blocked-text cursor-not-allowed'

  const clickable = isAvailable && !isPast

  return (
    <div
      className={`${baseClass} ${stateClass}`}
      onClick={() => { if (clickable) openModal(slot) }}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => { if (clickable && e.key === 'Enter') openModal(slot) }}
    >
      {/* Time range — primary line */}
      <span className="text-[10px] sm:text-xs font-semibold leading-tight truncate">{formatTimeRange(slot.start_time, slot.end_time)}</span>
      {/* Crew row — dot + name, only visible on tablet+ */}
      <div className="hidden sm:flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: crew?.color ?? '#cbd5e1' }}
        />
        <span className="text-[10px] sm:text-xs font-normal opacity-85 truncate">{crew?.name ?? 'Unknown'}</span>
      </div>
    </div>
  )
}
