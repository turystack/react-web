import type { ButtonProps } from '@/components/button/button.types'
import type { ConfirmSheetProps } from '@/components/confirm-sheet/confirm-sheet.types'
import type { SheetProps } from '@/components/sheet/sheet.types'

export type ActionSheetProps = Pick<SheetProps, 'open' | 'onChange'>

export type ActionSheetTriggerProps = {
  asChild?: boolean // render as child element
}

export type ActionSheetContentProps = Pick<SheetProps, 'side' | 'size'> & {
  title?: React.ReactNode // optional sheet title
  description?: React.ReactNode // optional sheet description
}

export type ActionSheetItemVariant = 'default' | 'destructive'

export type ActionSheetItemConfirmProps = Omit<
  ConfirmSheetProps,
  'open' | 'onClose'
>

export type ActionSheetItemProps = {
  variant?: ActionSheetItemVariant // visual variant
  icon?: React.ReactNode // element rendered before item label
  rightSection?: React.ReactNode // element rendered after item label
  confirm?: ActionSheetItemConfirmProps // confirmation sheet shown before action
  onClick?: ButtonProps['onClick'] // fires when item has no confirm
  disabled?: boolean
  loading?: boolean
}

export type ActionSheetGroupProps = {}

export type ActionSheetSeparatorProps = {}
