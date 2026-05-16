import { STATUS_STYLES, type SlotStatus } from '@/constants/slotStatus'

interface BadgeProps {
  status: SlotStatus
}

export function Badge({ status }: BadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.blocked
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}
