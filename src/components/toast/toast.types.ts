/**
 * Toast
 *
 * Notification toast system using the Sonner library.
 * Provides success, error, warning, info, and loading variants.
 *
 * Behavior:
 * - Toasts appear at top-center (configurable)
 * - Auto-dismiss after timeout
 * - Color-coded left border: green (success), red (error), yellow (warning), blue (info)
 * - Custom icons per variant
 * - Action and cancel button support
 * - Multiple toasts stack with grouping
 *
 * Implementation:
 * - Render <Toast /> once at app root
 * - Trigger via toast("Message") or toast.success/error/warning/info/loading("Message")
 * - toast.success("Saved!", { description: "Your changes were saved." })
 *
 * Dependencies: sonner library
 */

export type ToastPosition =
  | 'bottom-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'top-left'
  | 'top-right'

export type ToastTheme = 'dark' | 'light' | 'system'

export type ToastProps = {
  position?: ToastPosition
  theme?: ToastTheme
}
