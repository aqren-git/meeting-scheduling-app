import React from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  disabled?: boolean
  position?: 'top' | 'bottom'
  align?: 'center' | 'left' | 'right'
}

export function Tooltip({ content, children, disabled = false, position = 'top', align = 'center' }: TooltipProps) {
  if (disabled || !content) return <>{children}</>

  let positionClasses = ''
  let arrowClasses = ''

  if (position === 'top') {
    if (align === 'center') {
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2'
      arrowClasses = 'after:top-full after:left-1/2 after:-translate-x-1/2 after:border-t-[#0c2340]'
    } else if (align === 'left') {
      positionClasses = 'bottom-full left-0 mb-2'
      arrowClasses = 'after:top-full after:left-4 after:border-t-[#0c2340]'
    } else if (align === 'right') {
      positionClasses = 'bottom-full right-0 mb-2'
      arrowClasses = 'after:top-full after:right-4 after:border-t-[#0c2340]'
    }
  } else {
    if (align === 'center') {
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2'
      arrowClasses = 'after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-b-[#0c2340]'
    } else if (align === 'left') {
      positionClasses = 'top-full left-0 mt-2'
      arrowClasses = 'after:bottom-full after:left-4 after:border-b-[#0c2340]'
    } else if (align === 'right') {
      positionClasses = 'top-full right-0 mt-2'
      arrowClasses = 'after:bottom-full after:right-4 after:border-b-[#0c2340]'
    }
  }

  return (
    <div className="relative group/tooltip w-full h-full">
      {children}
      <div 
        className={`absolute z-35 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-150 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-[#0c2340] border border-white/10 shadow-md pointer-events-none text-center whitespace-nowrap rounded-none
          ${positionClasses}
          after:content-[''] after:absolute after:border-4 after:border-transparent
          ${arrowClasses}
        `}
      >
        {content}
      </div>
    </div>
  )
}
