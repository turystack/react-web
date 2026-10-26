import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from '@/components/checkbox'
import { ColorPicker } from '@/components/color-picker'
import { CurrencyInput } from '@/components/currency-input'
import { DateInput } from '@/components/date-input'
import { DateTimeInput } from '@/components/date-time-input'
import { Input } from '@/components/input'
import { MaskInput } from '@/components/mask-input'
import { NumberInput } from '@/components/number-input'
import { OTPInput } from '@/components/otp-input'
import { PasswordInput } from '@/components/password-input'
import { Radio } from '@/components/radio'
import { SegmentedControl } from '@/components/segmented-control'
import { Select } from '@/components/select'
import { Slider } from '@/components/slider'
import { Switch } from '@/components/switch'
import { TagsInput } from '@/components/tags-input'
import { Textarea } from '@/components/textarea'
import { TimeInput } from '@/components/time-input'

import { Form } from './form'

describe('Form', () => {
  it('fires onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <Form onSubmit={onSubmit}>
        <button type="submit">Save</button>
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('is submitted by a button outside it that names its id', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault())
    render(
      <>
        <Form id="checkout" onSubmit={onSubmit}>
          <input aria-label="Coupon" name="coupon" />
        </Form>
        <button form="checkout" type="submit">
          Pay
        </button>
      </>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Pay' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('renders no id when none is given', () => {
    render(
      <Form>
        <input aria-label="Coupon" name="coupon" />
      </Form>,
    )

    expect(
      screen.getByRole('textbox', { name: 'Coupon' }).closest('form'),
    ).not.toHaveAttribute('id')
  })

  it('stacks its children with the md rhythm by default', () => {
    render(
      <Form>
        <input aria-label="Coupon" />
      </Form>,
    )

    const form = screen.getByRole('textbox').closest('form')
    expect(form).toHaveClass('form', 'flex', 'flex-col', 'gap-4')
  })

  it.each([
    ['none', 'gap-0'],
    ['sm', 'gap-2'],
    ['md', 'gap-4'],
    ['lg', 'gap-6'],
  ] as const)('takes the %s gap', (gap, token) => {
    render(
      <Form gap={gap}>
        <input aria-label="Coupon" />
      </Form>,
    )

    const form = screen.getByRole('textbox').closest('form')
    expect(form).toHaveClass(token)
    for (const other of ['gap-0', 'gap-2', 'gap-4', 'gap-6']) {
      if (other !== token) {
        expect(form).not.toHaveClass(other)
      }
    }
  })

  it('submits without a handler', async () => {
    render(
      <Form>
        <button type="submit">Save</button>
      </Form>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled()
  })
})

describe('Form.Field', () => {
  it('names the input it wraps', () => {
    render(
      <Form.Field label="Email" name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'))
  })

  it('marks the input as required through a rich label', () => {
    render(
      <Form.Field
        label={{
          content: 'Email',
          required: true,
        }}
        name="email"
      >
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByRole('textbox', { name: 'Email*' })).toBeInTheDocument()
  })

  it('lets the rich label point at another input', () => {
    render(
      <Form.Field
        label={{
          content: 'Email',
          htmlFor: 'contact-email',
        }}
        name="email"
      >
        <input id="contact-email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByLabelText('Email')).toHaveAttribute(
      'id',
      'contact-email',
    )
  })

  it('renders the input alone when it has no label', () => {
    render(
      <Form.Field>
        <input aria-label="Email" />
      </Form.Field>,
    )

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })

  it('shows the helper text', () => {
    render(
      <Form.Field description="Your work email" label="Email" name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByText('Your work email')).toBeInTheDocument()
  })

  it('announces the error as an alert', () => {
    const { rerender } = render(
      <Form.Field label="Email" name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    rerender(
      <Form.Field error="Required field" label="Email" name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Required field')
  })
})

describe('Form.Field floating label', () => {
  it('paints the label as a floating label only when asked', () => {
    const { rerender } = render(
      <Form.Field label="Email" labelFloating name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByText('Email').closest('label')).toHaveClass(
      'form-floating-label',
      'label-root',
    )

    rerender(
      <Form.Field label="Email" name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByText('Email').closest('label')).not.toHaveClass(
      'form-floating-label',
    )
  })

  it('still names the input it wraps', () => {
    render(
      <Form.Field label="Email" labelFloating name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'))
  })

  it('reports the field as filled once the user types', async () => {
    render(
      <Form.Field label="Email" labelFloating name="email">
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(document.querySelector('[data-filled]')).toBeNull()

    await userEvent.type(screen.getByRole('textbox'), 'a')

    expect(document.querySelector('[data-filled]')).toContainElement(
      screen.getByRole('textbox'),
    )
  })

  it('reports the field as filled when it starts with a value', () => {
    render(
      <Form.Field label="Email" labelFloating name="email">
        <input defaultValue="me@work.com" id="email" name="email" />
      </Form.Field>,
    )

    expect(document.querySelector('[data-filled]')).toContainElement(
      screen.getByRole('textbox'),
    )
  })

  it('reports the field as empty again once it is cleared', async () => {
    render(
      <Form.Field label="Email" labelFloating name="email">
        <input defaultValue="me@work.com" id="email" name="email" />
      </Form.Field>,
    )

    await userEvent.clear(screen.getByRole('textbox'))

    expect(document.querySelector('[data-filled]')).toBeNull()
  })

  it('carries the helper text and the error while floating', () => {
    render(
      <Form.Field
        description="Your work email"
        error="Required field"
        label="Email"
        labelFloating
        name="email"
      >
        <input id="email" name="email" />
      </Form.Field>,
    )

    expect(screen.getByText('Your work email')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Required field')
  })

  // The label centres on `top-1/2` of its positioned box. Were that box the
  // whole field, helper text would push the resting label below the input.
  it('pins the label to a box holding the control alone', () => {
    render(
      <Form.Field
        description="Your work email"
        error="Required field"
        label="Email"
        labelFloating
        name="email"
      >
        <input id="email" name="email" />
      </Form.Field>,
    )

    const box = screen.getByRole('textbox').parentElement

    expect(box).toHaveClass('form-floating-control', 'relative')
    expect(box).toContainElement(screen.getByText('Email'))
    expect(box).not.toContainElement(screen.getByText('Your work email'))
    expect(box).not.toContainElement(screen.getByRole('alert'))
  })

  it('renders the input alone when a floating field has no label', () => {
    render(
      <Form.Field labelFloating>
        <input aria-label="Email" />
      </Form.Field>,
    )

    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  })
})

describe('Form.FieldGroup', () => {
  it('keeps every grouped field reachable', () => {
    render(
      <Form.FieldGroup>
        <Form.Field label="First name" name="first">
          <input id="first" name="first" />
        </Form.Field>
        <Form.Field label="Last name" name="last">
          <input id="last" name="last" />
        </Form.Field>
      </Form.FieldGroup>,
    )

    expect(screen.getByLabelText('First name')).toBeInTheDocument()
    expect(screen.getByLabelText('Last name')).toBeInTheDocument()
  })
})

describe('Form.FieldSet', () => {
  it('names the group with its legend', () => {
    render(
      <Form.FieldSet legend="Address">
        <input aria-label="Street" />
      </Form.FieldSet>,
    )

    expect(screen.getByRole('group', { name: 'Address' })).toBeInTheDocument()
  })

  it('groups the fields even without a legend', () => {
    render(
      <Form.FieldSet>
        <input aria-label="Street" />
      </Form.FieldSet>,
    )

    expect(screen.getByRole('group')).toContainElement(
      screen.getByRole('textbox'),
    )
  })

  it('explains the legend through a tooltip given as text', async () => {
    render(
      <Form.FieldSet legend="Address" tooltip="Shipping address">
        <input aria-label="Street" />
      </Form.FieldSet>,
    )

    await userEvent.hover(screen.getByTestId('tooltip-trigger'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Shipping address',
    )
  })

  it('explains the legend through a configured tooltip', async () => {
    render(
      <Form.FieldSet
        legend="Address"
        tooltip={{
          content: 'Shipping address',
          side: 'right',
        }}
      >
        <input aria-label="Street" />
      </Form.FieldSet>,
    )

    await userEvent.hover(screen.getByTestId('tooltip-trigger'))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Shipping address',
    )
  })
})

describe('Form.FieldSet naming a group', () => {
  const plans = [
    {
      label: 'Monthly',
      value: 'monthly',
    },
    {
      label: 'Yearly',
      value: 'yearly',
    },
  ]

  it('names a Radio.Group with its legend', () => {
    render(
      <Form.FieldSet legend="Plan">
        <Radio.Group items={plans} />
      </Form.FieldSet>,
    )

    const group = screen.getByRole('radiogroup', { name: 'Plan' })
    expect(group).toHaveAttribute(
      'aria-labelledby',
      screen.getByText('Plan').id,
    )
  })

  it('names a Checkbox.Group with its legend', () => {
    render(
      <Form.FieldSet legend="Channels">
        <Checkbox.Group items={plans} />
      </Form.FieldSet>,
    )

    const groups = screen.getAllByRole('group', { name: 'Channels' })
    // The fieldset itself and the Checkbox.Group inside it.
    expect(groups.map((group) => group.dataset.testid)).toContain(
      'checkbox-group',
    )
    // The boxes keep their own names.
    expect(
      screen.getByRole('checkbox', { name: 'Monthly' }),
    ).toBeInTheDocument()
  })

  it('lets an explicit ariaLabel win over the legend', () => {
    render(
      <Form.FieldSet legend="Plan">
        <Radio.Group ariaLabel="Billing plan" items={plans} />
      </Form.FieldSet>,
    )

    const group = screen.getByRole('radiogroup', { name: 'Billing plan' })
    expect(group).not.toHaveAttribute('aria-labelledby')
  })

  it('names nothing without a legend', () => {
    render(
      <Form.FieldSet>
        <Radio.Group items={plans} />
      </Form.FieldSet>,
    )

    expect(screen.getByRole('radiogroup')).not.toHaveAttribute(
      'aria-labelledby',
    )
  })

  it('leaves a labelled Form.Field inside it to name its own group', () => {
    render(
      <Form.FieldSet legend="Billing">
        <Form.Field label="Plan">
          <Radio.Group items={plans} />
        </Form.Field>
      </Form.FieldSet>,
    )

    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
  })

  it('does not prepend the legend to a Switch with its own label', () => {
    render(
      <Form.FieldSet legend="Notifications">
        <Switch label="Email me" />
      </Form.FieldSet>,
    )

    expect(screen.getByRole('switch', { name: 'Email me' })).toBeInTheDocument()
  })
})

describe('Form.FieldSeparator', () => {
  it('splits the form without a label', () => {
    render(<Form.FieldSeparator />)

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('shows the label it was given', () => {
    render(<Form.FieldSeparator>or</Form.FieldSeparator>)

    expect(screen.getByRole('separator')).toBeInTheDocument()
    expect(screen.getByText('or')).toBeInTheDocument()
  })
})

describe.each(['background', 'card', 'transparent'] as const)(
  'Form.FieldSeparator surface %s',
  (surface) => {
    it('keeps the label readable', () => {
      render(<Form.FieldSeparator surface={surface}>or</Form.FieldSeparator>)

      expect(screen.getByText('or')).toBeInTheDocument()
    })
  },
)

const fruits = [
  {
    id: 'a1',
    name: 'Apple',
  },
  {
    id: 'b2',
    name: 'Banana',
  },
]

const describedBy = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent)

describe('Form.Field wiring', () => {
  it('names an Input without an id or a name on either side', () => {
    render(
      <Form.Field label="Email">
        <Input />
      </Form.Field>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input.id).not.toBe('')
    expect(screen.getByText('Email').closest('label')).toHaveAttribute(
      'for',
      input.id,
    )
  })

  it('describes the control with the description and the error, and marks it invalid', () => {
    render(
      <Form.Field description="Your work email" error="Required" label="Email">
        <Input />
      </Form.Field>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(describedBy(input)).toEqual(['Your work email', 'Required'])
    expect(input).toHaveAccessibleDescription('Your work email Required')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('leaves a valid field without a description undescribed and valid', () => {
    render(
      <Form.Field label="Email">
        <Input />
      </Form.Field>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('follows the error as it comes and goes', () => {
    const { rerender } = render(
      <Form.Field label="Email">
        <Input />
      </Form.Field>,
    )
    rerender(
      <Form.Field error="Required" label="Email">
        <Input />
      </Form.Field>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription('Required')

    rerender(
      <Form.Field label="Email">
        <Input />
      </Form.Field>,
    )
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('lets an explicit id, description and invalid state win', () => {
    render(
      <>
        <span id="own-hint">Own hint</span>
        <Form.Field error="Required" label="Email">
          <Input aria-describedby="own-hint" aria-invalid={false} id="email" />
        </Form.Field>
      </>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAttribute('id', 'email')
    expect(screen.getByText('Email').closest('label')).toHaveAttribute(
      'for',
      'email',
    )
    expect(input).toHaveAccessibleDescription('Own hint')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('keeps an explicit id on a control nested deeper in the field', () => {
    render(
      <Form.Field label="Notes">
        <div>
          <Textarea id="notes" />
        </div>
      </Form.Field>,
    )

    expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveAttribute(
      'id',
      'notes',
    )
  })

  it('still labels the legacy id={name} a native input carries', () => {
    render(
      <Form.Field label="Email" name="email">
        <div>
          <input id="email" />
        </div>
      </Form.Field>,
    )

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'id',
      'email',
    )
  })

  it('labels the id a native direct child carries', () => {
    render(
      <Form.Field label="Email">
        <input id="contact" />
      </Form.Field>,
    )

    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'id',
      'contact',
    )
  })

  it('never gives two controls in one field the same id', () => {
    render(
      <Form.Field label="Name">
        <Input placeholder="First" />
        <Input placeholder="Last" />
      </Form.Field>,
    )

    const first = screen.getByPlaceholderText('First')
    const last = screen.getByPlaceholderText('Last')
    expect(first.id).not.toBe('')
    expect(last.id).not.toBe('')
    expect(first.id).not.toBe(last.id)
    expect(first).toHaveAccessibleName('Name')
    expect(last).not.toHaveAccessibleName('Name')
  })

  it('gives each field its own id', () => {
    render(
      <>
        <Form.Field label="First">
          <Input />
        </Form.Field>
        <Form.Field label="Second">
          <Input />
        </Form.Field>
      </>,
    )

    const first = screen.getByRole('textbox', { name: 'First' })
    const second = screen.getByRole('textbox', { name: 'Second' })
    expect(first.id).not.toBe(second.id)
  })

  it('wires nothing outside a field', () => {
    render(<Input ariaLabel="Email" />)

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).not.toHaveAttribute('id')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('wires a floating-label field too', () => {
    render(
      <Form.Field error="Required" label="Email" labelFloating>
        <Input />
      </Form.Field>,
    )

    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input).toHaveAccessibleDescription('Required')
  })

  it.each([
    ['Textarea', <Textarea key="c" />],
    ['NumberInput', <NumberInput key="c" />],
    ['MaskInput', <MaskInput key="c" mask="000.000.000-00" />],
    ['CurrencyInput', <CurrencyInput key="c" />],
    ['TagsInput', <TagsInput key="c" />],
    ['DateInput', <DateInput key="c" />],
  ])('names, describes and invalidates a %s', (_name, control) => {
    render(
      <Form.Field description="Hint" error="Wrong" label="Value">
        {control}
      </Form.Field>,
    )

    const field = screen.getByRole('textbox', { name: 'Value' })
    expect(field).toHaveAccessibleDescription('Hint Wrong')
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })

  it('names a DateTimeInput, and not the time field inside its popup', async () => {
    render(
      <Form.Field error="Wrong" label="Starts">
        <DateTimeInput />
      </Form.Field>,
    )

    const field = screen.getByRole('textbox', { name: 'Starts' })
    expect(field).toHaveAccessibleDescription('Wrong')

    await userEvent.click(field)

    const time = await screen.findByTestId('time-input-field')
    expect(time).not.toHaveAttribute('aria-labelledby')
    expect(time).not.toHaveAttribute('aria-describedby')
    expect(screen.getAllByRole('textbox', { name: 'Starts' })).toHaveLength(1)
  })

  it('names a CurrencyInput range, and not the bounds inside its popup', async () => {
    render(
      <Form.Field error="Wrong" label="Budget">
        <CurrencyInput mode="range" />
      </Form.Field>,
    )

    const field = screen.getByRole('textbox', { name: 'Budget' })
    await userEvent.click(field)

    const bounds = await screen.findAllByTestId('currency-input-field')
    for (const bound of bounds) {
      expect(bound).not.toHaveAttribute('aria-describedby')
      expect(bound.id).not.toBe(field.id)
    }
    expect(screen.getAllByRole('textbox', { name: 'Budget' })).toHaveLength(1)
  })

  it('names a PasswordInput', () => {
    render(
      <Form.Field error="Wrong" label="Password">
        <PasswordInput />
      </Form.Field>,
    )

    const field = screen.getByLabelText('Password')
    expect(field.tagName).toBe('INPUT')
    expect(field).toHaveAccessibleDescription('Wrong')
  })

  it('names an OTPInput', () => {
    render(
      <Form.Field error="Wrong" label="Code">
        <OTPInput />
      </Form.Field>,
    )

    const field = screen.getByLabelText('Code')
    expect(field.tagName).toBe('INPUT')
    expect(field).toHaveAccessibleDescription('Wrong')
    expect(field).toHaveAttribute('aria-invalid', 'true')
  })

  it.each([
    ['single', { mode: 'single' as const }],
    ['searchable', { mode: 'single' as const, searchable: true }],
    ['multiple', { mode: 'multiple' as const }],
  ])('names a %s Select trigger', (_name, extra) => {
    render(
      <Form.Field description="Pick one" error="Wrong" label="Fruit">
        <Select
          optionLabel="name"
          optionValue="id"
          options={fruits}
          {...extra}
        />
      </Form.Field>,
    )

    const trigger = screen.getByRole('combobox', { name: 'Fruit' })
    expect(trigger).toHaveAccessibleDescription('Pick one Wrong')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
  })

  it('lets an explicit Select id win', () => {
    render(
      <Form.Field label="Fruit">
        <Select
          id="fruit"
          mode="single"
          optionLabel="name"
          optionValue="id"
          options={fruits}
        />
      </Form.Field>,
    )

    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveAttribute(
      'id',
      'fruit',
    )
  })

  it('names a Switch alongside its own label', () => {
    render(
      <Form.Field error="Required" label="Notifications">
        <Switch label="Email me" />
      </Form.Field>,
    )

    const control = screen.getByRole('switch')
    expect(control).toHaveAccessibleName('Notifications Email me')
    expect(control).toHaveAccessibleDescription('Required')
    expect(control).toHaveAttribute('aria-invalid', 'true')
  })

  it('names a Switch with no label of its own through the field id', () => {
    render(
      <Form.Field label="Notifications">
        <Switch />
      </Form.Field>,
    )

    expect(
      screen.getByRole('switch', { name: 'Notifications' }),
    ).toBeInTheDocument()
    // The label points at the id the switch reported, which exists.
    const target = screen
      .getByText('Notifications')
      .closest('label')
      ?.getAttribute('for')
    expect(target && document.getElementById(target)).toBeTruthy()
  })

  it('names a ColorPicker trigger', () => {
    render(
      <Form.Field error="Required" label="Brand colour">
        <ColorPicker />
      </Form.Field>,
    )

    const trigger = screen.getByRole('button', { name: /^Brand colour/ })
    expect(trigger).toHaveAttribute('data-testid', 'color-picker-trigger')
    expect(trigger).toHaveAccessibleDescription('Required')
    expect(trigger).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('Form.Field wiring a group', () => {
  it('names a Radio.Group through aria-labelledby, with no dangling for', () => {
    render(
      <Form.Field description="Pick one" error="Required" label="Plan">
        <Radio.Group
          items={[
            {
              label: 'Monthly',
              value: 'monthly',
            },
            {
              label: 'Yearly',
              value: 'yearly',
            },
          ]}
        />
      </Form.Field>,
    )

    const group = screen.getByRole('radiogroup', { name: 'Plan' })
    expect(group).toHaveAccessibleDescription('Pick one Required')
    expect(group).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Plan').closest('label')).not.toHaveAttribute('for')
    // The radios keep their own names; none took the field's.
    expect(screen.getByRole('radio', { name: 'Monthly' })).not.toHaveAttribute(
      'aria-describedby',
    )
  })

  it('names a Checkbox.Group through aria-labelledby, and not its boxes', () => {
    render(
      <Form.Field error="Required" label="Channels">
        <Checkbox.Group
          items={[
            {
              label: 'Email',
              value: 'email',
            },
            {
              label: 'SMS',
              value: 'sms',
            },
          ]}
        />
      </Form.Field>,
    )

    const group = screen.getByRole('group', { name: 'Channels' })
    expect(group).toHaveAccessibleDescription('Required')
    expect(screen.getByText('Channels').closest('label')).not.toHaveAttribute(
      'for',
    )
    const email = screen.getByRole('checkbox', { name: 'Email' })
    expect(email).not.toHaveAttribute('id', expect.stringContaining('control'))
    expect(email).not.toHaveAttribute('aria-describedby')
    // The group's verdict still reaches every box.
    expect(email).toHaveAttribute('aria-invalid', 'true')
  })

  it('lets a group ariaLabel win over the field label', () => {
    render(
      <Form.Field label="Plan">
        <Radio.Group
          ariaLabel="Billing plan"
          items={[
            {
              label: 'Monthly',
              value: 'monthly',
            },
          ]}
        />
      </Form.Field>,
    )

    expect(
      screen.getByRole('radiogroup', { name: 'Billing plan' }),
    ).not.toHaveAttribute('aria-labelledby')
  })

  it('names a Checkbox without a label of its own', () => {
    render(
      <Form.Field error="Required" label="Accept the terms">
        <Checkbox />
      </Form.Field>,
    )

    const box = screen.getByRole('checkbox', { name: 'Accept the terms' })
    expect(box).toHaveAccessibleDescription('Required')
    expect(box).toHaveAttribute('aria-invalid', 'true')
  })

  it('names a SegmentedControl', () => {
    render(
      <Form.Field label="View">
        <SegmentedControl
          optionLabel="name"
          optionValue="id"
          options={fruits}
        />
      </Form.Field>,
    )

    expect(screen.getByRole('radiogroup', { name: 'View' })).toBeInTheDocument()
  })

  it('names a TimeInput group', () => {
    render(
      <Form.Field error="Wrong" label="Starts at">
        <TimeInput />
      </Form.Field>,
    )

    const group = screen.getByRole('group', { name: 'Starts at' })
    expect(group).toHaveAccessibleDescription('Wrong')
  })

  // A range Slider is the group; a single Slider has no group — its thumb is
  // named by the field (covered in slider.test.tsx, the thumb is hidden in jsdom).
  it('names a range Slider group', () => {
    render(
      <Form.Field description="0 to 100" label="Volume">
        <Slider mode="range" orientation="horizontal" />
      </Form.Field>,
    )

    const group = screen.getByRole('group', { name: 'Volume' })
    expect(group).toHaveAccessibleDescription('0 to 100')
  })

  it('draws no group around a single Slider', () => {
    render(
      <Form.Field label="Volume">
        <Slider mode="single" orientation="horizontal" />
      </Form.Field>,
    )

    expect(screen.queryByRole('group')).not.toBeInTheDocument()
  })
})
