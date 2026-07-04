import type { ChangeEvent } from 'react'
import { inputCls } from './inputCls'

interface PasswordFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  error: string | null
  autoComplete: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
}

export default function PasswordField({
  id,
  label,
  placeholder,
  value,
  error,
  autoComplete,
  onChange,
  onBlur,
}: Readonly<PasswordFieldProps>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12px] font-semibold uppercase tracking-[0.08em] text-dark/80">
        {label}
      </label>
      <input
        id={id}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        className={inputCls(error)}
      />
      {error && <p className="text-xs text-action/95">{error}</p>}
    </div>
  )
}
