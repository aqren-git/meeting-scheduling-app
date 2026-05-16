import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Crew } from '@/types/slot'

export function useCrews() {
  const [crews, setCrews] = useState<Crew[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCrews() {
      try {
        const { data, error: err } = await supabase
          .from('crews')
          .select('*')
          .eq('is_active', true)
          .order('display_order')

        if (cancelled) return
        if (err) throw err
        setCrews(data ?? [])
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load crews')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCrews()
    return () => { cancelled = true }
  }, [])

  return { crews, loading, error }
}
