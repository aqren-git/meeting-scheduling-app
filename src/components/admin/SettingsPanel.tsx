import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton/Skeleton'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'

/* ── Types ── */
interface Setting {
  key: string
  value: string
}

interface FormFields {
  notification_email: string
  company_name: string
  calendar_title: string
}

interface AggregateCounts {
  crews: number
  slots: number
  bookings: number
  properties: number
}

/* ── Known setting keys ── */
const SETTING_KEYS = ['notification_email', 'company_name', 'calendar_title'] as const
type SettingKey = (typeof SETTING_KEYS)[number]

const FIELD_LABELS: Record<SettingKey, string> = {
  notification_email: 'Notification Email',
  company_name: 'Company Name',
  calendar_title: 'Calendar Title',
}

const FIELD_PLACEHOLDERS: Record<SettingKey, string> = {
  notification_email: 'admin@example.com',
  company_name: 'Reliance Building Services',
  calendar_title: 'Irvine Scheduling',
}

/* ── Component ── */
export function SettingsPanel() {
  const [fields, setFields] = useState<FormFields>({
    notification_email: '',
    company_name: '',
    calendar_title: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [counts, setCounts] = useState<AggregateCounts | null>(null)
  const [countsLoading, setCountsLoading] = useState(true)

  /* ── Initial load: settings + counts ── */
  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('key, value')

        if (cancelled) return
        if (error) throw error

        const map = new Map<string, string>()
        ;(data as Setting[] | null)?.forEach((s) => map.set(s.key, s.value))

        setFields({
          notification_email: map.get('notification_email') ?? '',
          company_name: map.get('company_name') ?? '',
          calendar_title: map.get('calendar_title') ?? '',
        })
      } catch (e) {
        if (cancelled) return
        showErrorToast(e instanceof Error ? e.message : 'Failed to load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    async function loadCounts() {
      try {
        const [crewsRes, slotsRes, propertiesRes] = await Promise.all([
          supabase.from('crews').select('*', { count: 'exact', head: true }),
          supabase.from('slots').select('*', { count: 'exact', head: true }),
          supabase.from('properties').select('*', { count: 'exact', head: true }),
        ])

        const bookingsRes = await supabase
          .from('slots')
          .select('*', { count: 'exact', head: true })
          .not('booked_by_name', 'is', null)

        if (cancelled) return

        setCounts({
          crews: crewsRes.count ?? 0,
          slots: slotsRes.count ?? 0,
          bookings: bookingsRes.count ?? 0,
          properties: propertiesRes.count ?? 0,
        })
      } catch {
        if (!cancelled) setCounts(null)
      } finally {
        if (!cancelled) setCountsLoading(false)
      }
    }

    loadSettings()
    loadCounts()

    return () => { cancelled = true }
  }, [])

  /* ── Save ── */
  async function handleSave() {
    setSaving(true)
    try {
      const upserts = (Object.entries(fields) as [SettingKey, string][]).map(([key, value]) =>
        supabase
          .from('settings')
          .upsert({ key, value: value.trim() }, { onConflict: 'key' })
      )

      const results = await Promise.all(upserts)
      const errors = results.filter((r) => r.error)
      if (errors.length > 0) throw errors[0].error

      showSuccessToast('Settings saved')
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  /* ── Render ── */
  if (loading) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          <Skeleton className="w-24 h-6" />
        </h2>
        <div className="bg-surface-default rounded-lg border border-border p-4 sm:p-5 shadow-sm mb-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="w-40 h-4 mb-2" />
              <Skeleton className="w-full h-9" />
            </div>
          ))}
        </div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          <Skeleton className="w-20 h-5" />
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-default rounded-lg border border-border p-4 shadow-sm">
              <Skeleton className="w-16 h-8 mx-auto mb-1" />
              <Skeleton className="w-12 h-3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Settings Form ── */}
      <h2 className="text-lg font-semibold text-text-primary mb-4">Settings</h2>

      <div className="bg-surface-default rounded-lg border border-border p-4 sm:p-5 shadow-sm mb-6">
        {SETTING_KEYS.map((key) => (
          <Input
            key={key}
            label={FIELD_LABELS[key]}
            placeholder={FIELD_PLACEHOLDERS[key]}
            value={fields[key]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFields({ ...fields, [key]: e.target.value })}
          />
        ))}

        <div className="flex justify-end pt-1">
          <Button loading={saving} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>

      {/* ── Stats Section ── */}
      <h3 className="text-base font-semibold text-text-primary mb-3">Stats</h3>

      {countsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface-default rounded-lg border border-border p-4 shadow-sm text-center">
              <Skeleton className="w-16 h-8 mx-auto mb-1" />
              <Skeleton className="w-12 h-3 mx-auto" />
            </div>
          ))}
        </div>
      ) : counts ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            { label: 'Crews', value: counts.crews },
            { label: 'Slots Total', value: counts.slots },
            { label: 'Bookings', value: counts.bookings },
            { label: 'Properties', value: counts.properties },
          ] as const).map((stat) => (
            <div
              key={stat.label}
              className="bg-surface-default rounded-lg border border-border p-4 shadow-sm text-center"
            >
              <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">Unable to load stats.</p>
      )}
    </div>
  )
}
