import type { SlotStatus } from '@/constants/slotStatus'

export interface Slot {
  id: string
  crew_id: string
  date: string
  start_time: string
  end_time: string
  status: SlotStatus
  job_type: string
  property_name: string | null
  booked_by_name: string | null
  booked_by_email: string | null
  notes: string | null
  booked_at: string | null
  google_event_id?: string | null
  google_meet_link?: string | null
  created_at: string
  updated_at: string
  crews?: {
    name: string
    color: string
    display_order: number
    max_jobs_per_day: number
  }
}

export interface Crew {
  id: string
  name: string
  color: string
  display_order: number
  is_active: boolean
  max_jobs_per_day: number
}
