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
 *
 * Implementation:
 * - Base UI Collapsible, so the trigger carries aria-expanded and aria-controls
 * - <Collapsible defaultOpen>
 *     <Collapsible.Trigger>Advanced options</Collapsible.Trigger>
 *     <Collapsible.Panel>…</Collapsible.Panel>
 *   </Collapsible>
 *
 * Dependencies: @base-ui/react/collapsible
 */

export type CollapsibleProps = {
  defaultOpen?: boolean // uncontrolled initial state
  disabled?: boolean // refuses to open or close
  onChange?: (open: boolean) => void // fires when it opens or closes
  open?: boolean // controlled state
}

export type CollapsibleTriggerProps = {
  asChild?: boolean // render onto the child element instead of a button
}

export type CollapsiblePanelProps = {
  keepMounted?: boolean // leaves the content in the document while closed
}
