import { Button as ButtonPrimitive } from '@base-ui/react/button'
import {
  cloneElement,
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Loader2 } from '@/internal/icons'

import { buttonShared } from './button.shared'
import type { ButtonProps } from './button.types'

function Button({
  ariaLabel,
  children,
  variant,
  size,
  block,
  loading,
  disabled,
  leftSection,
  rightSection,
  asChild,
  type = 'button',
  form,
  className,
  'data-testid': testId = 'button',
  onClick,
}: PropsWithChildren<ButtonProps>) {
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
  const render = child ? cloneElement(child, undefined, content) : undefined

  return (
    <ButtonPrimitive
      aria-busy={loading}
      aria-label={ariaLabel}
      className={buttonShared({
        block,
        className,
        size,
        variant,
      })}
      data-slot="button"
      data-testid={testId}
      disabled={disabled || loading}
      form={form}
      nativeButton={!child}
      onClick={onClick}
      render={render}
      type={type}
    >
      {child ? undefined : content}
    </ButtonPrimitive>
  )
}

export { Button }
