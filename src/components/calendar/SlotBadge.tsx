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

  const baseClass = 'flex flex-col gap-0.5 px-2 py-1.5 rounded-md border transition-all duration-200 mb-1 select-none w-full'
  const interactiveClass = isAvailable
    ? 'bg-available-bg border-available-border text-available-text hover:bg-available-hover hover:shadow-sm cursor-pointer active:scale-[0.98]'
    : isBooked
    ? 'bg-booked-bg border-booked-border text-booked-text cursor-not-allowed opacity-80'
    : 'bg-blocked-bg border-blocked-border text-blocked-text cursor-not-allowed'

  return (
    <div
      className={`${baseClass} ${interactiveClass}`}
      onClick={() => { if (isAvailable) openModal(slot) }}
      role={isAvailable ? 'button' : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onKeyDown={(e) => { if (isAvailable && e.key === 'Enter') openModal(slot) }}
    >
      <span className="block text-[11px] font-semibold leading-tight tracking-tight">
        {formatTimeRange(slot.start_time, slot.end_time)}
      </span>
      <div className="flex items-center gap-1 max-sm:hidden">
        <span
          className="w-[5px] h-[5px] rounded-full flex-shrink-0 ring-1 ring-black/5"
          style={{ backgroundColor: crew?.color ?? '#cbd5e1' }}
        />
        <span className="text-[10px] font-medium opacity-80">{crew?.name ?? 'Unknown'}</span>
      </div>
    </div>
  )
}
