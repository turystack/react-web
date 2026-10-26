import { type PropsWithChildren, useEffect, useRef } from 'react'
import { tv } from 'tailwind-variants'

import type { BoxProps } from './box.types'

export const styles = tv({
  base: 'box-root',
  variants: {
    bg: {
      background: 'bg-background',
      card: 'bg-card',
      muted: 'bg-muted',
    },
    grow: {
      true: 'flex-grow',
    },
    // Responsive show/hide, every class a literal so Tailwind generates it.
    // A Box is a block, so below the breakpoint it is gone and from it on it
    // is a block again; hideAbove hides it from the breakpoint up.
    hideAbove: {
      lg: 'lg:hidden',
      md: 'md:hidden',
      sm: 'sm:hidden',
      xl: 'xl:hidden',
    },
    hideBelow: {
      lg: 'hidden lg:block',
      md: 'hidden md:block',
      sm: 'hidden sm:block',
      xl: 'hidden xl:block',
    },
    minHeight: {
      lg: 'min-h-64',
      md: 'min-h-48',
      screen: 'min-h-screen',
      sm: 'min-h-32',
    },
    overflow: {
      auto: 'overflow-auto',
      hidden: 'overflow-hidden',
      visible: 'overflow-visible',
    },
    padding: {
      '2xl': 'p-16',
      '3xl': 'p-24',
      lg: 'p-6',
      md: 'p-4',
      none: 'p-0',
      sm: 'p-2',
      xl: 'p-8',
      xs: 'p-1',
    },
    paddingX: {
      '2xl': 'px-16',
      '3xl': 'px-24',
      lg: 'px-6',
      md: 'px-4',
      none: 'px-0',
      sm: 'px-2',
      xl: 'px-8',
      xs: 'px-1',
    },
    paddingY: {
      '2xl': 'py-16',
      '3xl': 'py-24',
      lg: 'py-6',
      md: 'py-4',
      none: 'py-0',
      sm: 'py-2',
      xl: 'py-8',
      xs: 'py-1',
    },
    // Sticky sits above the content it scrolls over (z-30) and below the
    // app chrome — Layout.Footer is z-40 and Layout.Header z-50.
    position: {
      absolute: 'absolute',
      relative: 'relative',
      static: 'static',
      sticky: 'sticky z-30',
    },
    // Only read when sticky. `header` starts at h-14, the height of the
    // default (md) Layout.Header, and is then measured — see useHeaderOffset.
    stickyOffset: {
      header: 'top-14',
      none: 'top-0',
    },
    rounded: {
      full: 'rounded-full',
      lg: 'rounded-lg',
      md: 'rounded-md',
      none: 'rounded-none',
      sm: 'rounded-sm',
      xl: 'rounded-xl',
    },
    textAlign: {
      center: 'text-center',
      left: 'text-left',
      right: 'text-right',
    },
    width: {
      auto: 'w-auto',
      full: 'w-full',
    },
  },
})

/**
 * The same header AnchorNav clears: the first `.layout-header` or `<header>`
 * that is sticky or fixed. Measured, not assumed, so a small or large
 * Layout.Header (or an app's own header) is cleared exactly; with none, the
 * surface pins to the top.
 */
function findStickyHeader() {
  for (const header of document.querySelectorAll('.layout-header, header')) {
    const { position } = window.getComputedStyle(header)

    if (position === 'sticky' || position === 'fixed') {
      return header as HTMLElement
    }
  }

  return undefined
}

function useHeaderOffset(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current

    if (!active || !element) {
      return
    }

    const header = findStickyHeader()
    const place = () => {
      element.style.top = `${header?.getBoundingClientRect().height ?? 0}px`
    }

    place()

    if (!header || typeof ResizeObserver === 'undefined') {
      return () => {
        element.style.top = ''
      }
    }

    const observer = new ResizeObserver(place)
    observer.observe(header)

    return () => {
      observer.disconnect()
      element.style.top = ''
    }
  }, [active])

  return ref
}

function Box({
  bg,
  children,
  grow,
  hideAbove,
  hideBelow,
  id,
  minHeight,
  offset,
  overflow,
  padding,
  paddingX,
  paddingY,
  position,
  rounded,
  textAlign,
  width,
}: PropsWithChildren<BoxProps>) {
  const stickyOffset = position === 'sticky' ? (offset ?? 'none') : undefined
  const ref = useHeaderOffset(stickyOffset === 'header')

  return (
    <div
      className={styles({
        bg,
        grow,
        hideAbove,
        hideBelow,
        minHeight,
        overflow,
        padding,
        paddingX,
        paddingY,
        position,
        rounded,
        stickyOffset,
        textAlign,
        width,
      })}
      data-testid="box-root"
      id={id}
      ref={ref}
    >
      {children}
    </div>
  )
}

export { Box }
