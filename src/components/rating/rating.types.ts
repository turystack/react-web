/**
 * Rating
 *
 * Star rating input/display.
 *
 * Behavior:
 * - Renders `max` stars; fills stars up to `value`
 * - Click a star to set the value (calls `onChange`)
 * - `readOnly` (or no `onChange`) disables interaction for display-only use
 *
 * Implementation:
 * - Native <button> per star wrapping a lucide Star icon
 * - <Rating value={3} onChange={setValue} />
 */

export type RatingProps = {
  value: number // current rating (number of filled stars)
  onChange?: (value: number) => void // fires on star click
  max?: number // total stars (default 5)
  size?: number // star icon size in px
  readOnly?: boolean // disables interaction
}
