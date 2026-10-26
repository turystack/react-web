import type { PropsWithChildren } from 'react'
import { tv } from 'tailwind-variants'

import { useLayout } from '../layout.context'
import { GUTTER_X, GUTTER_Y } from '../layout.gutter'
import type { LayoutContentProps } from './content.types'

const styles = tv({
  slots: {
    content: 'layout-content min-h-0 min-w-0 flex-1 overflow-auto',
    contentInner: 'layout-content-inner mx-auto min-h-full w-full min-w-0',
  },
  variants: {
    bg: {
      background: {
        content: 'bg-background',
      },
      card: {
        content: 'bg-card text-card-foreground',
      },
      muted: {
        content: 'bg-muted',
      },
      // The brand side of a split screen. From the theme's own tokens rather
      // than a palette, so it follows a reskin: muted into a quarter of
      // muted-foreground in light — the slate-100 to slate-300 it replaced —
      // and muted into the page background in dark, darkening the same way.
      gradient: {
        content:
          'bg-muted bg-linear-to-br from-muted to-muted-foreground/25 dark:to-background',
      },
    },
    // Centred by flex on a column that is at least as tall as the pane and
    // grows with its content. Overflow never goes above the top: the column
    // is never shorter than what it holds, so there is no negative free space
    // for `justify-center` to split.
    centered: {
      true: {
        contentInner: 'flex flex-col justify-center',
      },
    },
    // `md:` only: below it Layout.Main stacks the panes, and a share of a
    // column would stretch a pane's height instead of dividing a row.
    span: {
      1: {},
      2: {
        content: 'md:flex-[2]',
      },
      3: {
        content: 'md:flex-[3]',
      },
      4: {
        content: 'md:flex-[4]',
      },
    },
    maxWidth: {
      lg: {
        contentInner: 'max-w-7xl',
      },
      md: {
        contentInner: 'max-w-4xl',
      },
      sm: {
        contentInner: 'max-w-2xl',
      },
      xs: {
        contentInner: 'max-w-sm',
      },
    },
    // The shell's gutter on both axes, from the same map the header and the
    // footer read — so the content's left edge is theirs at every step.
    padding: {
      lg: {
        contentInner: [GUTTER_X.lg, GUTTER_Y.lg],
      },
      md: {
        contentInner: [GUTTER_X.md, GUTTER_Y.md],
      },
      none: {
        contentInner: [GUTTER_X.none, GUTTER_Y.none],
      },
      sm: {
        contentInner: [GUTTER_X.sm, GUTTER_Y.sm],
      },
    },
    paddingHorizontal: {
      lg: {
        contentInner: GUTTER_X.lg,
      },
      md: {
        contentInner: GUTTER_X.md,
      },
      none: {
        contentInner: GUTTER_X.none,
      },
      sm: {
        contentInner: GUTTER_X.sm,
      },
    },
    paddingVertical: {
      lg: {
        contentInner: GUTTER_Y.lg,
      },
      md: {
        contentInner: GUTTER_Y.md,
      },
      none: {
        contentInner: GUTTER_Y.none,
      },
      sm: {
        contentInner: GUTTER_Y.sm,
      },
    },
  },
})

function LayoutContent({
  bg,
  children,
  id,
  maxWidth,
  padding,
  paddingHorizontal,
  paddingVertical,
  span,
}: PropsWithChildren<LayoutContentProps>) {
  // The shell's own padding is the fallback, so setting it once on <Layout>
  // lines the content up with the header and the footer around it.
  const layout = useLayout()
  const centered = layout.variant === 'centered'
  const { content, contentInner } = styles({
    bg,
    centered,
    maxWidth: maxWidth ?? (centered ? 'xs' : undefined),
    padding: padding ?? layout.padding,
    paddingHorizontal,
    paddingVertical,
    span,
  })

  return (
    <div className={content()} data-testid="layout-content" id={id}>
      <div className={contentInner()} data-testid="layout-content-inner">
        {children}
      </div>
    </div>
  )
}

export { LayoutContent }
