import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminSlots } from '@/hooks/useAdminSlots'
import { useCrews } from '@/hooks/useCrews'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton/Skeleton'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'
import { isSlotInPast, isPastDate } from '@/lib/dateUtils'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  CalendarX2,
  AlertTriangle,
} from 'lucide-react'
import {
  addWeeks,
  subWeeks,
  format,
  startOfWeek,
  endOfWeek,
  parseISO,
  addDays,
  addHours,
  isAfter,
} from 'date-fns'
import type { Slot } from '@/types/slot'

/* ── Constants ── */
const JOB_TYPES = [
  'general',
  'tile',
  'painting',
  'flooring',
  'plumbing',
  'electrical',
  'inspection',
] as const

const SLOT_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'blocked', label: 'Blocked' },
] as const

const BATCH_SIZE = 20

/* ── Local time helpers (mirror pattern from lib/dateUtils) ── */
function parseTimeStr(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function formatTime(timeStr: string): string {
  const d = parseTimeStr(timeStr)
  return format(d, 'h:mm a')
}

/* ── Status dot color ── */
function statusDotColor(status: string): string {
  if (status === 'available') return 'bg-available-dot'
  if (status === 'booked') return 'bg-booked-dot'
  return 'bg-blocked-dot'
}

/* ── Border left color ── */
function statusBorderColor(status: string): string {
  if (status === 'available') return 'border-l-available-dot'
  if (status === 'booked') return 'border-l-booked-dot'
  return 'border-l-blocked-dot'
}

/* ═══════════════════════════════════════════════════════════════
   Add / Edit Slot Form (shared between Add & Edit modals)
   ═══════════════════════════════════════════════════════════════ */
interface SlotFormProps {
  /** If non-null, we're editing; otherwise adding */
  slot?: Slot | null
  /** Date to pre-fill for new slots */
  defaultDate: string
  /** Callback after successful save */
  onSuccess: () => void
  /** Close the modal */
  onClose: () => void
  /** All crews for the dropdown */
  crews: { id: string; name: string; color: string; max_jobs_per_day: number }[]
  /** Existing slots to check for duplicates (add mode only) */
  existingSlots?: Slot[]
}

function SlotForm({ slot, defaultDate, onSuccess, onClose, crews, existingSlots }: SlotFormProps) {
  const isEdit = !!slot
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [date, setDate] = useState(slot?.date ?? defaultDate)
  const [crewId, setCrewId] = useState(slot?.crew_id ?? '')
  const [startTime, setStartTime] = useState(slot?.start_time ?? '08:00')
  const [endTime, setEndTime] = useState(slot?.end_time ?? '10:00')
  const [status, setStatus] = useState(slot?.status === 'booked' ? 'available' : (slot?.status ?? 'available'))
  const [jobType, setJobType] = useState(slot?.job_type ?? 'general')

  /* ── Validation ── */
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!date) errs.date = 'Date is required'
    if (!crewId) errs.crewId = 'Crew is required'
    if (!startTime) errs.startTime = 'Start time is required'
    if (!endTime) errs.endTime = 'End time is required'
    if (startTime && endTime && parseTimeStr(startTime) >= parseTimeStr(endTime)) {
      errs.endTime = 'End time must be after start time'
    }

    /* Reject past dates/times */
    if (!errs.date && !errs.startTime && isSlotInPast(date, startTime)) {
      errs.date = 'Cannot create slots in the past'
    }

    /* Check max slots per day */
    if (!errs.crewId && !errs.date) {
      const crew = crews.find((c) => c.id === crewId)
      if (crew && crew.max_jobs_per_day > 0) {
        const existingCount = existingSlots?.filter(
          (s) => s.crew_id === crewId && s.date === date && (isEdit && slot ? s.id !== slot.id : true),
        ).length ?? 0
        if (existingCount >= crew.max_jobs_per_day) {
          errs.date = `"${crew.name}" daily slot limit reached (${crew.max_jobs_per_day}). No more slots can be added for this date.`
        }
      }
    }

    /* Check duplicates (only for add mode, available slots) */
    if (!isEdit && status === 'available' && !errs.crewId && !errs.date && !errs.startTime) {
      const dup = existingSlots?.find(
        (s) =>
          s.crew_id === crewId &&
          s.date === date &&
          s.start_time === startTime &&
          s.status === 'available',
      )
      if (dup) {
        errs.startTime =
          'An available slot already exists for this crew, date, and time'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Submit ── */
  async function handleSubmit() {
    if (!validate()) return

    if (isSlotInPast(date, startTime)) {
      showErrorToast('Cannot save — this slot is in the past.')
      return
    }

    /* Server-side max slots check */
    const crew = crews.find((c) => c.id === crewId)
    if (crew && crew.max_jobs_per_day > 0) {
      const { count } = await supabase
        .from('slots')
        .select('id', { count: 'exact', head: true })
        .eq('crew_id', crewId)
        .eq('date', date)
        .neq('id', slot?.id ?? '')

      if (count !== null && count >= crew.max_jobs_per_day) {
        showErrorToast(`"${crew.name}" daily slot limit reached (${crew.max_jobs_per_day}). No more slots can be added for this date.`)
        setSaving(false)
        return
      }
    }

    setSaving(true)

    try {
      if (isEdit && slot) {
        const { error } = await supabase
          .from('slots')
          .update({
            crew_id: crewId,
            date,
            start_time: startTime,
            end_time: endTime,
            status,
            job_type: jobType,
            updated_at: new Date().toISOString(),
          })
          .eq('id', slot.id)

        if (error) throw error
        showSuccessToast('Slot updated')
      } else {
        const { error } = await supabase.from('slots').insert({
          crew_id: crewId,
          date,
          start_time: startTime,
          end_time: endTime,
          status,
          job_type: jobType,
        })

        if (error) throw error
        showSuccessToast('Slot added')
      }

      onSuccess()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to save slot')
    } finally {
      setSaving(false)
    }
  }

  const isBookedSlot = slot?.status === 'booked'

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-0">
      {/* Booker info — read-only when editing a booked slot */}
      {isEdit && isBookedSlot && (
        <div className="mb-4 p-3 rounded-md bg-booked-bg border border-booked-border">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={14} className="text-booked-text" />
            <span className="text-xs font-semibold text-booked-text">
              This slot is booked. Changing it may affect the booking.
            </span>
          </div>
          <div className="text-[12px] text-booked-text space-y-0.5">
            <p>
              <span className="font-medium">Booked by:</span>{' '}
              {slot.booked_by_name ?? 'Unknown'}
            </p>
            <p>
              <span className="font-medium">Email:</span>{' '}
              {slot.booked_by_email ?? '—'}
            </p>
            {slot.property_name && (
              <p>
                <span className="font-medium">Property:</span>{' '}
                {slot.property_name}
              </p>
            )}
            {slot.notes && (
              <p>
                <span className="font-medium">Notes:</span> {slot.notes}
              </p>
            )}
            {slot.booked_at && (
              <p>
                <span className="font-medium">Booked at:</span>{' '}
                {format(parseISO(slot.booked_at), 'MMM d, yyyy h:mm a')}
              </p>
            )}
          </div>
        </div>
      )}

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        error={errors.date}
        required
      />

      {/* Crew selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-1">
          Crew
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={crewId}
          onChange={(e) => setCrewId(e.target.value)}
          className={`w-full h-9 px-3 rounded-md border text-sm text-text-primary bg-surface-default outline-none transition-[border-color,box-shadow] duration-150 appearance-none
            ${errors.crewId ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)]'}
          `}
        >
          <option value="">Select a crew</option>
          {crews.map((c) => (
            <option key={c.id} value={c.id}>
              ● {c.name}
            </option>
          ))}
        </select>
        {errors.crewId && (
          <p className="text-xs text-red-500 mt-1">{errors.crewId}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={errors.startTime}
          required
        />
        <Input
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={errors.endTime}
          required
        />
      </div>

      {/* Status selector (only Available / Blocked — not Booked) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-1">
          Status
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'available' | 'blocked')}
          className="w-full h-9 px-3 rounded-md border border-border text-sm text-text-primary bg-surface-default outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)] transition-[border-color,box-shadow] duration-150 appearance-none"
        >
          {SLOT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-1">
          Job Type
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-border text-sm text-text-primary bg-surface-default outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)] transition-[border-color,box-shadow] duration-150 appearance-none"
        >
          {JOB_TYPES.map((jt) => (
            <option key={jt} value={jt}>
              {jt.charAt(0).toUpperCase() + jt.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button loading={saving} onClick={handleSubmit} type="button">
          {isEdit ? 'Update Slot' : 'Add Slot'}
        </Button>
      </div>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Bulk Create Modal
   ═══════════════════════════════════════════════════════════════ */
interface BulkCreateFormProps {
  crews: { id: string; name: string; color: string; max_jobs_per_day: number }[]
  onSuccess: () => void
  onClose: () => void
}

function BulkCreateForm({ crews, onSuccess, onClose }: BulkCreateFormProps) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('16:00')
  const [duration, setDuration] = useState(2)
  const [gap, setGap] = useState(0)
  const [selectedCrews, setSelectedCrews] = useState<string[]>([])
  const [status, setStatus] = useState<'available' | 'blocked'>('available')
  const [weekdaysOnly, setWeekdaysOnly] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [existingCounts, setExistingCounts] = useState<Map<string, number>>(new Map())

  /* ── Fetch existing slot counts for the date range ── */
  useEffect(() => {
    if (!startDate || !endDate || selectedCrews.length === 0) {
      setExistingCounts(new Map())
      return
    }
    let cancelled = false
    supabase
      .from('slots')
      .select('crew_id, date', { count: 'exact' })
      .in('crew_id', selectedCrews)
      .gte('date', startDate)
      .lte('date', endDate)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return
        const counts = new Map<string, number>()
        for (const row of data) {
          const key = `${row.crew_id}|${row.date}`
          counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        if (!cancelled) setExistingCounts(counts)
      })
    return () => { cancelled = true }
  }, [startDate, endDate, selectedCrews])

  /* ── Toggle crew selection ── */
  function toggleCrew(id: string) {
    setSelectedCrews((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )
  }

  const previewSlots = useMemo(() => {
    if (!startDate || !endDate || !startTime || !endTime || selectedCrews.length === 0) return []

    const slots: { crew_id: string; date: string; start_time: string; end_time: string; status: string }[] = []
    let current = parseISO(startDate)
    const end = parseISO(endDate)

    while (!isAfter(current, end)) {
      const dow = current.getDay()
      if (weekdaysOnly && (dow === 0 || dow === 6)) {
        current = addDays(current, 1)
        continue
      }

      let t = parseTimeStr(startTime)
      const endT = parseTimeStr(endTime)

      while (t < endT) {
        const slotEnd = addHours(t, duration)
        if (slotEnd > endT) break

        const startStr = format(t, 'HH:mm')
        const endStr = format(slotEnd, 'HH:mm')

        for (const crewId of selectedCrews) {
          slots.push({
            crew_id: crewId,
            date: format(current, 'yyyy-MM-dd'),
            start_time: startStr,
            end_time: endStr,
            status,
          })
        }
        t = addHours(t, duration + gap)
      }
      current = addDays(current, 1)
    }

    return slots
  }, [
    startDate,
    endDate,
    startTime,
    endTime,
    duration,
    gap,
    selectedCrews,
    status,
    weekdaysOnly,
  ])

  /* ── Validation ── */
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!startDate) errs.startDate = 'Start date is required'
    if (!endDate) errs.endDate = 'End date is required'
    if (startDate && endDate && isAfter(parseISO(startDate), parseISO(endDate))) {
      errs.endDate = 'End date must be after start date'
    }
    if (!startTime) errs.startTime = 'Start time is required'
    if (!endTime) errs.endTime = 'End time is required'
    if (startTime && endTime && parseTimeStr(startTime) >= parseTimeStr(endTime)) {
      errs.endTime = 'End time must be after start time'
    }
    if (startDate && isSlotInPast(startDate, startTime)) {
      errs.startDate = 'Start date/time cannot be in the past'
    }
    if (duration < 0.5) errs.duration = 'Duration must be at least 30 minutes'
    if (gap < 0) errs.gap = 'Gap cannot be negative'
    if (selectedCrews.length === 0) errs.crews = 'Select at least one crew'

    /* Check max slots per crew per date */
    if (!Object.keys(errs).length && previewSlots.length > 0) {
      const violations: string[] = []
      const newCounts = new Map<string, number>()
      for (const slot of previewSlots) {
        const key = `${slot.crew_id}|${slot.date}`
        newCounts.set(key, (newCounts.get(key) ?? 0) + 1)
      }
      for (const [key, newCount] of newCounts) {
        const [crewId] = key.split('|')
        const crew = crews.find((c) => c.id === crewId)
        if (!crew || crew.max_jobs_per_day <= 0) continue
        const existing = existingCounts.get(key) ?? 0
        const total = existing + newCount
        if (total > crew.max_jobs_per_day) {
          violations.push(
            `"${crew.name}" exceeds ${crew.max_jobs_per_day} slot limit on ${key.split('|')[1]} (would have ${total})`,
          )
        }
      }
      if (violations.length > 0) {
        errs.general = violations.slice(0, 3).join('. ')
        if (violations.length > 3) errs.general += ` (and ${violations.length - 3} more)`
      }
    }

    if (previewSlots.length === 0 && !Object.keys(errs).length) {
      errs.general = 'No slots would be created with the current settings'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Submit ── */
  async function handleSubmit() {
    if (!validate()) return

    if (isSlotInPast(startDate, startTime)) {
      showErrorToast('Cannot create slots in the past.')
      return
    }

    setSaving(true)

    try {
      /* Insert in batches */
      let inserted = 0
      for (let i = 0; i < previewSlots.length; i += BATCH_SIZE) {
        const batch = previewSlots.slice(i, i + BATCH_SIZE)
        const { error } = await supabase.from('slots').insert(batch)
        if (error) throw error
        inserted += batch.length
      }

      showSuccessToast(`${inserted} slots created`)
      onSuccess()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to create slots')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-0">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errors.startDate}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={errors.endDate}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start Time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          error={errors.startTime}
          required
        />
        <Input
          label="End Time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          error={errors.endTime}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Slot Duration (hours)"
          type="number"
          min={0.5}
          step={0.5}
          value={String(duration)}
          onChange={(e) => setDuration(Number(e.target.value))}
          error={errors.duration}
          required
        />
        <Input
          label="Gap Between Slots (hours)"
          type="number"
          min={0}
          step={0.25}
          value={String(gap)}
          onChange={(e) => setGap(Number(e.target.value))}
        />
      </div>

      {/* Crew checkboxes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-1">
          Crews
          <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 rounded-md border border-border bg-surface/30">
          {crews.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2 cursor-pointer text-sm text-text-primary hover:text-text-primary"
            >
              <input
                type="checkbox"
                checked={selectedCrews.includes(c.id)}
                onChange={() => toggleCrew(c.id)}
                className="accent-brand w-3.5 h-3.5"
              />
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </label>
          ))}
          {crews.length === 0 && (
            <p className="text-xs text-text-muted">No crews available</p>
          )}
        </div>
        {errors.crews && (
          <p className="text-xs text-red-500 mt-1">{errors.crews}</p>
        )}
      </div>

      {/* Status */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'available' | 'blocked')}
          className="w-full h-9 px-3 rounded-md border border-border text-sm text-text-primary bg-surface-default outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)] transition-[border-color,box-shadow] duration-150 appearance-none"
        >
          <option value="available">Available</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Weekdays only toggle */}
      <label className="flex items-center gap-2 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={weekdaysOnly}
          onChange={(e) => setWeekdaysOnly(e.target.checked)}
          className="accent-brand w-3.5 h-3.5"
        />
        <span className="text-sm text-text-primary">Weekdays only (skip Sat &amp; Sun)</span>
      </label>

      {/* Preview */}
      {previewSlots.length > 0 && (
        <div className="mb-4 p-3 rounded-md bg-brand-light border border-brand/20">
          <p className="text-sm font-medium text-brand mb-0.5">
            Preview: {previewSlots.length} slot{previewSlots.length !== 1 ? 's' : ''} will be created
          </p>
          <p className="text-[11px] text-text-muted">
            {format(parseISO(startDate), 'MMM d, yyyy')} –{' '}
            {format(parseISO(endDate), 'MMM d, yyyy')}
            {weekdaysOnly ? ' (weekdays only)' : ''} ·{' '}
            {formatTime(startTime)} – {formatTime(endTime)} ·{' '}
            {duration >= 1 ? `${duration}h` : `${duration * 60}min`} slots{gap > 0 ? ` · ${gap >= 1 ? `${gap}h` : `${gap * 60}min`} gap` : ''} · {selectedCrews.length} crew{selectedCrews.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {errors.general && (
        <p className="text-xs text-red-500 mb-3">{errors.general}</p>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          loading={saving}
          onClick={handleSubmit}
          type="button"
          disabled={previewSlots.length === 0}
        >
          Create {previewSlots.length > 0 ? `${previewSlots.length} Slot${previewSlots.length !== 1 ? 's' : ''}` : 'Slots'}
        </Button>
      </div>
    </form>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Delete Confirmation
   ═══════════════════════════════════════════════════════════════ */
function DeleteConfirm({ slot, onConfirm, onClose }: {
  slot: Slot
  onConfirm: () => void
  onClose: () => void
}) {
  const isBooked = slot.status === 'booked'
  const crewName = slot.crews?.name ?? 'Unknown'

  return (
    <div>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-booked-bg flex-shrink-0">
          <AlertTriangle size={18} className="text-booked-text" />
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary mb-1">
            Delete this slot?
          </p>
          <p className="text-xs text-text-secondary">
            {isBooked
              ? `This slot is booked by ${slot.booked_by_name ?? 'someone'}. Are you sure you want to delete it?`
              : 'This cannot be undone.'}
          </p>
          <div className="mt-2 text-xs text-text-muted space-y-0.5">
            <p>{format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}</p>
            <p>
              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
            </p>
            <p>
              <span
                className="w-1.5 h-1.5 rounded-full inline-block mr-1"
                style={{ backgroundColor: slot.crews?.color ?? '#cbd5e1' }}
              />
              {crewName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          className="!bg-booked-text !hover:bg-red-700 !text-white"
        >
          Delete Slot
        </Button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Slot Row
   ═══════════════════════════════════════════════════════════════ */
function SlotRow({
  slot,
  onEdit,
  onDelete,
  disableActions,
}: {
  slot: Slot
  onEdit: () => void
  onDelete: () => void
  disableActions?: boolean
}) {
  const crew = slot.crews
  const isBooked = slot.status === 'booked'

  return (
    <div className="slot-enter">
      {/* Main row */}
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 bg-white border-l-4 ${statusBorderColor(slot.status)} rounded-r-md hover:bg-surface-hover transition-colors`}
      >
        {/* Left side: dot, time, crew, badge */}
        <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDotColor(slot.status)}`}
          />

          <span className="text-sm font-medium text-text-primary whitespace-nowrap">
            {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
          </span>

          {crew && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: crew.color }}
            />
          )}
          <span className="text-sm text-text-secondary truncate max-w-[120px] sm:max-w-[180px]">
            {crew?.name ?? 'Unknown'}
          </span>

          <Badge status={slot.status} />
          {disableActions && (
            <span className="text-[10px] text-text-muted italic">Past</span>
          )}
        </div>

        {/* Right side: action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isBooked && !disableActions && (
            <button
              onClick={onEdit}
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
              title="Edit slot"
            >
              <Edit3 size={13} />
            </button>
          )}
          {!disableActions && (
            <button
              onClick={onDelete}
              className="w-6 h-6 rounded-md flex items-center justify-center text-text-muted hover:text-booked-text hover:bg-booked-bg transition-colors"
              title="Delete slot"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Booker info — second line for booked slots */}
      {isBooked && (
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted pl-2 mt-0.5 mb-1">
          <span>📋 {slot.booked_by_name ?? 'Unknown'}</span>
          <span>·</span>
          <span className="text-text-secondary">
            {slot.booked_by_email ?? '—'}
          </span>
          {slot.property_name && (
            <>
              <span>·</span>
              <span>{slot.property_name}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Main SlotManager Component
   ═══════════════════════════════════════════════════════════════ */
type SlotManagerView = 'day' | 'week'

export function SlotManager() {
  const [view, setView] = useState<SlotManagerView>('day')

  /* ── Date navigation ── */
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  )
  const weekEnd = useMemo(
    () => endOfWeek(weekStart, { weekStartsOn: 1 }),
    [weekStart],
  )

  const startStr = view === 'day' ? selectedDate : format(weekStart, 'yyyy-MM-dd')
  const endStr = view === 'day' ? selectedDate : format(weekEnd, 'yyyy-MM-dd')

  /* ── Data ── */
  const { slots, loading, error, refresh } = useAdminSlots(startStr, endStr)
  const { crews } = useCrews()

  /* ── Filters ── */
  const [crewFilter, setCrewFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  /* ── Modals ── */
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null)
  const [deletingSlot, setDeletingSlot] = useState<Slot | null>(null)

  /* ── Group slots by day ── */
  const grouped = useMemo(() => {
    const filtered = slots.filter((s) => {
      if (crewFilter !== 'all' && s.crew_id !== crewFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      return true
    })
    const groups: Record<string, Slot[]> = {}
    for (const slot of filtered) {
      if (!groups[slot.date]) groups[slot.date] = []
      groups[slot.date].push(slot)
    }
    return groups
  }, [slots, crewFilter, statusFilter])

  const sortedDates = useMemo(
    () => Object.keys(grouped).sort(),
    [grouped],
  )

  /* ── Navigation helpers ── */
  const label = useMemo(() => {
    if (view === 'day') {
      return format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')
    }
    return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`
  }, [view, selectedDate, weekStart, weekEnd])

  function goBack() {
    if (view === 'day') {
      setSelectedDate((prev) => format(addDays(parseISO(prev), -1), 'yyyy-MM-dd'))
    } else {
      setWeekStart((prev) => subWeeks(prev, 1))
    }
  }

  function goForward() {
    if (view === 'day') {
      setSelectedDate((prev) => format(addDays(parseISO(prev), 1), 'yyyy-MM-dd'))
    } else {
      setWeekStart((prev) => addWeeks(prev, 1))
    }
  }

  function goToToday() {
    if (view === 'day') {
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'))
    } else {
      setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    }
  }

  /* ── Delete handler ── */
  async function handleDelete(slot: Slot) {
    try {
      const { error: err } = await supabase.from('slots').delete().eq('id', slot.id)
      if (err) throw err
      showSuccessToast('Slot deleted')
      setDeletingSlot(null)
      refresh()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to delete slot')
    }
  }

  const hasAnySlots = slots.length > 0
  const filteredCount = sortedDates.reduce((sum, d) => sum + grouped[d].length, 0)
  const hasFilteredSlots = filteredCount > 0

  const isPastDay = (dateStr: string) => isPastDate(parseISO(dateStr))

  /* ── Render ── */
  return (
    <div className="w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-text-primary">Slots Management</h1>
          {/* View toggle — in header so it's always visible on mobile */}
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button
              onClick={() => setView('day')}
              className={`px-2.5 h-7 text-xs font-medium transition-colors ${
                view === 'day'
                  ? 'bg-brand text-white'
                  : 'bg-surface-default text-text-secondary hover:bg-surface-hover'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-2.5 h-7 text-xs font-medium transition-colors ${
                view === 'week'
                  ? 'bg-brand text-white'
                  : 'bg-surface-default text-text-secondary hover:bg-surface-hover'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === 'day' && (
            <Button variant="ghost" onClick={() => setAddModalOpen(true)}>
              <Plus size={14} />
              Add
            </Button>
          )}
          <Button variant="ghost" onClick={() => setBulkModalOpen(true)}>
            <Plus size={14} />
            Bulk
          </Button>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
            title={view === 'day' ? 'Previous day' : 'Previous week'}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goToToday}
            className="px-2.5 h-7 rounded-md text-xs font-medium text-text-secondary hover:bg-surface-hover border border-border transition-colors"
          >
            Today
          </button>
          <span className="text-sm font-semibold text-text-primary text-center whitespace-nowrap">
            {label}
          </span>
          <button
            onClick={goForward}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
            title={view === 'day' ? 'Next day' : 'Next week'}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2">
          <select
            value={crewFilter}
            onChange={(e) => setCrewFilter(e.target.value)}
            className="h-8 px-2 rounded-md border border-border text-xs text-text-primary bg-surface-default outline-none focus:border-brand appearance-none"
          >
            <option value="all">All Crews</option>
            {crews.map((c) => (
              <option key={c.id} value={c.id}>
                ● {c.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2 rounded-md border border-border text-xs text-text-primary bg-surface-default outline-none focus:border-brand appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* ── Content ── */}
      {loading && (
        <div>
          {Array.from({ length: view === 'day' ? 1 : 5 }).map((_, i) => (
            <div key={i} className="mb-4">
              <Skeleton className="w-48 h-5 mb-2" />
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="bg-surface-default rounded border border-border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 flex items-center gap-3">
                      <Skeleton className="w-16 h-16 rounded-md" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="w-28 h-4" />
                        <Skeleton className="w-20 h-4" />
                      </div>
                    </div>
                    <Skeleton className="w-24 h-8" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="p-3 rounded-full bg-booked-bg mb-3">
            <AlertTriangle size={20} className="text-booked-text" />
          </div>
          <p className="text-sm text-booked-text font-medium mb-1">
            Failed to load slots
          </p>
          <p className="text-xs text-text-muted mb-4">{error}</p>
          <Button variant="ghost" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && !hasAnySlots && (
        <EmptyState
          icon={<CalendarX2 className="w-10 h-10 text-text-muted mb-3" />}
          title={view === 'day' ? 'No slots for this day' : 'No slots for this week'}
          message="Add one or try a different date."
        />
      )}

      {!loading && !error && hasAnySlots && !hasFilteredSlots && (
        <EmptyState
          icon={<CalendarX2 className="w-10 h-10 text-text-muted mb-3" />}
          title="No slots match your filters"
          message="Try adjusting the crew or status filter."
        />
      )}

      {!loading && !error && hasFilteredSlots && (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => (
            <div key={dateStr} className="mb-4">
              <h3 className="text-sm font-semibold text-text-primary mb-2 px-1">
                {format(parseISO(dateStr), 'EEEE, MMMM d')}
              </h3>
              <div className="space-y-1">
                {grouped[dateStr].map((slot) => (
                  <SlotRow
                    key={slot.id}
                    slot={slot}
                    onEdit={() => setEditingSlot(slot)}
                    onDelete={() => setDeletingSlot(slot)}
                    disableActions={view === 'week' && isPastDay(dateStr)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Modal (day view only) ── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Time Slot"
      >
        {addModalOpen && (
          <SlotForm
            key="add"
            defaultDate={selectedDate}
            onSuccess={() => {
              setAddModalOpen(false)
              refresh()
            }}
            onClose={() => setAddModalOpen(false)}
            crews={crews}
            existingSlots={slots}
          />
        )}
      </Modal>

      {/* ── Bulk Create Modal ── */}
      <Modal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title="Bulk Create Slots"
      >
        {bulkModalOpen && (
          <BulkCreateForm
            key="bulk"
            crews={crews}
            onSuccess={() => {
              setBulkModalOpen(false)
              refresh()
            }}
            onClose={() => setBulkModalOpen(false)}
          />
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        title="Edit Time Slot"
      >
        {editingSlot && (
          <SlotForm
            key={editingSlot.id}
            slot={editingSlot}
            defaultDate={editingSlot.date}
            onSuccess={() => {
              setEditingSlot(null)
              refresh()
            }}
            onClose={() => setEditingSlot(null)}
            crews={crews}
            existingSlots={slots}
          />
        )}
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={!!deletingSlot}
        onClose={() => setDeletingSlot(null)}
        title="Confirm Delete"
      >
        {deletingSlot && (
          <DeleteConfirm
            slot={deletingSlot}
            onConfirm={() => handleDelete(deletingSlot)}
            onClose={() => setDeletingSlot(null)}
          />
        )}
      </Modal>
    </div>
  )
}
