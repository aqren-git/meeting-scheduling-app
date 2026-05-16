interface SkeletonProps {
  className?: string
}

/**
 * Base skeleton primitive — renders a pulsing gray rectangle.
 * Compose into layout-specific skeletons for accurate page previews.
 */
export function Skeleton({ className = 'w-full h-4' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-blocked-bg ${className}`}
      aria-hidden="true"
    />
  )
}
