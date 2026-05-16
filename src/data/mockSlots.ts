import type { Slot, Crew } from '@/types/slot'

export const MOCK_CREWS: Crew[] = [
  { id: 'crew-1', name: 'Team Alpha', color: '#16a34a', display_order: 1, is_active: true },
  { id: 'crew-2', name: 'Team Beta', color: '#2563eb', display_order: 2, is_active: true },
  { id: 'crew-3', name: 'Team Gamma', color: '#d97706', display_order: 3, is_active: true },
]

const now = new Date()
const yr = now.getFullYear()
const mo = now.getMonth()

function dateStr(day: number) {
  return `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function generateMockSlots(): Slot[] {
  const slots: Slot[] = []
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const today = now.getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(yr, mo, day)
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue

    for (const crew of MOCK_CREWS) {
      const isPast = day < today
      slots.push({
        id: `slot-${crew.id}-${day}`,
        crew_id: crew.id,
        date: dateStr(day),
        start_time: null,
        end_time: null,
        status: isPast ? 'blocked' : day % 5 === 0 ? 'booked' : 'available',
        job_type: 'general',
        property_name: day % 5 === 0 ? '1800 Main St' : null,
        booked_by_name: day % 5 === 0 ? 'Jane Doe' : null,
        booked_by_email: day % 5 === 0 ? 'jane@example.com' : null,
        notes: null,
        booked_at: day % 5 === 0 ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        crews: crew,
      })
    }
  }
  return slots
}
