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
    <div className="min-h-screen bg-surface-default">
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-surface-default">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Reliance Building Services</h1>
          <p className="text-xs text-text-secondary">Irvine Scheduling</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-[7px] h-[7px] rounded-full ${
              realtimeStatus === 'connected' ? 'bg-green-500 animate-[pulse-live_2s_infinite]' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs font-medium text-text-secondary">
            {realtimeStatus === 'connected' ? 'Live' : 'Reconnecting\u2026'}
          </span>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-6">
        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2 rounded-md mb-4">
            Unable to load schedule. Please check your connection.
          </div>
        )}

        <p className="text-sm text-text-secondary mb-6">
          Select a green slot to schedule your crew — availability updates in real time
        </p>

        <MonthNavigator />
        <CrewLegend crews={crews} />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-2 text-text-secondary">
              <Spinner size={20} className="border-text-secondary/30 border-t-text-secondary" />
              <span className="text-sm">Loading schedule\u2026</span>
            </div>
          </div>
        ) : !hasSlots ? (
          <EmptyState />
        ) : (
          <CalendarGrid slots={slots} />
        )}
      </main>

      <BookingModal />
    </div>
  )
}
