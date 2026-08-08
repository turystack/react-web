/**
 * Confirm
 *
 * Confirmation dialog for destructive or important actions.
 * Blocks interaction until the user confirms or cancels.
 *
 * Behavior:
 * - Modal overlay with title, description, and two action buttons
 * - Confirm and cancel buttons support async handlers (shows loading while awaiting)
 * - Actions layout: stacked on mobile, row-reverse on desktop (confirm on the right)
 * - Custom button text and props for both confirm and cancel
 * - Closes via cancel, confirm, or overlay click (fires onClose)
 *
 * Implementation:
 * - Use Radix UI AlertDialog primitive (blocks background interaction)
 * - Async: wrap onConfirm/onCancel in try/finally with loading state
 * - Zoom 95% + fade animation on open/close
 * - <Confirm open={show} title="Delete item?" description="This cannot be undone."
 *     confirmText="Delete" confirmProps={{ variant: "destructive" }}
 *     onConfirm={handleDelete} onCancel={() => setShow(false)} />
 *
 * Dependencies: @radix-ui/react-alert-dialog, Button component
 */

import type { ButtonProps } from '@/components/button/button.types'

export type ConfirmProps = {
  open?: boolean // controlled visibility
  title: string // confirm dialog title (required)
  description: string // confirm dialog message (required)
  confirmText?: string // custom confirm button text
  cancelText?: string // custom cancel button text
  confirmProps?: Omit<ButtonProps, 'loading' | 'onClick'> // confirm button style overrides
  cancelProps?: Omit<ButtonProps, 'loading' | 'onClick'> // cancel button style overrides
  onConfirm?: () => void // fires when confirm is clicked
  onCancel?: () => void // fires when cancel is clicked
  onClose?: () => void // fires when dialog is closed (any method)
}
