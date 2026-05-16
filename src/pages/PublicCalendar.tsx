import { useMemo } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarDayList } from '@/components/calendar/CalendarDayList'
import { MonthNavigator } from '@/components/calendar/MonthNavigator'
import { CrewLegend } from '@/components/calendar/CrewLegend'
import { BookingModal } from '@/components/booking/BookingModal'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { useCrews } from '@/hooks/useCrews'
import { useSlots } from '@/hooks/useSlots'
import { useCalendarStore } from '@/store/calendarStore'
import { getMonthRange } from '@/lib/dateUtils'

export default function PublicCalendar() {
  const { currentYear, currentMonth, view } = useCalendarStore()
  const { crews, loading: crewsLoading, error: crewsError } = useCrews()
  const range = useMemo(() => getMonthRange(currentYear, currentMonth), [currentYear, currentMonth])
  const { slots, loading: slotsLoading, error: slotsError, realtimeStatus } = useSlots(range.start, range.end)

  const loading = crewsLoading || slotsLoading
  const error = crewsError || slotsError
  const hasSlots = slots.length > 0

  const availableCount = slots.filter((s) => s.status === 'available').length
  const bookedCount = slots.filter((s) => s.status === 'booked').length

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Header ── */}
      <header className="h-16 flex items-center justify-between border-b border-border bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm shadow-sm">
            R
          </div>
          <div className="leading-tight hidden sm:block">
            <h1 className="text-base font-semibold text-text-primary">Reliance Building Services</h1>
            <p className="text-xs text-text-secondary">Irvine Scheduling</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-full px-3 py-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'connected' ? 'bg-green-500 animate-[pulse-live_2s_infinite]' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-medium text-text-secondary">
            {realtimeStatus === 'connected' ? 'Live' : 'Reconnecting\u2026'}
          </span>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      {!loading && hasSlots && (
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-white rounded-lg border border-border px-3 py-2.5 shadow-sm overflow-x-auto">
            <span className="font-medium text-text-primary shrink-0">Summary</span>
            <span className="w-px h-2.5 bg-border shrink-0" />
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-available-dot" />
              <span><strong className="text-available-text">{availableCount}</strong> available</span>
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-booked-dot" />
              <span><strong className="text-booked-text">{bookedCount}</strong> booked</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="px-4 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-3 rounded-lg flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold">!</span>
            Unable to load schedule. Please check your connection and refresh.
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="max-w-[1100px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-border">
            <MonthNavigator />
            <div className="mt-3 pt-3 border-t border-border/50">
              <CrewLegend crews={crews} />
            </div>
          </div>

          {/* Calendar */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-text-secondary">
                  <Spinner className="border-text-secondary/25 border-t-brand" />
                  <span className="text-sm">Loading schedule&hellip;</span>
                </div>
              </div>
            ) : !hasSlots ? (
              <div className="py-12">
                <EmptyState />
              </div>
            ) : view === 'month' ? (
              <CalendarGrid slots={slots} />
            ) : (
              <CalendarDayList slots={slots} />
            )}
          </div>
        </div>

        <p className="text-xs text-text-muted text-center mt-4">
          Availability updates in real time &middot; Reliance Building Services
        </p>
      </main>

      <BookingModal />
    </div>
  )
}
