import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useId,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import {
  DisabledReason,
  describedBy,
} from '@/components/tooltip/tooltip.composed'
import { ChevronDown, ChevronUp } from '@/internal/icons'
import { axes } from '@/support/utils'

import type {
  AccordionContent as AccordionContentProps,
  AccordionHeadingLevel,
  AccordionIndicator,
  AccordionItem as AccordionItemProps,
  AccordionProps,
  AccordionSize,
  AccordionTrigger as AccordionTriggerProps,
} from './accordion.types'

type AccordionContextValue = {
  bordered?: boolean
  headingLevel?: AccordionHeadingLevel
  indicator?: AccordionIndicator
  size?: AccordionSize
}

const AccordionContext = createContext<AccordionContextValue>({})

/** The item's disabledReason, read by its trigger, which is what takes focus. */
const AccordionItemReasonContext = createContext<string | undefined>(undefined)

const accordion = tv({
  defaultVariants: {
    bordered: false,
    indicator: 'chevron',
    size: 'md',
  },
  slots: {
    contentInner:
      'accordion-content-inner h-(--accordion-panel-height) pt-0 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
    header: 'accordion-header flex',
    item: 'accordion-item',
    panel:
      'accordion-panel overflow-hidden data-closed:animate-accordion-up data-open:animate-accordion-down',
    root: 'accordion-root flex w-full flex-col',
    trigger:
      'accordion-trigger group/accordion-trigger relative flex flex-1 cursor-pointer items-start justify-between rounded-lg border border-transparent text-left font-medium outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    // Phrasing only (spans) from here down: the trigger is a <button>, and a
    // button may not hold block content.
    triggerBody:
      'accordion-trigger-body flex min-w-0 flex-1 flex-col gap-0.5 text-left',
    triggerDescription:
      'accordion-trigger-description font-normal text-muted-foreground text-xs',
    triggerRightSection:
      'accordion-trigger-right-section ml-auto inline-flex shrink-0 items-center self-center',
    triggerTitle: 'accordion-trigger-title',
    triggerIconDown:
      'accordion-trigger-icon-down accordion-trigger-icon pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden',
    triggerIconUp:
      'accordion-trigger-icon-up accordion-trigger-icon pointer-events-none ml-auto hidden size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:inline',
    // A picture of a radio, not a radio: the trigger is the one control and
    // its aria-expanded is the state (see the contract's header for why).
    triggerRadio:
      'accordion-trigger-radio pointer-events-none flex size-4 shrink-0 items-center justify-center rounded-full border border-input transition-colors group-aria-expanded/accordion-trigger:border-primary motion-reduce:transition-none',
    triggerRadioDot:
      'accordion-trigger-radio-dot size-2 rounded-full bg-primary opacity-0 transition-opacity group-aria-expanded/accordion-trigger:opacity-100 motion-reduce:transition-none',
  },
  variants: {
    bordered: {
      false: {
        item: 'not-last:border-b',
      },
      true: {
        item: 'border-b px-3 last:border-b-0',
        root: 'rounded-lg border',
      },
    },
    // A description makes the trigger two lines. The chevron then centres on
    // the block (beside the right section, which is centred too) instead of
    // riding the title line; a plain title that wraps keeps it on its first
    // line, the way a long FAQ question reads. The radio variant centres
    // everything already.
    twoLine: {
      false: {},
      true: {
        triggerIconDown: 'self-center',
        triggerIconUp: 'self-center',
      },
    },
    indicator: {
      chevron: {},
      // Radio before the label, and the panel indented to the label's edge
      // (size-4 + gap-3 = 28px), the way a payment-method list reads.
      radio: {
        contentInner: 'pl-7',
        trigger: 'items-center justify-start gap-3',
      },
    },
    // md is what the accordion always was; lg is a marketing FAQ.
    size: {
      lg: {
        contentInner: 'pb-4',
        panel: 'text-base',
        trigger: 'py-4 text-base',
      },
      md: {
        contentInner: 'pb-2.5',
        panel: 'text-sm',
        trigger: 'py-2.5 text-sm',
      },
      sm: {
        contentInner: 'pb-2',
        panel: 'text-xs',
        trigger: 'py-2 text-xs',
      },
    },
  },
})

function AccordionRoot({
  type,
  bordered,
  children,
  headingLevel,
  indicator = 'chevron',
  size = 'md',
  ...props
}: PropsWithChildren<AccordionProps>) {
  const { root } = accordion({
    bordered,
  })

  const multiple = type === 'multiple'
  // A radio cannot be un-chosen by clicking it again, so the radio indicator
  // turns `collapsible` off unless the consumer says otherwise.
  const collapsible =
    type === 'single'
      ? ((
          props as {
            collapsible?: boolean
          }
        ).collapsible ?? indicator !== 'radio')
      : true

  const toList = (raw: string | string[] | undefined) => {
    if (raw === undefined) {
      return undefined
    }
    if (type === 'multiple') {
      return raw as string[]
    }
    return raw ? [raw as string] : []
  }

  const controlledValue = toList(props.value)
  const [ownValue, setOwnValue] = useState<string[]>(
    () => toList(props.defaultValue) ?? [],
  )
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : ownValue

  // The headless accordion has no `collapsible` of its own, so refusing the
  // close means owning the value and dropping the empty change on the floor.
  const handleValueChange = (newValue: unknown[]) => {
    const next = newValue as string[]

    if (!collapsible && next.length === 0) {
      return
    }

    if (!isControlled) {
      setOwnValue(next)
    }

    if (type === 'single') {
      ;(
        props as {
          onChange?: (v: string | null) => void
        }
      ).onChange?.(next[0] ?? null)
    } else {
      ;(
        props as {
          onChange?: (v: string[]) => void
        }
      ).onChange?.(next)
    }
  }

  return (
    <AccordionContext.Provider
      value={{
        bordered,
        headingLevel,
        indicator,
        size,
      }}
    >
      <AccordionPrimitive.Root
        className={root()}
        data-testid="accordion-root"
        {...axes(accordion, {
          indicator,
          size,
        })}
        multiple={multiple}
        onValueChange={handleValueChange}
        value={value}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  value,
  disabled,
  disabledReason,
  children,
}: PropsWithChildren<AccordionItemProps>) {
  const { bordered } = useContext(AccordionContext)
  const { item } = accordion({
    bordered,
  })

  // Base UI keeps a disabled trigger focusable (aria-disabled, never the
  // attribute) and refuses to toggle it, so a reason is `disabled` plus the
  // words: the trigger wears them.
  return (
    <AccordionItemReasonContext value={disabledReason || undefined}>
      <AccordionPrimitive.Item
        className={item()}
        data-testid="accordion-item"
        disabled={disabled || Boolean(disabledReason)}
        value={value}
      >
        {children}
      </AccordionPrimitive.Item>
    </AccordionItemReasonContext>
  )
}

function AccordionTrigger({
  children,
  description,
  headingLevel: ownHeadingLevel,
  rightSection,
}: PropsWithChildren<AccordionTriggerProps>) {
  const {
    headingLevel: rootHeadingLevel,
    indicator,
    size,
  } = useContext(AccordionContext)
  // Base UI's header is an h3; any other level swaps the element it renders.
  const headingLevel = ownHeadingLevel ?? rootHeadingLevel ?? 3
  const Heading = `h${headingLevel}` as const
  const disabledReason = useContext(AccordionItemReasonContext)
  const id = useId()
  const {
    header,
    trigger,
    triggerBody,
    triggerDescription,
    triggerIconDown,
    triggerIconUp,
    triggerRadio,
    triggerRadioDot,
    triggerRightSection,
    triggerTitle,
  } = accordion({
    indicator,
    size,
    twoLine: description !== undefined && description !== null,
  })

  const hasDescription = description !== undefined && description !== null
  const hasRightSection = rightSection !== undefined && rightSection !== null
  const rich = hasDescription || hasRightSection
  const titleId = `${id}-title`
  const detailIds = [
    hasDescription ? `${id}-description` : undefined,
    hasRightSection ? `${id}-right` : undefined,
  ].filter(Boolean)

  // With a second line or a right section the trigger is named by its title
  // alone and described by the rest, the way a radio card is: "Card, button,
  // expanded" is heard before "Credit, auto-renewing".
  const label = rich ? (
    <>
      <span className={triggerBody()} data-testid="accordion-trigger-body">
        <span className={triggerTitle()} id={titleId}>
          {children}
        </span>
        {hasDescription ? (
          <span
            className={triggerDescription()}
            data-testid="accordion-trigger-description"
            id={`${id}-description`}
          >
            {description}
          </span>
        ) : null}
      </span>
      {hasRightSection ? (
        <span
          className={triggerRightSection()}
          data-testid="accordion-trigger-right-section"
          id={`${id}-right`}
        >
          {rightSection}
        </span>
      ) : null}
    </>
  ) : (
    children
  )

  return (
    <AccordionPrimitive.Header className={header()} render={<Heading />}>
      {/* The reason is read first among the details: it is why it stays shut. */}
      <DisabledReason display="block" reason={disabledReason}>
        {(a11y) => (
          <AccordionPrimitive.Trigger
            {...a11y}
            aria-describedby={describedBy(
              a11y['aria-describedby'],
              ...detailIds,
            )}
            aria-labelledby={rich ? titleId : undefined}
            className={trigger()}
            data-testid="accordion-trigger"
          >
            {indicator === 'radio' ? (
              <>
                <span
                  aria-hidden="true"
                  className={triggerRadio()}
                  data-testid="accordion-trigger-radio"
                >
                  <span className={triggerRadioDot()} />
                </span>
                {label}
              </>
            ) : (
              <>
                {label}
                <ChevronDown className={triggerIconDown()} />
                <ChevronUp className={triggerIconUp()} />
              </>
            )}
          </AccordionPrimitive.Trigger>
        )}
      </DisabledReason>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  children,
}: PropsWithChildren<AccordionContentProps>) {
  const { indicator, size } = useContext(AccordionContext)
  const { panel, contentInner } = accordion({
    indicator,
    size,
  })

  return (
    <AccordionPrimitive.Panel className={panel()} data-testid="accordion-panel">
      <div className={contentInner()} data-testid="accordion-content-inner">
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

const Accordion = Object.assign(AccordionRoot, {
  Content: AccordionContent,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
})

export { Accordion }
