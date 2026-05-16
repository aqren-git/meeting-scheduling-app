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

  function goToToday() {
    useCalendarStore.setState({ currentYear: now.getFullYear(), currentMonth: now.getMonth() })
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrevMonth}
          disabled={isCurrentMonth}
          className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={goToNextMonth}
          className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <span className="text-[15px] font-semibold text-text-primary">
        {MONTHS[currentMonth]} {currentYear}
      </span>

      <button
        onClick={goToToday}
        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
          isCurrentMonth
            ? 'text-text-muted cursor-default'
            : 'text-brand hover:bg-brand-light'
        }`}
        disabled={isCurrentMonth}
      >
        Today
      </button>
    </div>
  )
}
