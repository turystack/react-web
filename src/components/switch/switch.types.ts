/**
 * Switch
 *
 * Toggle control for on/off binary states.
 * Supports label, description, and size variants.
 *
 * Behavior:
 * - Thumb slides horizontally on toggle (translateX via data-state)
 * - Three sizes: sm, md, lg (thumb and track scale accordingly)
 * - Bordered variant wraps switch + label in a bordered clickable container
 * - Label and description render beside the switch
 * - Inherits WithLabelProps for flexible label configuration
 *
 * Implementation:
 * - Use Radix UI Switch primitive for accessibility
 * - data-[state=checked]:translate-x-{N} for thumb animation
 * - <Switch label="Dark mode" size="md" checked={on} onCheckedChange={setOn} />
 *
 * Dependencies: @radix-ui/react-switch
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
