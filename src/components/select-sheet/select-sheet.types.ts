import type { SelectMode, SelectProps } from '@/components/select/select.types'
import type { SheetProps } from '@/components/sheet/sheet.types'

export type SelectSheetProps<
  T,
  I = string,
  O = I,
  K extends SelectMode = SelectMode,
> = SelectProps<T, I, O, K> &
  Pick<SheetProps, 'open' | 'side'> & {
    onOpenChange?: SheetProps['onChange'] // fires when the sheet opens/closes
    sheetSize?: SheetProps['size'] // popup max-width for side sheets
    title?: React.ReactNode // optional sheet title
    description?: React.ReactNode // optional sheet description
  }
