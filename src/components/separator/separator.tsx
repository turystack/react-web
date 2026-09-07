import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import { tv } from 'tailwind-variants'

import type { SeparatorProps } from './separator.types'

const separator = tv({
  base: 'separator shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
  compoundVariants: [
    {
      class: 'my-2',
      orientation: 'horizontal',
      spacing: 'sm',
    },
    {
      class: 'my-4',
      orientation: 'horizontal',
      spacing: 'md',
    },
    {
      class: 'my-6',
      orientation: 'horizontal',
      spacing: 'lg',
    },
    {
      class: 'mx-2',
      orientation: 'vertical',
      spacing: 'sm',
    },
    {
      class: 'mx-4',
      orientation: 'vertical',
      spacing: 'md',
    },
    {
      class: 'mx-6',
      orientation: 'vertical',
      spacing: 'lg',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    spacing: 'none',
  },
  variants: {
    orientation: {
      horizontal: '',
      vertical: '',
    },
    spacing: {
      lg: '',
      md: '',
      none: '',
      sm: '',
    },
  },
})

function Separator({
  decorative,
  orientation = 'horizontal',
  spacing = 'none',
}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      aria-hidden={decorative}
      className={separator({
        orientation,
        spacing,
      })}
      data-slot="separator"
      data-testid="separator"
      orientation={orientation}
    />
  )
}

export { Separator }
