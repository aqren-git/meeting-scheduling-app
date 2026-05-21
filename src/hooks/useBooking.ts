import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isSlotInPast } from '@/lib/dateUtils'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'

interface BookingInput {
  slotId: string
  bookedByName: string
  bookedByEmail: string
  propertyName: string
  notes?: string
  date: string
  startTime: string
}

export function useBooking() {
  const [loading, setLoading] = useState(false)

  async function book(input: BookingInput) {
    setLoading(true)
    try {
      if (isSlotInPast(input.date, input.startTime)) {
        showErrorToast('This time slot has already passed and cannot be booked.')
        return false
      }

      /* Check crew daily booking limit */
      const { data: crewIdResult } = await supabase
        .from('slots')
        .select('crew_id')
        .eq('id', input.slotId)
        .single()

      if (crewIdResult) {
        const { data: crewData } = await supabase
          .from('crews')
          .select('max_jobs_per_day')
          .eq('id', crewIdResult.crew_id)
          .single()

        const maxSlots = crewData?.max_jobs_per_day ?? 0
        if (maxSlots > 0) {
          const { count: bookedCount } = await supabase
            .from('slots')
            .select('id', { count: 'exact', head: true })
            .eq('crew_id', crewIdResult.crew_id)
            .eq('date', input.date)
            .eq('status', 'booked')

          if (bookedCount !== null && bookedCount >= maxSlots) {
            showErrorToast(`This crew has reached its daily booking limit (${maxSlots}). No more bookings available for this date.`)
            return false
          }
        }
      }

      const { data, error } = await supabase
        .from('slots')
        .update({
          status: 'booked',
          booked_by_name: input.bookedByName,
          booked_by_email: input.bookedByEmail,
          property_name: input.propertyName,
          notes: input.notes ?? null,
          booked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.slotId)
        .eq('status', 'available')
        .gte('date', new Date().toISOString().split('T')[0])
        .select('*, crews(name, color, display_order, max_jobs_per_day)')

      if (error) throw error

      if (!data || data.length === 0) {
        showErrorToast('This slot was just taken. Please choose another date.')
        return false
      }

      showSuccessToast('Booking confirmed!')

      const { crews } = data[0]
      const crewName = crews?.name ?? 'Unknown'

      // Create Google Calendar event first, then send notifications with the meet link
      const calendarPromise = supabase.functions.invoke('create-calendar-event', {
        body: {
          slotId: data[0].id,
          customerEmail: input.bookedByEmail,
          startTime: `${data[0].date}T${data[0].start_time}`,
          endTime: `${data[0].date}T${data[0].end_time}`,
          title: `Reliance Service Walkthrough: ${input.propertyName}`,
          description: `Service assessment booked by ${input.bookedByName}.\nNotes: ${input.notes ?? 'None'}`
        }
      }).then(res => res.data as { meetLink?: string } | null).catch(() => null)

      // Notify with or without meet link
      const { meetLink } = await calendarPromise ?? {}

      supabase.functions.invoke('notify-booking', {
        body: {
          date: data[0].date,
          crewName,
          propertyName: input.propertyName,
          bookedByName: input.bookedByName,
          bookedByEmail: input.bookedByEmail,
          notes: input.notes ?? null,
          meetLink: meetLink ?? null,
        },
      }).catch(() => {
        // Fire-and-forget — notification failure should not block UI
      })

      return true
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Booking failed. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { book, loading }
}
