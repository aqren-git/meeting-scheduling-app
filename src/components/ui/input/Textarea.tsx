import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="mb-4">
      <label htmlFor={textareaId} className="block text-[11px] font-black uppercase tracking-wider text-text-primary mb-1">
        {label}
      </label>
      <textarea
        id={textareaId}
        className={`w-full h-[72px] p-2 rounded-none border text-sm text-text-primary bg-surface-default outline-none resize-none transition-[border-color,box-shadow] duration-150
          ${error ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : 'border-border focus:border-brand focus:shadow-[0_0_0_3px_rgba(12,71,138,0.15)]'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
