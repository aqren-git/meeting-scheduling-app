import type { Slot, Crew } from '@/types/slot'

export const MOCK_CREWS: Crew[] = [
  { id: 'crew-1', name: 'Team Alpha', color: '#16a34a', display_order: 1, is_active: true, max_jobs_per_day: 5 },
  { id: 'crew-2', name: 'Team Beta', color: '#2563eb', display_order: 2, is_active: true, max_jobs_per_day: 5 },
  { id: 'crew-3', name: 'Team Gamma', color: '#d97706', display_order: 3, is_active: true, max_jobs_per_day: 5 },
]

const SLOT_TIMES = [
  { start: '08:00', end: '10:00' },
  { start: '10:00', end: '12:00' },
  { start: '12:00', end: '14:00' },
  { start: '14:00', end: '16:00' },
  { start: '16:00', end: '18:00' },
]

const now = new Date()
const yr = now.getFullYear()
const mo = now.getMonth()

function dateStr(day: number) {
  return `${yr}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

let slotCounter = 0

export function generateMockSlots(): Slot[] {
  const slots: Slot[] = []
  const daysInMonth = new Date(yr, mo + 1, 0).getDate()
  const today = now.getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(yr, mo, day)
    const dow = d.getDay()
    if (dow === 0 || dow === 6) continue

    for (const crew of MOCK_CREWS) {
      for (const t of SLOT_TIMES) {
        const isPast = day < today
        const isBooked = !isPast && day % 5 === 0 && t.start === '10:00'
        slotCounter++
        slots.push({
          id: `slot-${slotCounter}`,
          crew_id: crew.id,
          date: dateStr(day),
          start_time: t.start,
          end_time: t.end,
          status: isPast ? 'blocked' : isBooked ? 'booked' : 'available',
          job_type: 'general',
          property_name: isBooked ? '1800 Main St' : null,
          booked_by_name: isBooked ? 'Jane Doe' : null,
          booked_by_email: isBooked ? 'jane@example.com' : null,
          notes: null,
          booked_at: isBooked ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          crews: crew,
        })
      }
    }
  }
  return slots
}
