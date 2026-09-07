import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area'
import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import type { ScrollAreaProps } from './scroll-area.types'

export const styles = tv({
  slots: {
    content: 'scroll-area-content min-w-0',
    root: 'scroll-area relative h-full w-full overflow-hidden',
    scrollbar: [
      'scroll-area-scrollbar flex touch-none select-none rounded bg-transparent p-0.5',
      'opacity-0 transition-opacity delay-300 data-hovering:opacity-100 data-hovering:delay-0',
      'data-scrolling:opacity-100 data-scrolling:delay-0',
      'data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2',
    ],
    thumb: 'scroll-area-thumb flex-1 rounded-full bg-border',
    viewport:
      'scroll-area-viewport h-full w-full overscroll-contain outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
  },
})

/**
 * The scrollbars are kept mounted on purpose. Base UI only renders one once it
 * measures overflow, which means the element appears and disappears as content
 * changes — and a scrollbar that pops into existence shifts nothing but is
 * impossible to hold on to, in a test or in a transition. Mounted and
 * transparent is the steadier answer.
 */
export function ScrollArea({
  children,
  orientation = 'vertical',
}: PropsWithChildren<ScrollAreaProps>) {
  const { content, root, scrollbar, thumb, viewport } = styles()

  return (
    <ScrollAreaPrimitive.Root className={root()} data-testid="scroll-area">
      <ScrollAreaPrimitive.Viewport
        className={viewport()}
        data-testid="scroll-area-viewport"
      >
        <ScrollAreaPrimitive.Content className={content()}>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>

      {orientation !== 'horizontal' ? (
        <ScrollAreaPrimitive.Scrollbar
          className={scrollbar()}
          data-testid="scroll-area-scrollbar"
          keepMounted
          orientation="vertical"
        >
          <ScrollAreaPrimitive.Thumb className={thumb()} />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}

      {orientation !== 'vertical' ? (
        <ScrollAreaPrimitive.Scrollbar
          className={scrollbar()}
          data-testid="scroll-area-scrollbar"
          keepMounted
          orientation="horizontal"
        >
          <ScrollAreaPrimitive.Thumb className={thumb()} />
        </ScrollAreaPrimitive.Scrollbar>
      ) : null}
    </ScrollAreaPrimitive.Root>
  )
}
