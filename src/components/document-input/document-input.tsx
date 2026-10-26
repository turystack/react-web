import { Button } from '@base-ui/react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { DropdownMenu } from '@/components/dropdown-menu'
import { ChevronDown } from '@/internal/icons'
import { axes } from '@/support/utils'

import { buttonShared } from '../button/button.shared'
import type { InputSize } from '../input/input.types'
import { ComposedMaskInput } from '../mask-input/mask-input.composed'
import type { DocumentInputProps, DocumentType } from './document-input.types'

const MASKS: Record<Exclude<DocumentType, 'any'>, string> = {
  cnpj: '00.000.000/0000-00',
  cpf: '000.000.000-00',
}

const LABELS: Record<Exclude<DocumentType, 'any'>, string> = {
  cnpj: 'CNPJ',
  cpf: 'CPF',
}

const PLACEHOLDERS: Record<Exclude<DocumentType, 'any'>, string> = {
  cnpj: '00.000.000/0000-00',
  cpf: '000.000.000-00',
}

/**
 * The root DocumentInput paints itself in every branch, so its own axes —
 * `size`, and `variant` as the document type — sit on one element that never
 * also carries MaskInput's `data-variant` (the field's look). The masked
 * branch adds `w-full` so the wrapper sizes exactly like the MaskInput root it
 * wraps, in any parent.
 */
const rootStyles = tv({
  base: 'document-input-root flex',
  defaultVariants: {
    size: 'md',
  },
  variants: {
    masked: {
      true: 'w-full',
    },
    size: {
      lg: '',
      md: '',
      sm: '',
    } as Record<InputSize, string>,
  },
})

const triggerStyles = tv({
  base: [
    'document-input-trigger',
    buttonShared({
      className:
        'rounded-s-lg rounded-e-none border-r-0 bg-transparent px-3 focus:z-10 aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50 dark:bg-input/30',
      variant: 'outline',
    }),
  ],
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      lg: 'h-11',
      md: 'h-10',
      sm: 'h-9',
    } as Record<InputSize, string>,
  },
})

const inputFieldStyles = tv({
  base: 'document-input-field rounded-s-none rounded-e-lg',
})

function maskedType(
  type: DocumentType | undefined,
): Exclude<DocumentType, 'any'> | undefined {
  return type === 'cpf' || type === 'cnpj' ? type : undefined
}

function DocumentInput({
  variant,
  value,
  defaultValue,
  onChange,
  disabled,
  size,
  ...props
}: DocumentInputProps) {
  const [internalType, setInternalType] = useState<
    Exclude<DocumentType, 'any'>
  >(
    variant === 'any'
      ? (maskedType(value?.type) ?? maskedType(defaultValue?.type) ?? 'cpf')
      : variant,
  )

  const controlledType = maskedType(value?.type)
  const activeType =
    variant === 'any' ? (controlledType ?? internalType) : variant
  const mask = MASKS[activeType]

  /**
   * `value?.number` alone would read a controlled `null` as "uncontrolled" and
   * let MaskInput fall back to its own state, so the two are told apart here.
   */
  const maskValue = value === undefined ? undefined : (value?.number ?? null)

  const handleChange = (number: string | null) => {
    if (!number) {
      onChange?.(null)
      return
    }
    onChange?.({
      number,
      type: activeType,
    })
  }

  const handleTypeChange = (type: Exclude<DocumentType, 'any'>) => {
    setInternalType(type)
    onChange?.(null)
  }

  const rootAxes = axes(rootStyles, {
    size,
    variant,
  })

  if (variant !== 'any') {
    return (
      <div
        className={rootStyles({
          masked: true,
        })}
        {...rootAxes}
        data-testid="document-input-root"
      >
        <ComposedMaskInput
          {...props}
          defaultValue={defaultValue?.number ?? undefined}
          disabled={disabled}
          mask={mask}
          onChange={handleChange}
          placeholder={props.placeholder ?? PLACEHOLDERS[activeType]}
          size={size}
          value={maskValue}
        />
      </div>
    )
  }

  return (
    <div
      className={rootStyles()}
      {...rootAxes}
      data-testid="document-input-root"
    >
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            className={triggerStyles({
              size,
            })}
            data-testid="document-input-trigger"
            disabled={disabled}
            type="button"
          >
            {LABELS[activeType]}
            <ChevronDown className="document-input-trigger-icon size-4 opacity-50" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content sideOffset={4} width={100}>
          {(['cpf', 'cnpj'] as const).map((type) => (
            <DropdownMenu.CheckboxItem
              checked={activeType === type}
              key={type}
              onCheckedChange={() => handleTypeChange(type)}
            >
              {LABELS[type]}
            </DropdownMenu.CheckboxItem>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
      <ComposedMaskInput
        {...props}
        fieldClass={inputFieldStyles()}
        defaultValue={defaultValue?.number ?? undefined}
        disabled={disabled}
        mask={mask}
        onChange={handleChange}
        placeholder={props.placeholder ?? PLACEHOLDERS[activeType]}
        size={size}
        value={maskValue}
      />
    </div>
  )
}

export { DocumentInput }
