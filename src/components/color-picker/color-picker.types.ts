/**
 * ColorPicker
 *
 * Input-styled trigger that opens a popover with a 4×4 grid of preset colors
 * and an optional HEX input for custom values.
 *
 * Behavior:
 * - Trigger looks like an Input: leftSection swatch preview + HEX text + chevron
 * - Click trigger toggles popover; popover holds the 4×4 swatch grid
 * - HEX input inside popover commits on Enter / blur; invalid HEX silently ignored
 * - Selected swatch shows a check icon for color-blind safety
 * - Sizes (sm/md/lg) mirror the Input component (h-9 / h-10 / h-11)
 *
 * Implementation:
 * - Wraps @base-ui/react/popover (Root, Trigger, Portal, Positioner, Popup)
 * - Trigger is a native <button> styled with input-shared classes
 * - DEFAULT_COLORS exported for consumers to extend
 * - <ColorPicker value={v} onChange={setV} size="md" />
 *
 * Dependencies: @base-ui/react/popover, @turystack/react-icons
 */

import type { ReactNode } from 'react'

import type { InputSize } from '@/components/input/input.types'
import type {
  PopoverAlign,
  PopoverSide,
} from '@/components/popover/popover.types'

export type ColorPickerSize = InputSize

export type ColorPickerProps = {
  value?: string | null // controlled HEX (e.g. "#ff0000"); null clears
  defaultValue?: string | null // uncontrolled initial HEX
  onChange?: (hex: string | null) => void // fires with normalized HEX (#rrggbb) or null
  colors?: readonly string[] // swatches in the grid (default: DEFAULT_COLORS, 16 colors)
  allowCustom?: boolean // shows the HEX input below the grid (default: true)
  allowTransparent?: boolean // adds a transparent swatch (default: false)
  size?: ColorPickerSize // visual size mirroring Input (default: 'md')
  placeholder?: string // shown in trigger when no value is selected
  disabled?: boolean
  invalid?: boolean // toggles aria-invalid styling on the trigger
  name?: string // for form integration
  id?: string
  className?: string // className for the trigger button
  popupClassName?: string // className for the popover popup
  open?: boolean // controlled popover open state
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: PopoverSide // popover side (default: 'bottom')
  sideOffset?: number // distance from trigger in px (default: 4)
  align?: PopoverAlign // popover align (default: 'start')
  renderTrigger?: (ctx: { value: string | null; open: boolean }) => ReactNode // escape hatch for custom trigger
  'aria-label'?: string
}
