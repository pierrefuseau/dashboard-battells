/**
 * Format a number with french locale (spaces as thousands separator)
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR')
}

/**
 * Format a large number with suffix (K, M, B)
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toString()
}

/**
 * Format euros
 */
export function formatEuros(value: number): string {
  return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}€`
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Format watch time in minutes to human readable (Kh, Mh)
 */
export function formatWatchTime(minutes: number): string {
  const hours = minutes / 60
  if (hours >= 1_000_000) return `${(hours / 1_000_000).toFixed(1)}Mh`
  if (hours >= 1_000) return `${(hours / 1_000).toFixed(1)}Kh`
  return `${hours.toFixed(0)}h`
}

/**
 * Format a date to french locale
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const FRENCH_TEXT_REGEX = /[^a-zàâäéèêëïîôùûüÿç0-9\s]/g

export function tokenizeFrenchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(FRENCH_TEXT_REGEX, '')
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

export function coherenceTier(score: number): 'success' | 'warning' | 'error' {
  return score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error'
}
