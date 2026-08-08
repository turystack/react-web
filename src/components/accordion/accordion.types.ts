/**
 * Accordion
 *
 * Collapsible content sections that expand/collapse on trigger click.
 * Supports single (one open at a time) and multiple (many open) modes.
 *
 * Behavior:
 * - Trigger click toggles the associated content panel
 * - Single mode: opening one item automatically closes others
 * - Multiple mode: items toggle independently
 * - Collapsible prop (single mode) allows closing the last open item
 * - Chevron icon rotates 180° on open via data-state attribute
 * - Content animates height from 0 to auto on expand
 *
 * Implementation:
 * - Use Radix UI Accordion primitives for accessibility (keyboard nav, ARIA)
 * - tailwind-variants (tv) for styling with slots: root, item, trigger (header/root/icon), content (root/inner)
 * - Controlled (value/onChange) and uncontrolled (defaultValue) patterns
 * - Bordered variant adds border around each item
 * - <Accordion type="single" collapsible> / <Accordion type="multiple">
 * - <Accordion.Item value="x"> <Accordion.Trigger>...</Accordion.Trigger> <Accordion.Content>...</Accordion.Content> </Accordion.Item>
 *
 * Dependencies: @radix-ui/react-accordion, @turystack/react-icons (ChevronDown)
 */

export type AccordionType = 'single' | 'multiple'

type BaseAccordionProps = {
  type: AccordionType // controls single vs multiple open behavior
  bordered?: boolean // adds border styling to the accordion container
}

type SingleAccordionProps = {
  type: 'single'
  value?: string // controlled: currently open item value
  defaultValue?: string // uncontrolled: initially open item value
  collapsible?: boolean // whether the open item can be collapsed
  onChange?: (value: string) => void // fires when open item changes
}

type MultipleAccordionProps = {
  type: 'multiple'
  value?: string[] // controlled: list of open item values
  defaultValue?: string[] // uncontrolled: initially open items
  onChange?: (value: string[]) => void // fires when open items change
}

export type AccordionProps =
  | (BaseAccordionProps & SingleAccordionProps)
  | (BaseAccordionProps & MultipleAccordionProps)

export type AccordionItem = {
  value: string // unique identifier for this item
  disabled?: boolean // prevents interaction with this item
}

export type AccordionTrigger = {}

export type AccordionContent = {}
