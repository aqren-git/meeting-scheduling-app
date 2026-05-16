import { useMemo } from 'react'
import { getCalendarDays, isPastDate } from '@/lib/dateUtils'

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
    const { days, paddingDays } = getCalendarDays(year, month)
    const today = new Date()

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
