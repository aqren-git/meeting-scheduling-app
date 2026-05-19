import { useState } from 'react'
import { useProperties } from '@/hooks/useProperties'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton/Skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'
import { Building2, Pencil, Trash2, Plus } from 'lucide-react'
import type { Property } from '@/types/property'

interface PropertyFormData {
  name: string
  address: string
  city: string
  state: string
  contact_name: string
  contact_email: string
  notes: string
}

const EMPTY_FORM: PropertyFormData = {
  name: '',
  address: '',
  city: 'Irvine',
  state: 'CA',
  contact_name: '',
  contact_email: '',
  notes: '',
}

export function PropertyManager() {
  const { properties, loading, error, addProperty, updateProperty, deleteProperty } = useProperties()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PropertyFormData>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // ── Helpers ──

  const openAddModal = () => {
    setEditingId(null)
    setFormData(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEditModal = (prop: Property) => {
    setEditingId(prop.id)
    setFormData({
      name: prop.name,
      address: prop.address ?? '',
      city: prop.city,
      state: prop.state,
      contact_name: prop.contact_name ?? '',
      contact_email: prop.contact_email ?? '',
      notes: prop.notes ?? '',
    })
    setModalOpen(true)
  }

  const handleChange = (field: keyof PropertyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showErrorToast('Property name is required.')
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        await updateProperty(editingId, formData)
        showSuccessToast('Property updated.')
      } else {
        await addProperty({
          name: formData.name.trim(),
          address: formData.address.trim() || null,
          city: formData.city.trim() || 'Irvine',
          state: formData.state.trim() || 'CA',
          contact_name: formData.contact_name.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          notes: formData.notes.trim() || null,
          is_active: true,
        })
        showSuccessToast('Property added.')
      }
      setModalOpen(false)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to save property.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id)
      showSuccessToast('Property deactivated.')
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to deactivate property.')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  // ── Render ──

  const activeProperties = properties.filter((p) => p.is_active)

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">Properties</h2>
        <Button onClick={openAddModal}>
          <Plus size={15} />
          Add Property
        </Button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-3 rounded-lg flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold">!</span>
          {error}
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-32 h-9" />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-secondary">
                <tr>
                  <th className="px-4 py-3"><Skeleton className="w-12 h-4" /></th>
                  <th className="px-4 py-3"><Skeleton className="w-16 h-4" /></th>
                  <th className="px-4 py-3"><Skeleton className="w-12 h-4" /></th>
                  <th className="px-4 py-3"><Skeleton className="w-20 h-4" /></th>
                  <th className="px-4 py-3"><Skeleton className="w-20 h-4" /></th>
                  <th className="px-4 py-3"><Skeleton className="w-10 h-4" /></th>
                  <th className="px-4 py-3 text-right"><Skeleton className="w-12 h-4" /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-4 py-3"><Skeleton className="w-32 h-4" /></td>
                    <td className="px-4 py-3"><Skeleton className="w-20 h-4" /></td>
                    <td className="px-4 py-3"><Skeleton className="w-24 h-4" /></td>
                    <td className="px-4 py-3"><Skeleton className="w-28 h-4" /></td>
                    <td className="px-4 py-3 text-center"><Skeleton className="w-4 h-4 mx-auto rounded-full" /></td>
                    <td className="px-4 py-3 text-right"><Skeleton className="w-16 h-7 ml-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && activeProperties.length === 0 && (
        <EmptyState
          icon={<Building2 className="w-10 h-10 text-text-muted mb-3" />}
          title="No properties yet."
          message="Add your first property to get started."
        />
      )}

      {/* ── Table ── */}
      {!loading && activeProperties.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Address</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">City</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Contact Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Contact Email</th>
                <th className="text-center px-4 py-3 font-medium text-text-secondary">Active</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeProperties.map((prop) => (
                <tr key={prop.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-text-primary font-medium">{prop.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{prop.address ?? '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{prop.city}</td>
                  <td className="px-4 py-3 text-text-secondary">{prop.contact_name ?? '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{prop.contact_email ?? '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-green-500" title="Active" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(prop)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(prop.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
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
      <Modal
        isOpen={modalOpen}
        onClose={() => { if (!submitting) setModalOpen(false) }}
        title={editingId ? 'Edit Property' : 'Add Property'}
      >
        <div className="space-y-0">
          <Input
            label="Name"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Property name"
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Street address"
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Irvine"
              />
            </div>
            <div className="w-24">
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                placeholder="CA"
              />
            </div>
          </div>
          <Input
            label="Contact Name"
            value={formData.contact_name}
            onChange={(e) => handleChange('contact_name', e.target.value)}
            placeholder="Contact person"
          />
          <Input
            label="Contact Email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleChange('contact_email', e.target.value)}
            placeholder="email@example.com"
          />
          <Textarea
            label="Notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Optional notes..."
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {editingId ? 'Save Changes' : 'Add Property'}
          </Button>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Property"
      >
        <p className="text-sm text-text-secondary mb-4">
          Are you sure you want to deactivate this property? This will mark it as inactive.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  )
}
