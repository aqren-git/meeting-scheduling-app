import { useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAllBookings } from '@/hooks/useAdminSlots'
import { useCrews } from '@/hooks/useCrews'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton/Skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { showSuccessToast, showErrorToast } from '@/components/ui/toast/toastConfig'
import { format, parseISO } from 'date-fns'
import { Search, X, ChevronLeft, ChevronRight, CalendarX2 } from 'lucide-react'
import type { Slot } from '@/types/slot'

const ROWS_PER_PAGE = 20

export function BookingsList() {
  const { bookings, loading, error } = useAllBookings()
  const { crews } = useCrews()

  // ── Filters ──
  const [crewFilter, setCrewFilter] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')

  // ── Pagination ──
  const [page, setPage] = useState(1)

  // ── Detail Modal ──
  const [detailSlot, setDetailSlot] = useState<Slot | null>(null)
  const [cancelling, setCancelling] = useState(false)

  // ── Refresh counter (re-fetches after cancel) ──
  const [refreshKey, setRefreshKey] = useState(0)

  // ── Filtered Data ──
  const filtered = useMemo(() => {
    let result = [...bookings]

    // Crew filter
    if (crewFilter) {
      result = result.filter((s) => s.crew_id === crewFilter)
    }

    // Date range
    if (dateFrom) {
      result = result.filter((s) => s.date >= dateFrom)
    }
    if (dateTo) {
      result = result.filter((s) => s.date <= dateTo)
    }

    // Search text (property name or booked by name)
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter(
        (s) =>
          (s.property_name ?? '').toLowerCase().includes(q) ||
          (s.booked_by_name ?? '').toLowerCase().includes(q) ||
          (s.booked_by_email ?? '').toLowerCase().includes(q)
      )
    }

    return result
  }, [bookings, crewFilter, dateFrom, dateTo, searchText, refreshKey])

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * ROWS_PER_PAGE
  const pageRows = filtered.slice(startIndex, startIndex + ROWS_PER_PAGE)

  // ── Handlers ──

  const handleCancel = async (slotId: string) => {
    if (!window.confirm('Cancel this booking? This will mark the slot as cancelled.')) return

    setCancelling(true)
    try {
      const { error: err } = await supabase
        .from('slots')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_reason: 'Cancelled by admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId)

      if (err) throw err

      showSuccessToast('Booking cancelled.')
      setDetailSlot(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      showErrorToast(e instanceof Error ? e.message : 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  const formatTime = (t: string) => t.slice(0, 5)
  const formatDate = (d: string) => format(parseISO(d), 'MMM d, yyyy')
  const formatDateFull = (d: string) => format(parseISO(d), 'EEEE, MMMM d, yyyy')
  const formatDateTime = (d: string) => format(parseISO(d), 'MMM d, yyyy h:mm a')

  // ── Render ──

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Bookings
          <span className="ml-2 text-sm font-normal text-text-secondary">
            Total: {bookings.length}
          </span>
        </h2>
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
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Skeleton className="w-40 h-9" />
            <Skeleton className="w-24 h-9" />
            <Skeleton className="w-28 h-9" />
          </div>
          <div className="bg-white rounded-lg border border-border overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-border p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <Skeleton className="w-24 h-5" />
                      <Skeleton className="w-32 h-4" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                      <Skeleton className="w-28 h-4" />
                      <Skeleton className="w-20 h-4" />
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-16 h-4" />
                    </div>
                  </div>
                  <Skeleton className="w-20 h-8" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="w-32 h-4" />
            <div className="flex gap-2">
              <Skeleton className="w-10 h-9" />
              <Skeleton className="w-10 h-9" />
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {!loading && (
        <>
          {/* ── Filters ── */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {/* Crew filter */}
            <select
              value={crewFilter}
              onChange={(e) => { setCrewFilter(e.target.value); setPage(1) }}
              className="h-9 px-3 rounded-md border border-border text-sm text-text-primary bg-white outline-none focus:border-brand"
              aria-label="Filter by crew"
            >
              <option value="">All Crews</option>
              {crews.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Date from */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-text-secondary shrink-0">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="h-9 px-2 rounded-md border border-border text-sm text-text-primary bg-white outline-none focus:border-brand"
              />
            </div>

            {/* Date to */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-text-secondary shrink-0">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="h-9 px-2 rounded-md border border-border text-sm text-text-primary bg-white outline-none focus:border-brand"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(1) }}
                placeholder="Search property or booker..."
                className="w-full h-9 pl-8 pr-8 rounded-md border border-border text-sm text-text-primary bg-white outline-none focus:border-brand"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* ── Empty States ── */}
          {bookings.length === 0 && (
            <EmptyState
              icon={<CalendarX2 className="w-10 h-10 text-text-muted mb-3" />}
              title="No bookings yet."
              message="Bookings will appear here once customers schedule."
            />
          )}

          {bookings.length > 0 && filtered.length === 0 && (
            <EmptyState
              icon={<Search className="w-10 h-10 text-text-muted mb-3" />}
              title="No bookings match your filters."
              message="Try adjusting the filters or search text."
            />
          )}

          {/* ── Table ── */}
          {filtered.length > 0 && (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-surface-secondary">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Time</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Crew</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Property</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Booked By</th>
                      <th className="text-left px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Booked At</th>
                      <th className="text-right px-4 py-3 font-medium text-text-secondary whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((slot) => (
                      <tr
                        key={slot.id}
                        className="hover:bg-surface-hover transition-colors cursor-pointer"
                        onClick={() => setDetailSlot(slot)}
                      >
                        <td className="px-4 py-3 text-text-primary whitespace-nowrap">
                          {formatDate(slot.date)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {slot.crews && (
                            <span className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: slot.crews.color }}
                              />
                              <span className="text-text-primary">{slot.crews.name}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          {slot.property_name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap">
                          <div>{slot.booked_by_name ?? '—'}</div>
                          {slot.booked_by_email && (
                            <div className="text-xs text-text-muted">{slot.booked_by_email}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text-secondary whitespace-nowrap text-xs">
                          {slot.booked_at ? formatDateTime(slot.booked_at) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            className="!w-auto !h-7 !px-2 !text-xs"
                            onClick={(e) => { e.stopPropagation(); setDetailSlot(slot) }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ── */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-text-secondary">
                  Showing {startIndex + 1}–{Math.min(startIndex + ROWS_PER_PAGE, filtered.length)} of{' '}
                  {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">
                    Rows per page: {ROWS_PER_PAGE}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage <= 1}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage >= totalPages}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={detailSlot !== null}
        onClose={() => { if (!cancelling) setDetailSlot(null) }}
        title="Booking Details"
      >
        {detailSlot && (
          <div className="space-y-3">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-muted mb-0.5">Date</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatDateFull(detailSlot.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-0.5">Time</p>
                <p className="text-sm font-medium text-text-primary">
                  {formatTime(detailSlot.start_time)} AM – {formatTime(detailSlot.end_time)} PM
                </p>
              </div>
            </div>

            {/* Crew */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Crew</p>
              <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                {detailSlot.crews && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: detailSlot.crews.color }}
                  />
                )}
                {detailSlot.crews?.name ?? '—'}
              </p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Status</p>
              <Badge status={detailSlot.status} />
            </div>

            <div className="border-t border-border" />

            {/* Property */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Property</p>
              <p className="text-sm font-medium text-text-primary">
                {detailSlot.property_name ?? '—'}
              </p>
            </div>

            {/* Booked By */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Booked By</p>
              <p className="text-sm font-medium text-text-primary">
                {detailSlot.booked_by_name ?? '—'}
              </p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Email</p>
              <p className="text-sm text-text-primary">
                {detailSlot.booked_by_email ?? '—'}
              </p>
            </div>

            {/* Booked At */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Booked At</p>
              <p className="text-sm text-text-primary">
                {detailSlot.booked_at ? formatDateTime(detailSlot.booked_at) : '—'}
              </p>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs text-text-muted mb-0.5">Notes</p>
              <p className="text-sm text-text-primary bg-surface-secondary rounded-md p-2">
                {detailSlot.notes ? `"${detailSlot.notes}"` : 'No notes'}
              </p>
            </div>

            {/* Cancel Button */}
            <div className="border-t border-border pt-3">
              <Button
                onClick={() => handleCancel(detailSlot.id)}
                loading={cancelling}
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                Cancel Booking
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
