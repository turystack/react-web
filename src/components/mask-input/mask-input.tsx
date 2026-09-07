import { IMaskInput } from 'react-imask'

import { Loader } from '@/components/loader'

import { DEFAULT_SECTION_WIDTH, inputShared } from '../input/input.shared'
import type { MaskInputProps } from './mask-input.types'

function MaskInput({
  mask,
  size,
  variant,
  value,
  defaultValue,
  disabled,
  leftSection,
  leftSectionWidth = DEFAULT_SECTION_WIDTH,
  rightSection,
  rightSectionWidth = DEFAULT_SECTION_WIDTH,
  loading,
  rootClassName,
  className,
  onChange,
  ...props
}: MaskInputProps) {
  const effectiveRight = loading ? <Loader size="sm" /> : rightSection
  const hasLeft = Boolean(leftSection)
  const hasRight = Boolean(effectiveRight)

  const { root, field, section } = inputShared({
    size,
    variant,
  })

  const maskOptions = Array.isArray(mask)
    ? mask.map((m) => ({
        mask: m,
      }))
    : mask

  /**
   * IMaskInput seeds the mask from `defaultValue` only while no `value` key
   * reaches it at all: a `value` of `undefined` still counts as controlled and
   * overwrites the field, so the two have to be mutually exclusive here.
   */
  const controlledProps =
    value !== undefined
      ? {
          value: value ?? '',
        }
      : {
          defaultValue: defaultValue ?? undefined,
        }

  return (
    <div
      className={root({
        className: rootClassName,
      })}
      data-testid="mask-input-root"
    >
      {hasLeft && (
        <span
          className={section({
            className: 'pointer-events-auto left-0 justify-center',
          })}
          data-testid="mask-input-section-left"
          style={{
            width: leftSectionWidth,
          }}
        >
          {leftSection}
        </span>
      )}
      <IMaskInput
        {...(props as object)}
        aria-busy={loading || undefined}
        className={field({
          className,
        })}
        data-testid="mask-input-field"
        disabled={disabled || loading}
        mask={maskOptions as string}
        onAccept={(val: string) => onChange?.(val === '' ? null : val)}
        style={{
          ...(hasLeft
            ? {
                paddingLeft: leftSectionWidth,
              }
            : {}),
          ...(hasRight
            ? {
                paddingRight: rightSectionWidth,
              }
            : {}),
        }}
        {...controlledProps}
      />
      {hasRight && (
        <span
          className={section({
            className: 'right-0 justify-center',
          })}
          data-testid="mask-input-section-right"
          style={{
            width: rightSectionWidth,
          }}
        >
          {effectiveRight}
        </span>
      )}
    </div>
  )
}

export { MaskInput }
