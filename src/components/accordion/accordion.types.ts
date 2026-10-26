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
 * - Collapsible prop (single mode, default true) allows closing the last open item
 * - Chevron icon rotates 180° on open via data-state attribute
 * - Content animates height from 0 to auto on expand
 * - size scales the trigger's text and padding and the panel's text: sm,
 *   md (default, what the accordion always was) or lg for a marketing FAQ
 * - indicator="radio" (single mode only — the type refuses it on multiple)
 *   swaps the chevron for a radio circle before the label, filled on the
 *   open item: the checkout "choose a payment method" list, where opening an
 *   item *is* choosing it. It also defaults `collapsible` to false, because a
 *   radio is not un-chosen by clicking it again; pass collapsible to override
 *
 * - Trigger `description` adds a muted second line under the title and
 *   `rightSection` a right-aligned element (an icon, a price) before the
 *   chevron; with the radio indicator it sits at the far right. Both render as
 *   spans: the trigger is a <button>, and block content (a Flex, any div)
 *   inside a button is invalid HTML — pass these props instead of laying the
 *   trigger out by hand. With either one set the trigger is named by its title
 *   (children) alone and described by the description and right section
 * - With a description the chevron centres on the two-line block (level with
 *   the right section) rather than riding the title line; a plain title that
 *   wraps keeps it on its first line. The radio is always centred
 * - Every trigger sits in a heading, an h3 by default, so a screen reader can
 *   jump from question to question. headingLevel (h2–h6) sets the level for
 *   every item from the root — an FAQ under a page's h1 wants h2 — and a
 *   Trigger's own headingLevel overrides it for that item
 * - An Item's disabledReason blocks it like `disabled` and says why: the
 *   trigger stays focusable (aria-disabled, never the attribute) and does not
 *   expand, a tooltip shows the reason on hover and keyboard focus, and the
 *   trigger is described by it, ahead of its description (ARC-ERR-9)
 *
 * Accessibility of the radio indicator:
 * - The trigger stays the one interactive element, a <button> with
 *   aria-expanded and aria-controls pointing at its panel. The circle is
 *   decoration (aria-hidden); the state it paints is the aria-expanded
 *   screen readers already announce
 * - role="radiogroup" / role="radio" was considered and rejected: a radio
 *   group promises one tab stop with arrow keys moving the selection, and the
 *   headless accordion deliberately has no roving focus (every trigger is a
 *   tab stop, per the APG update Base UI follows), so the role would announce
 *   a keyboard model the component does not have. And `radio` does not
 *   support aria-expanded, so the trigger would lose its link to the panel
 *   it reveals. A real <input type="radio"> nested in the button is invalid
 *   HTML (interactive content inside a button)
 *
 * Implementation:
 * - Base UI Accordion primitives for accessibility (ARIA, disabled items)
 * - tailwind-variants (tv) for styling with slots: root, item, header,
 *   trigger (body, title, description, right section, icons, radio, radio
 *   dot), panel, content inner
 * - Controlled (value/onChange) and uncontrolled (defaultValue) patterns
 * - Bordered variant adds border around each item
 * - <Accordion type="single" collapsible> / <Accordion type="multiple">
 * - <Accordion size="lg" type="multiple"> — an FAQ
 * - <Accordion headingLevel={2} type="multiple"> — an FAQ right under the page's h1
 * - <Accordion defaultValue="card" indicator="radio" type="single"> — a payment method picker
 * - <Accordion.Item disabledReason="Add a card first" value="pix">…</Accordion.Item>
 * - <Accordion.Item value="x"> <Accordion.Trigger>...</Accordion.Trigger> <Accordion.Content>...</Accordion.Content> </Accordion.Item>
 * - <Accordion.Trigger description="Credit, auto-renewing" rightSection={<CreditCard size={18} />}>Card</Accordion.Trigger>
 *
 * Dependencies: @base-ui/react (Accordion), internal icons (ChevronDown, ChevronUp)
 */

export type AccordionType = 'single' | 'multiple'

export type AccordionSize = 'sm' | 'md' | 'lg'

export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6

/** What marks the open item: a chevron, or a radio circle (single mode only). */
export type AccordionIndicator = 'chevron' | 'radio'

/** Several items open at once cannot be a radio: only the chevron applies. */
export type AccordionMultipleIndicator = 'chevron'

type BaseAccordionProps = {
  type: AccordionType // controls single vs multiple open behavior
  bordered?: boolean // adds border styling to the accordion container
  headingLevel?: AccordionHeadingLevel // the heading every trigger sits in (h2–h6); default 3
  size?: AccordionSize // trigger text and padding, panel text; default md
}

type SingleAccordionProps = {
  type: 'single'
  value?: string // controlled: currently open item value
  defaultValue?: string // uncontrolled: initially open item value
  collapsible?: boolean // whether the open item can be collapsed (default true; false with the radio indicator)
  indicator?: AccordionIndicator // chevron (default) or a radio circle marking the open item
  onChange?: (value: string | null) => void // fires when open item changes, null once nothing is open
}

type MultipleAccordionProps = {
  type: 'multiple'
  value?: string[] // controlled: list of open item values
  defaultValue?: string[] // uncontrolled: initially open items
  onChange?: (value: string[]) => void // fires when open items change
  indicator?: AccordionMultipleIndicator // only the chevron: several open items are not a radio choice
}

export type AccordionProps =
  | (BaseAccordionProps & SingleAccordionProps)
  | (BaseAccordionProps & MultipleAccordionProps)

export type AccordionItem = {
  value: string // unique identifier for this item
  disabled?: boolean // prevents interaction with this item
  disabledReason?: string // blocks it, stays focusable, tooltip says why
}

export type AccordionTrigger = {
  description?: React.ReactNode // second line under the title, muted; phrasing content only
  headingLevel?: AccordionHeadingLevel // the heading this trigger sits in (h2–h6); default the root's, else 3
  rightSection?: React.ReactNode // right-aligned element before the indicator, e.g. an icon; phrasing content only
}

export type AccordionContent = {}
