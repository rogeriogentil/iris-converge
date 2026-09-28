import { describe, expect, it } from 'vitest'
import { scheduleToHuman } from '../schedule'

describe('scheduleToHuman', () => {
  it('returns "Disabled" when Enabled is false', () => {
    expect(scheduleToHuman({ Enabled: false })).toBe('Disabled')
  })

  it('returns "Suspended" when Suspended is true', () => {
    expect(scheduleToHuman({ Suspended: true })).toBe('Suspended')
  })

  it('formats daily schedule', () => {
    expect(scheduleToHuman({ DailyFrequency: 1, StartTime: '02:00:00' })).toBe('Daily at 2:00 AM')
  })

  it('formats every-N-days schedule', () => {
    expect(scheduleToHuman({ DailyFrequency: 3, StartTime: '12:00:00' })).toBe('Every 3 days at 12:00 PM')
  })

  it('formats weekly schedule', () => {
    // DayOfWeek 2 = Monday (1=Sunday)
    expect(scheduleToHuman({ DayOfWeek: 2, StartTime: '03:00:00' })).toBe('Every Monday at 3:00 AM')
  })

  it('formats monthly schedule', () => {
    expect(scheduleToHuman({ DayOfMonth: 15, StartTime: '06:00:00' })).toBe('Monthly on the 15th at 6:00 AM')
  })

  it('formats one-time schedule', () => {
    const result = scheduleToHuman({ RunDate: '2027-01-15', StartTime: '10:00:00' })
    expect(result).toMatch(/Once on/)
    expect(result).toMatch(/January/)
    expect(result).toMatch(/15/)
  })

  it('returns "Unscheduled" when no schedule fields are set', () => {
    expect(scheduleToHuman({})).toBe('Unscheduled')
  })
})
