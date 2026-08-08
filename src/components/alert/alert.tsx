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

const alert = tv({
  defaultVariants: {
    variant: 'default',
  },
  slots: {
    action: 'alert-action absolute top-2 right-2',
    description: [
      'alert-description text-balance text-muted-foreground text-sm md:text-pretty',
      '[&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
      '[&_p:not(:last-child)]:mb-4',
    ],
    icon: 'alert-icon row-span-2 translate-y-0.5 text-current [&_svg:not([class*=size-])]:size-4',
    root: [
      'alert-root group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2',
      'text-left text-sm transition-all duration-200',
      'has-data-[slot=alert-action]:pr-18',
      'has-[[data-testid=alert-icon]]:grid-cols-[auto_1fr] has-[[data-testid=alert-icon]]:gap-x-2',
    ],
    title: [
      'alert-title font-heading font-medium',
      'group-has-[[data-testid=alert-icon]]/alert:col-start-2',
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

  const handleTransitionEnd = useCallback(() => {
    if (closing) {
      setVisible(false)
      onClose?.()
    }
  }, [closing, onClose])

  if (!visible) {
    return null
  }

  return (
    <AlertContext.Provider value={slots}>
      <div
        className={root()}
        data-slot="alert"
        data-testid="alert-root"
        onTransitionEnd={handleTransitionEnd}
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
          <div className="absolute top-2 right-2">
            <Button onClick={handleClose} size="icon-sm" variant="ghost">
              <X className="size-3.5" />
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
