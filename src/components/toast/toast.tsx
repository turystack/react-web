import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Toaster as Sonner, toast } from 'sonner'
import { tv } from 'tailwind-variants'
import { useResolvedPortalContainer } from '@/components/portal-provider'
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
    item: 'toast-item',
    title: 'toast-title font-medium text-sm',
  },
  variants: {
    variant: {
      default: {
        item: 'toast-default',
      },
      error: {
        item: 'toast-error !border-l-4 !border-l-destructive',
      },
      info: {
        item: 'toast-info !border-l-4 !border-l-blue-500',
      },
      loading: {
        item: 'toast-loading',
      },
      success: {
        item: 'toast-success !border-l-4 !border-l-emerald-500',
      },
      warning: {
        item: 'toast-warning !border-l-4 !border-l-amber-500',
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
  const container = useResolvedPortalContainer()

  const toaster = (
    <Sonner
      className={toastRoot()}
      data-testid="toast"
      icons={{
        error: <OctagonXIcon className="toast-icon-error size-4" />,
        info: <InfoIcon className="toast-icon-info size-4" />,
        loading: (
          <Loader2Icon className="toast-icon-loading size-4 animate-spin" />
        ),
        success: <CircleCheckIcon className="toast-icon-success size-4" />,
        warning: <TriangleAlertIcon className="toast-icon-warning size-4" />,
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
          error: errorSlots.item(),
          icon: baseSlots.icon(),
          info: infoSlots.item(),
          loading: loadingSlots.item(),
          success: successSlots.item(),
          title: baseSlots.title(),
          toast: baseSlots.item(),
          warning: warningSlots.item(),
        },
      }}
    />
  )

  // Sonner renders where it is mounted, and the provider mounts it at the app
  // root. An app that scopes this library to a subtree — a themed panel, a docs
  // surface — has its tokens and its font resolved outside that subtree, so the
  // toast came out in the host's colours while every other surface obeyed.
  return container ? createPortal(toaster, container) : toaster
}

export { Toast, toast }
