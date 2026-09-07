import { useDisclosure } from '@turystack/react-hooks'
import type React from 'react'
import { useCallback } from 'react'
import { Confirm } from '@/components/confirm'
import type { ConfirmSimpleProps } from '@/components/confirm/confirm.types'
import { useLabels } from '@/components/labels-provider'

export type UnsavedOptions = {
  confirm?: Omit<ConfirmSimpleProps, 'open' | 'onConfirm' | 'onClose'>
  unsaved?: boolean
  leaving?: boolean
  onProceed?: () => void
}

export type UseUnsavedReturn = [() => void, () => React.ReactNode]

export type UnsavedConfirmProps = {
  confirm?: UnsavedOptions['confirm']
  open?: boolean
  onConfirm?: () => void
  onClose?: () => void
}

function UnsavedConfirm({ confirm, ...props }: UnsavedConfirmProps) {
  const labels = useLabels()

  return (
    <Confirm
      {...props}
      cancelText={labels.unsaved.cancel}
      confirmProps={{
        variant: 'destructive',
      }}
      confirmText={labels.unsaved.confirm}
      description={labels.unsaved.description}
      title={labels.unsaved.title}
      {...confirm}
    />
  )
}

export function useUnsaved({
  confirm,
  unsaved,
  leaving,
  onProceed,
}: UnsavedOptions): UseUnsavedReturn {
  const { on, off, value } = useDisclosure()

  const unsavedHandler = useCallback(() => {
    if (unsaved && leaving) {
      on()

      return
    }

    onProceed?.()
    off()
  }, [unsaved, leaving, on, off, onProceed])

  const handleConfirm = useCallback(() => {
    onProceed?.()
    off()
  }, [onProceed, off])

  return [
    unsavedHandler,
    () => (
      <UnsavedConfirm
        confirm={confirm}
        onClose={off}
        onConfirm={handleConfirm}
        open={value}
      />
    ),
  ]
}
