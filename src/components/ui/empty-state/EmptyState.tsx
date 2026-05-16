import { CalendarX2 } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
}

export function EmptyState({
  icon,
  title = 'No availability',
  message = 'for this month. Contact Reliance for custom scheduling.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon ?? <CalendarX2 className="w-10 h-10 text-text-muted mb-3" />}
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  )
}
