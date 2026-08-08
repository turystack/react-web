import type { CSSProperties } from 'react'
import { Toaster as Sonner, toast } from 'sonner'
import { tv } from 'tailwind-variants'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from '@/internal/icons'

import type { ToastProps } from './toast.types'

const toastStyles = tv({
  slots: {
    actionButton: 'toast-action-button',
    cancelButton: 'toast-cancel-button',
    closeButton: 'toast-close-button',
    content: 'toast-content',
    description:
      'toast-description !font-medium !text-sm !text-muted-foreground',
    icon: 'toast-icon',
    title: 'toast-title font-medium text-sm',
    toast: 'toast-item',
  },
  variants: {
    variant: {
      default: {
        toast: 'toast-default',
      },
      error: {
        toast: 'toast-error !border-l-4 !border-l-destructive',
      },
      info: {
        toast: 'toast-info !border-l-4 !border-l-blue-500',
      },
      loading: {
        toast: 'toast-loading',
      },
      success: {
        toast: 'toast-success !border-l-4 !border-l-emerald-500',
      },
      warning: {
        toast: 'toast-warning !border-l-4 !border-l-amber-500',
      },
    },
  },
})

const toastRoot = tv({
  base: 'toast',
})

// Pre-compute classNames for each variant
const baseSlots = toastStyles({
  variant: 'default',
})
const errorSlots = toastStyles({
  variant: 'error',
})
const infoSlots = toastStyles({
  variant: 'info',
})
const loadingSlots = toastStyles({
  variant: 'loading',
})
const successSlots = toastStyles({
  variant: 'success',
})
const warningSlots = toastStyles({
  variant: 'warning',
})

function Toast({ position = 'top-center', theme = 'system' }: ToastProps) {
  return (
    <Sonner
      className={toastRoot()}
      data-testid="toast"
      icons={{
        error: <OctagonXIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
        success: <CircleCheckIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
      }}
      position={position}
      style={
        {
          '--border-radius': 'var(--radius)',
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
        } as CSSProperties
      }
      theme={theme}
      toastOptions={{
        classNames: {
          actionButton: baseSlots.actionButton(),
          cancelButton: baseSlots.cancelButton(),
          closeButton: baseSlots.closeButton(),
          content: baseSlots.content(),
          description: baseSlots.description(),
          error: errorSlots.toast(),
          icon: baseSlots.icon(),
          info: infoSlots.toast(),
          loading: loadingSlots.toast(),
          success: successSlots.toast(),
          title: baseSlots.title(),
          toast: baseSlots.toast(),
          warning: warningSlots.toast(),
        },
      }}
    />
  )
}

export { Toast, toast }
