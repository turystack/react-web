/**
 * Collapsible
 *
 * One section that opens and closes.
 *
 * Behavior:
 * - Accordion is a set with a rule about how many can be open at once; this is
 *   a single disclosure with no siblings to coordinate. Reaching for Accordion
 *   to get one panel means inheriting a rule that has nothing to decide
 * - Controlled `open` and uncontrolled `defaultOpen`, as everywhere else
 * - The panel animates its own height, and `keepMounted` leaves the content in
 *   the document while closed — for a form field the browser has to be able to
 *   find and focus when validation fails
 * - `Collapsible.Trigger asChild` makes the child the trigger (a Button, a
 *   link): it gets the behaviour and aria-expanded/aria-controls but none of
 *   the trigger's own styles, so it keeps the look it was given. The type
 *   refuses description/leftSection/rightSection/indicator there: the child
 *   lays out its own content
 * - Trigger `description` adds a muted second line under the title,
 *   `leftSection` a leading element (an icon) and `rightSection` a
 *   right-aligned one (a price) — a two-line disclosure such as a mobile order
 *   summary without laying the trigger out by hand. All render as spans: the
 *   trigger is a <button>, and block content (a Flex, any div) inside a button
 *   is invalid HTML. With any of them set the trigger is named by its title
 *   (children) alone and described by the description and right section; the
 *   left section is the leading picture and is neither
 * - `indicator` draws a chevron at the end that turns over while open,
 *   centred on the whole trigger (between the lines of a two-line one)
 *
 * Implementation:
 * - Base UI Collapsible, so the trigger carries aria-expanded and aria-controls
 * - <Collapsible defaultOpen>
 *     <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
 *     <Collapsible.Panel>…</Collapsible.Panel>
 *   </Collapsible>
 * - <Collapsible.Trigger asChild><Button variant="ghost">More</Button></Collapsible.Trigger>
 * - <Collapsible.Trigger description="Pro · yearly" indicator rightSection={<MoneyText value={49000} />}>Order summary</Collapsible.Trigger>
 *
 * Dependencies: @base-ui/react/collapsible, internal icons (ChevronDown)
 */

export type CollapsibleProps = {
  defaultOpen?: boolean // uncontrolled initial state
  disabled?: boolean // refuses to open or close
  onChange?: (open: boolean) => void // fires when it opens or closes
  open?: boolean // controlled state
}

type CollapsibleOwnTriggerProps = {
  asChild?: false // the trigger is its own <button>, laid out below
  description?: React.ReactNode // second line under the title, muted; phrasing content only
  indicator?: boolean // chevron at the end that turns over while open
  leftSection?: React.ReactNode // leading element before the title, e.g. an icon; phrasing content only
  rightSection?: React.ReactNode // right-aligned element, e.g. a price; phrasing content only
}

type CollapsibleChildTriggerProps = {
  asChild: true // the child becomes the trigger, with its own look (no trigger styles)
  description?: never // the child lays out its own content
  indicator?: never // the child lays out its own content
  leftSection?: never // the child lays out its own content
  rightSection?: never // the child lays out its own content
}

export type CollapsibleTriggerProps =
  | CollapsibleOwnTriggerProps
  | CollapsibleChildTriggerProps

export type CollapsiblePanelProps = {
  keepMounted?: boolean // leaves the content in the document while closed
}
