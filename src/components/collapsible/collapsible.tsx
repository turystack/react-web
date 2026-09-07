import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type {
  CollapsiblePanelProps,
  CollapsibleProps,
  CollapsibleTriggerProps,
} from './collapsible.types'

export const styles = tv({
  slots: {
    panel: [
      'collapsible-panel overflow-hidden text-sm',
      'h-[var(--collapsible-panel-height)] transition-[height] duration-200 ease-out',
      'data-ending-style:h-0 data-starting-style:h-0',
    ],
    root: 'collapsible flex w-full flex-col',
    trigger: [
      'collapsible-trigger flex w-full cursor-pointer items-center justify-between gap-2',
      'rounded-md py-2 text-left font-medium text-sm outline-none',
      'hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
  },
})

function CollapsibleRoot({
  children,
  defaultOpen,
  disabled,
  onChange,
  open,
}: PropsWithChildren<CollapsibleProps>) {
  const { root } = styles()

  return (
    <CollapsiblePrimitive.Root
      className={root()}
      data-testid="collapsible"
      defaultOpen={defaultOpen}
      disabled={disabled}
      onOpenChange={onChange ? (next: boolean) => onChange(next) : undefined}
      open={open}
    >
      {children}
    </CollapsiblePrimitive.Root>
  )
}

function CollapsibleTrigger({
  asChild,
  children,
}: PropsWithChildren<CollapsibleTriggerProps>) {
  const { trigger } = styles()

  return (
    <CollapsiblePrimitive.Trigger
      className={trigger()}
      data-testid="collapsible-trigger"
      render={asChild ? (children as React.ReactElement) : undefined}
    >
      {asChild ? undefined : children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsiblePanel({
  children,
  keepMounted,
}: PropsWithChildren<CollapsiblePanelProps>) {
  const { panel } = styles()

  return (
    <CollapsiblePrimitive.Panel
      className={panel()}
      data-testid="collapsible-panel"
      keepMounted={keepMounted}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  )
}

const Collapsible = Object.assign(CollapsibleRoot, {
  Panel: CollapsiblePanel,
  Trigger: CollapsibleTrigger,
})

export { Collapsible }
