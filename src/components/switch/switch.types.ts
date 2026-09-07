/**
 * Switch
 *
 * Toggle control for on/off binary states.
 * Supports label, description, and size variants.
 *
 * Behavior:
 * - Thumb slides horizontally on toggle (translateX via data-state)
 * - Three sizes: sm, md, lg (thumb and track scale accordingly)
 * - Bordered variant wraps switch + label in a bordered container
 * - Label and description render beside the switch
 * - Clicking the label toggles the switch; the description is announced as the
 *   switch's description, not as part of its name
 * - Inherits WithLabelProps for flexible label configuration; label.htmlFor
 *   names the control instead of pointing the label somewhere else
 *
 * Implementation:
 * - Base UI Switch primitive for accessibility
 * - data-checked:translate-x-{N} for thumb animation
 * - <Switch label="Dark mode" size="md" checked={on} onCheckedChange={setOn} />
 *
 * Dependencies: @base-ui/react/switch, Label component (WithLabelProps)
 */

import type { WithLabelProps } from '@/components/label'

export type SwitchSize = 'sm' | 'md' | 'lg'

export type SwitchProps = WithLabelProps<{
  value?: string // value for form submission
  size?: SwitchSize // visual size variant
  description?: string // helper text below the switch
  checked?: boolean // controlled state
  defaultChecked?: boolean // uncontrolled initial state
  disabled?: boolean // prevents interaction
  bordered?: boolean // adds border around switch wrapper
  onCheckedChange?: (checked: boolean) => void // fires on toggle
}>
