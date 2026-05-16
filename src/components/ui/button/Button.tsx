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
  const base = 'h-9 w-full sm:w-auto px-3 sm:px-4 rounded-md text-sm font-medium inline-flex items-center gap-1.5 transition-colors duration-150'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-text-secondary border border-border hover:bg-surface-hover',
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
