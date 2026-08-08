import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Input } from '@/components/input'
import { PasswordInput } from '@/components/password-input'
import { PhoneInput } from '@/components/phone-input'
import { Select } from '@/components/select'
import { Textarea } from '@/components/textarea'

import { Form } from './form'

const meta = {
  component: Form,
  title: 'Form/Form',
} satisfies Meta<typeof Form>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Form className="w-80 space-y-4">
      <Form.Field
        description="We will never share your email."
        label="Email"
        name="email"
      >
        <Input name="email" placeholder="you@example.com" />
      </Form.Field>
    </Form>
  ),
}

export const WithError: Story = {
  render: () => (
    <Form className="w-80">
      <Form.Field error="This field is required." label="Email" name="email">
        <Input name="email" placeholder="you@example.com" />
      </Form.Field>
    </Form>
  ),
}

export const RichLabel: Story = {
  render: () => (
    <Form className="w-80">
      <Form.Field
        label={{
          content: 'Work email',
          htmlFor: 'work-email',
          required: true,
          tooltip: 'Use your company email address.',
        }}
      >
        <Input
          id="work-email"
          name="work_email"
          placeholder="you@company.com"
        />
      </Form.Field>
    </Form>
  ),
}

export const FieldGroup: Story = {
  render: () => (
    <Form className="w-80">
      <Form.FieldGroup>
        <Form.Field label="First name" name="first_name">
          <Input name="first_name" placeholder="John" />
        </Form.Field>
        <Form.Field label="Last name" name="last_name">
          <Input name="last_name" placeholder="Doe" />
        </Form.Field>
      </Form.FieldGroup>
    </Form>
  ),
}

export const WithFieldSet: Story = {
  render: () => (
    <Form className="w-80 space-y-4">
      <Form.FieldSet legend="Address" tooltip="Your shipping address.">
        <Form.Field label="Street" name="street">
          <Input name="street" placeholder="123 Main St" />
        </Form.Field>
        <Form.Field label="City" name="city">
          <Input name="city" placeholder="São Paulo" />
        </Form.Field>
      </Form.FieldSet>
    </Form>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <Form className="w-80 space-y-4">
      <Form.Field label="Email" name="email">
        <Input name="email" placeholder="you@example.com" />
      </Form.Field>
      <Form.FieldSeparator>or</Form.FieldSeparator>
      <Form.Field label="Username" name="username">
        <Input name="username" placeholder="johndoe" />
      </Form.Field>
    </Form>
  ),
}

const ROLES = [
  {
    label: 'Software Engineer',
    value: 'engineer',
  },
  {
    label: 'Product Manager',
    value: 'pm',
  },
  {
    label: 'Designer',
    value: 'designer',
  },
  {
    label: 'Data Scientist',
    value: 'data',
  },
  {
    label: 'DevOps / SRE',
    value: 'devops',
  },
  {
    label: 'Other',
    value: 'other',
  },
]

const COUNTRIES = [
  {
    label: 'Brazil',
    value: 'BR',
  },
  {
    label: 'United States',
    value: 'US',
  },
  {
    label: 'Portugal',
    value: 'PT',
  },
  {
    label: 'Argentina',
    value: 'AR',
  },
  {
    label: 'Germany',
    value: 'DE',
  },
]

function CreateAccountForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const next: Record<string, string> = {}
    if (!data.get('first_name')) {
      next.first_name = 'First name is required.'
    }
    if (!data.get('last_name')) {
      next.last_name = 'Last name is required.'
    }
    if (!data.get('email')) {
      next.email = 'Email is required.'
    }
    if (!data.get('password')) {
      next.password = 'Password is required.'
    }
    setErrors(next)
  }

  return (
    <Form className="w-full max-w-lg space-y-5" onSubmit={handleSubmit}>
      <Form.FieldGroup>
        <Form.Field
          error={errors.first_name}
          label={{
            content: 'First name',
            htmlFor: 'first_name',
            required: true,
          }}
        >
          <Input id="first_name" name="first_name" placeholder="John" />
        </Form.Field>
        <Form.Field
          error={errors.last_name}
          label={{
            content: 'Last name',
            htmlFor: 'last_name',
            required: true,
          }}
        >
          <Input id="last_name" name="last_name" placeholder="Doe" />
        </Form.Field>
      </Form.FieldGroup>

      <Form.Field
        description="We will never share your email."
        error={errors.email}
        label={{
          content: 'Work email',
          htmlFor: 'email',
          required: true,
        }}
      >
        <Input id="email" name="email" placeholder="you@company.com" />
      </Form.Field>

      <Form.Field
        error={errors.password}
        label={{
          content: 'Password',
          htmlFor: 'password',
          required: true,
          tooltip: 'Minimum 8 characters.',
        }}
      >
        <PasswordInput
          id="password"
          name="password"
          placeholder="••••••••"
          showStrength
        />
      </Form.Field>

      <Form.Field
        label={{
          content: 'Phone',
          htmlFor: 'phone',
          optional: true,
        }}
      >
        <PhoneInput id="phone" name="phone" placeholder="(00) 00000-0000" />
      </Form.Field>

      <Form.Field
        label={{
          content: 'Role',
          htmlFor: 'role',
        }}
      >
        <Select
          mode="single"
          optionLabel="label"
          options={ROLES}
          optionValue="value"
          placeholder="Select your role…"
        />
      </Form.Field>

      <Form.FieldSeparator>billing address</Form.FieldSeparator>

      <Form.FieldSet legend="Address" tooltip="Used for billing purposes.">
        <Form.Field
          label={{
            content: 'Country',
            htmlFor: 'country',
          }}
        >
          <Select
            mode="single"
            optionLabel="label"
            options={COUNTRIES}
            optionValue="value"
            placeholder="Select country…"
            searchable
          />
        </Form.Field>
        <Form.FieldGroup>
          <Form.Field label="City" name="city">
            <Input name="city" placeholder="São Paulo" />
          </Form.Field>
          <Form.Field label="ZIP code" name="zip">
            <Input name="zip" placeholder="01310-100" />
          </Form.Field>
        </Form.FieldGroup>
      </Form.FieldSet>

      <Form.Field
        description="Tell us a bit about yourself."
        label={{
          content: 'Bio',
          htmlFor: 'bio',
          optional: true,
        }}
      >
        <Textarea
          id="bio"
          maxLength={300}
          name="bio"
          placeholder="I build things…"
        />
      </Form.Field>

      <Form.Field label="Terms">
        <Checkbox label="I agree to the Terms of Service and Privacy Policy." />
      </Form.Field>

      <Button block type="submit">
        Create account
      </Button>
    </Form>
  )
}

export const CompleteForm: Story = {
  render: () => <CreateAccountForm />,
}
