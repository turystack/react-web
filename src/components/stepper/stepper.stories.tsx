import type { StoryObj } from '@storybook/react-vite'
import { useEffect, useState } from 'react'
import { Input } from '@/components/input'
import { CheckCircle2, CircleDot, User } from '@/internal/icons'

import { Stepper } from './stepper'

const meta = {
  component: Stepper,
  title: 'Feedback/Stepper',
}

export default meta
type Story = StoryObj<typeof meta>

function Field({
  label,
  name,
  defaultValue = '',
}: {
  label: string
  name: string
  defaultValue?: string
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Input defaultValue={defaultValue} name={name} />
    </label>
  )
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-heading font-medium text-base" tabIndex={-1}>
      {children}
    </h3>
  )
}

export const Default: Story = {
  args: {
    active: 0,
  },
  render: () => {
    const [active, setActive] = useState(0)
    return (
      <Stepper active={active} onActiveChange={setActive}>
        <Stepper.Step description="Informações pessoais" label="Dados">
          <div className="flex flex-col gap-3">
            <Heading>Dados pessoais</Heading>
            <Field label="Nome completo" name="name" />
            <Field label="E-mail" name="email" />
          </div>
        </Stepper.Step>
        <Stepper.Step description="Endereço de cobrança" label="Endereço">
          <div className="flex flex-col gap-3">
            <Heading>Endereço</Heading>
            <Field label="CEP" name="zip" />
            <Field label="Logradouro" name="street" />
          </div>
        </Stepper.Step>
        <Stepper.Step description="Confirme e envie" label="Revisão">
          <div className="flex flex-col gap-3">
            <Heading>Revisão</Heading>
            <p className="text-muted-foreground text-sm">
              Confira os dados e finalize o cadastro.
            </p>
          </div>
        </Stepper.Step>
        <Stepper.Completed>
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="size-10 text-primary" />
            <Heading>Tudo pronto!</Heading>
            <p className="text-muted-foreground text-sm">
              Seu cadastro foi concluído com sucesso.
            </p>
          </div>
        </Stepper.Completed>
        <Stepper.Previous />
        <Stepper.Next />
      </Stepper>
    )
  },
}

export const AllowJumpAhead: Story = {
  args: {
    active: 0,
  },
  render: () => {
    const [active, setActive] = useState(0)
    return (
      <Stepper active={active} allowNextStepsSelect onActiveChange={setActive}>
        <Stepper.Step label="Plano">
          <Heading>Escolha o plano</Heading>
        </Stepper.Step>
        <Stepper.Step label="Conta">
          <Heading>Crie sua conta</Heading>
        </Stepper.Step>
        <Stepper.Step label="Pagamento">
          <Heading>Forma de pagamento</Heading>
        </Stepper.Step>
        <Stepper.Previous />
        <Stepper.Next />
      </Stepper>
    )
  },
}

export const Vertical: Story = {
  args: {
    active: 0,
  },
  render: () => {
    const [active, setActive] = useState(0)
    return (
      <Stepper
        active={active}
        onActiveChange={setActive}
        orientation="vertical"
      >
        <Stepper.Step description="Quem você é" label="Identificação">
          <Heading>Identificação</Heading>
        </Stepper.Step>
        <Stepper.Step description="Onde você mora" label="Endereço">
          <Heading>Endereço</Heading>
        </Stepper.Step>
        <Stepper.Step label="Confirmar">
          <Heading>Confirmação</Heading>
        </Stepper.Step>
        <Stepper.Previous />
        <Stepper.Next />
      </Stepper>
    )
  },
}

function CounterPanel({ name }: { name: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setCount((c) => c + 1), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <div className="flex flex-col gap-3">
      <Heading>Painel {name}</Heading>
      <p className="text-muted-foreground text-sm">
        Contador (effect ativo): <strong>{count}s</strong>
      </p>
      <Field label="Texto persistente" name={`${name}-input`} />
    </div>
  )
}

export const KeepMounted: Story = {
  args: {
    active: 0,
  },
  render: () => {
    const [active, setActive] = useState(0)
    return (
      <Stepper active={active} keepMounted onActiveChange={setActive}>
        <Stepper.Step label="A">
          <CounterPanel name="A" />
        </Stepper.Step>
        <Stepper.Step label="B">
          <CounterPanel name="B" />
        </Stepper.Step>
        <Stepper.Step label="C">
          <CounterPanel name="C" />
        </Stepper.Step>
        <Stepper.Previous />
        <Stepper.Next />
      </Stepper>
    )
  },
}

export const CustomIcons: Story = {
  args: {
    active: 0,
  },
  render: () => {
    const [active, setActive] = useState(0)
    return (
      <Stepper
        active={active}
        completedIcon={({ step }) => <CheckCircle2 key={step} />}
        icon={({ state }) =>
          state === 'stepProgress' ? <CircleDot /> : <User />
        }
        onActiveChange={setActive}
        radius="full"
        variant="icon"
      >
        <Stepper.Step label="Perfil">
          <Heading>Perfil</Heading>
        </Stepper.Step>
        <Stepper.Step label="Preferências">
          <Heading>Preferências</Heading>
        </Stepper.Step>
        <Stepper.Step label="Confirmação">
          <Heading>Confirmação</Heading>
        </Stepper.Step>
        <Stepper.Previous />
        <Stepper.Next />
      </Stepper>
    )
  },
}

export const LoadingStep: Story = {
  args: {
    active: 0,
  },
  render: () => {
    const [active, setActive] = useState(1)
    return (
      <Stepper active={active} onActiveChange={setActive}>
        <Stepper.Step label="Pronto" />
        <Stepper.Step description="Processando..." label="Em progresso" loading>
          <Heading>Aguarde</Heading>
        </Stepper.Step>
        <Stepper.Step label="Pendente" />
        <Stepper.Previous />
        <Stepper.Next />
      </Stepper>
    )
  },
}
