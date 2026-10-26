/**
 * Tabs
 *
 * Tab navigation with trigger buttons and associated content panels.
 * Supports horizontal and vertical orientations.
 *
 * Behavior:
 * - Clicking a trigger activates its associated content panel
 * - Active trigger shows an underline by default
 * - Justified layout stretches triggers to equal width
 * - Block layout stretches the rail to 100% width and leaves the triggers at
 *   their natural content width; it is mutually exclusive with justified
 * - A block rail aligns its triggers to the start by default; justify="center"
 *   or justify="between" distributes them differently (block only)
 * - Orientation: horizontal (default) or vertical
 * - Trigger supports an icon before the label
 * - Focus ring on keyboard navigation
 * - disabledReason on a Trigger blocks it like `disabled` and says why: arrow
 *   keys still reach it in the tablist, a tooltip shows the reason on hover
 *   and on keyboard focus, and the tab is described by it (ARC-ERR-9). Click,
 *   Enter and Space do not activate it
 * - Tabs.List takes ariaLabel to name the tablist (role="tablist"), so a
 *   screen reader says which set of tabs it entered; without it the list is
 *   unnamed
 *
 * Implementation:
 * - Use Base UI Tabs primitive for accessibility (keyboard nav, ARIA roles)
 * - List renders as line navigation by default
 * - Use variant="pill" for the previous segmented style
 * - block and justified are a discriminated union: the compiler rejects both
 * - <Tabs value={tab} onChange={setTab}>
 *     <Tabs.List ariaLabel="Account sections">
 *       <Tabs.Trigger value="a" icon={<Icon />}>Tab A</Tabs.Trigger>
 *       <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
 *       <Tabs.Trigger disabledReason="Upgrade to see billing" value="c">Billing</Tabs.Trigger>
 *     </Tabs.List>
 *     <Tabs.Content value="a">Panel A</Tabs.Content>
 *     <Tabs.Content value="b">Panel B</Tabs.Content>
 *   </Tabs>
 *
 * Dependencies: @base-ui/react/tabs
 */

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsVariant = 'line' | 'pill'
export type TabsJustify = 'start' | 'center' | 'between'

export type TabsLayoutProps =
  | {
      block?: false // rail keeps the width its layout gives it
      justified?: boolean // stretches tabs to fill available width; default true
      justify?: never // only a block rail has free space to distribute
    }
  | {
      block: true // rail spans 100% width, triggers keep their natural width
      justified?: false // block already owns the width; justified is refused
      justify?: TabsJustify // where the triggers sit in the full-width rail; default start
    }

export type TabsProps = TabsLayoutProps & {
  orientation?: TabsOrientation // layout direction for tab list
  variant?: TabsVariant // visual style; default line
  value?: string // controlled active tab
  defaultValue?: string // uncontrolled initial tab
  onChange?: (value: string) => void // fires when active tab changes
}

export type TabsListProps = TabsLayoutProps & {
  ariaLabel?: string // accessible name of the tablist, e.g. "Account sections"
  variant?: TabsVariant // optional per-list visual override
}

export type TabsTriggerProps = {
  value: string // tab identifier (required, must match content value)
  icon?: React.ReactNode // icon rendered before tab label
  disabled?: boolean // prevents activation and applies muted styling
  disabledReason?: string // blocks it, arrows still reach it, tooltip says why
}

export type TabsContentProps = {
  value: string // tab identifier (required, must match trigger value)
}
