import type { Crew } from '@/types/slot'

interface CrewLegendProps {
  crews: Crew[]
}

export function CrewLegend({ crews }: CrewLegendProps) {
  if (crews.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {crews.map((crew) => (
        <div key={crew.id} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full ring-1 ring-white/80"
            style={{ backgroundColor: crew.color }}
          />
          <span className="text-[11px] text-text-secondary">{crew.name}</span>
        </div>
      ))}
    </div>
  )
}
