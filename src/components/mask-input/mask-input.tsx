import { IMaskInput } from 'react-imask'

import { useFormFieldControl } from '@/components/form/form.context'
import { Loader } from '@/components/loader'
import { axes } from '@/support/utils'

import { DEFAULT_SECTION_WIDTH, inputShared } from '../input/input.shared'
import type { MaskInputComposition } from './mask-input.composed'
import type { MaskInputProps } from './mask-input.types'

/**
 * The implementation reads the public contract plus `MaskInputComposition`;
 * the exported `MaskInput` is narrowed back to `MaskInputProps`, so only this
 * package's composers (through `ComposedMaskInput`) reach the internal prop.
 */
function MaskInputImpl({
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
  ariaLabel,
  fieldClass,
  onChange,
  'data-testid': testId = 'mask-input-field',
  id: explicitId,
  'aria-describedby': explicitDescribedBy,
  'aria-invalid': explicitInvalid,
  ...props
}: MaskInputProps & MaskInputComposition) {
  // Form.Field's id, description/error ids and error state, unless given.
  const control = useFormFieldControl({
    describedBy: explicitDescribedBy,
    id: explicitId,
    invalid: explicitInvalid,
  })
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
      className={root()}
      {...axes(inputShared, {
        size,
        variant,
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
        aria-describedby={control.describedBy}
        aria-invalid={control.invalid}
        aria-label={ariaLabel}
        className={field({
          className: fieldClass,
        })}
        data-testid={testId}
        disabled={disabled || loading}
        id={control.id}
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

const MaskInput = MaskInputImpl as (props: MaskInputProps) => React.JSX.Element

export { MaskInput }
