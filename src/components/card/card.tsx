import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { CardFooterProps, CardHeaderProps, CardProps } from './card.types'

const card = tv({
  slots: {
    content: 'card-content px-5',
    description: 'card-description text-muted-foreground text-sm',
    footer: 'card-footer flex items-center px-5',
    header:
      'card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-5',
    root: 'card-root flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-5 text-card-foreground text-sm shadow-sm ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0',
    separator: 'card-separator border-t',
    title: 'card-title font-heading font-medium text-base leading-snug',
  },
  variants: {
    clickable: {
      true: {
        root: 'cursor-pointer transition-shadow hover:shadow-md',
      },
    },
    footerBordered: {
      true: {
        footer: 'rounded-b-xl border-t bg-muted/50 py-5',
      },
    },
    headerBordered: {
      true: {
        header: 'border-b pb-5',
      },
    },
    minHeight: {
      lg: {
        root: 'min-h-[30rem]',
      },
      md: {
        root: 'min-h-96',
      },
      sm: {
        root: 'min-h-80',
      },
      xl: {
        root: 'min-h-[34.375rem]',
      },
    },
    verticalAlign: {
      center: {
        root: 'justify-center',
      },
      start: {
        root: 'justify-start',
      },
    },
  },
})

function CardRoot({
  children,
  minHeight,
  onClick,
  verticalAlign,
}: PropsWithChildren<CardProps>) {
  const { root } = card({
    clickable: !!onClick,
    minHeight,
    verticalAlign,
  })

  return (
    <div className={root()} data-testid="card-root" onClick={onClick}>
      {children}
    </div>
  )
}

function CardHeader({
  bordered,
  children,
}: PropsWithChildren<CardHeaderProps>) {
  const { header } = card({
    headerBordered: bordered,
  })

  return (
    <div className={header()} data-testid="card-header">
      {children}
    </div>
  )
}

function CardTitle({ children }: PropsWithChildren) {
  const { title } = card()

  return (
    <div className={title()} data-testid="card-title">
      {children}
    </div>
  )
}

function CardDescription({ children }: PropsWithChildren) {
  const { description } = card()

  return (
    <div className={description()} data-testid="card-description">
      {children}
    </div>
  )
}

function CardContent({ children }: PropsWithChildren) {
  const { content } = card()

  return (
    <div className={content()} data-testid="card-content">
      {children}
    </div>
  )
}

function CardFooter({
  bordered,
  children,
}: PropsWithChildren<CardFooterProps>) {
  const { footer } = card({
    footerBordered: bordered,
  })

  return (
    <div
      className={footer()}
      data-slot={bordered ? 'card-footer' : undefined}
      data-testid="card-footer"
    >
      {children}
    </div>
  )
}

function CardSeparator() {
  const { separator } = card()

  return <hr className={separator()} data-testid="card-separator" />
}

const Card = Object.assign(CardRoot, {
  Content: CardContent,
  Description: CardDescription,
  Footer: CardFooter,
  Header: CardHeader,
  Separator: CardSeparator,
  Title: CardTitle,
})

export { Card }
