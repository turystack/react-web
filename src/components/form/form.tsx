import { Separator } from '@base-ui/react/separator'
import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { Label } from '@/components/label'
import type { TooltipProps } from '@/components/tooltip'
import { Tooltip } from '@/components/tooltip'
import { Info } from '@/internal/icons'
import { cn } from '@/support/utils'

import type {
  FormFieldGroupProps,
  FormFieldProps,
  FormFieldSeparatorProps,
  FormFieldSetProps,
  FormProps,
} from './form.types'

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = tv({
  defaultVariants: {
    invalid: false,
    legendVariant: 'legend',
    separatorSurface: 'background',
  },
  slots: {
    // Field wrapper — groups label + input + description + error
    field: [
      'group/field flex w-full flex-col gap-2',
      '*:w-full [&>.sr-only]:w-auto',
    ],

    // Helper text below the input
    fieldDescription: [
      'text-left font-normal text-muted-foreground text-sm leading-normal',
      '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
    ],

    // Error message
    fieldError: 'font-normal text-destructive text-sm',

    // Stacked row of fields (e.g. first name + last name)
    fieldGroup: '@container/field-group flex w-full flex-col gap-5',

    // Fieldset legend
    fieldLegend: 'mb-1.5 flex items-center gap-1.5 font-medium',

    // Separator wrapper
    fieldSeparator: 'relative my-2 h-5 text-sm',

    // Separator inline text label
    fieldSeparatorContent: [
      'relative mx-auto block w-fit',
      'px-2',
      'text-center text-muted-foreground text-sm',
    ],

    // Separator line
    fieldSeparatorLine: ['absolute inset-x-0 top-1/2', 'h-px bg-border'],

    // Fieldset — groups related sections with legend
    fieldSet: 'flex flex-col gap-4',

    floatingLabel: [
      'pointer-events-none absolute top-1/2 left-2.5 z-10 origin-left',
      '-translate-y-1/2 px-1 font-normal text-muted-foreground text-sm',
      'transition-all duration-150',
      'group-focus-within/field:top-0 group-focus-within/field:bg-background',
      'group-focus-within/field:text-foreground group-focus-within/field:text-xs',
      'group-data-[filled]/field:top-0 group-data-[filled]/field:bg-background',
      'group-data-[filled]/field:text-xs',
    ],
    root: '',
  },

  variants: {
    floating: {
      true: {
        field: [
          'relative',
          '[&>label]:w-fit',
          '[&_input::placeholder]:opacity-0 [&_textarea::placeholder]:opacity-0',
          'group-focus-within/field:[&_input::placeholder]:opacity-100',
          'group-focus-within/field:[&_textarea::placeholder]:opacity-100',
        ],
      },
    },

    invalid: {
      true: {
        field: 'text-destructive',
        fieldDescription: 'text-destructive/80',
        floatingLabel:
          'text-destructive group-focus-within/field:text-destructive',
      },
    },

    // Legend size — 'legend' for fieldset sections, 'label' for inline use
    legendVariant: {
      label: {
        fieldLegend: 'text-sm',
      },
      legend: {
        fieldLegend: 'text-base',
      },
    },
    separatorSurface: {
      background: {
        fieldSeparatorContent: 'bg-background',
      },
      card: {
        fieldSeparatorContent: 'bg-card',
      },
      transparent: {
        fieldSeparatorContent: 'bg-transparent',
      },
    },
  },
})

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FormRoot({
  children,
  onSubmit,
  ...props
}: PropsWithChildren<FormProps> & React.ComponentProps<'form'>) {
  return (
    <form onSubmit={onSubmit} {...props}>
      {children}
    </form>
  )
}

function FormField({
  children,
  description,
  error,
  label,
  labelFloating,
  name,
}: PropsWithChildren<FormFieldProps>) {
  const invalid = !!error

  const ref = useRef<HTMLDivElement>(null)
  const [filled, setFilled] = useState(false)

  const syncFilled = useCallback(() => {
    const el = ref.current?.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >('input, textarea, select')
    setFilled(!!el && el.value !== '')
  }, [])

  useEffect(() => {
    if (labelFloating) {
      syncFilled()
    }
  }, [labelFloating, syncFilled])

  const { field, fieldDescription, fieldError, floatingLabel } = styles({
    floating: labelFloating,
    invalid,
  })

  const labelConfig =
    typeof label === 'string'
      ? {
          content: label,
          htmlFor: name,
        }
      : label
        ? {
            htmlFor: name,
            ...label,
          }
        : undefined

  if (labelFloating) {
    return (
      <div
        className={field()}
        data-filled={filled ? '' : undefined}
        onInput={syncFilled}
        ref={ref}
      >
        {children}
        {labelConfig && (
          <Label
            {...labelConfig}
            className={cn(floatingLabel(), labelConfig.className)}
          >
            {labelConfig.content}
          </Label>
        )}
        {description && <p className={fieldDescription()}>{description}</p>}
        {error && (
          <div className={fieldError()} role="alert">
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={field()}>
      {labelConfig && <Label {...labelConfig}>{labelConfig.content}</Label>}
      {children}
      {description && <p className={fieldDescription()}>{description}</p>}
      {error && (
        <div className={fieldError()} role="alert">
          {error}
        </div>
      )}
    </div>
  )
}

function FormFieldGroup({ children }: PropsWithChildren<FormFieldGroupProps>) {
  const { fieldGroup } = styles()
  return <div className={fieldGroup()}>{children}</div>
}

function FormFieldSet({
  children,
  legend,
  tooltip,
}: PropsWithChildren<FormFieldSetProps>) {
  const { fieldSet, fieldLegend } = styles()

  const tooltipProps: TooltipProps | undefined =
    typeof tooltip === 'string'
      ? {
          content: tooltip,
        }
      : tooltip

  return (
    <fieldset className={fieldSet()}>
      {legend && (
        <legend className={fieldLegend()}>
          {legend}
          {tooltipProps && (
            <Tooltip {...tooltipProps}>
              <Info className="text-muted-foreground" size={14} />
            </Tooltip>
          )}
        </legend>
      )}
      {children}
    </fieldset>
  )
}

function FormFieldSeparator({ children, surface }: FormFieldSeparatorProps) {
  const { fieldSeparator, fieldSeparatorLine, fieldSeparatorContent } = styles({
    separatorSurface: surface,
  })

  return (
    <div className={fieldSeparator()}>
      <Separator className={fieldSeparatorLine()} orientation="horizontal" />
      {children && <span className={fieldSeparatorContent()}>{children}</span>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Compound export
// ---------------------------------------------------------------------------

const Form = Object.assign(FormRoot, {
  Field: FormField,
  FieldGroup: FormFieldGroup,
  FieldSeparator: FormFieldSeparator,
  FieldSet: FormFieldSet,
})

export { Form }
