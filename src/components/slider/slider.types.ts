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
 *
 * Implementation:
 * - Use Radix UI Slider primitive (Root, Track, Range, Thumb)
 * - Range mode renders two Thumb elements
 * - <Slider mode="single" orientation="horizontal" size="md" value={50} onValueChange={setValue} />
 * - <Slider mode="range" orientation="horizontal" value={[20, 80]} onValueChange={setRange} />
 *
 * Dependencies: @radix-ui/react-slider
 */

export type SliderOrientation = 'horizontal' | 'vertical'

export type SliderSize = 'sm' | 'md' | 'lg'

type BaseSliderProps = {
  disabled?: boolean // prevents interaction
  orientation: SliderOrientation // track direction (required)
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
