import {
  cloneElement,
  createContext,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { ConfirmSheet } from '@/components/confirm-sheet'
import { Loader } from '@/components/loader'
import { Separator } from '@/components/separator'
import { Sheet } from '@/components/sheet'

import type {
  ActionSheetContentProps,
  ActionSheetGroupProps,
  ActionSheetItemConfirmProps,
  ActionSheetItemProps,
  ActionSheetProps,
  ActionSheetSeparatorProps,
  ActionSheetTriggerProps,
} from './action-sheet.types'

type ActionSheetContextValue = {
  open?: boolean
  setOpen: (open: boolean) => void
  openConfirm: (confirm: ActionSheetItemConfirmProps) => void
}

const ActionSheetContext = createContext<ActionSheetContextValue | null>(null)

const actionSheet = tv({
  slots: {
    content: 'action-sheet-content flex flex-col gap-1',
    group: 'action-sheet-group flex flex-col gap-1',
    item: [
      'action-sheet-item flex min-h-12 w-full items-center gap-3 rounded-lg text-left',
      'text-sm outline-none transition-colors hover:bg-muted hover:text-foreground',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    itemContent: 'action-sheet-item-content flex min-w-0 flex-1 items-center',
    itemIcon: 'action-sheet-item-icon flex shrink-0 text-muted-foreground',
    itemLabel: 'action-sheet-item-label min-w-0 flex-1 truncate',
    itemRight:
      'action-sheet-item-right ml-3 flex shrink-0 text-muted-foreground',
  },
  variants: {
    variant: {
      default: {
        item: '',
        itemIcon: '',
      },
      destructive: {
        item: 'text-destructive hover:text-destructive',
        itemIcon: 'text-destructive',
      },
    },
  },
})

function useActionSheet() {
  const context = useContext(ActionSheetContext)
  if (!context) {
    throw new Error('ActionSheet components must be used inside ActionSheet')
  }
  return context
}

function ActionSheetRoot({
  open,
  onChange,
  children,
}: PropsWithChildren<ActionSheetProps>) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirm, setConfirm] = useState<ActionSheetItemConfirmProps>()

  const isControlled = open !== undefined
  const currentOpen = isControlled ? open : internalOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onChange?.(nextOpen)
    },
    [isControlled, onChange],
  )

  const value = useMemo<ActionSheetContextValue>(
    () => ({
      open: currentOpen,
      openConfirm: (nextConfirm) => {
        setConfirm(nextConfirm)
        setOpen(false)
        setConfirmOpen(true)
      },
      setOpen,
    }),
    [currentOpen, setOpen],
  )

  const closeConfirm = () => setConfirmOpen(false)

  return (
    <ActionSheetContext.Provider value={value}>
      {children}
      {confirm && (
        <ConfirmSheet
          {...confirm}
          onCancel={async () => {
            await Promise.resolve(confirm.onCancel?.())
            closeConfirm()
          }}
          onClose={closeConfirm}
          onConfirm={async () => {
            await Promise.resolve(confirm.onConfirm?.())
            closeConfirm()
          }}
          open={confirmOpen}
        />
      )}
    </ActionSheetContext.Provider>
  )
}

function ActionSheetTrigger({
  asChild,
  children,
}: PropsWithChildren<ActionSheetTriggerProps>) {
  const { setOpen } = useActionSheet()

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onClick?: React.MouseEventHandler<HTMLElement>
    }>

    return cloneElement(child, {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) {
          setOpen(true)
        }
      },
    })
  }

  return <Button onClick={() => setOpen(true)}>{children}</Button>
}

function ActionSheetContent({
  side = 'bottom',
  size,
  title,
  description,
  children,
}: PropsWithChildren<ActionSheetContentProps>) {
  const { open, setOpen } = useActionSheet()
  const { content } = actionSheet()

  return (
    <Sheet onChange={setOpen} open={open} side={side} size={size}>
      {(title || description) && (
        <Sheet.Header bordered closable>
          {title && <Sheet.Header.Title>{title}</Sheet.Header.Title>}
          {description && (
            <Sheet.Header.Description>{description}</Sheet.Header.Description>
          )}
        </Sheet.Header>
      )}
      <Sheet.Body>
        <div className={content()} data-testid="action-sheet-content">
          {children}
        </div>
      </Sheet.Body>
    </Sheet>
  )
}

function ActionSheetItem({
  variant = 'default',
  icon,
  rightSection,
  confirm,
  onClick,
  disabled,
  loading,
  children,
}: PropsWithChildren<ActionSheetItemProps>) {
  const { setOpen, openConfirm } = useActionSheet()
  const { item, itemContent, itemIcon, itemLabel, itemRight } = actionSheet({
    variant,
  })

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (confirm) {
      openConfirm(confirm)
      return
    }
    onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(false)
    }
  }

  return (
    <button
      className={item()}
      disabled={disabled || loading}
      onClick={handleClick}
      type="button"
    >
      {icon && <span className={itemIcon()}>{icon}</span>}
      <span className={itemContent()}>
        <span className={itemLabel()}>{children}</span>
        {(loading || rightSection) && (
          <span className={itemRight()}>
            {loading ? <Loader size="sm" /> : rightSection}
          </span>
        )}
      </span>
    </button>
  )
}

function ActionSheetGroup({
  children,
}: PropsWithChildren<ActionSheetGroupProps>) {
  const { group } = actionSheet()

  return (
    <div className={group()} data-testid="action-sheet-group">
      {children}
    </div>
  )
}

function ActionSheetSeparator(_: ActionSheetSeparatorProps) {
  return <Separator decorative />
}

const ActionSheet = Object.assign(ActionSheetRoot, {
  Content: ActionSheetContent,
  Group: ActionSheetGroup,
  Item: ActionSheetItem,
  Separator: ActionSheetSeparator,
  Trigger: ActionSheetTrigger,
})

export { ActionSheet }
