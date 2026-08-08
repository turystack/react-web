import type { ReactNode } from 'react'

export type LayoutHeaderSize = 'sm' | 'md' | 'lg'

export type LayoutHeaderProps = {
  bordered?: boolean // adds bottom border
  leftSection?: ReactNode // content rendered on the left of the header
  rightSection?: ReactNode // content rendered on the right of the header
  size?: LayoutHeaderSize // controls header height
  sticky?: boolean // makes header sticky at top
}
