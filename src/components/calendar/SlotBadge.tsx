import { useCalendarStore } from '@/store/calendarStore'
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
      className={`flex items-start gap-1.5 px-[7px] py-[5px] rounded-md border transition-[background-color,opacity] duration-200 mb-[3px] select-none ${bg}`}
      onClick={() => { if (isAvailable) openModal(slot) }}
      role={isAvailable ? 'button' : undefined}
      tabIndex={isAvailable ? 0 : undefined}
      onKeyDown={(e) => { if (isAvailable && e.key === 'Enter') openModal(slot) }}
    >
      <span
        className="w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[3px]"
        style={{ backgroundColor: crew?.color ?? '#cbd5e1' }}
      />
      <div>
        <span className="block text-[11px] font-medium leading-tight">{crew?.name ?? 'Unknown'}</span>
        <span className="block text-[10px] font-normal opacity-80 leading-tight max-sm:hidden">
          {isAvailable ? 'Available' : isBooked ? 'Booked' : 'Unavailable'}
        </span>
      </div>
    </div>
  )
}
