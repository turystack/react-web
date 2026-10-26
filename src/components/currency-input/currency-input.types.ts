/**
 * CurrencyInput
 *
 * Numeric input formatted as currency with symbol prefix.
 * Supports single value, currency selector, and from/to range modes.
 *
 * Behavior:
 * - Single mode: displays formatted currency value (e.g. R$ 1.234,56)
 * - "any" variant: renders a dropdown to select currency (BRL/USD/EUR), single mode only
 * - Range mode: opens a popover with two inputs (from/to) and confirm/cancel buttons.
 *   The currency symbol left of the field is a button (named by the
 *   `currencyInput.open` label) that opens it, and the clear button sits right
 *   of the field: sibling <button>s, nothing interactive nested in another.
 *   The popup anchors to the whole field
 * - Formatting uses Intl.NumberFormat based on currency locale
 * - Parsing strips non-digits, divides by 100 for decimal placement
 * - Single mode: a `leftSection`/`rightSection` of the consumer's renders as an
 *   extra slot inside the field, next to the fixed currency symbol (or the
 *   "any" dropdown)
 * - Range mode has no `leftSection`/`rightSection`: its sections are the open
 *   and clear buttons, so TypeScript refuses them rather than the field
 *   dropping them in silence. `leftSectionWidth`/`rightSectionWidth` still
 *   size those two button slots
 *
 * Implementation:
 * - Compose with Input component for base styling
 * - Popover for range mode dual-input UI
 * - DropdownMenu for currency type selector in "any" mode
 * - Locale map: brl → pt-BR, usd → en-US, eur → de-DE
 * - Values are expressed in integer cents (e.g. 123456 → R$ 1.234,56)
 * - <CurrencyInput variant="brl" value={123456} onChange={setValue} />
 * - <CurrencyInput mode="range" variant="usd" value={{ from: 1000, to: 10000 }} onChange={setRange} />
 *
 * Dependencies: Input component, Popover component, DropdownMenu component
 */

import type { InputProps } from '@/components/input/input.types'

export type Currency = 'brl' | 'usd' | 'eur'

export type CurrencyVariant = Currency | 'any'

export type CurrencyInputRangeValue = {
  from?: number | null
  to?: number | null
}

type CurrencyInputBaseProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'variant'
>

export type CurrencyInputSingleProps = CurrencyInputBaseProps & {
  mode?: 'single'
  variant?: CurrencyVariant // currency type determines symbol/formatting
  value?: number | null // controlled value in integer cents
  defaultValue?: number | null // uncontrolled initial value in integer cents
  onChange?: (value: number | null) => void // fires with integer cents
}

// The range field's sections are its own buttons (the symbol that opens the
// bounds, the clear button): a consumer's section has nowhere to go.
export type CurrencyInputRangeProps = Omit<
  CurrencyInputBaseProps,
  'leftSection' | 'rightSection'
> & {
  mode: 'range'
  variant?: Currency // currency the bounds are read and shown in
  value?: CurrencyInputRangeValue | null // controlled from/to values in integer cents
  defaultValue?: CurrencyInputRangeValue | null // uncontrolled initial range in integer cents
  onChange?: (value: CurrencyInputRangeValue | null) => void // fires on confirm
  fromPlaceholder?: string
  toPlaceholder?: string
}

export type CurrencyInputProps =
  | CurrencyInputSingleProps
  | CurrencyInputRangeProps
