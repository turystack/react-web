import { useTimeout } from '@turystack/react-hooks'
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { X } from '@/internal/icons'

import type {
  AlertActionProps,
  AlertDescriptionProps,
  AlertIconProps,
  AlertProps,
  AlertTitleProps,
} from './alert.types'

const CLOSE_DURATION_MS = 200

const alert = tv({
  defaultVariants: {
    variant: 'default',
  },
  slots: {
    /**
     * A real column, not an overlay. It used to be `absolute` over a root that
     * reserved a fixed `pr-18`, which held only while the control stayed
     * narrower than 4.5rem — a two-word button spilled left over the very
     * description it was meant to sit beside, and reserving more padding only
     * moves the width at which it breaks.
     */
    action: 'alert-action col-start-3 row-span-2 row-start-1 ml-3 self-start',
    close: 'alert-close col-start-4 row-span-2 row-start-1 ml-1 self-start',
    description: [
      'alert-description col-start-2 row-start-2 text-balance text-muted-foreground text-sm md:text-pretty',
      '[&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
      '[&_p:not(:last-child)]:mb-4',
    ],
    icon: [
      'alert-icon col-start-1 row-span-2 row-start-1 mr-2 translate-y-0.5 text-current',
      '[&_svg:not([class*=size-])]:size-4',
    ],
    /**
     * Four `auto` columns and one `1fr`: an absent icon, action or close button
     * leaves its column zero-wide, and the spacing rides on the parts' own
     * margins rather than a column gap that would otherwise open a hole where
     * the missing part used to be.
     */
    root: [
      'alert-root',
      'group/alert relative grid w-full grid-cols-[auto_1fr_auto_auto] gap-y-0.5',
      'rounded-lg border px-2.5 py-2',
      'text-left text-sm transition-all duration-200',
    ],
    title: [
      'alert-title col-start-2 row-start-1 font-heading font-medium',
      '[&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
    ],
  },
  variants: {
    variant: {
      default: {
        root: 'bg-card text-card-foreground',
      },
      destructive: {
        description: 'text-destructive/90',
        icon: 'text-current',
        root: 'bg-card text-destructive',
      },
    },
  },
})

type AlertSlots = Omit<ReturnType<typeof alert>, 'root'>

const AlertContext = createContext<AlertSlots>({} as AlertSlots)

function AlertRoot({
  children,
  variant,
  closable,
  onClose,
}: PropsWithChildren<AlertProps>) {
  const [visible, setVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const { root, ...slots } = alert({
    variant,
  })

  const handleClose = useCallback(() => {
    setClosing(true)
  }, [])

  const finishClose = useCallback(() => {
    setVisible(false)
    onClose?.()
  }, [onClose])

  // `transitionend` is the only signal the close had, and it never arrives when
  // the transition does not run — reduced motion, a hidden ancestor, a test
  // environment. Without this fallback the alert stays invisible on screen and
  // `onClose` never fires.
  useTimeout(finishClose, closing ? CLOSE_DURATION_MS : null)

  if (!visible) {
    return null
  }

  return (
    <AlertContext.Provider value={slots}>
      <div
        className={root()}
        data-closing={closing || undefined}
        data-slot="alert"
        data-testid="alert-root"
        onTransitionEnd={closing ? finishClose : undefined}
        ref={rootRef}
        role="alert"
        style={
          closing
            ? {
                opacity: 0,
                transform: 'translateY(-4px)',
              }
            : undefined
        }
      >
        {children}
        {closable && (
          <div className={slots.close()} data-testid="alert-close">
            <Button
              ariaLabel="Close"
              onClick={handleClose}
              size="icon-sm"
              variant="ghost"
            >
              <X className="alert-close-icon size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </AlertContext.Provider>
  )
}

function AlertIcon({ children }: PropsWithChildren<AlertIconProps>) {
  const { icon } = useContext(AlertContext)
  return (
    <div className={icon()} data-testid="alert-icon">
      {children}
    </div>
  )
}

function AlertTitle({ children }: PropsWithChildren<AlertTitleProps>) {
  const { title } = useContext(AlertContext)
  return (
    <div className={title()} data-testid="alert-title">
      {children}
    </div>
  )
}

function AlertDescription({
  children,
}: PropsWithChildren<AlertDescriptionProps>) {
  const { description } = useContext(AlertContext)
  return (
    <div className={description()} data-testid="alert-description">
      {children}
    </div>
  )
}

function AlertAction({ children }: PropsWithChildren<AlertActionProps>) {
  const { action } = useContext(AlertContext)
  return (
    <div
      className={action()}
      data-slot="alert-action"
      data-testid="alert-action"
    >
      {children}
    </div>
  )
}

const Alert = Object.assign(AlertRoot, {
  Action: AlertAction,
  Description: AlertDescription,
  Icon: AlertIcon,
  Title: AlertTitle,
})

export { Alert }
