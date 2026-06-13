import React from 'react'

const VARIANTS = {
  dark: 'bg-dark text-white hover:bg-black active:bg-black/95 disabled:opacity-40',
  primary: 'bg-action text-white hover:bg-red-800 active:bg-red-900 disabled:opacity-40',
  alternative: 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white active:bg-primary/95 disabled:opacity-40',
}

interface ButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: keyof typeof VARIANTS
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  type = 'button',
  variant = 'dark',
  disabled = false,
  onClick,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'px-4 py-3 text-sm font-semibold rounded-lg cursor-pointer select-none',
        'transition-[transform,background-color,color,border-color,box-shadow] duration-150 ease-out',
        'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:active:scale-100',
        VARIANTS[variant] ?? VARIANTS.dark,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
