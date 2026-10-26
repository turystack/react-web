import {
  type PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { useLabels } from '@/components/labels-provider'

import { FilterBarContext } from './filter-bar.context'
import type { FilterBarProps } from './filter-bar.types'

const styles = tv({
  slots: {
    // Wraps rather than scrolls: a chip cut off at the edge of a narrow
    // screen is a filter nobody knows is there. A <fieldset> is the native
    // group; `min-w-0` undoes its default min-inline-size, which would
    // otherwise stop the row from wrapping, and the border and padding it
    // ships with are cleared.
    root: 'filter-bar-root m-0 flex min-w-0 flex-wrap items-center gap-2 border-0 p-0',
    // `ml-auto` keeps the trailing content at the end of whichever line it
    // lands on, so it does not jump left when Clear filters comes and goes.
    trailing: 'filter-bar-trailing ml-auto flex items-center gap-2',
  },
})

const { root: rootClass, trailing: trailingClass } = styles()

function FilterBar({
  ariaLabel,
  children,
  onClear,
  trailing,
}: PropsWithChildren<FilterBarProps>) {
  const labels = useLabels()
  const rootRef = useRef<HTMLFieldSetElement>(null)
  const [active, setActive] = useState<ReadonlySet<string>>(() => new Set())

  const report = useCallback((id: string, isActive: boolean) => {
    setActive((current) => {
      if (current.has(id) === isActive) {
        return current
      }

      const next = new Set(current)

      if (isActive) {
        next.add(id)
      } else {
        next.delete(id)
      }

      return next
    })
  }, [])

  const context = useMemo(() => ({ report }), [report])

  function clear() {
    // The link is about to leave the row with the last active filter. Focus
    // left on it would fall to the page, so it moves to the first chip — the
    // place a keyboard user starts filtering again from.
    rootRef.current
      ?.querySelector<HTMLElement>('[data-filter-chip-trigger]:not(:disabled)')
      ?.focus()
    onClear?.()
  }

  return (
    <FilterBarContext value={context}>
      <fieldset
        aria-label={ariaLabel ?? labels.filterBar.label}
        className={rootClass()}
        data-testid="filter-bar"
        ref={rootRef}
      >
        {children}

        {onClear !== undefined && active.size > 0 ? (
          <Button
            className="filter-bar-clear"
            data-testid="filter-bar-clear"
            onClick={clear}
            size="sm"
            variant="link"
          >
            {labels.filterBar.clear}
          </Button>
        ) : null}

        {trailing === undefined ? null : (
          <div className={trailingClass()} data-testid="filter-bar-trailing">
            {trailing}
          </div>
        )}
      </fieldset>
    </FilterBarContext>
  )
}

export { FilterBar }
