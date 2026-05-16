import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Slot } from '@/types/slot'

export function useSlots(start: string, end: string) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected'>('connected')

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

        if (cancelled) return
        if (err) throw err
        setSlots(data ?? [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load schedule')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSlots()

    const channel = supabase
      .channel(`slots-${start}-${end}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'slots' },
        (payload) => {
          if (cancelled) return

          if (payload.eventType === 'INSERT') {
            const newSlot = payload.new as Slot
            if (newSlot.date >= start && newSlot.date <= end) {
              setSlots((prev) => [...prev, newSlot])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Slot
            setSlots((prev) =>
              prev.map((s) => s.id === updated.id
                ? { ...s, ...updated, crews: s.crews }
                : s
              )
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Slot
            setSlots((prev) => prev.filter((s) => s.id !== deleted.id))
          }
        }
      )
      .subscribe((status) => {
        if (!cancelled) {
          setRealtimeStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected')
        }
      })

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [start, end])

  return { slots, loading, error, realtimeStatus }
}
