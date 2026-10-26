import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * The axes a theme can tell apart, as `data-*` attributes for the root.
 *
 * A variant lives in utilities, and utilities are not a surface a theme can
 * name: `.button` reaches every button, and nothing reaches only the
 * destructive one. `data-variant="destructive"` does. The value is the
 * resolved one — the style's own default when the prop was left out — so the
 * component with no props is themeable too (STY-L5).
 */
function axes(
  styles: {
    defaultVariants: Record<string, unknown>
  },
  values: Record<string, unknown>,
): Record<`data-${string}`, string> {
  const published: Record<`data-${string}`, string> = {}

  for (const [axis, value] of Object.entries(values)) {
    const resolved = value ?? styles.defaultVariants[axis]

    if (resolved !== undefined && resolved !== null && resolved !== false) {
      published[`data-${kebab(axis)}`] = String(resolved)
    }
  }

  return published
}

/** `triggerSize` → `trigger-size`. */
function kebab(key: string) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

export { axes, cn, tv }
