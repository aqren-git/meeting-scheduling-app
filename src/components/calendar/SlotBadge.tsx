import { useCalendarStore } from '@/store/calendarStore'
import { formatTimeRange } from '@/lib/dateUtils'
import type { Slot } from '@/types/slot'

interface SlotBadgeProps {
  slot: Slot
}

export function SlotBadge({ slot }: SlotBadgeProps) {
  const openModal = useCalendarStore((s) => s.openModal)
  const crew = slot.crews
  const isAvailable = slot.status === 'available'
  const isBooked = slot.status === 'booked'

  /* Spec 6.6: padding 4px 6px, gap 2px, rounded-md, mb-3px */
  const baseClass = 'flex flex-col gap-0.5 px-1.5 py-1 rounded-md border transition-all duration-200 mb-0.5 select-none w-full max-sm:px-1 max-sm:py-[3px]'
  const stateClass = isAvailable
    ? 'bg-available-bg border-available-border text-available-text hover:bg-available-hover hover:shadow-sm cursor-pointer active:scale-[0.98]'
    : isBooked
    ? 'bg-booked-bg border-booked-border text-booked-text cursor-not-allowed opacity-85'
    : 'bg-blocked-bg border-blocked-border text-blocked-text cursor-not-allowed'

  return (
    <div
      className={`${baseClass} ${stateClass}`}
      onClick={() => { if (isAvailable) openModal(slot) }}
      role={isAvailable ? 'button' : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onKeyDown={(e) => { if (isAvailable && e.key === 'Enter') openModal(slot) }}
    >
      {/* Spec 6.6: slot-time — 11px, 600 */}
      <span className="block text-[11px] font-semibold leading-tight">
        {formatTimeRange(slot.start_time, slot.end_time)}
      </span>
      {/* Spec 6.6: slot-footer — dot + crew, hidden on mobile */}
      <div className="flex items-center gap-1 max-sm:hidden">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: crew?.color ?? '#cbd5e1' }}
        />
        {/* Spec 6.6: slot-crew — 10px, 400, opacity 0.85 */}
        <span className="text-[10px] font-normal opacity-85">{crew?.name ?? 'Unknown'}</span>
      </div>
    </div>
  )
}
