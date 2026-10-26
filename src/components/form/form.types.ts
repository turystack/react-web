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
 * - Form stacks its direct children in a column with a vertical rhythm:
 *   gap md (1rem) by default, sm/lg/none on the same scale as Flex — no
 *   wrapping Flex needed to space the fields
 * - Description appears as muted helper text below the input
 * - Form.Field wires its control without the author repeating ids: it
 *   generates an id (useId) and hands it, with the description/error ids
 *   (aria-describedby) and the error state (aria-invalid), to the control
 *   through context. Every control of this package reads it as its default;
 *   an explicit `id`, `aria-describedby` or `aria-invalid` on the control
 *   always wins, and the label follows the id the control actually rendered
 * - Radio/Checkbox groups are not labelable: they are named by the field's
 *   label through aria-labelledby instead (and the label drops its `for`)
 * - A group placed in a Form.FieldSet (outside a labelled Form.Field) is named
 *   by the fieldset's legend the same way; an explicit ariaLabel still wins
 * - A control the field cannot wire (e.g. a native <input>) is labelled by
 *   the `id` it carries as the field's direct child, else by `name`
 *
 * Implementation:
 * - Form renders <form class="flex flex-col"> with onSubmit, an optional id and
 *   gap — the whole contract: no className, style or native form attributes
 *   pass through
 * - An id lets a submit button outside the form submit it: <Button form={id}>
 * - Field renders label (via Label component), children (the input), description, error,
 *   inside a FormFieldContext provider (form.context.ts, internal) read by the
 *   controls through useFormFieldControl
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

export type FormGap = 'none' | 'sm' | 'md' | 'lg'

export type FormProps = {
  gap?: FormGap // space between the form's direct children (Flex's scale); default md
  id?: string // the form's id, for a submit button outside it (`<Button form={id}>`)
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
  name?: string // legacy label target for a control the field cannot wire; not needed otherwise
  description?: React.ReactNode // helper text below the field
  error?: React.ReactNode // error message (renders in error state)
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
