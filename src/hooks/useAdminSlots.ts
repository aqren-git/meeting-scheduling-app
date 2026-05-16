import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Slot } from '@/types/slot'

export function useAdminSlots(start: string, end: string) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchSlots() {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('slots')
          .select('*, crews(name, color, display_order)')
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })

        if (cancelled) return
        if (err) throw err
        setSlots(data ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load slots')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSlots()
    return () => { cancelled = true }
  }, [start, end])

  const refresh = async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('slots')
        .select('*, crews(name, color, display_order)')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
      if (err) throw err
      setSlots(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to refresh slots')
    } finally {
      setLoading(false)
    }
  }

  return { slots, loading, error, refresh }
}

export function useAllBookings() {
  const [bookings, setBookings] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchBookings() {
      setLoading(true)
      try {
        const { data, error: err } = await supabase
          .from('slots')
          .select('*, crews(name, color, display_order)')
          .eq('status', 'booked')
          .order('booked_at', { ascending: false, nullsFirst: true })

        if (cancelled) return
        if (err) throw err
        setBookings(data ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load bookings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBookings()
    return () => { cancelled = true }
  }, [])

  return { bookings, loading, error }
}
