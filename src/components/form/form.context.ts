import {
  createContext,
  createElement,
  type ReactNode,
  useContext,
  useId,
  useLayoutEffect,
} from 'react'

/**
 * What a `Form.Field` hands the control inside it, so the label, the
 * description and the error reach the control without the author repeating an
 * id on both sides. Internal: the controls of this package read it through
 * `useFormFieldControl`; it is not exported from the package.
 */
export type FormFieldContextValue = {
  controlId: string // the id the field generated for its control
  claimControlId: (key: string) => boolean // the first control to ask takes controlId
  releaseControlId: (key: string) => void // the claimant unmounted
  describedBy?: string // ids of the description and the error, when rendered
  invalid: boolean // the field shows an error
  labelTextId?: string // id of the label's text, for a group's aria-labelledby
  registerControl: (id: string | null) => () => void // a control reports the id it rendered (null: a group, which a <label for> cannot name)
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null,
)

/**
 * What a `Form.FieldSet` hands the groups inside it: the id of its legend, so
 * a Radio.Group or Checkbox.Group placed directly in the fieldset is named by
 * the legend without the screen repeating it as `ariaLabel`.
 */
export type FormFieldSetContextValue = {
  legendId?: string // id of the fieldset's <legend>, when it has one
}

export const FormFieldSetContext =
  createContext<FormFieldSetContextValue | null>(null)

/**
 * Cuts the field's wiring off below a group: the boxes of a Checkbox.Group or
 * the radios of a Radio.Group are not the field's control — the group is.
 */
export function FormFieldReset({ children }: { children: ReactNode }) {
  return createElement(
    FormFieldSetContext.Provider,
    {
      value: null,
    },
    createElement(
      FormFieldContext.Provider,
      {
        value: null,
      },
      children,
    ),
  )
}

type FormFieldControlInput = {
  id?: string // the control's explicit id — always wins over the field's
  describedBy?: string // the control's explicit aria-describedby — wins
  invalid?: boolean // the control's explicit aria-invalid — wins
}

type FormFieldControlOptions = {
  /**
   * A labelable element (input, textarea, button) takes the field's id and
   * reports it, so the `<label htmlFor>` follows it. A group (radio, checkbox
   * group) is not labelable: it takes no id and is named by `labelledBy`.
   */
  labelable?: boolean
}

export type FormFieldControl = {
  id?: string // explicit id, else the field's generated id (labelable only)
  describedBy?: string // explicit, else the field's description/error ids
  invalid?: boolean // explicit (false included), else true when the field shows an error
  labelledBy?: string // the field's label id, else the fieldset's legend id (for groups)
  inField: boolean // inside a Form.Field (not only a Form.FieldSet)
}

/**
 * The control's side of Form.Field wiring: one call, and an explicit prop
 * always wins. Outside a Form.Field it returns the explicit values unchanged
 * (plus, inside a Form.FieldSet, the legend's id as `labelledBy`).
 */
export function useFormFieldControl(
  explicit: FormFieldControlInput,
  { labelable = true }: FormFieldControlOptions = {},
): FormFieldControl {
  const field = useContext(FormFieldContext)
  const fieldSet = useContext(FormFieldSetContext)
  const key = useId()

  // The first wired control takes the field's id; a second control in the
  // same field gets an id of its own, so two never share one.
  let fieldId: string | undefined
  if (field && labelable && explicit.id === undefined) {
    fieldId = field.claimControlId(key) ? field.controlId : `${key}-control`
  }
  const id = explicit.id ?? fieldId
  const register = field?.registerControl
  const claim = field?.claimControlId
  const release = field?.releaseControlId
  const claimed = fieldId !== undefined && fieldId === field?.controlId

  // Reports what the label can point at: this control's id, or null for a
  // group — the label then drops its dangling `for` and names the group
  // through aria-labelledby instead.
  const target = labelable ? (id ?? null) : null
  useLayoutEffect(() => {
    if (!register) {
      return
    }
    return register(target)
  }, [register, target])

  // Holds the claim while mounted — re-taken on mount so a StrictMode
  // remount does not leave the field's id free for a second control.
  useLayoutEffect(() => {
    if (!claim || !release || !claimed) {
      return
    }
    claim(key)
    return () => release(key)
  }, [claim, release, key, claimed])

  return {
    describedBy: explicit.describedBy ?? field?.describedBy,
    id,
    invalid: explicit.invalid ?? (field?.invalid ? true : undefined),
    inField: field !== null,
    labelledBy: field?.labelTextId ?? fieldSet?.legendId,
  }
}
