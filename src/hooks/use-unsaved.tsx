import type React from 'react'
import { useCallback } from 'react'

import { Confirm } from '@/components/confirm'
import type { ConfirmProps } from '@/components/confirm/confirm.types'

import { useDisclosure } from './use-disclosure'

export type UnsavedOptions = {
  confirm?: Omit<ConfirmProps, 'open' | 'onConfirm' | 'onClose'>
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
  return (
    <Confirm
      {...props}
      cancelText="Continuar editando"
      confirmProps={{
        variant: 'destructive',
      }}
      confirmText="Sair sem salvar"
      description="Você tem alterações não salvas. Sair agora fará você perder as mudanças."
      title="Deseja sair sem salvar?"
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
