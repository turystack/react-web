import type { DurationTextUnit } from './duration-text.types'

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export type DurationParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function toSeconds(value: number, unit: DurationTextUnit): number {
  if (unit === 'minutes') {
    return value * MINUTE
  }

  if (unit === 'milliseconds') {
    return value / 1000
  }

  return value
}

export function splitDuration(totalSeconds: number): DurationParts {
  const whole = Math.floor(Math.abs(totalSeconds))

  return {
    days: Math.floor(whole / DAY),
    hours: Math.floor((whole % DAY) / HOUR),
    minutes: Math.floor((whole % HOUR) / MINUTE),
    seconds: whole % MINUTE,
  }
}

/**
 * Hours appear only once there are hours: `45:00` is a plausible reading of
 * forty five minutes, `00:45:00` reads as a stopwatch nobody asked for.
 */
export function clockOf(totalSeconds: number): string {
  const { days, hours, minutes, seconds } = splitDuration(totalSeconds)
  const allHours = days * 24 + hours
  const pad = (part: number) => String(part).padStart(2, '0')
  const sign = totalSeconds < 0 ? '-' : ''

  return allHours > 0
    ? `${sign}${pad(allHours)}:${pad(minutes)}:${pad(seconds)}`
    : `${sign}${pad(minutes)}:${pad(seconds)}`
}
