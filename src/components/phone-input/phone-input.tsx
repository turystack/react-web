import { Button } from '@base-ui/react/button'
import * as React from 'react'
import * as RPNInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import { tv } from 'tailwind-variants'
import { ChevronsUpDown } from '@/internal/icons'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shadcn/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shadcn/popover'
import { ScrollArea } from '@/shadcn/scroll-area'

import { buttonShared } from '../button/button.shared'
import { Input } from '../input'
import type { InputProps, InputSize } from '../input/input.types'
import type { PhoneInputProps } from './phone-input.types'
import { getPhoneInputValue, getPhoneValue } from './phone-input.utils'

const rootStyles = tv({
  base: 'flex',
})

const triggerStyles = tv({
  base: buttonShared({
    className:
      'gap-1 rounded-s-lg rounded-e-none border-r-0 px-3 focus:z-10 aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-ring/50 data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/50',
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

const flagStyles = tv({
  base: '[&>svg]:!h-4 [&>svg]:!w-6 flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20',
})

const itemStyles = tv({
  base: 'gap-2 [&>svg:last-child]:hidden',
  defaultVariants: {
    selected: false,
  },
  variants: {
    selected: {
      true: 'bg-muted text-foreground',
    },
  },
})

const chevronStyles = tv({
  base: '-mr-2 size-4',
  defaultVariants: {
    disabled: false,
  },
  variants: {
    disabled: {
      false: 'opacity-50',
      true: 'opacity-30',
    },
  },
})

const PhoneInput = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(
  (
    {
      className,
      debounce,
      defaultValue,
      loading,
      onChange,
      size,
      variant,
      value,
      ...props
    },
    ref,
  ) => {
    const valueCountry = value?.iso as RPNInput.Country | undefined
    const defaultValueCountry = defaultValue?.iso as
      | RPNInput.Country
      | undefined
    const inputValue = getPhoneInputValue(value)
    const defaultInputValue = getPhoneInputValue(defaultValue)

    const selectedCountryRef = React.useRef<RPNInput.Country | undefined>(
      valueCountry ?? defaultValueCountry,
    )

    const inputComponent = React.useCallback(
      ({
        className: inputClassName,
        onChange: rpnOnChange,
        ...inputProps
      }: InputProps & {
        onChange?: React.ChangeEventHandler<HTMLInputElement>
      }) => (
        <Input
          className={inputFieldStyles({
            className: inputClassName,
          })}
          onChange={(val) =>
            rpnOnChange?.({
              target: {
                value: val ?? '',
              },
            } as React.ChangeEvent<HTMLInputElement>)
          }
          ref={ref as React.Ref<HTMLInputElement>}
          size={size}
          variant={variant}
          {...inputProps}
        />
      ),
      [size, variant, ref],
    )

    const countrySelectComponent = React.useCallback(
      (selectProps: CountrySelectBaseProps) => (
        <CountrySelect {...selectProps} size={size} />
      ),
      [size],
    )

    return (
      <RPNInput.default
        className={rootStyles({
          className,
        })}
        countrySelectComponent={countrySelectComponent}
        defaultValue={defaultInputValue}
        flagComponent={FlagComponent}
        inputComponent={inputComponent}
        onChange={(phoneNumber) => {
          if (!onChange) {
            return
          }
          if (!phoneNumber) {
            onChange(null)
            return
          }
          onChange(getPhoneValue(phoneNumber, selectedCountryRef.current))
        }}
        onCountryChange={(country) => {
          selectedCountryRef.current = country
        }}
        smartCaret={false}
        value={inputValue}
        {...props}
      />
    )
  },
)
PhoneInput.displayName = 'PhoneInput'

type CountryEntry = {
  label: string
  value: RPNInput.Country | undefined
}

type CountrySelectBaseProps = {
  disabled?: boolean
  onChange: (country: RPNInput.Country) => void
  options: CountryEntry[]
  value: RPNInput.Country
}

type CountrySelectProps = CountrySelectBaseProps & {
  size?: InputSize
}

const CountrySelect = ({
  disabled,
  onChange,
  options: countryList,
  size,
  value: selectedCountry,
}: CountrySelectProps) => {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const [searchValue, setSearchValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  const selectedLabel =
    countryList.find((o) => o.value === selectedCountry)?.label ??
    selectedCountry

  return (
    <Popover
      modal
      onOpenChange={(open) => {
        setIsOpen(open)
        open && setSearchValue('')
      }}
      open={isOpen}
    >
      <PopoverTrigger
        render={
          <Button
            aria-label="Select country code"
            className={triggerStyles({
              size,
            })}
            disabled={disabled}
            type="button"
          >
            <FlagComponent
              country={selectedCountry}
              countryName={selectedLabel}
            />
            <ChevronsUpDown
              className={chevronStyles({
                disabled,
              })}
            />
          </Button>
        }
      />
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput
            onValueChange={(value) => {
              setSearchValue(value)
              setTimeout(() => {
                if (scrollAreaRef.current) {
                  const viewportElement = scrollAreaRef.current.querySelector(
                    '[data-radix-scroll-area-viewport]',
                  )
                  if (viewportElement) {
                    viewportElement.scrollTop = 0
                  }
                }
              }, 0)
            }}
            placeholder="Search country..."
            value={searchValue}
          />
          <CommandList>
            <ScrollArea className="h-72" ref={scrollAreaRef}>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      country={value}
                      countryName={label}
                      key={value}
                      onChange={onChange}
                      onSelectComplete={() => setIsOpen(false)}
                      selectedCountry={selectedCountry}
                    />
                  ) : null,
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  onChange: (country: RPNInput.Country) => void
  onSelectComplete: () => void
  selectedCountry: RPNInput.Country
}

const CountrySelectOption = ({
  country,
  countryName,
  onChange,
  onSelectComplete,
  selectedCountry,
}: CountrySelectOptionProps) => {
  const handleSelect = () => {
    onChange(country)
    onSelectComplete()
  }

  return (
    <CommandItem
      className={itemStyles({
        selected: country === selectedCountry,
      })}
      onSelect={handleSelect}
    >
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="w-12 shrink-0 text-right text-foreground/50 text-sm tabular-nums">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
    </CommandItem>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className={flagStyles()}>{Flag && <Flag title={countryName} />}</span>
  )
}

export { PhoneInput }
