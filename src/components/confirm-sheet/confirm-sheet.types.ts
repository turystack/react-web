import type { ConfirmProps } from '@/components/confirm/confirm.types'
import type { SheetProps } from '@/components/sheet/sheet.types'

export type ConfirmSheetProps = ConfirmProps & Pick<SheetProps, 'side' | 'size'>
