import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarStore } from '@/store/calendarStore'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthNavigator() {
  const { currentYear, currentMonth, goToNextMonth, goToPrevMonth } = useCalendarStore()
  const now = new Date()
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth()

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={goToPrevMonth}
        disabled={isCurrentMonth}
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-base font-semibold text-text-primary min-w-[180px] text-center">
        {MONTHS[currentMonth]} {currentYear}
      </span>
      <button
        onClick={goToNextMonth}
        className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
      {!isCurrentMonth && (
        <button
          onClick={() => {
            useCalendarStore.setState({ currentYear: now.getFullYear(), currentMonth: now.getMonth() })
          }}
          className="text-sm text-brand underline ml-2"
        >
          Today
        </button>
      )}
    </div>
  )
}
