import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import { type PropsWithChildren, type ReactNode, useId } from 'react'
import { tv } from 'tailwind-variants'
import { ChevronDown } from '@/internal/icons'

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
    // Under asChild the only thing added to the consumer's element: the root
    // is a column, which would otherwise stretch a Button to its full width.
    ownTrigger: 'collapsible-own-trigger self-start',
    root: 'collapsible flex w-full flex-col',
    trigger: [
      'collapsible-trigger group/collapsible-trigger flex w-full cursor-pointer items-center justify-between gap-2',
      'rounded-md py-2 text-left font-medium text-sm outline-none',
      'hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    // Phrasing only (spans) from here down: the trigger is a <button>, and a
    // button may not hold block content.
    triggerBody:
      'collapsible-trigger-body flex min-w-0 flex-1 flex-col gap-0.5 text-left',
    triggerDescription:
      'collapsible-trigger-description font-normal text-muted-foreground text-xs',
    // Centred on the whole block, so on a two-line trigger the chevron sits
    // between the lines, beside the price, not on the title line alone.
    triggerIndicator:
      'collapsible-trigger-indicator pointer-events-none size-4 shrink-0 self-center text-muted-foreground transition-transform group-aria-expanded/collapsible-trigger:rotate-180 motion-reduce:transition-none',
    triggerLeftSection:
      'collapsible-trigger-left-section inline-flex shrink-0 items-center self-center',
    triggerRightSection:
      'collapsible-trigger-right-section ml-auto inline-flex shrink-0 items-center self-center',
    triggerTitle: 'collapsible-trigger-title',
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

function isSet(node: ReactNode) {
  return node !== undefined && node !== null && node !== false
}

function CollapsibleTrigger(props: PropsWithChildren<CollapsibleTriggerProps>) {
  const id = useId()
  const {
    ownTrigger,
    trigger,
    triggerBody,
    triggerDescription,
    triggerIndicator,
    triggerLeftSection,
    triggerRightSection,
    triggerTitle,
  } = styles()

  // Under asChild the child is the trigger and keeps its own look: Base UI
  // merges className into the rendered element, so passing the trigger's
  // styles would stretch a Button to full width and push its content apart.
  if (props.asChild) {
    return (
      <CollapsiblePrimitive.Trigger
        className={ownTrigger()}
        data-testid="collapsible-trigger"
        render={props.children as React.ReactElement}
      />
    )
  }

  const { children, description, indicator, leftSection, rightSection } = props
  const hasDescription = isSet(description)
  const hasLeftSection = isSet(leftSection)
  const hasRightSection = isSet(rightSection)
  const rich = hasDescription || hasLeftSection || hasRightSection
  const titleId = `${id}-title`
  const detailIds = [
    hasDescription ? `${id}-description` : undefined,
    hasRightSection ? `${id}-right` : undefined,
  ].filter(Boolean)

  // With any section the trigger is named by its title alone and described by
  // the second line and the right section: "Order summary, button, collapsed"
  // is heard before "Pro · yearly, R$ 490,00". The left section is the
  // leading picture (an icon) and is neither.
  const label = rich ? (
    <>
      {hasLeftSection ? (
        <span
          className={triggerLeftSection()}
          data-testid="collapsible-trigger-left-section"
        >
          {leftSection}
        </span>
      ) : null}
      <span className={triggerBody()} data-testid="collapsible-trigger-body">
        <span className={triggerTitle()} id={titleId}>
          {children}
        </span>
        {hasDescription ? (
          <span
            className={triggerDescription()}
            data-testid="collapsible-trigger-description"
            id={`${id}-description`}
          >
            {description}
          </span>
        ) : null}
      </span>
      {hasRightSection ? (
        <span
          className={triggerRightSection()}
          data-testid="collapsible-trigger-right-section"
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
    <CollapsiblePrimitive.Trigger
      aria-describedby={detailIds.length ? detailIds.join(' ') : undefined}
      aria-labelledby={rich ? titleId : undefined}
      className={trigger()}
      data-testid="collapsible-trigger"
    >
      {label}
      {indicator ? (
        <ChevronDown
          aria-hidden="true"
          className={triggerIndicator()}
          data-testid="collapsible-trigger-indicator"
        />
      ) : null}
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
