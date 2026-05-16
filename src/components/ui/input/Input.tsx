import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1">
        {label}
        {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={inputId}
        className={`w-full h-9 px-3 rounded-md border text-sm text-text-primary bg-surface-default outline-none transition-[border-color,box-shadow] duration-150
          ${error ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(26,86,219,0.12)]'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
