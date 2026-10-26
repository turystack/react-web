import { useDebounceCallback } from '@turystack/react-hooks'
import { forwardRef, useCallback, useRef, useState } from 'react'

import { useFormFieldControl } from '@/components/form/form.context'
import { Loader } from '@/components/loader'
import { axes } from '@/support/utils'

import {
  DEBOUNCE_MS,
  DEFAULT_SECTION_WIDTH,
  type InputComposition,
  inputShared,
} from './input.shared'
import type { InputProps } from './input.types'

/**
 * The implementation reads the public contract plus `InputComposition`; the
 * exported `Input` is narrowed back to `InputProps`, so only this package's
 * own composers (through `ComposedInput`) can reach the internal props.
 */
const InputImpl = forwardRef<HTMLInputElement, InputProps & InputComposition>(
  function Input(
    {
      ariaLabel,
      size,
      variant,
      value,
      defaultValue,
      leftSection,
      leftSectionWidth = DEFAULT_SECTION_WIDTH,
      rightSection,
      rightSectionWidth = DEFAULT_SECTION_WIDTH,
      loading,
      debounce,
      disabled,
      rootClass,
      fieldClass,
      onChange,
      type = 'text',
      id: explicitId,
      'aria-describedby': explicitDescribedBy,
      'aria-invalid': explicitInvalid,
      ...props
    },
    ref,
  ) {
    // Form.Field's id, description/error ids and error state, unless given.
    const control = useFormFieldControl({
      describedBy: explicitDescribedBy,
      id: explicitId,
      invalid: explicitInvalid,
    })

    const emitDebounced = useDebounceCallback((val: string | null) => {
      lastEmitted.current = val
      onChange?.(val)
    }, DEBOUNCE_MS)

    /*
     * A controlled, debounced field types into a draft. The parent's `value`
     * only changes once the debounce fires, so rendering it directly reverted
     * every keystroke typed in between. The draft follows `value` when the
     * parent changes it for its own reasons (a reset, a chip), and ignores the
     * echo of what this field just emitted — adopting the echo would drop
     * whatever was typed after it.
     */
    const draftable = debounce && value !== undefined
    const lastEmitted = useRef<string | null | undefined>(value)
    const [draft, setDraft] = useState(value ?? '')
    const [previousValue, setPreviousValue] = useState(value)
    if (value !== previousValue) {
      setPreviousValue(value)
      if (value !== lastEmitted.current) {
        lastEmitted.current = value
        setDraft(value ?? '')
      }
    }

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onChange) {
          return
        }
        const val = e.target.value === '' ? null : e.target.value
        if (draftable) {
          setDraft(e.target.value)
        }
        if (!debounce) {
          onChange(val)
          return
        }
        emitDebounced(val)
      },
      [onChange, debounce, draftable, emitDebounced],
    )

    const effectiveRight = loading ? <Loader size="sm" /> : rightSection
    const hasLeft = Boolean(leftSection)
    const hasRight = Boolean(effectiveRight)

    const { root, field, section } = inputShared({
      size,
      variant,
    })

    const fieldStyle: React.CSSProperties = {
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
    }

    const controlledProps = draftable
      ? {
          value: draft,
        }
      : value !== undefined
        ? {
            value: value ?? '',
          }
        : {
            defaultValue: defaultValue ?? undefined,
          }

    return (
      <div
        className={root({
          className: rootClass,
        })}
        {...axes(inputShared, {
          size,
          variant,
        })}
        data-testid="input-root"
      >
        {hasLeft && (
          <span
            className={section({
              className: 'left-0 justify-center',
            })}
            data-testid="input-section-left"
            style={{
              width: leftSectionWidth,
            }}
          >
            {leftSection}
          </span>
        )}
        <input
          aria-busy={loading || undefined}
          aria-describedby={control.describedBy}
          aria-invalid={control.invalid}
          aria-label={ariaLabel}
          data-slot="input"
          data-testid="input-field"
          disabled={disabled || loading}
          id={control.id}
          onChange={handleChange}
          ref={ref}
          type={type}
          {...controlledProps}
          {...props}
          // After the spread: the field's look is its own, whatever arrives at
          // runtime (PROP-1).
          className={field({
            className: fieldClass,
          })}
          style={fieldStyle}
        />
        {hasRight && (
          <span
            className={section({
              className: 'pointer-events-auto right-0 justify-center',
            })}
            data-testid="input-section-right"
            style={{
              width: rightSectionWidth,
            }}
          >
            {effectiveRight}
          </span>
        )}
      </div>
    )
  },
)

const Input = InputImpl as React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<HTMLInputElement>
>

export { Input }
