import { useMediaQuery } from 'usehooks-ts'

const MOBILE_BREAKPOINT = 768

/**
 * Whether the viewport is phone-sized.
 *
 * It used to hand-roll matchMedia while this package re-exported
 * `useMediaQuery` two files away — two listeners doing the same job, and only
 * one of them handling the case where the query changes. The breakpoint stays
 * here because it is this design system's, not the hook's.
 */
export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
