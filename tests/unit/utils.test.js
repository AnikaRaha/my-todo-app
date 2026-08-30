import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { todayStr, fmtDate, nextRecurringDate } from '../../src/utils.js'

describe('todayStr', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns today in local YYYY-MM-DD format', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T10:00:00'))
    expect(todayStr()).toBe('2026-08-15')
  })

  it('pads single-digit month and day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-05T00:30:00'))
    expect(todayStr()).toBe('2026-01-05')
  })

  it('reflects local calendar date, not the UTC date (regression: avoid toISOString)', () => {
    // Just before local midnight — a UTC-based formatter (toISOString) would
    // roll this back to the previous day for any positive UTC-offset zone.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T23:59:00'))
    expect(todayStr()).toBe('2026-08-15')
  })
})

describe('fmtDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-15T10:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "today" for the current date', () => {
    expect(fmtDate('2026-08-15')).toBe('today')
  })

  it('returns "tomorrow" for the next calendar date', () => {
    expect(fmtDate('2026-08-16')).toBe('tomorrow')
  })

  it('returns "tomorrow" across a month boundary', () => {
    vi.setSystemTime(new Date('2026-08-31T10:00:00'))
    expect(fmtDate('2026-09-01')).toBe('tomorrow')
  })

  it('returns "Mon D, YYYY" for a future date beyond tomorrow', () => {
    expect(fmtDate('2026-08-20')).toBe('Aug 20, 2026')
  })

  it('returns "Mon D, YYYY" for a past date', () => {
    expect(fmtDate('2026-08-01')).toBe('Aug 1, 2026')
  })

  it('includes the year across a year boundary', () => {
    vi.setSystemTime(new Date('2026-12-15T10:00:00'))
    expect(fmtDate('2027-01-10')).toBe('Jan 10, 2027')
  })
})

describe('nextRecurringDate', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('daily', () => {
    it('returns due date + 1 day when due is in the future', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-08-15T10:00:00'))
      expect(nextRecurringDate('2026-08-20', 'daily')).toBe('2026-08-21')
    })

    it('rolls over a month boundary', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-08-15T10:00:00'))
      expect(nextRecurringDate('2026-08-31', 'daily')).toBe('2026-09-01')
    })

    it('bases the next date on today (not the stale due date) when due is in the past', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-08-15T10:00:00'))
      expect(nextRecurringDate('2026-08-01', 'daily')).toBe('2026-08-16')
    })

    it('bases the next date on today when due is exactly today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-08-15T10:00:00'))
      expect(nextRecurringDate('2026-08-15', 'daily')).toBe('2026-08-16')
    })
  })

  describe('monthly', () => {
    it('lands on the same day next month for a normal date', () => {
      expect(nextRecurringDate('2026-08-15', 'monthly')).toBe('2026-09-15')
    })

    it('skips February for a 31st due date (month-end edge case)', () => {
      expect(nextRecurringDate('2027-01-31', 'monthly')).toBe('2027-03-31')
    })

    it('skips a leap-year February 29th and still finds no 31st there', () => {
      // 2028 is a leap year (Feb has 29 days) — still short of 31, so it
      // must skip to March 31 just like a non-leap year would.
      expect(nextRecurringDate('2028-01-31', 'monthly')).toBe('2028-03-31')
    })

    it('skips two consecutive short months when neither has enough days', () => {
      // April (30 days) is too short for the 31st, so it must reach May.
      expect(nextRecurringDate('2026-03-31', 'monthly')).toBe('2026-05-31')
    })

    it('rolls over a year boundary', () => {
      expect(nextRecurringDate('2026-12-15', 'monthly')).toBe('2027-01-15')
    })
  })

  describe('yearly', () => {
    it('lands on the same date next year', () => {
      expect(nextRecurringDate('2026-08-30', 'yearly')).toBe('2027-08-30')
    })

    it('rolls a Feb 29 leap date forward to Mar 1 in a non-leap target year', () => {
      // Native Date.setFullYear behavior for a nonexistent Feb 29 target.
      expect(nextRecurringDate('2024-02-29', 'yearly')).toBe('2025-03-01')
    })
  })

  describe('unrecognized recurrence', () => {
    it('returns the due date unchanged', () => {
      expect(nextRecurringDate('2026-08-15', 'none')).toBe('2026-08-15')
      expect(nextRecurringDate('2026-08-15', undefined)).toBe('2026-08-15')
    })
  })
})
