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
 * - triggerVariant 'input' paints the Input chrome (border, height, padding);
 *   'bare' drops it and keeps only the focus ring, so a renderTrigger draws its own look.
 *   Default: 'bare' when renderTrigger is given, 'input' otherwise
 * - ariaLabel names the trigger; set it with renderTrigger, whose content may carry no text
 *
 * Implementation:
 * - Wraps @base-ui/react/popover (Root, Trigger, Portal, Positioner, Popup)
 * - Trigger is a native <button> styled with input-shared classes
 * - DEFAULT_COLORS exported for consumers to extend
 * - <ColorPicker value={v} onChange={setV} size="md" />
 * - <ColorPicker ariaLabel="Brand colour" renderTrigger={({ value }) => <Dot color={value} />} />
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

export type ColorPickerTriggerVariant = 'input' | 'bare'

export type ColorPickerProps = {
  value?: string | null // controlled HEX (e.g. "#ff0000"); null clears
  defaultValue?: string | null // uncontrolled initial HEX
  onChange?: (hex: string | null) => void // fires with normalized HEX (#rrggbb) or null
  colors?: readonly string[] // swatches in the grid (default: DEFAULT_COLORS, 16 colors)
  allowCustom?: boolean // shows the HEX input below the grid (default: true)
  allowTransparent?: boolean // adds a transparent swatch (default: false)
  size?: ColorPickerSize // visual size mirroring Input (default: 'md')
  placeholder?: string // shown in trigger when no value is selected
  disabled?: boolean // blocks opening and dims the trigger
  invalid?: boolean // toggles aria-invalid styling on the trigger
  name?: string // for form integration
  id?: string // id on the trigger button, to pair it with a Label
  open?: boolean // controlled popover open state
  defaultOpen?: boolean // uncontrolled initial open state (default: false)
  onOpenChange?: (open: boolean) => void // fires on every open and close
  side?: PopoverSide // popover side (default: 'bottom')
  sideOffset?: number // distance from trigger in px (default: 4)
  align?: PopoverAlign // popover align (default: 'start')
  renderTrigger?: (ctx: { value: string | null; open: boolean }) => ReactNode // replaces the trigger content; the button and popover stay
  triggerVariant?: ColorPickerTriggerVariant // 'input' chrome or 'bare' button (default: 'bare' with renderTrigger, else 'input')
  ariaLabel?: string // accessible name of the trigger; overrides the text inside it
}
