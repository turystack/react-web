/**
 * ColorSchemeSwitcher
 *
 * Segmented control that switches the active color scheme
 * (light / dark / system) via `useColorScheme`.
 *
 * Behavior:
 * - Three icon-only toggles: Sun (light), Moon (dark), Monitor (system)
 * - Selected scheme shows elevated pill background (matches Tabs pattern)
 * - Reads + writes the scheme through the ColorSchemeProvider context
 * - Keyboard accessible via role="radiogroup" + role="radio"
 *
 * Implementation:
 * - Each toggle is a @base-ui/react Button primitive
 * - Styled with tv() slots, active state driven by data-active attribute
 * - <ColorSchemeSwitcher size="md" />
 *
 * Dependencies: @base-ui/react/button, @turystack/react-icons (Sun, Moon, Monitor)
 */

export type ColorSchemeSwitcherSize = 'sm' | 'md' | 'lg'

export type ColorSchemeSwitcherProps = {
  size?: ColorSchemeSwitcherSize // visual size variant
}
