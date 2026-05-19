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

interface UseAllBookingsParams {
  page: number
  pageSize: number
  crewFilter?: string
  dateFrom?: string
  dateTo?: string
  searchText?: string
  refreshKey: number
}

export function useAllBookings({ page, pageSize, crewFilter, dateFrom, dateTo, searchText, refreshKey }: UseAllBookingsParams) {
  const [bookings, setBookings] = useState<Slot[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchBookings() {
      setLoading(true)
      setError(null)
      try {
        let query = supabase.from('slots').select('*, crews(name, color, display_order)', { count: 'exact' })

        query = query.eq('status', 'booked')

        if (crewFilter) {
          query = query.eq('crew_id', crewFilter)
        }
        if (dateFrom) {
          query = query.gte('date', dateFrom)
        }
        if (dateTo) {
          query = query.lte('date', dateTo)
        }
        if (searchText?.trim()) {
          const q = searchText.trim()
          query = query.or(
            `property_name.ilike.%${q}%,booked_by_name.ilike.%${q}%,booked_by_email.ilike.%${q}%`,
          )
        }

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, error: err, count } = await query
          .order('booked_at', { ascending: false, nullsFirst: false })
          .range(from, to)

        if (cancelled) return
        if (err) throw err
        setBookings(data ?? [])
        setTotal(count ?? 0)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load bookings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchBookings()
    return () => { cancelled = true }
  }, [page, pageSize, crewFilter, dateFrom, dateTo, searchText, refreshKey])

  return { bookings, total, loading, error }
}
