/**
 * OTPInput
 *
 * Segmented one-time-password input with individual cell styling.
 * Pattern prop defines digit grouping (e.g. [3, 3] for XXX-XXX).
 *
 * Behavior:
 * - Each cell renders as an individual styled box
 * - Active cell shows a blinking caret animation (1s cycle)
 * - Separator (dash icon) renders between pattern groups
 * - Auto-focuses next cell on valid input
 * - Backspace moves to previous cell
 * - Paste support fills all cells at once
 * - The cells are drawn over one real text input, and that input is what a
 *   screen reader meets: id lands on it, so a <label htmlFor> names it;
 *   inside a Form.Field the field supplies the id, aria-describedby and
 *   aria-invalid; ariaLabel names it when no visible label does
 *
 * Implementation:
 * - Use input-otp library for core OTP behavior
 * - Custom slot rendering with fake caret (CSS animation: caret-blink 1s)
 * - Size variants: sm, md, lg for cell dimensions
 * - <OTPInput pattern={[3, 3]} size="md" value={otp} onChange={setOtp} />
 * - <Form.Field label="Verification code"><OTPInput /></Form.Field>
 * - <OTPInput ariaLabel="Verification code" />
 *
 * Dependencies: input-otp library, @turystack/react-icons (Minus for separator)
 */

export type OTPInputSize = 'sm' | 'md' | 'lg'

export type OTPInputProps = {
  ariaLabel?: string // accessible name of the code field when no visible label names it
  id?: string // id of the underlying input, the target of a <label htmlFor>
  pattern?: number[] // digit count per segment, e.g. [3, 3] for XXX-XXX
  size?: OTPInputSize // visual size of each cell
  value?: string | null // controlled value (concatenated digits)
  defaultValue?: string | null // uncontrolled initial value
  onChange?: (value: string | null) => void // fires with full OTP string
}
