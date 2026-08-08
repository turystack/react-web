import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { tv } from 'tailwind-variants'

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
      'slider-thumb relative block shrink-0 select-none rounded-full border border-ring bg-white',
      'ring-ring/50 transition-[color,box-shadow]',
      'after:absolute after:-inset-2',
      'hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:ring-3',
      'disabled:pointer-events-none disabled:opacity-50',
    ],
    track:
      'slider-track relative grow select-none overflow-hidden rounded-full bg-muted data-vertical:h-full data-horizontal:w-full',
  },
  variants: {
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
  const { mode, orientation, size, disabled } = props

  const isSingle = mode === 'single'

  const { control, indicator, root, thumb, track } = sliderStyles({
    size,
  })

  if (isSingle) {
    const { value, defaultValue, onValueChange } = props as Extract<
      SliderProps,
      {
        mode: 'single'
      }
    >

    return (
      <SliderPrimitive.Root
        className={root()}
        data-testid="slider-root"
        defaultValue={defaultValue}
        disabled={disabled}
        max={100}
        min={0}
        onValueChange={onValueChange}
        orientation={orientation}
        thumbAlignment="edge"
        value={value}
      >
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
          <SliderPrimitive.Thumb
            className={thumb()}
            data-testid="slider-thumb"
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>
    )
  }

  const { value, defaultValue, onValueChange } = props as Extract<
    SliderProps,
    {
      mode: 'range'
    }
  >

  return (
    <SliderPrimitive.Root
      className={root()}
      data-testid="slider-root"
      defaultValue={defaultValue}
      disabled={disabled}
      max={100}
      min={0}
      onValueChange={
        onValueChange
          ? (val: readonly number[]) =>
              onValueChange(val as unknown as [number, number])
          : undefined
      }
      orientation={orientation}
      thumbAlignment="edge"
      value={value}
    >
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
        <SliderPrimitive.Thumb className={thumb()} data-testid="slider-thumb" />
        <SliderPrimitive.Thumb className={thumb()} data-testid="slider-thumb" />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
