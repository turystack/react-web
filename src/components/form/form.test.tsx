import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

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

  it('forwards native form attributes', () => {
    render(
      <Form aria-label="Checkout" id="checkout">
        <button type="submit">Save</button>
      </Form>,
    )

    expect(screen.getByRole('form', { name: 'Checkout' })).toHaveAttribute(
      'id',
      'checkout',
    )
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
