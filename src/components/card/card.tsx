import {
  type KeyboardEvent,
  type MouseEvent,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { tv } from 'tailwind-variants'

import {
  CardContext,
  CardLinkContext,
  useCardLink,
  useCardSize,
} from './card.context'
import type {
  CardFooterProps,
  CardHeaderProps,
  CardProps,
  CardTitleProps,
} from './card.types'

/**
 * `process.env.NODE_ENV`, not `import.meta.env.DEV`: in library mode Vite
 * bakes `import.meta.env.*` into the published build (DEV would ship as
 * false and the warning would never reach an app), while `process.env` is
 * left for the consuming app's bundler to replace — the same guard the
 * bundled Base UI code already ships with. Typed here because the package's
 * tsconfig does not load Node's types.
 */
declare const process: { env: { NODE_ENV?: string } }

const card = tv({
  slots: {
    content: 'card-content px-5',
    description: 'card-description text-muted-foreground text-sm',
    footer: 'card-footer flex items-center px-5',
    header:
      'card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-5',
    // The stretched link. The title's own text is the link, so its name is
    // the title; its ::after covers the whole card, above the static content
    // (a click anywhere lands on it) and below the card's own controls. The
    // focus ring is drawn on that cover, inset because the root clips.
    link: [
      'card-link outline-none',
      'after:absolute after:inset-0 after:z-1 after:rounded-xl',
      'focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset',
    ],
    // The same cover as a real element, for a card named by ariaLabel rather
    // than by a title: the name travels as visually hidden text inside it.
    linkCover: [
      'card-link-cover absolute inset-0 z-1 rounded-xl outline-none',
      'focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset',
    ],
    linkLabel: 'card-link-label sr-only',
    root: 'card-root flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-5 text-card-foreground text-sm shadow-sm ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0',
    separator: 'card-separator border-t',
    title: 'card-title font-heading font-medium text-base leading-snug',
  },
  compoundVariants: [
    {
      class: { footer: 'py-3' },
      footerBordered: true,
      size: 'sm',
    },
    {
      class: { header: 'pb-3' },
      headerBordered: true,
      size: 'sm',
    },
    /**
     * A selected or highlighted card already spends its ring on that state, so
     * a pressable one keeps the primary ring on focus and shows focus as an
     * offset outline around it — the ring-3 focus ring would repaint the
     * selection grey exactly when the user lands on it.
     */
    {
      class: {
        root: [
          'focus-visible:ring-primary',
          'focus-visible:outline-3 focus-visible:outline-ring/50 focus-visible:outline-offset-2 focus-visible:outline-solid',
        ],
      },
      emphasised: true,
      pressable: true,
    },
    {
      class: { root: 'focus-visible:ring-2' },
      pressable: true,
      selected: true,
    },
    {
      class: { root: 'focus-visible:ring-1' },
      pressable: true,
      selected: false,
      emphasised: true,
    },
  ],
  variants: {
    clickable: {
      true: {
        root: 'cursor-pointer transition-shadow hover:shadow-md',
      },
    },
    /**
     * A card with onClick and no href is itself the button: it takes focus,
     * so it draws the ring the stretched link draws in href mode.
     */
    pressable: {
      true: {
        root: 'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
      },
    },
    footerBordered: {
      true: {
        footer: 'border-t py-5',
      },
    },
    /** Internal: selected or highlighted, the two states that own the ring. */
    emphasised: {
      true: {},
    },
    /**
     * The recommended tier among its siblings: the hairline ring turns
     * primary. Declared before `selected`, so a card that is both shows the
     * selection.
     */
    highlighted: {
      true: {
        root: 'ring-primary',
      },
    },
    /**
     * The card the user picked: a 2px primary ring and a primary tint. The
     * tint is a layer over the card's own background, not a replacement for
     * it — `bg-primary/5` on the root would drop `bg-card` and let the page
     * show through, which in dark mode is a different grey. `isolate` keeps
     * the layer below the content and above the background.
     */
    selected: {
      false: {},
      true: {
        root: [
          'relative isolate ring-2 ring-primary',
          'before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-primary/5',
        ],
      },
    },
    /**
     * A linked card is the containing block of the link's cover, and lifts
     * every control inside it above that cover, so a nested button or link
     * stays clickable on its own and never navigates the card.
     */
    linked: {
      true: {
        root: [
          'relative',
          '[&_:is(a,button,input,select,textarea,summary):not(.card-link,.card-link-cover)]:relative',
          '[&_:is(a,button,input,select,textarea,summary):not(.card-link,.card-link-cover)]:z-2',
        ],
      },
    },
    headerBordered: {
      true: {
        header: 'border-b pb-5',
      },
    },
    /**
     * `sm` is a card that is one row of a list: the gutter and the gap shrink
     * together, and the shadow goes, because a stack of shadowed rows inside a
     * container reads as noise rather than as depth.
     */
    size: {
      default: {},
      sm: {
        content: 'px-3',
        footer: 'px-3',
        header: 'px-3',
        root: 'gap-2 py-3 shadow-none',
      },
    },
    /**
     * `full` fills the cell the card sits in: a stretched grid item (Grid's
     * default align) or a flex parent with a height. `auto` is the card's own
     * content height, which leaves a gap under a short card in a bento row.
     */
    height: {
      auto: {},
      // The content takes the spare height, so a bordered footer sits on the
      // card's bottom edge and two cards side by side draw their footer rule
      // on the same line.
      full: {
        root: 'h-full [&>.card-content]:flex-1',
      },
    },
    minHeight: {
      lg: {
        root: 'min-h-120',
      },
      md: {
        root: 'min-h-96',
      },
      sm: {
        root: 'min-h-80',
      },
      xl: {
        root: 'min-h-137.5',
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

/**
 * What counts as a control of its own inside a card. A click or key press
 * that starts in one belongs to that control, never to the card — the same
 * rule the stretched link follows in href mode, where those controls sit
 * above the link's cover.
 */
const NESTED_CONTROL =
  'a[href],button,input,select,textarea,summary,[role=button],[role=link],[tabindex]'

function startedInNestedControl(event: {
  currentTarget: Element
  target: EventTarget
}) {
  const target = event.target as Element | null
  const control = target?.closest?.(NESTED_CONTROL)
  return Boolean(control && control !== event.currentTarget)
}

function CardRoot({
  ariaLabel,
  children,
  height = 'auto',
  highlighted = false,
  href,
  id,
  minHeight,
  onClick,
  onSelectedChange,
  selected,
  size = 'default',
  verticalAlign,
}: PropsWithChildren<CardProps>) {
  const linked = href !== undefined
  const pressable =
    !linked && (onClick !== undefined || onSelectedChange !== undefined)
  // A card the consumer can flip reports its state even while unselected.
  const pressed = onSelectedChange !== undefined ? Boolean(selected) : selected
  const { linkCover, linkLabel, root } = card({
    clickable: linked || pressable,
    emphasised: Boolean(selected) || highlighted,
    height,
    highlighted,
    linked,
    minHeight,
    pressable,
    selected: Boolean(selected),
    size,
    verticalAlign,
  })

  // How many Card.Title elements rendered the link. Read only by the
  // development warning below.
  const titles = useRef(0)
  const claim = useCallback(() => {
    titles.current += 1
    return () => {
      titles.current -= 1
    }
  }, [])
  const namedByTitle = linked && !ariaLabel

  useEffect(() => {
    // Child effects run first, so every Card.Title has claimed by now.
    if (
      process.env.NODE_ENV !== 'production' &&
      namedByTitle &&
      titles.current === 0
    ) {
      console.error(
        `Card: href="${href}" was given with neither a Card.Title nor an ariaLabel, so no link is rendered and the card is not a link. Add a Card.Title or pass ariaLabel.`,
      )
    }
  }, [namedByTitle, href])

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (!startedInNestedControl(event)) {
      onClick?.(event)
      onSelectedChange?.(!selected)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Only the card's own focus: Enter on a nested button is that button's.
    if (event.target !== event.currentTarget) {
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.click()
    } else if (event.key === ' ') {
      // Space activates on release, as a native button does; stopping the
      // default here keeps the page from scrolling.
      event.preventDefault()
    }
  }

  function handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget && event.key === ' ') {
      event.currentTarget.click()
    }
  }

  return (
    <CardContext.Provider value={size}>
      <CardLinkContext.Provider
        // Named by its title unless an ariaLabel names it: then the root
        // renders the cover itself and the title stays plain text.
        value={namedByTitle ? { claim, href, onClick } : undefined}
      >
        <div
          className={root()}
          data-size={size}
          data-testid="card-root"
          id={id}
          // A linked card hands onClick to its link: it runs on activation
          // (pointer or Enter), not on a click on a nested control. A card
          // with onClick alone is the button itself — reached by Tab, pressed
          // with Enter or Space, named by ariaLabel or else by its text.
          // A pressable card given `selected` is a toggle button: aria-pressed
          // reports the state. A static or linked card has no role that can
          // carry a selection, so there `selected` is visual only.
          {...(pressable
            ? {
                'aria-label': ariaLabel,
                'aria-pressed': pressed,
                onClick: handleClick,
                onKeyDown: handleKeyDown,
                onKeyUp: handleKeyUp,
                role: 'button',
                tabIndex: 0,
              }
            : {})}
        >
          {linked && ariaLabel ? (
            <a
              className={linkCover()}
              data-testid="card-link"
              href={href}
              onClick={onClick}
            >
              <span className={linkLabel()}>{ariaLabel}</span>
            </a>
          ) : null}
          {children}
        </div>
      </CardLinkContext.Provider>
    </CardContext.Provider>
  )
}

function CardHeader({
  bordered,
  children,
}: PropsWithChildren<CardHeaderProps>) {
  const { header } = card({
    headerBordered: bordered,
    size: useCardSize(),
  })

  return (
    <div className={header()} data-testid="card-header">
      {children}
    </div>
  )
}

function CardTitle({
  children,
  headingLevel,
}: PropsWithChildren<CardTitleProps>) {
  const { link: linkSlot, title } = card()
  // A heading only when asked: the level depends on where the card sits in
  // the page, which the card cannot know. In href mode the heading holds the
  // stretched link, so the link keeps the title's name.
  const Title = headingLevel ? (`h${headingLevel}` as const) : 'div'
  const link = useCardLink()
  const claim = link?.claim

  useEffect(() => claim?.(), [claim])

  return (
    <Title className={title()} data-testid="card-title">
      {link ? (
        <a
          className={linkSlot()}
          data-testid="card-link"
          href={link.href}
          onClick={link.onClick}
        >
          {children}
        </a>
      ) : (
        children
      )}
    </Title>
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
  const { content } = card({ size: useCardSize() })

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
    size: useCardSize(),
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
