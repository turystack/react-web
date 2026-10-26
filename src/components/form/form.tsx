import { Separator } from '@base-ui/react/separator'
import {
  Children,
  isValidElement,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { tv } from 'tailwind-variants'
import { ComposedLabel } from '@/components/label/label.composed'
import type { TooltipProps } from '@/components/tooltip'
import { Tooltip } from '@/components/tooltip'
import { Info } from '@/internal/icons'

import {
  FormFieldContext,
  type FormFieldContextValue,
  FormFieldSetContext,
} from './form.context'
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
    gap: 'md',
    invalid: false,
    legendVariant: 'legend',
    separatorSurface: 'background',
  },
  slots: {
    // Field wrapper — groups label + input + description + error
    field: [
      'form-field group/field flex w-full flex-col gap-2',
      '*:w-full [&>.sr-only]:w-auto',
    ],

    // Helper text below the input
    fieldDescription: [
      'form-field-description text-left font-normal text-muted-foreground text-sm leading-normal',
      '[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4',
    ],

    // Error message
    fieldError: 'form-field-error font-normal text-destructive text-sm',

    // Stacked row of fields (e.g. first name + last name)
    fieldGroup:
      'form-field-group @container/field-group flex w-full flex-col gap-5',

    // Fieldset legend
    fieldLegend:
      'form-field-legend mb-1.5 flex items-center gap-1.5 font-medium',

    // Separator wrapper
    fieldSeparator: 'form-field-separator relative my-2 h-5 text-sm',

    // Separator inline text label
    fieldSeparatorContent: [
      'form-field-separator-content relative mx-auto block w-fit',
      'px-2',
      'text-center text-muted-foreground text-sm',
    ],

    // Separator line
    fieldSeparatorLine: [
      'form-field-separator-line absolute inset-x-0 top-1/2',
      'h-px bg-border',
    ],

    // Fieldset — groups related sections with legend
    fieldSet: 'form-field-set flex flex-col gap-4',

    // The box the floating label is pinned to: the control alone. Pinned to
    // the field instead, `top-1/2` measured the description and error too,
    // and a field with helper text rested its label below the input's centre.
    floatingControl: 'form-floating-control relative [&>label]:w-fit',

    floatingLabel: [
      'form-floating-label pointer-events-none absolute top-1/2 left-2.5 z-10 origin-left',
      '-translate-y-1/2 px-1 font-normal text-muted-foreground text-sm',
      'transition-all duration-150',
      'group-focus-within/field:top-0 group-focus-within/field:bg-background',
      'group-focus-within/field:text-foreground group-focus-within/field:text-xs',
      'group-data-[filled]/field:top-0 group-data-[filled]/field:bg-background',
      'group-data-[filled]/field:text-xs',
    ],
    // A form stacks its fields: the vertical rhythm is the form's, so a
    // screen does not wrap its fields in a Flex to space them.
    root: 'form flex flex-col',
  },

  variants: {
    // The same scale as Flex's gap.
    gap: {
      lg: {
        root: 'gap-6',
      },
      md: {
        root: 'gap-4',
      },
      none: {
        root: 'gap-0',
      },
      sm: {
        root: 'gap-2',
      },
    },

    floating: {
      true: {
        field: [
          '[&_input::placeholder]:opacity-0 [&_textarea::placeholder]:opacity-0',
          // `focus-within`, not `group-focus-within/field`: this is the group
          // itself, and a group variant only ever reaches its descendants.
          'focus-within:[&_input::placeholder]:opacity-100',
          'focus-within:[&_textarea::placeholder]:opacity-100',
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
  gap,
  id,
  onSubmit,
}: PropsWithChildren<FormProps>) {
  const { root } = styles({
    gap,
  })

  return (
    <form className={root()} id={id} onSubmit={onSubmit}>
      {children}
    </form>
  )
}

/**
 * The id a direct child element already carries, so a control the field does
 * not wire (a native <input id>) keeps its label on the first render too.
 */
function childId(children: ReactNode): string | undefined {
  const only = Children.toArray(children).filter(isValidElement)
  const first = only.length === 1 ? only[0] : undefined
  const id = (first?.props as { id?: unknown } | undefined)?.id
  return typeof id === 'string' && id ? id : undefined
}

/**
 * The controls a field wires report the id they rendered; the label follows
 * the first one. Anything else in the field keeps the legacy target (`name`).
 * The first control to render also claims the field's generated id, so the
 * very first render (and a server render) already agrees with the label.
 */
function useRegisteredControl() {
  const controls = useRef<(string | null)[]>([])
  const [registered, setRegistered] = useState<string | null>()
  const claimant = useRef<string | null>(null)

  const claimControlId = useCallback((key: string) => {
    if (claimant.current === null) {
      claimant.current = key
    }
    return claimant.current === key
  }, [])

  const releaseControlId = useCallback((key: string) => {
    if (claimant.current === key) {
      claimant.current = null
    }
  }, [])

  const registerControl = useCallback((id: string | null) => {
    controls.current.push(id)
    setRegistered(controls.current[0])
    return () => {
      const at = controls.current.indexOf(id)
      if (at >= 0) {
        controls.current.splice(at, 1)
      }
      setRegistered(controls.current[0])
    }
  }, [])

  return {
    claimControlId,
    registered,
    registerControl,
    releaseControlId,
  }
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

  const baseId = useId()
  const controlId = `${baseId}-control`
  const labelId = `${baseId}-label`
  const descriptionId = description ? `${baseId}-description` : undefined
  const errorId = error ? `${baseId}-error` : undefined
  const {
    claimControlId,
    registered: registeredId,
    registerControl,
    releaseControlId,
  } = useRegisteredControl()

  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(' ') || undefined

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

  const {
    field,
    fieldDescription,
    fieldError,
    floatingControl,
    floatingLabel,
  } = styles({
    floating: labelFloating,
    invalid,
  })

  const labelConfig = label
    ? {
        ...(typeof label === 'string'
          ? {
              content: label,
            }
          : label),
      }
    : undefined

  // The label's target: an explicit `label.htmlFor`, else the id a wired
  // control reported (its explicit id or the one generated here) — none when
  // that control is a group, which names itself with aria-labelledby — else
  // an id a direct child carries, else the legacy `name`, else the generated id.
  const htmlFor =
    labelConfig?.htmlFor ??
    (registeredId === null
      ? undefined
      : (registeredId ?? childId(children) ?? name ?? controlId))
  const labelTextId = labelConfig ? (labelConfig.id ?? labelId) : undefined

  const context = useMemo<FormFieldContextValue>(
    () => ({
      claimControlId,
      controlId,
      describedBy,
      invalid,
      labelTextId,
      registerControl,
      releaseControlId,
    }),
    [
      claimControlId,
      controlId,
      describedBy,
      invalid,
      labelTextId,
      registerControl,
      releaseControlId,
    ],
  )

  const renderedLabel = labelConfig && (
    <ComposedLabel
      {...labelConfig}
      className={labelFloating ? floatingLabel() : undefined}
      htmlFor={htmlFor}
      id={labelTextId}
    >
      {labelConfig.content}
    </ComposedLabel>
  )

  const details = (
    <>
      {description && (
        <p className={fieldDescription()} id={descriptionId}>
          {description}
        </p>
      )}
      {error && (
        <div className={fieldError()} id={errorId} role="alert">
          {error}
        </div>
      )}
    </>
  )

  if (labelFloating) {
    return (
      <FormFieldContext.Provider value={context}>
        <div
          className={field()}
          data-filled={filled ? '' : undefined}
          onInput={syncFilled}
          ref={ref}
        >
          <div className={floatingControl()}>
            {children}
            {renderedLabel}
          </div>
          {details}
        </div>
      </FormFieldContext.Provider>
    )
  }

  return (
    <FormFieldContext.Provider value={context}>
      <div className={field()}>
        {renderedLabel}
        {children}
        {details}
      </div>
    </FormFieldContext.Provider>
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
  const legendId = useId()
  const fieldSetContext = useMemo(
    () => ({
      legendId: legend ? legendId : undefined,
    }),
    [legend, legendId],
  )

  const tooltipProps: TooltipProps | undefined =
    typeof tooltip === 'string'
      ? {
          content: tooltip,
        }
      : tooltip

  return (
    <fieldset className={fieldSet()}>
      {legend && (
        <legend className={fieldLegend()} id={legendId}>
          {legend}
          {tooltipProps && (
            <Tooltip {...tooltipProps}>
              <Info
                className="form-field-legend-tooltip-icon text-muted-foreground"
                size={14}
              />
            </Tooltip>
          )}
        </legend>
      )}
      <FormFieldSetContext.Provider value={fieldSetContext}>
        {children}
      </FormFieldSetContext.Provider>
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
