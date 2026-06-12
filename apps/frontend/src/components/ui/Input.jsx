import { useState } from 'react'
import { AlertTriangle, Eye, EyeOff } from 'lucide-react'

export default function Input({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
  const hasRightIcon = error || isPassword

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-dark select-none">
          {label}
          {required && <span className="text-action ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={[
            'w-full px-3 py-2.5 text-sm rounded-lg border bg-white',
            'placeholder:text-grey text-dark',
            'focus:outline-none focus:ring-1 transition-colors duration-150',
            hasRightIcon ? 'pr-9' : '',
            error
              ? 'border-action focus:border-action focus:ring-action/30'
              : 'border-grey focus:border-primary focus:ring-primary/20',
          ].join(' ')}
        />

        {/* Password toggle — only when no error */}
        {isPassword && !error && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-dark transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Error icon */}
        {error && (
          <AlertTriangle
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-action pointer-events-none"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-action leading-tight">{error}</p>
      )}
    </div>
  )
}
