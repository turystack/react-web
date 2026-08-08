import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import {
  forwardRef,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { Check, ChevronDown } from '@/internal/icons'

import type { ColorPickerProps } from './color-picker.types'

export const DEFAULT_COLORS = [
  '#000000',
  '#404040',
  '#808080',
  '#ffffff',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
] as const

const TRANSPARENT_VALUE = 'transparent'

const HEX_REGEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i
const TRANSPARENT_PATTERN =
  'repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 8px 8px'

function normalizeHex(input: string): string | null {
  if (!input) {
    return null
  }
  const trimmed = input.trim().toLowerCase()
  if (trimmed === TRANSPARENT_VALUE) {
    return TRANSPARENT_VALUE
  }
  const match = trimmed.match(HEX_REGEX)
  if (!match) {
    return null
  }
  const hex = match[1]
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
  }
  return `#${hex}`
}

const trigger = tv({
  base: [
    'color-picker-trigger flex w-full min-w-0 items-center gap-2',
    'rounded-lg border border-input bg-transparent px-2.5 py-1 text-left',
    'text-base outline-none transition-colors md:text-sm',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
    'dark:bg-input/30 dark:disabled:bg-input/80',
    'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  ],
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      lg: 'h-11',
      md: 'h-10',
      sm: 'h-9',
    },
  },
})

const previewSwatch = tv({
  base: 'inline-block shrink-0 rounded ring-1 ring-foreground/15',
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      lg: 'size-5',
      md: 'size-[18px]',
      sm: 'size-4',
    },
  },
})

const popup = tv({
  base: [
    'color-picker-popup z-50 w-fit rounded-lg bg-popover p-3 text-popover-foreground',
    'shadow-md outline-hidden ring-1 ring-foreground/10',
    'origin-(--transform-origin)',
    'data-[side=bottom]:slide-in-from-top-2',
    'data-[side=left]:slide-in-from-right-2',
    'data-[side=right]:slide-in-from-left-2',
    'data-[side=top]:slide-in-from-bottom-2',
    'data-open:fade-in-0 data-open:zoom-in-95 duration-100 data-open:animate-in',
    'data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:animate-out',
  ],
})

const grid = tv({
  base: 'grid grid-cols-4 gap-1.5',
})

const swatch = tv({
  base: [
    'relative flex size-7 items-center justify-center rounded-md',
    'cursor-pointer ring-1 ring-foreground/10 transition-transform',
    'outline-none',
    'hover:scale-110',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-popover',
    'data-[selected=true]:ring-2 data-[selected=true]:ring-foreground data-[selected=true]:ring-offset-1 data-[selected=true]:ring-offset-popover',
  ],
})

const hexInput = tv({
  base: [
    'mt-3 h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1',
    'font-mono text-sm uppercase outline-none transition-colors',
    'placeholder:text-muted-foreground placeholder:normal-case',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
    'dark:bg-input/30 dark:disabled:bg-input/80',
  ],
})

const chevron = tv({
  base: 'ml-auto size-4 shrink-0 text-muted-foreground transition-transform',
  variants: {
    open: {
      true: 'rotate-180',
    },
  },
})

const valueText = tv({
  base: 'truncate font-mono uppercase',
  variants: {
    empty: {
      true: 'text-muted-foreground normal-case',
    },
  },
})

const checkIcon = tv({
  base: 'size-3.5 text-white drop-shadow-sm',
  variants: {
    onLight: {
      true: 'text-foreground',
    },
  },
})

function getSwatchBackground(color: string): string | undefined {
  return color === TRANSPARENT_VALUE ? TRANSPARENT_PATTERN : undefined
}

function getSwatchColor(color: string): string | undefined {
  return color === TRANSPARENT_VALUE ? undefined : color
}

const ColorPicker = forwardRef<HTMLButtonElement, ColorPickerProps>(
  function ColorPicker(
    {
      value,
      defaultValue,
      onChange,
      colors = DEFAULT_COLORS,
      allowCustom = true,
      allowTransparent = false,
      size,
      placeholder = 'Selecionar cor',
      disabled,
      invalid,
      name,
      id,
      className,
      popupClassName,
      open,
      defaultOpen,
      onOpenChange,
      side = 'bottom',
      sideOffset = 4,
      align = 'start',
      renderTrigger,
      'aria-label': ariaLabel,
    },
    ref,
  ) {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = useState<string | null>(
      defaultValue ?? null,
    )
    const currentValue = isControlled ? (value ?? null) : internalValue

    const isOpenControlled = open !== undefined
    const [internalOpen, setInternalOpen] = useState<boolean>(
      defaultOpen ?? false,
    )
    const isOpen = isOpenControlled ? (open ?? false) : internalOpen

    const [hexDraft, setHexDraft] = useState<string>(currentValue ?? '')

    useEffect(() => {
      if (!isOpen) {
        setHexDraft(currentValue ?? '')
      }
    }, [isOpen, currentValue])

    const commit = useCallback(
      (next: string | null) => {
        if (!isControlled) {
          setInternalValue(next)
        }
        onChange?.(next)
      },
      [isControlled, onChange],
    )

    const handleOpenChange = useCallback(
      (next: boolean) => {
        if (!isOpenControlled) {
          setInternalOpen(next)
        }
        onOpenChange?.(next)
      },
      [isOpenControlled, onOpenChange],
    )

    const handleSwatchClick = useCallback(
      (color: string) => {
        commit(color)
        setHexDraft(color === TRANSPARENT_VALUE ? '' : color)
        handleOpenChange(false)
      },
      [commit, handleOpenChange],
    )

    const handleHexCommit = useCallback(() => {
      const normalized = normalizeHex(hexDraft)
      if (normalized) {
        commit(normalized)
        setHexDraft(normalized === TRANSPARENT_VALUE ? '' : normalized)
      } else {
        setHexDraft(currentValue ?? '')
      }
    }, [hexDraft, commit, currentValue])

    const handleHexKeyDown = useCallback(
      (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          handleHexCommit()
        }
      },
      [handleHexCommit],
    )

    const swatchList = allowTransparent
      ? [...colors, TRANSPARENT_VALUE]
      : [...colors]

    const triggerContent = renderTrigger ? (
      renderTrigger({
        open: isOpen,
        value: currentValue,
      })
    ) : (
      <>
        <span
          aria-hidden="true"
          className={previewSwatch({
            size,
          })}
          data-testid="color-picker-trigger-swatch"
          style={{
            background:
              currentValue === null
                ? TRANSPARENT_PATTERN
                : currentValue === TRANSPARENT_VALUE
                  ? TRANSPARENT_PATTERN
                  : currentValue,
          }}
        />
        <span
          className={valueText({
            empty: currentValue === null,
          })}
        >
          {currentValue === null
            ? placeholder
            : currentValue === TRANSPARENT_VALUE
              ? 'Transparente'
              : currentValue.toUpperCase()}
        </span>
        <ChevronDown
          className={chevron({
            open: isOpen,
          })}
        />
      </>
    )

    return (
      <PopoverPrimitive.Root onOpenChange={handleOpenChange} open={isOpen}>
        <PopoverPrimitive.Trigger
          render={
            <button
              aria-invalid={invalid || undefined}
              aria-label={ariaLabel}
              className={trigger({
                className,
                size,
              })}
              data-testid="color-picker-trigger"
              disabled={disabled}
              id={id}
              name={name}
              ref={ref}
              type="button"
            />
          }
        >
          {triggerContent}
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner
            align={align}
            className="isolate z-50"
            side={side}
            sideOffset={sideOffset}
          >
            <PopoverPrimitive.Popup
              className={popup({
                className: popupClassName,
              })}
              data-testid="color-picker-popup"
            >
              <div className={grid()} data-testid="color-picker-grid">
                {swatchList.map((color) => {
                  const isSelected = currentValue === color
                  return (
                    <button
                      aria-label={
                        color === TRANSPARENT_VALUE
                          ? 'Transparente'
                          : color.toUpperCase()
                      }
                      aria-pressed={isSelected}
                      className={swatch()}
                      data-selected={isSelected}
                      data-testid={`color-picker-swatch-${color}`}
                      key={color}
                      onClick={() => handleSwatchClick(color)}
                      style={{
                        background: getSwatchBackground(color),
                        backgroundColor: getSwatchColor(color),
                      }}
                      type="button"
                    >
                      {isSelected && (
                        <Check
                          aria-hidden="true"
                          className={checkIcon({
                            onLight:
                              color === '#ffffff' ||
                              color === TRANSPARENT_VALUE,
                          })}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
              {allowCustom && (
                <input
                  className={hexInput()}
                  data-testid="color-picker-hex-input"
                  inputMode="text"
                  maxLength={7}
                  onBlur={handleHexCommit}
                  onChange={(event) => setHexDraft(event.target.value)}
                  onKeyDown={handleHexKeyDown}
                  placeholder="#RRGGBB"
                  spellCheck={false}
                  type="text"
                  value={hexDraft}
                />
              )}
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    )
  },
)

export { ColorPicker }
