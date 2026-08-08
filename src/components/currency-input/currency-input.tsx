import { Button as ButtonPrimitive } from '@base-ui/react'
import { useRef, useState } from 'react'
import { IMaskInput } from 'react-imask'
import { tv } from 'tailwind-variants'
import { Button } from '@/components/button'
import { DropdownMenu } from '@/components/dropdown-menu'
import { Input } from '@/components/input'
import { inputShared } from '@/components/input/input.shared'
import { Popover } from '@/components/popover'
import { ChevronsUpDown, X } from '@/internal/icons'

import { buttonShared } from '../button/button.shared'
import type { InputSize } from '../input/input.types'
import type {
  Currency,
  CurrencyInputProps,
  CurrencyInputRangeProps,
  CurrencyInputRangeValue,
  CurrencyInputSingleProps,
} from './currency-input.types'

type CurrencyConfig = {
  symbol: string
  thousandsSeparator: string
  radix: string
  label: string
  locale: string
}

const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
  brl: {
    label: 'BRL',
    locale: 'pt-BR',
    radix: ',',
    symbol: 'R$',
    thousandsSeparator: '.',
  },
  eur: {
    label: 'EUR',
    locale: 'de-DE',
    radix: ',',
    symbol: '€',
    thousandsSeparator: '.',
  },
  usd: {
    label: 'USD',
    locale: 'en-US',
    radix: '.',
    symbol: '$',
    thousandsSeparator: ',',
  },
}

function parseCurrencyValue(
  val: string,
  config: CurrencyConfig,
): number | null {
  if (!val) {
    return null
  }
  const cleaned = val
    .split(config.thousandsSeparator)
    .join('')
    .replace(config.radix, '.')
  const num = parseFloat(cleaned)
  return Number.isNaN(num) ? null : Math.round(num * 100)
}

const rootStyles = tv({
  base: 'flex',
})

const triggerStyles = tv({
  base: buttonShared({
    className:
      'gap-1 rounded-s-lg rounded-e-none border-r-0 bg-transparent px-3 focus:z-10 aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50 dark:bg-input/30',
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

const symbolStyles = tv({
  base: 'inline-flex shrink-0 items-center justify-center rounded-s-lg rounded-e-none border border-border border-r-0 bg-transparent px-3 font-medium text-muted-foreground text-sm dark:bg-input/30',
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
  base: [
    'rounded-s-none rounded-e-lg',
    'border border-input bg-transparent transition-colors',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:bg-input/50 disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:bg-input/30 dark:disabled:bg-input/80',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  ],
})

const rangeStyles = tv({
  slots: {
    actions:
      'flex items-center justify-end gap-2 border-border border-t bg-background px-3 py-2',
    clearTrigger:
      'visible cursor-pointer text-muted-foreground hover:text-foreground',
    content: 'flex flex-col gap-3 rounded-[inherit] bg-background p-3',
    fields: 'grid grid-cols-2 gap-2',
    root: 'currency-input-range-root',
  },
  variants: {
    disabled: {
      true: {
        clearTrigger:
          'invisible cursor-not-allowed text-muted-foreground opacity-50',
      },
    },
    hasValue: {
      false: {
        clearTrigger:
          'invisible cursor-pointer text-muted-foreground hover:text-foreground',
      },
    },
  },
})

function formatCurrencyValue(
  cents: number | null | undefined,
  config: CurrencyConfig,
): string {
  if (cents === null || cents === undefined) {
    return ''
  }

  return new Intl.NumberFormat(config.locale, {
    currency: config.label,
    style: 'currency',
  }).format(cents / 100)
}

function formatCurrencyRange(
  range: CurrencyInputRangeValue | null | undefined,
  config: CurrencyConfig,
): string {
  if (!range) {
    return ''
  }

  const from = formatCurrencyValue(range.from, config)
  const to = formatCurrencyValue(range.to, config)

  if (from && to) {
    return `${from} ~ ${to}`
  }

  if (from) {
    return `A partir de ${from}`
  }

  if (to) {
    return `Até ${to}`
  }

  return ''
}

function normalizeRange(
  range: CurrencyInputRangeValue | null | undefined,
): CurrencyInputRangeValue | null {
  if (!range || (range.from == null && range.to == null)) {
    return null
  }

  return {
    from: range.from ?? null,
    to: range.to ?? null,
  }
}

function copyRange(
  range: CurrencyInputRangeValue | null | undefined,
): CurrencyInputRangeValue | null {
  const normalized = normalizeRange(range)

  if (!normalized) {
    return null
  }

  return {
    from: normalized.from,
    to: normalized.to,
  }
}

function CurrencySingleInput({
  variant = 'brl',
  value,
  defaultValue,
  onChange,
  disabled,
  size,
  placeholder,
}: CurrencyInputSingleProps) {
  const [internalCurrency, setInternalCurrency] = useState<Currency>(
    variant === 'any' ? 'brl' : (variant as Currency),
  )

  const activeCurrency =
    variant === 'any' ? internalCurrency : (variant as Currency)
  const config = CURRENCY_CONFIGS[activeCurrency]

  const { field } = inputShared({
    size,
  })

  const formatNumber = (cents: number | null | undefined): string =>
    cents === null || cents === undefined
      ? ''
      : (cents / 100).toFixed(2).replace('.', config.radix)

  const [display, setDisplay] = useState<string>(() =>
    formatNumber(value !== undefined ? value : defaultValue),
  )

  const lastValueRef = useRef(value)
  if (value !== lastValueRef.current) {
    lastValueRef.current = value
    if (value !== undefined) {
      const parsed = parseCurrencyValue(display, config)
      if (value !== parsed) {
        setDisplay(formatNumber(value))
      }
    }
  }

  const lastConfigRef = useRef(config)
  if (config !== lastConfigRef.current) {
    const oldConfig = lastConfigRef.current
    lastConfigRef.current = config
    const parsed = parseCurrencyValue(display, oldConfig)
    if (parsed !== null) {
      setDisplay(formatNumber(parsed))
    }
  }

  return (
    <div className={rootStyles()} data-testid="currency-input-root">
      {variant === 'any' ? (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <ButtonPrimitive
              className={triggerStyles({
                size,
              })}
              data-testid="currency-input-variant-trigger"
              disabled={disabled}
              type="button"
            >
              {config.label}
              <ChevronsUpDown className="size-4 opacity-50" />
            </ButtonPrimitive>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content sideOffset={4} width={100}>
            {(['brl', 'usd', 'eur'] as Currency[]).map((c) => (
              <DropdownMenu.CheckboxItem
                checked={internalCurrency === c}
                key={c}
                onCheckedChange={() => setInternalCurrency(c)}
              >
                {CURRENCY_CONFIGS[c].label}
              </DropdownMenu.CheckboxItem>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      ) : (
        <span
          className={symbolStyles({
            className: disabled ? 'opacity-50' : undefined,
            size,
          })}
          data-testid="currency-input-section-left"
        >
          {config.symbol}
        </span>
      )}
      <IMaskInput
        className={field({
          className: inputFieldStyles(),
        })}
        data-testid="currency-input-field"
        disabled={disabled}
        mask={Number as unknown as string}
        normalizeZeros
        onAccept={(val: string) => {
          setDisplay(val)
          onChange?.(parseCurrencyValue(val, config))
        }}
        padFractionalZeros
        placeholder={placeholder}
        radix={config.radix}
        scale={2}
        thousandsSeparator={config.thousandsSeparator}
        value={display}
      />
    </div>
  )
}

function CurrencyRangeInput({
  variant = 'brl',
  value,
  defaultValue,
  onChange,
  disabled,
  size,
  placeholder = 'Filtre por valor',
  fromPlaceholder = 'Valor mínimo',
  toPlaceholder = 'Valor máximo',
  ...props
}: CurrencyInputRangeProps) {
  const [open, setOpen] = useState(false)
  const [internalCurrency] = useState<Currency>(
    variant === 'any' ? 'brl' : (variant as Currency),
  )
  const [internalRange, setInternalRange] = useState<
    CurrencyInputRangeValue | null | undefined
  >(defaultValue)
  const [draftRange, setDraftRange] = useState<CurrencyInputRangeValue | null>(
    copyRange(defaultValue),
  )

  const activeCurrency =
    variant === 'any' ? internalCurrency : (variant as Currency)
  const config = CURRENCY_CONFIGS[activeCurrency]
  const isControlled = value !== undefined
  const selectedRange = isControlled ? value : internalRange
  const displayValue = formatCurrencyRange(selectedRange, config)
  const hasValue = !!displayValue
  const { actions, clearTrigger, content, fields, root } = rangeStyles()

  function commit(nextRange: CurrencyInputRangeValue | null | undefined) {
    const normalized = normalizeRange(nextRange)

    if (!isControlled) {
      setInternalRange(normalized)
    }

    onChange?.(normalized)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (disabled) {
      return
    }

    if (nextOpen) {
      setDraftRange(copyRange(selectedRange))
    }

    setOpen(nextOpen)
  }

  function handleFromChange(nextValue: number | null) {
    setDraftRange((current) => ({
      ...(current ?? {}),
      from: nextValue,
    }))
  }

  function handleToChange(nextValue: number | null) {
    setDraftRange((current) => ({
      ...(current ?? {}),
      to: nextValue,
    }))
  }

  function handleCancel() {
    setDraftRange(copyRange(selectedRange))
    setOpen(false)
  }

  function handleConfirm() {
    commit(draftRange)
    setOpen(false)
  }

  function handleClear(event: React.MouseEvent) {
    event.stopPropagation()
    commit(null)
    setDraftRange(null)
    setOpen(false)
  }

  return (
    <Popover
      align="start"
      content={
        <>
          <div className={content()}>
            <div className={fields()}>
              <CurrencySingleInput
                disabled={disabled}
                onChange={handleFromChange}
                placeholder={fromPlaceholder}
                size={size}
                value={draftRange?.from ?? null}
                variant={activeCurrency}
              />
              <CurrencySingleInput
                disabled={disabled}
                onChange={handleToChange}
                placeholder={toPlaceholder}
                size={size}
                value={draftRange?.to ?? null}
                variant={activeCurrency}
              />
            </div>
          </div>
          <div className={actions()}>
            <Button
              disabled={disabled}
              onClick={handleCancel}
              size="sm"
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button disabled={disabled} onClick={handleConfirm} size="sm">
              Aplicar
            </Button>
          </div>
        </>
      }
      onOpenChange={handleOpenChange}
      open={open}
      popupClassName="min-w-72 overflow-hidden p-0"
      side="bottom"
      sideOffset={8}
    >
      <Input
        {...props}
        className={root()}
        disabled={disabled}
        leftSection={
          <span className="font-medium text-muted-foreground text-sm leading-none">
            {config.symbol}
          </span>
        }
        placeholder={placeholder}
        readOnly
        rightSection={
          <ButtonPrimitive
            className={clearTrigger({
              disabled,
              hasValue,
            })}
            disabled={disabled}
            onClick={handleClear}
            tabIndex={hasValue && !disabled ? 0 : -1}
            type="button"
          >
            <X className="size-4" />
          </ButtonPrimitive>
        }
        size={size}
        value={displayValue}
      />
    </Popover>
  )
}

function CurrencyInput(props: CurrencyInputProps) {
  if (props.mode === 'range') {
    return <CurrencyRangeInput {...props} />
  }

  return <CurrencySingleInput {...props} />
}

export { CurrencyInput }
