import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'

interface BookingInput {
  slotId: string
  bookedByName: string
  bookedByEmail: string
  propertyName: string
  notes?: string
}

export function useBooking() {
  const [loading, setLoading] = useState(false)

  async function book(input: BookingInput) {
    setLoading(true)
    try {
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
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        showErrorToast('This slot was just taken. Please choose another date.')
        return false
      }

      showSuccessToast('Booking confirmed!')

      const { crews } = data[0]
      supabase.functions.invoke('notify-booking', {
        body: {
          date: data[0].date,
          crewName: crews?.name ?? 'Unknown',
          propertyName: input.propertyName,
          bookedByName: input.bookedByName,
          bookedByEmail: input.bookedByEmail,
          notes: input.notes ?? null,
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
