const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'shortOffset',
})

export function formatTimestamp(iso: string): string {
  if (!iso) return '—'
  try {
    return formatter.format(new Date(iso))
  } catch {
    return iso
  }
}

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

export function isExpired(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}
