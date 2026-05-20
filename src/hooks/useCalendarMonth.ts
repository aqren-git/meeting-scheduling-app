import { useMemo } from 'react'
import { isPastDate } from '@/lib/dateUtils'
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths } from 'date-fns'

interface CalendarDay {
  date: Date | null
  dayNumber: number | null
  isPadding: boolean
  isPast: boolean
  isToday: boolean
  dateStr: string | null
}

export function useCalendarMonth(year: number, month: number) {
  return useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

    const startOfSelected = startOfMonth(new Date(year, month))
    const endOfSelected = isCurrentMonth
      ? endOfMonth(addMonths(startOfSelected, 1))
      : endOfMonth(startOfSelected)

    const days = eachDayOfInterval({ start: startOfSelected, end: endOfSelected })
    const paddingDays = getDay(startOfSelected)

    const paddingCells: CalendarDay[] = Array.from({ length: paddingDays }, () => ({
      date: null,
      dayNumber: null,
      isPadding: true,
      isPast: false,
      isToday: false,
      dateStr: null,
    }))

    const dayCells: CalendarDay[] = days.map((date) => ({
      date,
      dayNumber: date.getDate(),
      isPadding: false,
      isPast: isPastDate(date),
      isToday: date.toDateString() === today.toDateString(),
      dateStr: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    }))

    return [...paddingCells, ...dayCells]
  }, [year, month])
}
