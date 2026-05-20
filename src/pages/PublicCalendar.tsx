import { useMemo } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { CalendarDayList } from '@/components/calendar/CalendarDayList'
import { MonthNavigator } from '@/components/calendar/MonthNavigator'
import { CrewLegend } from '@/components/calendar/CrewLegend'
import { BookingModal } from '@/components/booking/BookingModal'
import { EmptyState } from '@/components/ui/empty-state'
import { CalendarSkeleton } from '@/components/ui/skeleton'
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
      {/* ── Stats Bar ── */}
      {!loading && hasSlots && (
        <div className="max-w-[1100px] mx-auto px-4 pt-4 pb-0 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-text-secondary bg-white rounded-none border border-border px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="font-black text-text-primary uppercase tracking-wider shrink-0 text-[10px]">Summary</span>
              <span className="w-px h-2.5 bg-border shrink-0" />
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-none bg-available-dot" />
                <span className="text-[11px] font-semibold"><strong className="text-available-text">{availableCount}</strong> available</span>
              </span>
              <span className="flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-none bg-booked-dot" />
                <span className="text-[11px] font-semibold"><strong className="text-booked-text">{bookedCount}</strong> booked</span>
              </span>
            </div>

            {/* Live status dot inside stats bar */}
            <div className="sm:ml-auto flex items-center gap-1.5 bg-surface border border-border/80 px-2.5 py-1 self-start sm:self-auto rounded-none">
              <span
                className={`w-1.5 h-1.5 rounded-none ${
                  realtimeStatus === 'connected' ? 'bg-green-500 animate-[pulse-live_2s_infinite]' : 'bg-amber-500'
                }`}
              />
              <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary leading-none">
                {realtimeStatus === 'connected' ? 'Live Sync' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="max-w-[1100px] mx-auto px-4 pt-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3.5 rounded-none flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-none bg-red-100 flex items-center justify-center text-red-500 text-xs font-black">!</span>
            Unable to load schedule. Please check your connection and refresh.
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {loading && <CalendarSkeleton view={view} />}

      {/* ── Main Content (loaded) ── */}
      {!loading && (
        <main className="max-w-[1100px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* ── Welcome Banner ── */}
          <div className="bg-[#f8fafc] rounded-none border border-border border-l-4 border-l-[#e59400] px-5 py-4.5 mb-4 shadow-sm">
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#0c478a]">Schedule a time for the team to come and visit</h2>
            <p className="text-sm text-text-secondary mt-1">Browse available time slots below and book a visit that works for you.</p>
          </div>

          <div className="bg-white rounded-none border border-border shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-border bg-[#f8fafc]">
              <MonthNavigator />
              <div className="mt-3 pt-3 border-t border-border/50">
                <CrewLegend crews={crews} />
              </div>
            </div>

            {/* Calendar */}
            <div>
              {!hasSlots ? (
                <div className="py-12 bg-white">
                  <EmptyState
                    title="No availability yet"
                    message="Schedule a time for the team to come and visit."
                  />
                </div>
              ) : view === 'month' ? (
                <CalendarGrid slots={slots} />
              ) : (
                <CalendarDayList slots={slots} />
              )}
            </div>
          </div>
        </main>
      )}

      <BookingModal />
    </div>
  )
}
