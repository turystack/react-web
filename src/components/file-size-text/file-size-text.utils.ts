import type { FileSizeTextVariant } from './file-size-text.types'

const UNITS: Record<FileSizeTextVariant, string[]> = {
  binary: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'],
  decimal: ['B', 'kB', 'MB', 'GB', 'TB', 'PB'],
}

const STEP: Record<FileSizeTextVariant, number> = {
  binary: 1024,
  decimal: 1000,
}

export type FileSize = {
  amount: number
  unit: string
}

/**
 * Climbs to the largest unit that still leaves a number at or above one, so a
 * size is read in the unit a person would have said it in.
 */
export function scaleBytes(
  bytes: number,
  variant: FileSizeTextVariant,
): FileSize {
  const units = UNITS[variant]
  const step = STEP[variant]
  const sign = bytes < 0 ? -1 : 1
  let amount = Math.abs(bytes)
  let index = 0

  while (amount >= step && index < units.length - 1) {
    amount /= step
    index += 1
  }

  return {
    amount: amount * sign,
    unit: units[index] as string,
  }
}
