import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Spinner } from '../spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'h-9 w-full sm:w-auto px-4 sm:px-5 rounded-none text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all duration-150 border'
  const variants = {
    primary: 'bg-brand border-brand text-white hover:bg-brand-hover hover:border-brand-hover disabled:opacity-60 disabled:cursor-not-allowed shadow-sm',
    ghost: 'bg-transparent text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {loading ? 'Booking...' : children}
    </button>
  )
}
