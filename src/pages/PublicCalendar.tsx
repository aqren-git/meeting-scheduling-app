import { useMemo } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
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
  const { currentYear, currentMonth } = useCalendarStore()
  const { crews, loading: crewsLoading, error: crewsError } = useCrews()
  const range = useMemo(() => getMonthRange(currentYear, currentMonth), [currentYear, currentMonth])
  const { slots, loading: slotsLoading, error: slotsError, realtimeStatus } = useSlots(range.start, range.end)

  const loading = crewsLoading || slotsLoading
  const error = crewsError || slotsError
  const hasSlots = slots.length > 0

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Header ── */}
      <header className="h-16 px-6 lg:px-8 flex items-center justify-between border-b border-border bg-surface-default sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-text-inverse font-semibold text-sm">
            R
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary leading-tight">Reliance Building Services</h1>
            <p className="text-[11px] text-text-secondary leading-tight">Irvine Scheduling</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-full px-3 py-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              realtimeStatus === 'connected' ? 'bg-green-500 animate-[pulse-live_2s_infinite]' : 'bg-amber-500'
            }`}
          />
          <span className="text-[11px] font-medium text-text-secondary">
            {realtimeStatus === 'connected' ? 'Live' : 'Reconnecting\u2026'}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            Unable to load schedule. Please check your connection.
          </div>
        )}

        <div className="bg-surface-default rounded-lg border border-border shadow-sm overflow-hidden">
          {/* ── Calendar Toolbar ── */}
          <div className="px-4 sm:px-6 pt-5 pb-3 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Schedule</h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Select a green slot to book your crew
                </p>
              </div>
            </div>
            <MonthNavigator />
            <CrewLegend crews={crews} />
          </div>

          {/* ── Calendar Body ── */}
          <div className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Spinner size={18} className="border-text-secondary/30 border-t-text-secondary" />
                  <span className="text-sm">Loading schedule\u2026</span>
                </div>
              </div>
            ) : !hasSlots ? (
              <div className="py-12">
                <EmptyState />
              </div>
            ) : (
              <CalendarGrid slots={slots} />
            )}
          </div>
        </div>

        <p className="text-[11px] text-text-muted text-center mt-4">
          Availability updates in real time \u00b7 Reliance Building Services
        </p>
      </main>

      <BookingModal />
    </div>
  )
}
