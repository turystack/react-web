import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { tv } from 'tailwind-variants'

import { DisabledReason } from '@/components/tooltip/tooltip.composed'

import type {
  TabsContentProps,
  TabsJustify,
  TabsListProps,
  TabsOrientation,
  TabsProps,
  TabsTriggerProps,
  TabsVariant,
} from './tabs.types'

type TabsContextValue = {
  block: boolean
  justify: TabsJustify
  justified: boolean
  orientation: TabsOrientation
  variant: TabsVariant
}

const TabsContext = createContext<TabsContextValue>({
  block: false,
  justify: 'start',
  justified: true,
  orientation: 'horizontal',
  variant: 'line',
})

const tabs = tv({
  compoundVariants: [
    {
      block: true,
      class: {
        list: 'w-full',
      },
      justified: false,
    },
    {
      class: {
        list: 'border-r border-b-0',
        trigger: '-mr-px mb-0 border-r-2 border-b-0',
      },
      orientation: 'vertical',
      variant: 'line',
    },
    {
      class: {
        list: 'h-fit',
      },
      orientation: 'vertical',
      variant: 'pill',
    },
    // Equal columns, whatever sits in them. `flex-1` shares the free space
    // from each item's padding, so a blocked trigger — whose flex item is its
    // padding-less wrapper — came out 24px narrower than the tabs beside it.
    {
      class: {
        list: 'grid auto-cols-fr grid-flow-col',
      },
      justified: true,
      orientation: 'horizontal',
    },
  ],
  defaultVariants: {
    block: false,
    justified: true,
    orientation: 'horizontal',
    variant: 'line',
  },
  slots: {
    content: 'tabs-content flex-1 text-sm outline-none',
    list: 'tabs-list flex items-center justify-center text-muted-foreground',
    root: 'tabs-root flex gap-4',
    trigger:
      'tabs-trigger relative inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap font-medium text-muted-foreground text-sm outline-none transition-all hover:text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-active:text-foreground data-disabled:opacity-50 dark:text-muted-foreground dark:data-active:text-foreground dark:hover:text-foreground [&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  },
  variants: {
    block: {
      true: {
        list: 'w-full',
      },
    },
    justify: {
      between: {
        list: 'justify-between',
      },
      center: {
        list: 'justify-center',
      },
      start: {
        list: 'justify-start',
      },
    },
    justified: {
      false: {
        list: 'w-fit',
      },
      true: {
        // A blocked trigger sits in a disabled-reason wrapper, which is then
        // the flex item; it has to stretch like the triggers beside it.
        list: 'w-full *:data-[slot=disabled-reason]:flex-1',
        trigger: 'flex-1',
      },
    },
    orientation: {
      horizontal: {
        list: 'flex-row',
        root: 'flex-col',
      },
      vertical: {
        list: 'h-fit flex-col items-stretch',
        root: 'flex-row',
        trigger: 'w-full justify-start',
      },
    },
    variant: {
      line: {
        list: 'border-border border-b bg-transparent',
        trigger:
          '-mb-px h-10 rounded-none border-transparent border-b-2 px-3 py-2 data-active:border-primary',
      },
      pill: {
        list: 'h-8 rounded-lg bg-muted p-0.75',
        trigger:
          'h-[calc(100%-1px)] rounded-md border border-transparent px-1.5 py-0.5 text-foreground/60 data-active:bg-background data-active:shadow-sm dark:data-active:border-input dark:data-active:bg-input/30',
      },
    },
  },
})

function TabsRoot({
  block = false,
  justify = 'start',
  orientation = 'horizontal',
  variant = 'line',
  justified = true,
  value,
  defaultValue,
  onChange,
  children,
}: PropsWithChildren<TabsProps>) {
  const { root } = tabs({
    orientation,
  })

  return (
    <TabsContext.Provider
      value={{
        block,
        justified: block ? false : justified,
        justify,
        orientation,
        variant,
      }}
    >
      <TabsPrimitive.Root
        className={root()}
        data-testid="tabs-root"
        data-variant={variant}
        defaultValue={defaultValue}
        onValueChange={onChange ? (v) => onChange(v as string) : undefined}
        orientation={orientation}
        value={value}
      >
        {children}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  )
}

function TabsList({
  ariaLabel,
  block,
  justified,
  justify,
  variant,
  children,
}: PropsWithChildren<TabsListProps>) {
  const context = useContext(TabsContext)
  const resolvedBlock = block ?? context.block
  const resolvedJustified = resolvedBlock
    ? false
    : (justified ?? context.justified)
  const resolvedVariant = variant ?? context.variant
  const resolvedJustify = justify ?? context.justify
  const { list } = tabs({
    block: resolvedBlock,
    justified: resolvedJustified,
    justify: resolvedBlock ? resolvedJustify : undefined,
    orientation: context.orientation,
    variant: resolvedVariant,
  })

  return (
    <TabsContext.Provider
      value={{
        ...context,
        block: resolvedBlock,
        justified: resolvedJustified,
        justify: resolvedJustify,
        variant: resolvedVariant,
      }}
    >
      <TabsPrimitive.List
        aria-label={ariaLabel}
        className={list()}
        data-block={resolvedBlock}
        data-justify={resolvedBlock ? resolvedJustify : undefined}
        data-justified={resolvedJustified}
        data-testid="tabs-list"
        data-variant={resolvedVariant}
      >
        {children}
      </TabsPrimitive.List>
    </TabsContext.Provider>
  )
}

function TabsTrigger({
  value,
  icon,
  disabled,
  disabledReason,
  children,
}: PropsWithChildren<TabsTriggerProps>) {
  const context = useContext(TabsContext)
  const { trigger } = tabs({
    block: context.block,
    justified: context.justified,
    orientation: context.orientation,
    variant: context.variant,
  })

  const vertical = context.orientation === 'vertical'

  // A reason blocks the tab as surely as `disabled` does. Base UI keeps a
  // disabled tab focusable and in the arrow-key order (aria-disabled, not the
  // attribute) and refuses to activate it, so the reason only adds the
  // tooltip and the description.
  return (
    <DisabledReason
      display={vertical ? 'block' : 'inline'}
      reason={disabledReason}
      side={vertical ? 'right' : 'top'}
    >
      {(a11y) => (
        <TabsPrimitive.Tab
          className={trigger()}
          data-testid="tabs-trigger"
          disabled={Boolean(disabled || disabledReason)}
          value={value}
          {...a11y}
        >
          {icon}
          {children}
        </TabsPrimitive.Tab>
      )}
    </DisabledReason>
  )
}

function TabsContent({ value, children }: PropsWithChildren<TabsContentProps>) {
  const { content } = tabs()

  return (
    <TabsPrimitive.Panel
      className={content()}
      data-testid="tabs-content"
      value={value}
    >
      {children}
    </TabsPrimitive.Panel>
  )
}

const Tabs = Object.assign(TabsRoot, {
  Content: TabsContent,
  List: TabsList,
  Trigger: TabsTrigger,
})

export { Tabs }
