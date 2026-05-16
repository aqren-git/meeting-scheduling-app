import type { Crew } from '@/types/slot'

interface CrewLegendProps {
  crews: Crew[]
}

export function CrewLegend({ crews }: CrewLegendProps) {
  return (
    <div className="flex gap-4 flex-wrap mb-4">
      {crews.map((crew) => (
        <div key={crew.id} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: crew.color }}
          />
          <span className="text-xs text-text-secondary">{crew.name}</span>
        </div>
      ))}
    </div>
  )
}
