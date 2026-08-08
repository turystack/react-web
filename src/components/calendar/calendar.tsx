import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { useEffect, useRef } from 'react'
import {
  type DayButtonProps,
  DayPicker,
  getDefaultClassNames,
  type Matcher,
  type DateRange as RDPDateRange,
} from 'react-day-picker'
import { tv } from 'tailwind-variants'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/internal/icons'

import { cn } from '@/support/utils'

import type { CalendarProps } from './calendar.types'

const styles = tv({
  defaultVariants: {
    size: 'md',
  },
  slots: {
    dayButton: [
      // base button (from shadcn Button output)
      'group/button shrink-0 cursor-pointer items-center justify-center rounded-lg border-transparent bg-clip-padding',
      'select-none whitespace-nowrap text-sm outline-none transition-all',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
      'active:not-aria-[haspopup]:translate-y-px',
      'disabled:pointer-events-none disabled:opacity-50',
      'hover:bg-muted hover:text-foreground',
      'aria-expanded:bg-muted aria-expanded:text-foreground',
      'dark:hover:bg-muted/50',
      '[&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      // day button overrides (from shadcn CalendarDayButton)
      'relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size)',
      'flex-col gap-1 border-0 font-normal leading-none',
      'data-[range-end=true]:rounded-(--cell-radius) data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-(--cell-radius)',
      'data-[range-end=true]:rounded-r-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius)',
      'data-[range-end=true]:bg-primary data-[range-middle=true]:bg-muted data-[range-start=true]:bg-primary data-[selected-single=true]:bg-primary',
      'data-[range-end=true]:text-primary-foreground data-[range-middle=true]:text-foreground data-[range-start=true]:text-primary-foreground data-[selected-single=true]:text-primary-foreground',
      'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50',
      'dark:hover:text-foreground',
      '[&>span]:text-xs [&>span]:opacity-70',
    ],
    root: [
      'calendar-root group/calendar bg-transparent p-2',
      '[--cell-radius:var(--radius-md)]',
    ],
  },
  variants: {
    fullWidth: {
      true: {
        root: 'w-full',
      },
    },
    size: {
      lg: {
        root: '[--cell-size:--spacing(9)]',
      },
      md: {
        root: '[--cell-size:--spacing(7)]',
      },
      sm: {
        root: '[--cell-size:--spacing(6)]',
      },
    },
  },
})

function buildClassNames() {
  const d = getDefaultClassNames()
  return {
    button_next: cn(
      'inline-flex size-(--cell-size) shrink-0 cursor-pointer items-center justify-center rounded-lg p-0 select-none',
      'hover:bg-muted hover:text-foreground aria-disabled:opacity-50',
      d.button_next,
    ),
    button_previous: cn(
      'inline-flex size-(--cell-size) shrink-0 cursor-pointer items-center justify-center rounded-lg p-0 select-none',
      'hover:bg-muted hover:text-foreground aria-disabled:opacity-50',
      d.button_previous,
    ),
    caption_label: cn('font-medium text-sm select-none', d.caption_label),
    chevron: cn(d.chevron),
    day: cn(
      'group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none',
      '[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)',
      '[&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)',
      d.day,
    ),
    day_button: cn(d.day_button),
    disabled: cn('text-muted-foreground opacity-50', d.disabled),
    dropdown: cn('absolute inset-0 opacity-0', d.dropdown),
    dropdown_root: cn('relative rounded-(--cell-radius)', d.dropdown_root),
    dropdowns: cn(
      'flex h-(--cell-size) w-full items-center justify-center gap-1.5 font-medium text-sm',
      d.dropdowns,
    ),
    focused: cn(d.focused),
    hidden: cn('invisible', d.hidden),
    month: cn('flex w-full flex-col gap-4', d.month),
    month_caption: cn(
      'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
      d.month_caption,
    ),
    month_grid: cn(d.month_grid),
    months: cn('relative flex flex-col gap-4 md:flex-row', d.months),
    nav: cn(
      'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
      d.nav,
    ),
    outside: cn(
      'text-muted-foreground aria-selected:text-muted-foreground',
      d.outside,
    ),
    range_end: cn(
      'relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted',
      d.range_end,
    ),
    range_middle: cn('rounded-none', d.range_middle),
    range_start: cn(
      'relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted',
      d.range_start,
    ),
    root: cn('w-fit', d.root),
    selected: cn(d.selected),
    table: 'w-full border-collapse',
    today: cn(
      'rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none',
      d.today,
    ),
    week: cn('mt-2 flex w-full', d.week),
    week_number: cn(
      'text-[0.8rem] text-muted-foreground select-none',
      d.week_number,
    ),
    week_number_header: cn('w-(--cell-size) select-none', d.week_number_header),
    weekday: cn(
      'flex-1 rounded-(--cell-radius) font-normal text-[0.8rem] text-muted-foreground select-none',
      d.weekday,
    ),
    weekdays: cn('flex', d.weekdays),
    weeks: cn(d.weeks),
  }
}

function CalendarChevron({
  className,
  orientation,
  ...props
}: {
  className?: string
  orientation?: string
} & React.SVGProps<SVGSVGElement>) {
  if (orientation === 'left') {
    return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
  }
  if (orientation === 'right') {
    return <ChevronRightIcon className={cn('size-4', className)} {...props} />
  }
  return <ChevronDownIcon className={cn('size-4', className)} {...props} />
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  dayButtonClass,
  defaultDayClass,
  ...props
}: DayButtonProps & {
  dayButtonClass: string
  defaultDayClass: string
}) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (modifiers.focused) {
      ref.current?.focus()
    }
  }, [modifiers.focused])

  return (
    <ButtonPrimitive
      {...props}
      className={cn(dayButtonClass, defaultDayClass, className)}
      data-day={day.date.toISOString()}
      data-range-end={modifiers.range_end || undefined}
      data-range-middle={modifiers.range_middle || undefined}
      data-range-start={modifiers.range_start || undefined}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      ref={ref}
    />
  )
}

function Calendar(props: CalendarProps) {
  const {
    className,
    defaultMonth,
    excludeDate,
    fullWidth,
    highlightToday = true,
    locale,
    maxDate,
    minDate,
    mode,
    month,
    numberOfMonths: numberOfMonthsProp,
    onMonthChange,
    selected,
    showOutsideDays = true,
    size,
    onDateChange,
  } = props

  const { dayButton, root } = styles({
    fullWidth,
    size,
  })

  const disabledMatchers: Matcher[] = []
  if (minDate) {
    disabledMatchers.push({
      before: minDate,
    })
  }
  if (maxDate) {
    disabledMatchers.push({
      after: maxDate,
    })
  }
  if (excludeDate) {
    disabledMatchers.push(excludeDate)
  }

  const numberOfMonths = numberOfMonthsProp ?? (mode === 'range' ? 2 : 1)
  const classNames = buildClassNames()
  const dayButtonClass = dayButton()
  const defaultDayClass = getDefaultClassNames().day

  const sharedProps = {
    className: root({
      className,
    }),
    classNames,
    components: {
      Chevron: CalendarChevron,
      DayButton: (dayBtnProps: DayButtonProps) => (
        <CalendarDayButton
          dayButtonClass={dayButtonClass}
          defaultDayClass={defaultDayClass}
          {...dayBtnProps}
        />
      ),
      Root: ({
        rootRef,
        ...rootProps
      }: {
        rootRef?: React.Ref<HTMLDivElement>
      } & React.HTMLAttributes<HTMLDivElement>) => (
        <div
          {...rootProps}
          className={cn(rootProps.className)}
          data-slot="calendar"
          ref={rootRef}
        />
      ),
    },
    defaultMonth,
    disabled: disabledMatchers.length > 0 ? disabledMatchers : undefined,
    endMonth: maxDate,
    locale,
    ...(highlightToday
      ? {}
      : {
          modifiers: {
            today: false as const,
          },
        }),
    month,
    numberOfMonths,
    onMonthChange,
    showOutsideDays,
    startMonth: minDate,
  }

  if (mode === 'single') {
    return (
      <DayPicker
        {...sharedProps}
        mode="single"
        onSelect={(date) => onDateChange?.(date ?? null)}
        selected={selected ?? undefined}
      />
    )
  }

  return (
    <DayPicker
      {...sharedProps}
      mode="range"
      onSelect={(range: RDPDateRange | undefined) => {
        onDateChange?.(
          range
            ? {
                from: range.from,
                to: range.to,
              }
            : null,
        )
      }}
      selected={
        selected
          ? {
              from: selected.from,
              to: selected.to,
            }
          : undefined
      }
    />
  )
}

export { Calendar }
