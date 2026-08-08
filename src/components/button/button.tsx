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
  onClick,
}: PropsWithChildren<ButtonProps>) {
  const content = (
    <>
      {loading ? <Loader2 className="animate-spin" /> : leftSection}
      {children}
      {rightSection}
    </>
  )
  const renderAsChild = asChild && isValidElement(children)
  const render = renderAsChild
    ? cloneElement(
        children as ReactElement<{
          children?: ReactNode
        }>,
        undefined,
        content,
      )
    : undefined

  return (
    <ButtonPrimitive
      aria-label={ariaLabel}
      className={buttonShared({
        block,
        className,
        size,
        variant,
      })}
      data-slot="button"
      data-testid="button"
      disabled={disabled || loading}
      form={form}
      nativeButton={!renderAsChild}
      onClick={onClick}
      render={render}
      type={type}
    >
      {renderAsChild ? undefined : content}
    </ButtonPrimitive>
  )
}

export { Button }
