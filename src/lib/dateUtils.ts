import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, format, isBefore, startOfDay,
} from 'date-fns'

export function getCalendarDays(year: number, month: number) {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  const days = eachDayOfInterval({ start, end })
  const paddingDays = getDay(start)
  return { days, paddingDays }
}

export function getMonthRange(year: number, month: number) {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  }
}

export function isPastDate(date: Date) {
  return isBefore(startOfDay(date), startOfDay(new Date()))
}

export function isSlotInPast(date: string, startTime: string): boolean {
  return new Date(`${date}T${startTime}`) <= new Date()
}

export function formatDisplayDate(dateStr: string) {
  return format(new Date(dateStr), 'EEEE, MMMM d, yyyy')
}

function parseTime(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

export function formatTimeRange(start: string, end: string): string {
  return `${format(parseTime(start), 'h:mm a')} \u2013 ${format(parseTime(end), 'h:mm a')}`
}
