import { type KeyboardEvent, useId, useRef } from 'react'
import { tv } from 'tailwind-variants'
import { useFormFieldControl } from '@/components/form/form.context'
import { Star, StarFilled } from '@/internal/icons'

import type { RatingProps } from './rating.types'

const styles = tv({
  slots: {
    // The visually hidden radio is what takes focus and the choice; the
    // label around it is what shows both.
    input: 'rating-input sr-only',
    option: [
      'rating-option cursor-pointer rounded-md p-0.5 text-primary',
      'transition-transform has-enabled:active:scale-95 has-enabled:hover:scale-110',
      'has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
      'has-disabled:cursor-default motion-reduce:transition-none',
    ],
    root: 'rating-root inline-flex items-center gap-1.5',
    star: 'rating-star',
  },
  variants: {
    filled: {
      false: {
        star: 'text-muted-foreground',
      },
      true: {
        star: 'text-primary',
      },
    },
  },
})

function clamp(position: number, max: number) {
  return Math.min(max, Math.max(1, position))
}

function Rating({
  ariaLabel,
  value,
  onChange,
  max = 5,
  size = 28,
  readOnly = false,
}: RatingProps) {
  const { root, input, option, star } = styles()
  // One name ties the stars into one native radio group.
  const name = useId()
  // In a Form.Field: named by its label (unless ariaLabel), described by its
  // description/error, invalid with its error — a group, like Radio.Group.
  const fieldControl = useFormFieldControl(
    {},
    {
      labelable: false,
    },
  )
  const starsRef = useRef<(HTMLInputElement | null)[]>([])
  const stars = Array.from(
    {
      length: max,
    },
    (_, index) => index + 1,
  )
  const interactive = !readOnly && !!onChange
  // One tab stop: the chosen star, or the first while nothing is chosen.
  const tabStop = value >= 1 && value <= max ? value : 1

  // Arrows move the choice and the focus together, as in a radio group
  // (Right/Down next, Left/Up previous, Home/End the ends). They stop at the
  // ends instead of wrapping, which is why they replace the native radio's
  // arrows (those wrap): one star is not one past five.
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const current = Number(event.currentTarget.dataset.position)
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      ArrowUp: current - 1,
      End: max,
      Home: 1,
    }
    const target = moves[event.key]
    if (target === undefined) {
      return
    }
    event.preventDefault()
    const next = clamp(target, max)
    starsRef.current[next - 1]?.focus()
    if (next !== value) {
      onChange?.(next)
    }
  }

  return (
    <div
      aria-describedby={fieldControl.describedBy}
      aria-invalid={fieldControl.invalid}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : fieldControl.labelledBy}
      aria-readonly={readOnly || undefined}
      className={root()}
      data-testid="rating-root"
      role="radiogroup"
    >
      {stars.map((position) => {
        const filled = position <= value
        // Solar's outline star is a stroke traced around the shape, so no fill
        // utility can colour its inside — a filled star has to be its own glyph.
        const Glyph = filled ? StarFilled : Star

        return (
          <label
            className={option()}
            data-position={position}
            data-testid="rating-option"
            key={position}
          >
            <input
              aria-label={`${position}`}
              checked={position === value}
              className={input()}
              data-position={position}
              disabled={!interactive}
              name={name}
              onChange={() => onChange?.(position)}
              onKeyDown={handleKeyDown}
              ref={(element) => {
                starsRef.current[position - 1] = element
              }}
              tabIndex={position === tabStop ? 0 : -1}
              type="radio"
              value={position}
            />
            <Glyph
              aria-hidden="true"
              className={star({
                filled,
              })}
              size={size}
            />
          </label>
        )
      })}
    </div>
  )
}

export { Rating }
