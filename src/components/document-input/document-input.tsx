import { Button } from '@base-ui/react'
import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { DropdownMenu } from '@/components/dropdown-menu'
import { MaskInput } from '@/components/mask-input'
import { ChevronsUpDown } from '@/internal/icons'

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
  base: 'flex',
})

const triggerStyles = tv({
  base: buttonShared({
    className:
      'rounded-s-lg rounded-e-none border-r-0 bg-transparent px-3 focus:z-10 aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50 dark:bg-input/30',
    variant: 'outline',
  }),
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
  base: 'rounded-s-none rounded-e-lg',
})

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
      ? ((value?.type ?? defaultValue?.type ?? 'cpf') as Exclude<
          DocumentType,
          'any'
        >)
      : variant,
  )

  const activeType = variant === 'any' ? internalType : variant
  const mask = MASKS[activeType]

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
        value={value?.number ?? undefined}
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
            {LABELS[internalType]}
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content sideOffset={4} width={100}>
          {(['cpf', 'cnpj'] as const).map((type) => (
            <DropdownMenu.CheckboxItem
              checked={internalType === type}
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
        value={value?.number ?? undefined}
      />
    </div>
  )
}

export { DocumentInput }
