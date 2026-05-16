import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton/Skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'

/* ── Types ── */
interface CrewRow {
  id: string
  name: string
  color: string
  display_order: number
  max_jobs_per_day: number
  is_active: boolean
  notes: string | null
  created_at: string
}

interface CrewFormData {
  name: string
  color: string
  display_order: number
  max_jobs_per_day: number
  is_active: boolean
  notes: string
}

const EMPTY_FORM: CrewFormData = {
  name: '',
  color: '#1a56db',
  display_order: 0,
  max_jobs_per_day: 1,
  is_active: true,
  notes: '',
}

/* ── Component ── */
export function CrewManager() {
  /* data */
  const [crews, setCrews] = useState<CrewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  /* modal */
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CrewFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  /* delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<CrewRow | null>(null)
  const [deleteSlotCount, setDeleteSlotCount] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  /* ── Fetch ── */
  async function fetchCrews() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setCrews(data ?? [])
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to load crews')
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => { fetchCrews() }, [])

  /* ── Filtered list ── */
  const filteredCrews = showInactive ? crews : crews.filter((c) => c.is_active)

  /* ── Form helpers ── */
  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(crew: CrewRow) {
    setEditingId(crew.id)
    setForm({
      name: crew.name,
      color: crew.color,
      display_order: crew.display_order,
      max_jobs_per_day: crew.max_jobs_per_day,
      is_active: crew.is_active,
      notes: crew.notes ?? '',
    })
    setErrors({})
    setModalOpen(true)
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        color: form.color,
        display_order: form.display_order,
        max_jobs_per_day: form.max_jobs_per_day,
        is_active: form.is_active,
        notes: form.notes.trim() || null,
      }

      if (editingId) {
        const { error } = await supabase
          .from('crews')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        showSuccessToast('Crew updated')
      } else {
        const { error } = await supabase
          .from('crews')
          .insert(payload)
        if (error) throw error
        showSuccessToast('Crew added')
      }

      setModalOpen(false)
      await fetchCrews()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to save crew')
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete (soft) ── */
  async function confirmDelete(crew: CrewRow) {
    setDeleteTarget(crew)
    setDeleteSlotCount(null)
    setDeleteConfirmOpen(true)

    // Check for existing slots
    try {
      const { count, error } = await supabase
        .from('slots')
        .select('id', { count: 'exact', head: true })
        .eq('crew_id', crew.id)

      if (!error) setDeleteSlotCount(count)
    } catch {
      // Non-critical — just proceed without the warning
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('crews')
        .update({ is_active: false })
        .eq('id', deleteTarget.id)

      if (error) throw error
      showSuccessToast(`"${deleteTarget.name}" deactivated`)
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
      await fetchCrews()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to deactivate crew')
    } finally {
      setDeleting(false)
    }
  }

  /* ── Toggle active ── */
  async function toggleActive(crew: CrewRow) {
    try {
      const { error } = await supabase
        .from('crews')
        .update({ is_active: !crew.is_active })
        .eq('id', crew.id)
      if (error) throw error
      await fetchCrews()
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to update crew')
    }
  }

  /* ── Render ── */
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="w-48 h-6" />
          <Skeleton className="w-24 h-9" />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr className="text-left text-text-secondary text-xs uppercase tracking-wider">
                <th className="px-3 py-2.5 font-medium w-10"><Skeleton className="w-4 h-4" /></th>
                <th className="px-3 py-2.5 font-medium"><Skeleton className="w-8 h-4" /></th>
                <th className="px-3 py-2.5 font-medium"><Skeleton className="w-12 h-4" /></th>
                <th className="px-3 py-2.5 font-medium"><Skeleton className="w-16 h-4" /></th>
                <th className="px-3 py-2.5 font-medium"><Skeleton className="w-20 h-4" /></th>
                <th className="px-3 py-2.5 font-medium"><Skeleton className="w-10 h-4" /></th>
                <th className="px-3 py-2.5 font-medium w-20"><Skeleton className="w-12 h-4" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-3 py-2.5"><Skeleton className="w-4 h-4" /></td>
                  <td className="px-3 py-2.5"><Skeleton className="w-5 h-5 rounded-sm" /></td>
                  <td className="px-3 py-2.5"><Skeleton className="w-32 h-4" /></td>
                  <td className="px-3 py-2.5"><Skeleton className="w-6 h-4" /></td>
                  <td className="px-3 py-2.5"><Skeleton className="w-8 h-4" /></td>
                  <td className="px-3 py-2.5"><Skeleton className="w-6 h-4" /></td>
                  <td className="px-3 py-2.5"><Skeleton className="w-16 h-6" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Crew Management</h2>
        <Button onClick={openAdd}>
          <Plus size={14} />
          Add Crew
        </Button>
      </div>

      {/* ── Filter toggle ── */}
      <label className="flex items-center gap-2 mb-4 text-sm text-text-secondary cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showInactive}
          onChange={(e) => setShowInactive(e.target.checked)}
          className="accent-brand w-4 h-4 rounded border-border"
        />
        Show inactive
      </label>

      {/* ── Empty state ── */}
      {filteredCrews.length === 0 && (
        <EmptyState
          icon={<Plus className="w-10 h-10 text-text-muted mb-3" />}
          title="No crews yet"
          message="Add one to get started."
        />
      )}

      {/* ── Table ── */}
      {filteredCrews.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface text-left text-text-secondary text-xs uppercase tracking-wider">
                <th className="px-3 py-2.5 font-medium w-10">#</th>
                <th className="px-3 py-2.5 font-medium">Color</th>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Display Order</th>
                <th className="px-3 py-2.5 font-medium">Max Jobs/Day</th>
                <th className="px-3 py-2.5 font-medium">Active</th>
                <th className="px-3 py-2.5 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCrews.map((crew, idx) => (
                <tr key={crew.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-3 py-2.5 text-text-muted">{idx + 1}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-block w-5 h-5 rounded-sm border border-border"
                      style={{ backgroundColor: crew.color }}
                      title={crew.color}
                    />
                  </td>
                  <td className="px-3 py-2.5 font-medium text-text-primary">
                    <div className="flex items-center gap-2">
                      <span>{crew.name}</span>
                      {!crew.is_active && (
                        <span className="text-xs text-text-muted bg-surface px-1.5 py-0.5 rounded-sm">inactive</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-text-secondary">{crew.display_order}</td>
                  <td className="px-3 py-2.5 text-text-secondary">{crew.max_jobs_per_day}</td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => toggleActive(crew)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        crew.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      role="switch"
                      aria-checked={crew.is_active}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                          crew.is_active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(crew)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => confirmDelete(crew)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add/Edit Modal ── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Crew' : 'Add Crew'}>
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          required
          placeholder="e.g. Window Cleaning"
        />

        {/* Color picker inline */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1">
            Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-10 h-10 rounded-md border border-border cursor-pointer bg-surface-default p-0.5"
            />
            <input
              type="text"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="flex-1 h-9 px-3 rounded-md border border-border text-sm text-text-primary bg-surface-default outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)]"
              placeholder="#hex"
            />
          </div>
        </div>

        <Input
          label="Display Order"
          type="number"
          value={form.display_order}
          onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
        />

        <Input
          label="Max Jobs Per Day"
          type="number"
          min={1}
          value={form.max_jobs_per_day}
          onChange={(e) => setForm({ ...form, max_jobs_per_day: Math.max(1, Number(e.target.value)) })}
        />

        <label className="flex items-center gap-2 mb-4 text-sm text-text-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="accent-brand w-4 h-4 rounded border-border"
          />
          Active
        </label>

        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Optional notes about this crew"
        />

        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>
            {editingId ? 'Save Changes' : 'Add Crew'}
          </Button>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Deactivate Crew">
        {deleteTarget && (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-text-primary font-medium mb-1">
                  Deactivate "{deleteTarget.name}"?
                </p>
                <p className="text-sm text-text-secondary">
                  This will soft-delete the crew. It will no longer appear in active schedules.
                </p>
                {deleteSlotCount !== null && deleteSlotCount > 0 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    This crew has <strong>{deleteSlotCount}</strong> slot{deleteSlotCount !== 1 ? 's' : ''} assigned.
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
              <Button loading={deleting} onClick={handleDelete} className="!bg-red-600 hover:!bg-red-700">
                Deactivate
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
