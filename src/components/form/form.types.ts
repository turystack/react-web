/**
 * Form
 *
 * Form container with Field and FieldSet sub-components for structured
 * form layouts with labels, descriptions, and error messages.
 *
 * Behavior:
 * - Form.Field wraps an input with label, description, and error display
 * - labelFloating enables floating label animation (label moves up on focus/fill)
 * - Error prop renders error message below the field with destructive styling
 * - Form.FieldGroup groups multiple fields in a column layout (e.g. name + surname)
 * - Form.FieldSet groups related fields with a legend and optional tooltip
 * - Description appears as muted helper text below the input
 *
 * Implementation:
 * - Form renders <form> with onSubmit handler
 * - Field renders label (via Label component), children (the input), description, error
 * - FieldGroup renders a <div> grouping multiple Form.Fields
 * - FieldSet renders <fieldset> with <legend> and Tooltip integration
 * - <Form onSubmit={handleSubmit}>
 *     <Form.FieldGroup>
 *       <Form.Field label="First name"><Input name="first_name" /></Form.Field>
 *       <Form.Field label="Last name"><Input name="last_name" /></Form.Field>
 *     </Form.FieldGroup>
 *     <Form.Field label="Email" error={errors.email} description="Your work email">
 *       <Input name="email" />
 *     </Form.Field>
 *     <Form.FieldSet legend="Address" tooltip="Shipping address">
 *       <Input name="street" />
 *     </Form.FieldSet>
 *   </Form>
 *
 * Dependencies: Label component, Tooltip component
 */

import type { LabelProps } from '@/components/label'
import type { TooltipProps } from '@/components/tooltip'

export type FormProps = {
  onSubmit?: React.FormEventHandler<HTMLFormElement> // form submission handler
}

export type FormFieldLabelInput =
  | string
  | (LabelProps & {
      content: string
    })

export type FormFieldProps = {
  label?: FormFieldLabelInput // field label (string or rich label config)
  labelFloating?: boolean // enables floating label animation
  name?: string // input name for form data
  description?: React.ReactNode // helper text below the field
  error?: React.ReactNode // error message (renders in error state)
}

export type FormFieldLabelProps = {
  htmlFor?: string // associates with input id
  required?: boolean // shows required indicator
  optional?: boolean // shows optional text
  disabled?: boolean // applies disabled styling
  tooltip?: React.ReactNode // tooltip next to label
}

export type FormFieldGroupProps = {
  children: React.ReactNode
}

export type FormFieldSeparatorSurface = 'background' | 'card' | 'transparent'

export type FormFieldSeparatorProps = {
  children?: React.ReactNode // optional label text shown centered on the separator
  surface?: FormFieldSeparatorSurface // background behind the inline label
}

export type FormFieldSetTooltip = string | TooltipProps

export type FormFieldSetProps = {
  legend?: string // fieldset legend text
  tooltip?: FormFieldSetTooltip // tooltip on the legend
}
