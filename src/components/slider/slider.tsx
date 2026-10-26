import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { tv } from 'tailwind-variants'

import { useFormFieldControl } from '@/components/form/form.context'
import { useLabels } from '@/components/labels-provider'
import { axes } from '@/support/utils'

import type { SliderProps } from './slider.types'

const sliderStyles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    control: [
      'slider-control relative flex w-full touch-none select-none items-center',
      'data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col',
      'data-disabled:opacity-50',
    ],
    indicator:
      'slider-indicator select-none bg-primary data-horizontal:h-full data-vertical:w-full',
    root: 'slider-root data-vertical:h-full data-horizontal:w-full',
    thumb: [
      'slider-thumb relative block shrink-0 select-none rounded-full border border-ring bg-control-thumb',
      'ring-ring/50 transition-[color,box-shadow]',
      'after:absolute after:-inset-2',
      'hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:ring-3',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    value:
      'slider-value text-muted-foreground text-sm tabular-nums leading-none',
    valueRow: 'slider-value-row flex items-center justify-end',
    track:
      'slider-track relative grow select-none overflow-hidden rounded-full bg-muted data-vertical:h-full data-horizontal:w-full',
  },
  variants: {
    showValue: {
      true: {
        root: 'flex flex-col gap-2',
      },
    },
    size: {
      lg: {
        thumb: 'size-4',
        track: 'data-horizontal:h-1.5 data-vertical:w-1.5',
      },
      md: {
        thumb: 'size-3',
        track: 'data-horizontal:h-1 data-vertical:w-1',
      },
      sm: {
        thumb: 'size-2.5',
        track: 'data-horizontal:h-0.5 data-vertical:w-0.5',
      },
    },
  },
})

function Slider(props: SliderProps) {
  const {
    ariaLabel,
    disabled,
    formatValue,
    max = 100,
    min = 0,
    mode,
    orientation,
    showValue = false,
    size,
    step = 1,
  } = props

  const labels = useLabels()
  // In a Form.Field the slider is named by the field's label (unless
  // ariaLabel) and described by its description/error.
  const fieldControl = useFormFieldControl(
    {},
    {
      labelable: false,
    },
  )

  const isRange = mode === 'range'
  const labelledBy = ariaLabel ? undefined : fieldControl.labelledBy
  // Only a range is a group: two thumbs under one name. It carries
  // role="group" only when something names it (ariaLabel, else the field's
  // label); an unnamed group is noise to a screen reader. A single slider has
  // no group at all — its one thumb is the control, so the name and the
  // description land on the thumb.
  const groupNamed = isRange && (ariaLabel !== undefined || !!labelledBy)

  const { control, indicator, root, thumb, track, value, valueRow } =
    sliderStyles({
      showValue,
      size,
    })

  // A range has two thumbs inside one group: the group carries the consumer's
  // name and each thumb says which end it is, so neither reads as "slider".
  const thumbName = (index: number) => {
    if (!isRange) {
      return ariaLabel ?? ''
    }

    return index === 0
      ? labels.currencyInput.minimum
      : labels.currencyInput.maximum
  }

  const valueText = formatValue
    ? (_formatted: string, value: number) => formatValue(value)
    : isRange
      ? (formatted: string) => formatted
      : undefined

  // The on-screen value repeats what each thumb's aria-valuetext already
  // speaks, so it is hidden from assistive tech rather than read twice.
  const displayValue = (
    formatted: readonly string[],
    values: readonly number[],
  ) =>
    values
      .map((current, index) =>
        formatValue
          ? formatValue(current)
          : (formatted[index] ?? String(current)),
      )
      .join(' – ')

  const handleValueChange = (next: number | readonly number[]) => {
    if (isRange) {
      props.onValueChange?.(next as unknown as [number, number])
      return
    }

    props.onValueChange?.(next as number)
  }

  const renderThumb = (index: number) => (
    <SliderPrimitive.Thumb
      aria-describedby={isRange ? undefined : fieldControl.describedBy}
      aria-labelledby={isRange ? undefined : labelledBy}
      className={thumb()}
      data-testid="slider-thumb"
      getAriaLabel={isRange || ariaLabel ? thumbName : undefined}
      getAriaValueText={valueText}
      index={isRange ? index : undefined}
      key={index}
    />
  )

  return (
    <SliderPrimitive.Root
      aria-describedby={groupNamed ? fieldControl.describedBy : undefined}
      aria-label={groupNamed ? ariaLabel : undefined}
      aria-labelledby={groupNamed ? labelledBy : undefined}
      className={root()}
      {...axes(sliderStyles, {
        size,
      })}
      data-testid="slider-root"
      defaultValue={props.defaultValue}
      disabled={disabled}
      max={max}
      min={min}
      onValueChange={props.onValueChange ? handleValueChange : undefined}
      orientation={orientation}
      // Base UI stamps role="group" on the root; an explicit undefined drops it.
      role={groupNamed ? 'group' : undefined}
      step={step}
      thumbAlignment="edge"
      value={props.value}
    >
      {showValue && (
        <div className={valueRow()} data-testid="slider-value-row">
          <SliderPrimitive.Value
            aria-hidden="true"
            className={value()}
            data-testid="slider-value"
          >
            {displayValue}
          </SliderPrimitive.Value>
        </div>
      )}
      <SliderPrimitive.Control
        className={control()}
        data-testid="slider-control"
      >
        <SliderPrimitive.Track className={track()} data-testid="slider-track">
          <SliderPrimitive.Indicator
            className={indicator()}
            data-testid="slider-indicator"
          />
        </SliderPrimitive.Track>
        {isRange ? [renderThumb(0), renderThumb(1)] : renderThumb(0)}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
