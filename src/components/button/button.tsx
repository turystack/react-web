import { Button as ButtonPrimitive } from '@base-ui/react/button'
import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  DisabledReason,
  describedBy,
} from '@/components/tooltip/tooltip.composed'
import { Loader2 } from '@/internal/icons'
import { axes } from '@/support/utils'

import { type ButtonInjectedProps, buttonShared } from './button.shared'
import type { ButtonProps } from './button.types'

function Button(props: PropsWithChildren<ButtonProps>) {
  const {
    ariaLabel,
    children,
    current,
    variant,
    size,
    block,
    loading,
    disabled,
    disabledReason,
    leftSection,
    rightSection,
    asChild,
    type = 'button',
    form,
    href,
    external,
    className,
    'data-testid': testId = 'button',
    onClick,
    ...injected
  } = props as PropsWithChildren<ButtonProps> & ButtonInjectedProps
  const {
    className: _injectedClassName,
    style: _injectedStyle,
    ...forwarded
  } = injected

  const child =
    asChild && isValidElement(children)
      ? (children as ReactElement<{ children?: ReactNode }>)
      : undefined
  const label = child ? child.props.children : children
  const content = (
    <>
      {loading ? (
        <Loader2 className="button-spinner animate-spin" />
      ) : (
        leftSection
      )}
      {label}
      {rightSection}
    </>
  )
  // While loading the spinner is the reason (a control in flight owes no
  // sentence), so the reason waits until the work is over.
  const reason = loading ? undefined : disabledReason
  const inertChild = Boolean(disabled || loading || reason)
  // An inert asChild link drops its href, like the href path below: a
  // preventDefault on click still lets a middle click or "open in new tab"
  // navigate.
  const render = child
    ? cloneElement(
        child as ReactElement<{
          children?: ReactNode
          href?: string
        }>,
        inertChild && 'href' in child.props
          ? {
              href: undefined,
            }
          : undefined,
        content,
      )
    : undefined
  // `true` is ARIA's generic "current item in a set"; the named tokens say
  // which kind. false and undefined leave the attribute off.
  const currentProps = current
    ? {
        'aria-current': current === true ? ('true' as const) : current,
        'data-current': '',
      }
    : {}
  // A reason blocks the button as surely as `disabled` does, but keeps it in
  // the tab order: a control nobody can reach cannot tell anyone why.
  const blocked = Boolean(reason)
  const classes = buttonShared({
    block,
    className,
    size,
    variant,
  })

  // A real anchor, not Base UI's Button rendering one: that path stamps
  // role="button" on the element and clicks it on Space, so a link would be
  // announced and operated as a button.
  // A router Link handed to asChild builds its own href, so dropping the prop
  // cannot stop it. While inert it is rendered as the href path's inert link
  // — no destination at all — and becomes the Link again once it may act.
  const inertComponentChild =
    child !== undefined && inertChild && typeof child.type !== 'string'

  if ((href !== undefined && !child) || inertComponentChild) {
    const inert = Boolean(disabled || loading || blocked)

    return (
      <DisabledReason display={block ? 'block' : 'inline'} reason={reason}>
        {(a11y) => (
          <a
            {...forwarded}
            aria-busy={loading}
            {...(ariaLabel === undefined
              ? {}
              : {
                  'aria-label': ariaLabel,
                })}
            // A disabled link drops its href so nothing can navigate — not a
            // click, not a middle click, not "open in new tab" — keeps the link
            // role explicitly and leaves the tab order, like a disabled button.
            aria-disabled={inert ? true : undefined}
            {...currentProps}
            className={classes}
            data-slot="button"
            {...axes(buttonShared, {
              size,
              variant,
            })}
            data-testid={testId}
            href={inert ? undefined : href}
            onClick={
              inert
                ? (event: MouseEvent<HTMLAnchorElement>) =>
                    event.preventDefault()
                : onClick
            }
            rel={external ? 'noopener noreferrer' : undefined}
            role={inert ? 'link' : undefined}
            // An anchor with no href leaves the tab order on its own, so a
            // blocked one has to be put back in it.
            tabIndex={inert ? (blocked ? 0 : -1) : undefined}
            target={external ? '_blank' : undefined}
            {...a11y}
            aria-describedby={describedBy(
              forwarded['aria-describedby'] as string | undefined,
              a11y['aria-describedby'],
            )}
          >
            {content}
          </a>
        )}
      </DisabledReason>
    )
  }

  return (
    <DisabledReason display={block ? 'block' : 'inline'} reason={reason}>
      {(a11y) => (
        <ButtonPrimitive
          {...forwarded}
          aria-busy={loading}
          // Only when it has one: an undefined name must not erase the one a
          // composing parent injected.
          {...(ariaLabel === undefined
            ? {}
            : {
                'aria-label': ariaLabel,
              })}
          {...currentProps}
          className={classes}
          data-slot="button"
          {...axes(buttonShared, {
            size,
            variant,
          })}
          data-testid={testId}
          disabled={disabled || loading || blocked}
          // A composing parent (Confirm, Popconfirm) may have asked for this
          // already, for a reason it shows itself; a reason here asks too.
          focusableWhenDisabled={
            blocked || forwarded.focusableWhenDisabled === true
          }
          form={form}
          nativeButton={!child}
          onClick={onClick}
          render={render}
          type={type}
          {...a11y}
          aria-describedby={describedBy(
            forwarded['aria-describedby'] as string | undefined,
            a11y['aria-describedby'],
          )}
        >
          {child ? undefined : content}
        </ButtonPrimitive>
      )}
    </DisabledReason>
  )
}

export { Button }
