import { createContext, useContext } from 'react'

/**
 * How a chip tells the bar it holds a value.
 *
 * The bar offers Clear filters only while something is active, and the chips
 * are the ones that know. Reading it from them, rather than from a count the
 * consumer keeps by hand, means the link cannot disagree with the row: a chip
 * wrapped in a component of the consumer's still reports, and a chip removed
 * from the row stops counting.
 */
export type FilterBarContextValue = {
  report: (id: string, active: boolean) => void
}

export const FilterBarContext = createContext<FilterBarContextValue | null>(
  null,
)

/** The enclosing bar, or `null` for a chip standing on its own. */
export const useFilterBar = () => useContext(FilterBarContext)
