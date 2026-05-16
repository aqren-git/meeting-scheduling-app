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

  const bg = isAvailable ? 'bg-available-bg border-available-border text-available-text hover:bg-available-hover cursor-pointer'
    : isBooked ? 'bg-booked-bg border-booked-border text-booked-text cursor-not-allowed opacity-85'
    : 'bg-blocked-bg border-blocked-border text-blocked-text cursor-not-allowed'

  return (
    <div
      className={`flex flex-col gap-0.5 px-[6px] py-[4px] rounded-md border transition-[background-color,opacity] duration-200 mb-[3px] select-none w-full ${bg}`}
      onClick={() => { if (isAvailable) openModal(slot) }}
      role={isAvailable ? 'button' : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onKeyDown={(e) => { if (isAvailable && e.key === 'Enter') openModal(slot) }}
    >
      <span className="block text-[11px] font-semibold leading-tight">
        {formatTimeRange(slot.start_time, slot.end_time)}
      </span>
      <div className="flex items-center gap-1 max-sm:hidden">
        <span
          className="w-[6px] h-[6px] rounded-full flex-shrink-0"
          style={{ backgroundColor: crew?.color ?? '#cbd5e1' }}
        />
        <span className="text-[10px] font-normal opacity-85">{crew?.name ?? 'Unknown'}</span>
      </div>
    </div>
  )
}
