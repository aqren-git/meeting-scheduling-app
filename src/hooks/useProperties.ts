import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Property } from '@/types/property'

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ── Initial load ── */
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data, error: err } = await supabase
          .from('properties')
          .select('*')
          .order('name')
        if (cancelled) return
        if (err) throw err
        setProperties(data ?? [])
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load properties')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => { cancelled = true }
  }, [])

  /* ── Manual refresh ── */
  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('properties')
        .select('*')
        .order('name')
      if (err) throw err
      setProperties(data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const addProperty = async (prop: Omit<Property, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('properties')
      .insert(prop)
      .select()
      .single()
    if (error) throw error
    setProperties((prev) => [...prev, data])
    return data
  }

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setProperties((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }

  const deleteProperty = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return { properties, loading, error, addProperty, updateProperty, deleteProperty, refresh }
}
