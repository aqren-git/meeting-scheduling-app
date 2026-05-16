import { useMemo } from 'react'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'
import { MonthNavigator } from '@/components/calendar/MonthNavigator'
import { CrewLegend } from '@/components/calendar/CrewLegend'
import { BookingModal } from '@/components/booking/BookingModal'
import { MOCK_CREWS, generateMockSlots } from '@/data/mockSlots'

export default function PublicCalendar() {
  const slots = useMemo(() => generateMockSlots(), [])

  return (
    <div className="min-h-screen bg-surface-default">
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-surface-default">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Reliance Building Services</h1>
          <p className="text-xs text-text-secondary">Irvine Scheduling</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 animate-[pulse-live_2s_infinite]" />
          <span className="text-xs font-medium text-text-secondary">Live</span>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-6">
        <p className="text-sm text-text-secondary mb-6">
          Select a green slot to schedule your crew — availability updates in real time
        </p>
        <MonthNavigator />
        <CrewLegend crews={MOCK_CREWS} />
        <CalendarGrid slots={slots} />
      </main>

      <BookingModal />
    </div>
  )
}
