import type { ReactNode } from 'react'

export type BottomTabsProps = {
  value?: string
  onChange?: (event: React.SyntheticEvent, value: string) => void
  showLabels?: boolean
  children: ReactNode
}

export type BottomTabsItemProps = {
  value: string
  label?: string
  icon?: ReactNode
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  asChild?: boolean
  children?: ReactNode
}
