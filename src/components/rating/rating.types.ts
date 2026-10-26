/**
 * Rating
 *
 * Star rating input/display.
 *
 * Behavior:
 * - Renders `max` stars; fills stars up to `value`
 * - Click a star to set the value (calls `onChange`)
 * - `readOnly` (or no `onChange`) disables interaction for display-only use;
 *   `readOnly` also marks the group aria-readonly
 *
 * Accessibility:
 * - A radio group (the APG "rating radio group" pattern), not a slider: the
 *   choice is one of a few discrete values, each a star you can point at.
 *   The root is role="radiogroup", each star a native radio (one name per
 *   Rating) named by its position and checked when it is the value (the stars
 *   below it are painted full but not checked). Choosing the star that is
 *   already the value reports nothing — it is not a change
 * - One tab stop — the chosen star, or the first while the value is 0.
 *   Right/Down choose the next star, Left/Up the previous one, Home/End the
 *   first/last; focus follows. They stop at the ends instead of wrapping
 *   (going past five does not mean one star)
 * - Named by `ariaLabel`, else — inside a Form.Field — by the field's label
 *   (aria-labelledby), and described/invalidated by the field's description
 *   and error, the way Radio.Group is
 *
 * Implementation:
 * - Per star, a visually hidden <input type="radio"> inside a <label> that
 *   draws the Star / StarFilled icon and the focus ring; the arrows replace
 *   the native ones, which would wrap
 * - <Rating ariaLabel="Your rating" value={3} onChange={setValue} />
 * - <Form.Field label="How was your stay?"><Rating value={v} onChange={setV} /></Form.Field>
 *
 * Dependencies: Form (field context), internal icons (Star, StarFilled)
 */

export type RatingProps = {
  ariaLabel?: string // names the group; inside a Form.Field the label does it
  value: number // current rating (number of filled stars)
  onChange?: (value: number) => void // fires on star click or arrow key
  max?: number // total stars (default 5)
  size?: number // star icon size in px
  readOnly?: boolean // disables interaction
}
