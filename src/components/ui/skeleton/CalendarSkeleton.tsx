import { Skeleton } from './Skeleton'
import type { CalendarView } from '@/store/calendarStore'

interface CalendarSkeletonProps {
  view: CalendarView
}

const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** ─── Month Grid Skeleton ─── */
function MonthGridSkeleton() {
  /* Mirrors CalendarGrid: 35 cells (5 rows × 7 cols) with the same
     overflow-x-auto / min-w-[910px] scroll wrapper so widths match exactly. */
  const cells = Array.from({ length: 35 }, (_, i) => {
    const isPadding = i < 3
    const slotSeed = (i * 13 + 7) % 7
    const slotCount = isPadding ? 0 : slotSeed < 2 ? 2 : slotSeed < 5 ? 4 : 5
    return {
      isPadding,
      isWeekend: !isPadding && [0, 6].includes((i - 3) % 7),
      slotCount,
    }
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[910px] sm:min-w-0">
        {/* Day-of-week header — identical to CalendarGrid */}
        <div className="grid grid-cols-7 border-b border-border bg-surface/50">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="py-2 text-center">
              <Skeleton className="w-6 h-3 mx-auto rounded" />
            </div>
          ))}
        </div>

        {/* Grid cells with gap-px border trick */}
        <div className="grid grid-cols-7 gap-px bg-border overflow-hidden">
          {cells.map((cell, i) => {
            if (cell.isPadding) {
              return <div key={i} className="bg-surface-default sm:min-h-[120px]" />
            }
            return (
              <div
                key={i}
                className={`${cell.isWeekend ? 'bg-surface' : 'bg-surface-default'}`}
              >
                {/* Day number header — matches DayCell's sticky header */}
                <div className="sticky top-0 z-10 bg-inherit px-2 pt-2 pb-1 sm:px-3 sm:pt-3 sm:pb-1.5">
                  <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                </div>
                {/* Slot area — matches DayCell's px-2 pb-2 sm:px-3 sm:pb-3 */}
                <div className="px-2 pb-2 sm:px-3 sm:pb-3 space-y-0.5 sm:space-y-1">
                  {Array.from({ length: cell.slotCount }, (_, j) => (
                    <Skeleton
                      key={j}
                      className="w-full h-[18px] sm:h-5 rounded-[3px] sm:rounded"
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** ─── List View Skeleton ─── */
function ListSkeleton() {
  /* 20 rows matching CalendarDayList exactly:
     - px-5 py-3 row spacing
     - flex items-center gap-3
     - w-10 h-10 date badge (2-line: weekday + number)
     - flex-1 min-w-0 info area with text-sm title + text-xs subtitle (mt-0.5)
     - slot summary dots (w-2 h-2 rounded-full, gap-1)
     - chevron w-3.5 h-3.5
     Some rows have 0 slots (mirrors empty days). */
  const days = Array.from({ length: 20 }, (_, i) => ({
    isToday: i === 0,
    hasSlots: i % 4 !== 2,
    dotCount: i % 4 === 2 ? 0 : [3, 5, 4, 2][i % 4],
  }))

  return (
    <div className="divide-y divide-border">
      {days.map((day, i) => (
        <div
          key={i}
          className={`transition-colors ${day.isToday ? 'bg-brand-light/30' : ''}`}
        >
          <div className="flex items-center gap-3 px-5 py-3">
            {/* Date badge — exact w-10 h-10 match */}
            <div className="flex-shrink-0">
              {day.isToday ? (
                <Skeleton className="w-10 h-10 rounded-lg" />
              ) : (
                <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center bg-surface border border-border">
                  <Skeleton className="w-5 h-2.5 mb-0.5" />
                  <Skeleton className="w-4 h-3.5" />
                </div>
              )}
            </div>

            {/* Day info — flex-1 min-w-0, text-sm + text-xs mt-0.5 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className={`h-3.5 ${day.isToday ? 'w-28' : 'w-24'}`} />
                {day.isToday && <Skeleton className="w-10 h-4 rounded" />}
              </div>
              <div className="mt-0.5">
                {day.hasSlots ? (
                  <Skeleton className="w-[88px] h-3" />
                ) : (
                  <Skeleton className="w-[90px] h-3" />
                )}
              </div>
            </div>

            {/* Slot summary dots */}
            {day.hasSlots && (
              <div className="flex gap-1 flex-shrink-0">
                {Array.from({ length: Math.min(day.dotCount, 4) }, (_, j) => (
                  <Skeleton key={j} className="w-2 h-2 rounded-full" />
                ))}
                {day.dotCount > 4 && <span className="text-[10px] text-text-muted font-medium">+{day.dotCount - 4}</span>}
              </div>
            )}

            {/* Chevron */}
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** ─── Toolbar Skeleton ─── */
function ToolbarSkeleton() {
  return (
    <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-border space-y-3">
      {/* Month navigator row — mirrors MonthNavigator layout exactly */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Centered nav: left arrow + month label + right arrow */}
        <div className="flex items-center justify-center gap-2 flex-1">
          <Skeleton className="w-8 h-8 rounded-md" />
          {/* Month label — min-w-[180px] matches real MonthNavigator */}
          <Skeleton className="min-w-[180px] h-5 rounded" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
        {/* Today button + view toggle */}
        <div className="flex items-center justify-center gap-3">
          <Skeleton className="w-9 h-4 rounded" />
          <div className="flex items-center gap-0.5 bg-surface rounded-md p-0.5 border border-border">
            <Skeleton className="w-[54px] h-7 rounded" />
            <Skeleton className="w-[46px] h-7 rounded" />
          </div>
        </div>
      </div>
      {/* Crew legend — 3 crews */}
      <div className="flex items-center gap-3 pt-3 border-t border-border/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="w-16 h-3 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** ─── Stats Bar Skeleton ─── */
function StatsBarSkeleton() {
  return (
    <div className="px-4 pt-4 pb-0">
      <div className="flex items-center gap-2 bg-white rounded-lg border border-border px-3 py-2.5 shadow-sm">
        <Skeleton className="w-10 h-3.5 rounded" />
        <Skeleton className="w-px h-3" />
        <Skeleton className="w-[88px] h-3.5 rounded" />
        <Skeleton className="w-[72px] h-3.5 rounded" />
      </div>
    </div>
  )
}

/**
 * Full-page calendar skeleton — exactly mirrors the loaded page layout.
 * Every dimension (padding, min-width, gap, border) matches the real components.
 *
 * Mobile (<640px, defaults to list view):
 *   StatsBarSkeleton → Card → ToolbarSkeleton → ListSkeleton (20 rows)
 *
 * Desktop (640px+, defaults to month view):
 *   StatsBarSkeleton → Card → ToolbarSkeleton → MonthGridSkeleton (35 cells)
 */
export function CalendarSkeleton({ view }: CalendarSkeletonProps) {
  return (
    <div>
      <StatsBarSkeleton />
      <div className="max-w-[1100px] mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <ToolbarSkeleton />
          <div>
            {view === 'month' ? <MonthGridSkeleton /> : <ListSkeleton />}
          </div>
        </div>
      </div>
    </div>
  )
}
