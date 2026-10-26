import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { tv } from 'tailwind-variants'
import {
  type ColorScheme,
  useColorScheme,
} from '@/components/color-scheme-provider'
import { useLabels } from '@/components/labels-provider'
import { Monitor, Moon, Sun } from '@/internal/icons'
import { axes } from '@/support/utils'

import type { ColorSchemeSwitcherProps } from './color-scheme-switcher.types'

const styles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    icon: 'color-scheme-switcher-icon pointer-events-none shrink-0',
    option:
      'color-scheme-switcher-option relative inline-flex cursor-pointer items-center justify-center rounded-md border border-transparent text-foreground/60 outline-none transition-all hover:text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-active:bg-background data-active:text-foreground data-active:shadow-sm dark:text-muted-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground dark:hover:text-foreground',
    root: 'color-scheme-switcher-root inline-flex w-fit items-center justify-center rounded-lg bg-muted p-0.75 text-muted-foreground',
  },
  variants: {
    size: {
      lg: {
        icon: 'size-5',
        option: 'size-9',
        root: 'h-11',
      },
      md: {
        icon: 'size-4',
        option: 'size-7',
        root: 'h-8',
      },
      sm: {
        icon: 'size-3.5',
        option: 'size-6',
        root: 'h-7',
      },
    },
  },
})

const OPTIONS: {
  icon: typeof Sun
  value: ColorScheme
}[] = [
  {
    icon: Sun,
    value: 'light',
  },
  {
    icon: Moon,
    value: 'dark',
  },
  {
    icon: Monitor,
    value: 'system',
  },
]

function ColorSchemeSwitcher({ size }: ColorSchemeSwitcherProps) {
  const { changeColorScheme, colorScheme } = useColorScheme()
  const labels = useLabels()
  const s = styles({
    size,
  })

  return (
    <div
      aria-label={labels.colorSchemeSwitcher.label}
      className={s.root()}
      data-testid="color-scheme-switcher"
      role="radiogroup"
      {...axes(styles, {
        size,
      })}
    >
      {OPTIONS.map(({ icon: Icon, value }) => {
        const active = colorScheme === value
        return (
          <ButtonPrimitive
            aria-checked={active}
            aria-label={labels.colorSchemeSwitcher[value]}
            className={s.option()}
            data-active={active ? '' : undefined}
            data-testid={`color-scheme-switcher-${value}`}
            key={value}
            onClick={() => changeColorScheme(value)}
            role="radio"
            type="button"
          >
            <Icon className={s.icon()} />
          </ButtonPrimitive>
        )
      })}
    </div>
  )
}

export { ColorSchemeSwitcher }
