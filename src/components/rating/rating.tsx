import { tv } from 'tailwind-variants'
import { Star, StarFilled } from '@/internal/icons'

import type { RatingProps } from './rating.types'

const styles = tv({
  slots: {
    button: [
      'rating-button cursor-pointer rounded-md p-0.5 text-primary outline-none',
      'transition-transform enabled:active:scale-95 enabled:hover:scale-110',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:cursor-default',
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

function Rating({
  value,
  onChange,
  max = 5,
  size = 28,
  readOnly = false,
}: RatingProps) {
  const { root, button, star } = styles()
  const stars = Array.from(
    {
      length: max,
    },
    (_, index) => index + 1,
  )

  return (
    <div className={root()} data-testid="rating-root">
      {stars.map((position) => {
        const filled = position <= value
        // Solar's outline star is a stroke traced around the shape, so no fill
        // utility can colour its inside — a filled star has to be its own glyph.
        const Glyph = filled ? StarFilled : Star

        return (
          <button
            aria-label={`${position}`}
            aria-pressed={filled}
            className={button()}
            disabled={readOnly || !onChange}
            key={position}
            onClick={() => onChange?.(position)}
            type="button"
          >
            <Glyph
              className={star({
                filled,
              })}
              size={size}
            />
          </button>
        )
      })}
    </div>
  )
}

export { Rating }
