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
import { useLabels } from '@/components/labels-provider'
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
    layout: 'card',
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
    root: [
      'alert-root',
      'group/alert relative w-full',
      'text-left text-sm transition-all duration-200',
    ],
    title: [
      'alert-title col-start-2 row-start-1 font-heading font-medium',
      '[&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
    ],
  },
  variants: {
    layout: {
      /**
       * A strip across the top of the shell. Flex, not the card's grid: the
       * grid stacks the description under the title, and a banner is one line
       * by definition. The gap spaces whatever parts are present, the action
       * rides `ml-auto` to the far edge, and the description is the one part
       * that gives way — it truncates instead of wrapping the strip taller.
       * Only the bottom border survives: the banner meets the window on three
       * sides and the shell on one.
       */
      banner: {
        action: 'ml-auto self-center',
        close: 'ml-0 self-center',
        description: 'min-w-0 flex-1 truncate',
        icon: 'mr-0 translate-y-0 self-center',
        root: 'flex min-h-9 items-center gap-x-2 rounded-none border-0 border-b px-4 py-1.5',
        title: 'shrink-0 whitespace-nowrap',
      },
      /**
       * Four `auto` columns and one `1fr`: an absent icon, action or close button
       * leaves its column zero-wide, and the spacing rides on the parts' own
       * margins rather than a column gap that would otherwise open a hole where
       * the missing part used to be.
       */
      card: {
        root: 'grid grid-cols-[auto_1fr_auto_auto] gap-y-0.5 rounded-lg border px-2.5 py-2',
      },
    },
    /**
     * Each status tone is its theme token — `success`, `warning`, or `primary`
     * for info, so info is the brand's colour in every theme — at a low alpha
     * for the surface and the border, and full strength for the icon. On a
     * tinted surface the description drops `muted-foreground` for the card's
     * own ink at 80%: the grey measured 4.1–4.2:1 on the tints in the light scheme,
     * under AA, while the 80% ink holds above 9:1 in both schemes.
     */
    variant: {
      default: {
        root: 'bg-card text-card-foreground',
      },
      destructive: {
        description: 'text-destructive/90',
        icon: 'text-current',
        root: 'bg-card text-destructive',
      },
      info: {
        description: 'text-card-foreground/80',
        icon: 'text-primary',
        root: 'border-primary/30 bg-primary/5 text-card-foreground',
      },
      success: {
        description: 'text-card-foreground/80',
        icon: 'text-success',
        root: 'border-success/30 bg-success/10 text-card-foreground',
      },
      warning: {
        description: 'text-card-foreground/80',
        icon: 'text-warning',
        root: 'border-warning/30 bg-warning/10 text-card-foreground',
      },
    },
  },
})

type AlertSlots = Omit<ReturnType<typeof alert>, 'root'>

const AlertContext = createContext<AlertSlots>({} as AlertSlots)

function AlertRoot({
  children,
  variant = 'default',
  layout = 'card',
  closable,
  onClose,
}: PropsWithChildren<AlertProps>) {
  const labels = useLabels()
  const [visible, setVisible] = useState(true)
  const [closing, setClosing] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const { root, ...slots } = alert({
    layout,
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
        data-layout={layout}
        data-slot="alert"
        data-testid="alert-root"
        data-variant={variant}
        onTransitionEnd={closing ? finishClose : undefined}
        ref={rootRef}
        // A banner is on every screen for as long as the condition lasts; an
        // assertive `alert` would interrupt each page it appears on to say so.
        role={layout === 'banner' ? 'status' : 'alert'}
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
              ariaLabel={labels.common.close}
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
    // Decorative: the title and the description carry the message.
    <div aria-hidden className={icon()} data-testid="alert-icon">
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
