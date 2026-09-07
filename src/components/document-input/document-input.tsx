import { Button } from '@base-ui/react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { DropdownMenu } from '@/components/dropdown-menu'
import { MaskInput } from '@/components/mask-input'
import { ChevronDown } from '@/internal/icons'

import { buttonShared } from '../button/button.shared'
import type { InputSize } from '../input/input.types'
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

const rootStyles = tv({
  base: 'document-input-root flex',
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
  className,
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

  if (variant !== 'any') {
    return (
      <MaskInput
        {...props}
        className={className}
        defaultValue={defaultValue?.number ?? undefined}
        disabled={disabled}
        mask={mask}
        onChange={handleChange}
        placeholder={props.placeholder ?? PLACEHOLDERS[activeType]}
        size={size}
        value={maskValue}
      />
    )
  }

  return (
    <div
      className={rootStyles({
        className,
      })}
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
      <MaskInput
        {...props}
        className={inputFieldStyles()}
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
