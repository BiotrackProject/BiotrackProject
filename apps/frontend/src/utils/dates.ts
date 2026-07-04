import i18n from '../i18n'

export function getDateLocale(): string {
  return i18n.language === 'en' ? 'en-US' : 'es-DO'
}

export function formatDate(isoString: string | null | undefined, fallback = '—'): string {
  if (!isoString) return fallback
  return new Date(isoString).toLocaleDateString(getDateLocale())
}

export function formatDateTime(isoString: string | null | undefined, fallback = '—'): string {
  if (!isoString) return fallback
  return new Date(isoString).toLocaleString(getDateLocale())
}
