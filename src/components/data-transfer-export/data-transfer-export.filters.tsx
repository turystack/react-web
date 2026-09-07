import { CurrencyInput } from '@/components/currency-input'
import type { DataTransferFilter } from '@/components/data-transfer/data-transfer.types'
import { DateInput } from '@/components/date-input'
import { DateRangeInput } from '@/components/date-range-input'
import { Input } from '@/components/input'
import { useLabels } from '@/components/labels-provider'
import { NumberInput } from '@/components/number-input'
import { Select } from '@/components/select'

type FilterFieldProps = {
  filter: DataTransferFilter
  onChange: (value: unknown) => void
  value: unknown
}

/**
 * The one place a filter type becomes an input.
 *
 * Every screen that exports something declares its filters the same way, and
 * none of them name a component. When the money field gains a currency
 * selector, or dates start defaulting to the workspace time zone, it happens
 * here and every export inherits it.
 */
export function DataTransferFilterField({
  filter,
  onChange,
  value,
}: FilterFieldProps) {
  const labels = useLabels()

  if (filter.type === 'select') {
    return (
      <Select
        mode="single"
        onChange={onChange}
        optionLabel="label"
        optionValue="value"
        options={filter.options ?? []}
        placeholder={filter.placeholder}
        size="sm"
        value={(value as string | null) ?? null}
      />
    )
  }

  if (filter.type === 'boolean') {
    return (
      <Select
        mode="single"
        onChange={(next) => onChange(next === null ? null : next === 'true')}
        optionLabel="label"
        optionValue="value"
        options={[
          {
            label: labels.booleanText.yes,
            value: 'true',
          },
          {
            label: labels.booleanText.no,
            value: 'false',
          },
        ]}
        placeholder={filter.placeholder}
        size="sm"
        value={value === null || value === undefined ? null : String(value)}
      />
    )
  }

  if (filter.type === 'dateRange') {
    return (
      <DateRangeInput
        onChange={onChange}
        placeholder={filter.placeholder}
        size="sm"
        value={value as never}
      />
    )
  }

  if (filter.type === 'date') {
    return (
      <DateInput
        onChange={onChange}
        placeholder={filter.placeholder}
        size="sm"
        value={(value as Date | null) ?? null}
      />
    )
  }

  if (filter.type === 'money') {
    return (
      <CurrencyInput
        onChange={onChange}
        placeholder={filter.placeholder}
        size="sm"
        value={(value as number | null) ?? null}
      />
    )
  }

  if (filter.type === 'number') {
    return (
      <NumberInput
        onChange={onChange}
        placeholder={filter.placeholder}
        size="sm"
        value={(value as number | null) ?? null}
      />
    )
  }

  return (
    <Input
      onChange={onChange}
      placeholder={filter.placeholder}
      size="sm"
      value={(value as string | null) ?? null}
    />
  )
}
