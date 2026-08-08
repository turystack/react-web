import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { tv } from 'tailwind-variants'
import { ChevronDown, ChevronUp } from '@/internal/icons'

import type {
  AccordionContent as AccordionContentProps,
  AccordionItem as AccordionItemProps,
  AccordionProps,
  AccordionTrigger as AccordionTriggerProps,
} from './accordion.types'

type AccordionContextValue = {
  bordered?: boolean
}

const AccordionContext = createContext<AccordionContextValue>({})

const accordion = tv({
  defaultVariants: {
    bordered: false,
  },
  slots: {
    contentInner:
      'accordion-content-inner h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
    header: 'accordion-header flex',
    item: 'accordion-item',
    panel:
      'accordion-panel overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down',
    root: 'accordion-root flex w-full flex-col',
    trigger:
      'accordion-trigger group/accordion-trigger relative flex flex-1 cursor-pointer items-start justify-between rounded-lg border border-transparent py-2.5 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
    triggerIconDown:
      'accordion-trigger-icon pointer-events-none ml-auto size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden',
    triggerIconUp:
      'accordion-trigger-icon pointer-events-none ml-auto hidden size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:inline',
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
  },
})

function AccordionRoot({
  type,
  bordered,
  children,
  ...props
}: PropsWithChildren<AccordionProps>) {
  const { root } = accordion({
    bordered,
  })

  const multiple = type === 'multiple'

  const handleValueChange = (newValue: unknown[]) => {
    if (type === 'single') {
      ;(
        props as {
          onChange?: (v: string) => void
        }
      ).onChange?.((newValue as string[])[0])
    } else {
      ;(
        props as {
          onChange?: (v: string[]) => void
        }
      ).onChange?.(newValue as string[])
    }
  }

  const value =
    type === 'single'
      ? props.value !== undefined
        ? props.value
          ? [props.value]
          : []
        : undefined
      : props.value

  const defaultValue =
    type === 'single'
      ? props.defaultValue !== undefined
        ? props.defaultValue
          ? [props.defaultValue]
          : []
        : undefined
      : props.defaultValue

  return (
    <AccordionContext.Provider
      value={{
        bordered,
      }}
    >
      <AccordionPrimitive.Root
        className={root()}
        data-testid="accordion-root"
        defaultValue={defaultValue as string[]}
        multiple={multiple}
        onValueChange={handleValueChange}
        value={value as string[]}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  value,
  disabled,
  children,
}: PropsWithChildren<AccordionItemProps>) {
  const { bordered } = useContext(AccordionContext)
  const { item } = accordion({
    bordered,
  })

  return (
    <AccordionPrimitive.Item
      className={item()}
      data-testid="accordion-item"
      disabled={disabled}
      value={value}
    >
      {children}
    </AccordionPrimitive.Item>
  )
}

function AccordionTrigger({
  children,
}: PropsWithChildren<AccordionTriggerProps>) {
  const { header, trigger, triggerIconDown, triggerIconUp } = accordion()

  return (
    <AccordionPrimitive.Header className={header()}>
      <AccordionPrimitive.Trigger
        className={trigger()}
        data-testid="accordion-trigger"
      >
        {children}
        <ChevronDown className={triggerIconDown()} />
        <ChevronUp className={triggerIconUp()} />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  children,
}: PropsWithChildren<AccordionContentProps>) {
  const { panel, contentInner } = accordion()

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
