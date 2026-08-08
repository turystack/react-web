import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { Input } from '@/components/input'
import { Eye, EyeOff } from '@/internal/icons'

import type {
  PasswordInputProps,
  PasswordStrengthLevel,
} from './password-input.types'

const passwordInput = tv({
  slots: {
    root: 'password-input-root flex flex-col gap-2',
    strengthBar:
      'password-input-strength-bar h-1 flex-1 rounded-full transition-colors',
    strengthBars: 'password-input-strength-bars flex gap-1',
    strengthFooter:
      'password-input-strength-footer flex items-center justify-between',
    strengthLabel:
      'password-input-strength-label text-muted-foreground text-xs',
  },
})

const strengthLevelLabels: Record<PasswordStrengthLevel, string> = {
  medium: 'Medium',
  strong: 'Strong',
  'very-strong': 'Very strong',
  'very-weak': 'Very weak',
  weak: 'Weak',
}

const strengthLevelColors: Record<PasswordStrengthLevel, string> = {
  medium: 'bg-yellow-500',
  strong: 'bg-green-500',
  'very-strong': 'bg-emerald-500',
  'very-weak': 'bg-red-500',
  weak: 'bg-orange-500',
}

const strengthLevelScore: Record<PasswordStrengthLevel, number> = {
  medium: 3,
  strong: 4,
  'very-strong': 5,
  'very-weak': 1,
  weak: 2,
}

function getStrengthLevel(password: string): PasswordStrengthLevel {
  let score = 0
  if (password.length >= 8) {
    score++
  }
  if (/[A-Z]/.test(password)) {
    score++
  }
  if (/[a-z]/.test(password)) {
    score++
  }
  if (/[0-9]/.test(password)) {
    score++
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score++
  }

  if (score <= 1) {
    return 'very-weak'
  }
  if (score === 2) {
    return 'weak'
  }
  if (score === 3) {
    return 'medium'
  }
  if (score === 4) {
    return 'strong'
  }
  return 'very-strong'
}

function PasswordInput({
  showStrength,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  const { root, strengthBars, strengthBar, strengthFooter, strengthLabel } =
    passwordInput()

  const level = showStrength && value ? getStrengthLevel(value) : null
  const score = level ? strengthLevelScore[level] : 0
  const activeColor = level ? strengthLevelColors[level] : 'bg-muted'

  const toggle = (
    <button
      className="pointer-events-auto flex cursor-pointer items-center text-muted-foreground hover:text-foreground"
      onClick={() => setVisible((v) => !v)}
      tabIndex={-1}
      type="button"
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div className={root()} data-testid="password-input-root">
      <Input
        {...props}
        onChange={onChange}
        rightSection={toggle}
        type={visible ? 'text' : 'password'}
        value={value}
      />
      {showStrength && (
        <>
          <div
            className={strengthBars()}
            data-testid="password-input-strength-bars"
          >
            {Array.from(
              {
                length: 5,
              },
              (_, i) => (
                <div
                  className={strengthBar({
                    className: i < score ? activeColor : 'bg-muted',
                  })}
                  data-testid="password-input-strength-bar"
                  key={String(i)}
                />
              ),
            )}
          </div>
          {level && (
            <div
              className={strengthFooter()}
              data-testid="password-input-strength-footer"
            >
              <span
                className={strengthLabel()}
                data-testid="password-input-strength-label"
              >
                {strengthLevelLabels[level]}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { PasswordInput }
