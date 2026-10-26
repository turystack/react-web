/**
 * Slider
 *
 * Draggable range control for selecting numeric values.
 * Supports single thumb and dual-thumb range modes.
 *
 * Behavior:
 * - Single mode: one thumb, returns a single number
 * - Range mode: two thumbs, returns [min, max] tuple
 * - Orientation: horizontal (default) or vertical
 * - Size variants: sm (4px track), md (8px), lg (12px)
 * - Thumb: circular with border-2, focus ring on keyboard nav
 * - Track shows filled range between thumb(s)
 * - Scale: min/max/step (defaults 0/100/1) bound every thumb and keyboard step
 * - Accessible name: single mode names the thumb with ariaLabel (inside a
 *   Form.Field, else the field's label and description) and draws no group;
 *   range mode is a role="group" named by ariaLabel (else the field's label)
 *   with each thumb named minimum/maximum (labels owned by react-i18n). A
 *   range nothing names renders no group role
 * - formatValue turns each thumb's number into its aria-valuetext
 *   (`R$ 40`, `40%`) so screen readers hear the unit, not a bare number
 * - showValue (default false) prints the value in a row above the track,
 *   right-aligned: one value in single mode, `min – max` in range mode, each
 *   through formatValue when given. It is aria-hidden — the thumbs'
 *   aria-valuetext already speaks it
 *
 * Implementation:
 * - Use Base UI Slider primitive (Root, Value, Control, Track, Indicator, Thumb)
 * - Range mode renders two Thumb elements
 * - <Slider ariaLabel="Volume" mode="single" orientation="horizontal" size="md" value={50} onValueChange={setValue} />
 * - <Slider ariaLabel="Price" formatValue={(v) => `R$ ${v}`} max={500} min={0} mode="range" orientation="horizontal" showValue step={10} value={[20, 80]} onValueChange={setRange} />
 *
 * Dependencies: @base-ui/react/slider, @turystack/react-i18n (thumb names)
 */

export type SliderOrientation = 'horizontal' | 'vertical'

export type SliderSize = 'sm' | 'md' | 'lg'

type BaseSliderProps = {
  ariaLabel?: string // accessible name — the thumb in single mode, the group in range mode (wins over a Form.Field label)
  disabled?: boolean // prevents interaction
  formatValue?: (value: number) => string // turns a thumb's number into its aria-valuetext
  max?: number // upper bound of the scale (default 100)
  min?: number // lower bound of the scale (default 0)
  step?: number // increment per keyboard step and drag snap (default 1)
  orientation: SliderOrientation // track direction (required)
  showValue?: boolean // prints the (formatted) value above the track, aria-hidden (default false)
  size?: SliderSize // visual size of track and thumb
}

type SliderSingleProps = {
  mode: 'single' // single thumb
  value?: number // controlled value
  defaultValue?: number // uncontrolled initial value
  onValueChange?: (value: number) => void // fires on drag/change
}

type SliderRangeProps = {
  mode: 'range' // two thumbs for range selection
  value?: [number, number] // controlled [min, max] values
  defaultValue?: [number, number] // uncontrolled initial range
  onValueChange?: (value: [number, number]) => void // fires on drag/change
}

export type SliderProps = BaseSliderProps &
  (SliderSingleProps | SliderRangeProps)
