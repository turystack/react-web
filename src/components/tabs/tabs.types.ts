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
 * - Orientation: horizontal (default) or vertical
 * - Trigger supports an icon before the label
 * - Focus ring on keyboard navigation
 *
 * Implementation:
 * - Use Base UI Tabs primitive for accessibility (keyboard nav, ARIA roles)
 * - List renders as line navigation by default
 * - Use variant="pill" for the previous segmented style
 * - block and justified are a discriminated union: the compiler rejects both
 * - <Tabs value={tab} onChange={setTab}>
 *     <Tabs.List>
 *       <Tabs.Trigger value="a" icon={<Icon />}>Tab A</Tabs.Trigger>
 *       <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
 *     </Tabs.List>
 *     <Tabs.Content value="a">Panel A</Tabs.Content>
 *     <Tabs.Content value="b">Panel B</Tabs.Content>
 *   </Tabs>
 *
 * Dependencies: @base-ui/react/tabs
 */

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsVariant = 'line' | 'pill'

export type TabsLayoutProps =
  | {
      block?: false // rail keeps the width its layout gives it
      justified?: boolean // stretches tabs to fill available width; default true
    }
  | {
      block: true // rail spans 100% width, triggers keep their natural width
      justified?: false // block already owns the width; justified is refused
    }

export type TabsProps = TabsLayoutProps & {
  orientation?: TabsOrientation // layout direction for tab list
  variant?: TabsVariant // visual style; default line
  value?: string // controlled active tab
  defaultValue?: string // uncontrolled initial tab
  onChange?: (value: string) => void // fires when active tab changes
}

export type TabsListProps = TabsLayoutProps & {
  variant?: TabsVariant // optional per-list visual override
}

export type TabsTriggerProps = {
  value: string // tab identifier (required, must match content value)
  icon?: React.ReactNode // icon rendered before tab label
  disabled?: boolean // prevents activation and applies muted styling
}

export type TabsContentProps = {
  value: string // tab identifier (required, must match trigger value)
}
