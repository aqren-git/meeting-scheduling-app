import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Input, Textarea } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDisplayDate, formatTimeRange } from '@/lib/dateUtils'
import { useCalendarStore } from '@/store/calendarStore'
import { useBooking } from '@/hooks/useBooking'

export function BookingModal() {
  const { selectedSlot, isModalOpen, closeModal } = useCalendarStore()
  const { book, loading } = useBooking()
  const [propertyName, setPropertyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isModalOpen) {
      setPropertyName('')
      setContactName('')
      setEmail('')
      setNotes('')
      setErrors({})
    }
  }, [isModalOpen])

  if (!selectedSlot) return null

  const slot = selectedSlot
  const crew = slot.crews
  const dateDisplay = `${formatDisplayDate(slot.date)} \u00b7 ${formatTimeRange(slot.start_time, slot.end_time)}`

  function validate() {
    const errs: Record<string, string> = {}
    if (!propertyName.trim()) errs.propertyName = 'Property name is required'
    if (!contactName.trim()) errs.contactName = 'Contact name is required'
    if (!email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email format'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    const success = await book({
      slotId: slot.id,
      bookedByName: contactName.trim(),
      bookedByEmail: email.trim(),
      propertyName: propertyName.trim(),
      notes: notes.trim() || undefined,
    })

    if (success) {
      closeModal()
    }
  }

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} title="Book a Crew">
      <p className="text-sm font-medium text-text-primary mb-1">{dateDisplay}</p>
      <div className="flex items-center gap-1.5 mb-5">
        {crew && (
          <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: crew.color }} />
        )}
        <span className="text-sm text-text-secondary">{crew?.name ?? 'Unknown'}</span>
      </div>

      <Input
        label="Property Name"
        placeholder="1800 Main St Irvine"
        value={propertyName}
        onChange={(e) => setPropertyName(e.target.value)}
        error={errors.propertyName}
        required
      />
      <Input
        label="Contact Name"
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        error={errors.contactName}
        required
      />
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <Textarea
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={closeModal}>Cancel</Button>
        <Button loading={loading} onClick={handleSubmit}>Confirm Booking</Button>
      </div>
    </Modal>
  )
}
