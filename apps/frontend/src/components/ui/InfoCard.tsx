import type { ReactNode, ElementType } from 'react'

export function InfoRow({ label, value }: Readonly<{ label: string; value?: string | null }>) {
  return (
    <p className="text-sm text-gray-600">
      <span className="font-semibold text-gray-700">{label}: </span>
      {value ?? '—'}
    </p>
  )
}

export function InfoCard({
  title,
  icon: Icon,
  children,
}: Readonly<{
  title: string
  icon?: ElementType
  children: ReactNode
}>) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="text-sm font-bold text-primary">{title}</h3>
      </div>
      {children}
    </div>
  )
}
