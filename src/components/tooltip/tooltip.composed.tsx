import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import { usePortalContainer } from '@/components/portal-provider'

import { tooltipStyles } from './tooltip'
import type { TooltipSide } from './tooltip.types'

/**
 * What a control hands its focusable element: the id of the text that says
 * why (only while there is a reason), and a stable anchor (always). A control
 * spreads it unconditionally; one that already has a description of its own
 * joins the two with `describedBy` instead of letting this one replace it.
 */
export type DisabledReasonA11y = {
  'aria-describedby'?: string
  'data-reason-anchor'?: string
}

/** Joins description ids, dropping the empty ones; undefined when none. */
export function describedBy(
  ...ids: (string | false | null | undefined)[]
): string | undefined {
  const joined = ids.filter(Boolean).join(' ')

  return joined === '' ? undefined : joined
}

export type DisabledReasonProps = {
  /** Renders the control; spread `a11y` on the element that takes focus. */
  children: (a11y: DisabledReasonA11y) => ReactNode
  /**
   * `inline` hugs the control (a button in a row); `block` spans the line it
   * sits on (a menu item, a sidebar row), so the hover target is the row.
   */
  display?: 'block' | 'inline'
  /** Why the control is inert. Absent: nothing is added, not even a wrapper. */
  reason?: ReactNode
  side?: TooltipSide
  /**
   * Internal: names the wrapper for a parent that must place it, set as
   * `data-reason-slot`. Only the parts listed here use it — the sidebar's
   * group and row actions, whose wrapper takes the action's corner — so a
   * parent styles that one wrapper and not every blocked control it holds.
   */
  slot?: DisabledReasonSlot
  /**
   * Internal: keep the wrapper mounted even without a reason (as a
   * `contents` box, so it adds no layout). For a control whose value lives in
   * itself — an uncontrolled Checkbox or Toggle: swapping the tree around it
   * would mount it again and silently reset what the reader had picked.
   */
  stable?: boolean
}

/** The wrappers a parent places by name; see `slot`. */
export type DisabledReasonSlot = 'sidebar-group-action' | 'sidebar-menu-action'

const wrapper = tv({
  // The control fills its wrapper, so a block wrapper (a menu row, a
  // justified tab) is filled by the control and not just by its hover box.
  // An inline wrapper is sized by the control, so there it changes nothing.
  // A control that never shrinks (Button is shrink-0) keeps its wrapper from
  // shrinking too, or a blocked one would overflow onto its neighbours.
  base: 'tooltip-trigger *:min-w-0 *:grow has-[>.shrink-0]:shrink-0',
  variants: {
    display: {
      block: 'flex w-full min-w-0',
      inline: 'inline-flex min-w-0 max-w-full',
    },
    idle: {
      true: 'contents',
    },
  },
})

const { arrow, popup } = tooltipStyles()

/**
 * The reason a control cannot be used, shown where the reader is looking.
 *
 * A disabled control that only looks dead teaches nobody anything (ARC-ERR-9).
 * This is the one mechanism every react-web control uses to say why:
 *
 * - The tooltip opens on hover **and on keyboard focus**. Focus is tracked on
 *   the wrapper, because the control inside is what takes it — a menu item
 *   reached by arrow keys, a button reached by Tab — and the primitive's own
 *   focus handling only listens on its trigger
 * - The reason is always in the DOM, hidden, and the control is described by
 *   it, so a screen reader hears it on focus whether or not the tooltip is
 *   showing
 * - Escape closes it, and it stays closed until focus or the pointer comes
 *   back (WCAG 1.4.13)
 * - The control itself must stay focusable — `aria-disabled`, not the
 *   `disabled` attribute — and must refuse activation; that part is the
 *   control's, since each primitive blocks it differently
 * - It wears the Tooltip's slot classes, so a theme that reskins one reskins
 *   both
 */
export function DisabledReason({
  children,
  display = 'inline',
  reason,
  stable = false,
  side = 'top',
  slot,
}: DisabledReasonProps) {
  const anchorId = useId()
  const reasonId = useId()
  const popupId = useId()
  const portalContainer = usePortalContainer()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const hasReason = !(reason === undefined || reason === null || reason === '')

  // Gaining or losing a reason swaps the tree around the control, so React
  // mounts it again — and a focused control would drop focus to the page
  // ("Send invite" turning into "10 of 10 seats" under the reader's finger).
  // The anchor survives the swap: if the old node held focus, the new one
  // takes it back. Read during render, while the old node is still mounted.
  const hadReason = useRef(hasReason)
  const refocus = useRef(false)

  if (hadReason.current !== hasReason) {
    hadReason.current = hasReason
    refocus.current =
      typeof document !== 'undefined' &&
      document.activeElement?.getAttribute('data-reason-anchor') === anchorId
  }

  useLayoutEffect(() => {
    if (!refocus.current) {
      return
    }

    refocus.current = false

    for (const node of document.querySelectorAll('[data-reason-anchor]')) {
      if (
        node.getAttribute('data-reason-anchor') === anchorId &&
        node instanceof HTMLElement &&
        document.activeElement !== node
      ) {
        node.focus({
          preventScroll: true,
        })
      }
    }
  })

  if (!hasReason && !stable) {
    return (
      <>
        {children({
          'data-reason-anchor': anchorId,
        })}
      </>
    )
  }

  const open = hasReason && (hovered || focused)

  return (
    <TooltipPrimitive.Provider delay={200}>
      <TooltipPrimitive.Root
        disabled={!hasReason}
        onOpenChange={(next, details) => {
          // The primitive answers the pointer; focus is ours. Without the
          // filter its own blur/focus handling would fight the wrapper's.
          if (details.reason === 'trigger-hover' || !next) {
            setHovered(next)
          }

          if (details.reason === 'escape-key') {
            setFocused(false)
          }
        }}
        open={open}
      >
        <TooltipPrimitive.Trigger
          data-slot={hasReason ? 'disabled-reason' : undefined}
          render={
            <span
              className={wrapper({
                display,
                idle: !hasReason,
              })}
              data-reason-slot={slot}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setFocused(false)
                }
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && open) {
                  setFocused(false)
                  setHovered(false)
                }
              }}
            />
          }
        >
          {children(
            hasReason
              ? {
                  'aria-describedby': reasonId,
                  'data-reason-anchor': anchorId,
                }
              : {
                  'data-reason-anchor': anchorId,
                },
          )}
          {hasReason ? (
            <span hidden id={reasonId}>
              {reason}
            </span>
          ) : null}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal container={portalContainer}>
          <TooltipPrimitive.Positioner
            className="tooltip-positioner isolate z-50"
            side={side}
            sideOffset={4}
          >
            <TooltipPrimitive.Popup
              aria-hidden
              className={popup()}
              data-testid="disabled-reason-popup"
              id={popupId}
            >
              {reason}
              <TooltipPrimitive.Arrow className={arrow()} />
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
