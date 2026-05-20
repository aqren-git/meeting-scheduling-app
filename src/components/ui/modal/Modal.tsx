import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-none border-t-4 border-t-[#e59400] shadow-modal w-full max-w-md mx-2 sm:mx-4 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-text-primary">
            {title ?? 'Modal'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-none flex items-center justify-center text-text-secondary hover:bg-surface-hover border border-transparent hover:border-border transition-all"
          >
            <X size={14} />
          </button>
        </div>
        <div className="border-t border-border mb-3 sm:mb-4" />
        {children}
      </div>
    </div>
  )
}
