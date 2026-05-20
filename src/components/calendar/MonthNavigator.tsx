import { ChevronLeft, ChevronRight, CalendarDays, List } from 'lucide-react'
import { useCalendarStore, type CalendarView } from '@/store/calendarStore'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthNavigator() {
  const { currentYear, currentMonth, goToNextMonth, goToPrevMonth, view, setView } = useCalendarStore()
  const now = new Date()
  const isCurrentMonth = currentYear === now.getFullYear() && currentMonth === now.getMonth()

  function goToToday() {
    useCalendarStore.setState({ currentYear: now.getFullYear(), currentMonth: now.getMonth() })
  }

  const views: { key: CalendarView; icon: typeof CalendarDays; label: string }[] = [
    { key: 'month', icon: CalendarDays, label: 'Month' },
    { key: 'list', icon: List, label: 'List' },
  ]

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      {/* Centered month navigation — spec 6.2 */}
      <div className="flex items-center justify-center gap-2 flex-1">
        <button
          onClick={goToPrevMonth}
          disabled={isCurrentMonth}
          className="w-8 h-8 rounded-none flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none transition-colors border border-border bg-white"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-black uppercase tracking-wider text-text-primary min-w-[180px] text-center select-none">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={goToNextMonth}
          className="w-8 h-8 rounded-none flex items-center justify-center text-text-secondary hover:bg-surface-hover transition-colors border border-border bg-white"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Today button & View Toggle */}
      <div className="flex items-center justify-center gap-3">
        {!isCurrentMonth && (
          <button
            onClick={goToToday}
            className="text-xs font-black uppercase tracking-wider text-brand hover:text-brand-hover hover:underline transition-colors"
          >
            Today
          </button>
        )}
        <div className="flex items-center bg-surface rounded-none p-0.5 border border-border">
          {views.map((v) => {
            const Icon = v.icon
            const active = view === v.key
            return (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[10px] font-black uppercase tracking-wider transition-all ${
                  active
                    ? 'bg-white text-text-primary border border-border/80 shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={14} />
                {v.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
