export const SLOT_STATUS = {
  AVAILABLE: 'available' as const,
  BOOKED: 'booked' as const,
  BLOCKED: 'blocked' as const,
  CANCELLED: 'cancelled' as const,
} as const

export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS]

export const STATUS_STYLES: Record<SlotStatus, { bg: string; text: string; label: string }> = {
  available: {
    bg: 'bg-available-bg hover:bg-available-hover cursor-pointer',
    text: 'text-available-text',
    label: 'Available',
  },
  booked: {
    bg: 'bg-booked-bg cursor-not-allowed',
    text: 'text-booked-text',
    label: 'Booked',
  },
  blocked: {
    bg: 'bg-blocked-bg cursor-not-allowed',
    text: 'text-blocked-text',
    label: 'Unavailable',
  },
  cancelled: {
    bg: 'bg-cancelled-bg cursor-not-allowed',
    text: 'text-cancelled-text',
    label: 'Cancelled',
  },
}
