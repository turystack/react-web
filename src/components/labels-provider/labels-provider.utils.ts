import { defaultLabels } from './labels-provider.data'
import type { PartialTuryLabels, TuryLabels } from './labels-provider.types'

export function mergeLabels(
  overrides: PartialTuryLabels | undefined,
): TuryLabels {
  if (!overrides) {
    return defaultLabels
  }

  const merged: Record<string, unknown> = {}
  for (const [group, strings] of Object.entries(defaultLabels)) {
    merged[group] = {
      ...strings,
      ...overrides[group as keyof TuryLabels],
    }
  }
  return merged as TuryLabels
}
