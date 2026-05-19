import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-text-secondary">
        Showing {startIndex}–{endIndex} of {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Rows per page: {pageSize}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-7 h-7 rounded-md flex items-center justify-center text-text-secondary hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
