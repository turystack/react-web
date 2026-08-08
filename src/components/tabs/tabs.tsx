import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { createContext, type PropsWithChildren, useContext } from 'react'
import { tv } from 'tailwind-variants'

import type {
  TabsContentProps,
  TabsListProps,
  TabsOrientation,
  TabsProps,
  TabsTriggerProps,
  TabsVariant,
} from './tabs.types'

type TabsContextValue = {
  justified: boolean
  orientation: TabsOrientation
  variant: TabsVariant
}

const TabsContext = createContext<TabsContextValue>({
  justified: true,
  orientation: 'horizontal',
  variant: 'line',
})

const tabs = tv({
  compoundVariants: [
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
  ],
  defaultVariants: {
    justified: true,
    orientation: 'horizontal',
    variant: 'line',
  },
  slots: {
    content: 'tabs-content flex-1 text-sm outline-none',
    list: 'tabs-list flex items-center justify-center text-muted-foreground',
    root: 'tabs-root flex gap-4',
    trigger:
      'tabs-trigger relative inline-flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap font-medium text-muted-foreground text-sm outline-none transition-all hover:text-foreground focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-active:text-foreground data-disabled:opacity-50 dark:text-muted-foreground dark:data-active:text-foreground dark:hover:text-foreground [&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  },
  variants: {
    justified: {
      false: {
        list: 'w-fit',
      },
      true: {
        list: 'w-full',
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
        list: 'h-8 rounded-lg bg-muted p-[3px]',
        trigger:
          'h-[calc(100%-1px)] rounded-md border border-transparent px-1.5 py-0.5 text-foreground/60 data-active:bg-background data-active:shadow-sm dark:data-active:border-input dark:data-active:bg-input/30',
      },
    },
  },
})

function TabsRoot({
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
        justified,
        orientation,
        variant,
      }}
    >
      <TabsPrimitive.Root
        className={root()}
        data-testid="tabs-root"
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
  justified,
  variant,
  children,
}: PropsWithChildren<TabsListProps>) {
  const context = useContext(TabsContext)
  const resolvedJustified = justified ?? context.justified
  const resolvedVariant = variant ?? context.variant
  const { list } = tabs({
    justified: resolvedJustified,
    orientation: context.orientation,
    variant: resolvedVariant,
  })

  return (
    <TabsContext.Provider
      value={{
        ...context,
        justified: resolvedJustified,
        variant: resolvedVariant,
      }}
    >
      <TabsPrimitive.List className={list()} data-testid="tabs-list">
        {children}
      </TabsPrimitive.List>
    </TabsContext.Provider>
  )
}

function TabsTrigger({
  value,
  icon,
  disabled,
  children,
}: PropsWithChildren<TabsTriggerProps>) {
  const context = useContext(TabsContext)
  const { trigger } = tabs({
    justified: context.justified,
    orientation: context.orientation,
    variant: context.variant,
  })

  return (
    <TabsPrimitive.Tab
      className={trigger()}
      data-testid="tabs-trigger"
      disabled={disabled}
      value={value}
    >
      {icon}
      {children}
    </TabsPrimitive.Tab>
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
