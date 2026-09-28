const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type ScheduleTask = {
  DailyFrequency?: number   // 0 = not scheduled; positive = every N days
  DayOfWeek?: number        // 1-7 (1=Sunday)
  DayOfMonth?: number
  DayOfYear?: number
  StartTime?: string        // "HH:MM:SS"
  RunDate?: string          // ISO date — one-time run
  Suspended?: boolean
  Enabled?: boolean
}

function formatTime(raw?: string): string {
  if (!raw) return ''
  const [h = '0', m = '0'] = raw.split(':')
  const hours = parseInt(h, 10)
  const minutes = m.padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function scheduleToHuman(task: ScheduleTask): string {
  if (task.Enabled === false) return 'Disabled'
  if (task.Suspended) return 'Suspended'

  const time = formatTime(task.StartTime)
  const at = time ? ` at ${time}` : ''

  if (task.RunDate) {
    const [year, month = 1, day = 1] = task.RunDate.split('-').map(Number)
    const label = `${MONTH_NAMES[(month - 1) % 12]} ${day}, ${year}`
    return `Once on ${label}${at}`
  }

  const freq = task.DailyFrequency ?? 0

  if (task.DayOfYear && task.DayOfYear > 0) {
    const d = new Date(Date.UTC(new Date().getFullYear(), 0, task.DayOfYear))
    const label = `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}`
    return `Annually on ${label}${at}`
  }

  if (task.DayOfMonth && task.DayOfMonth > 0) {
    const suffix = ordinal(task.DayOfMonth)
    return `Monthly on the ${suffix}${at}`
  }

  if (task.DayOfWeek && task.DayOfWeek >= 1 && task.DayOfWeek <= 7) {
    const day = DAY_NAMES[task.DayOfWeek - 1] ?? 'day'
    return `Every ${day}${at}`
  }

  if (freq > 0) {
    if (freq === 1) return `Daily${at}`
    return `Every ${freq} days${at}`
  }

  return at ? `Runs${at}` : 'Unscheduled'
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0])
}
