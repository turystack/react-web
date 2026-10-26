import { useState } from 'react'
import { tv } from 'tailwind-variants'
import { ComposedInput } from '@/components/input/input.composed'
import { useLabels } from '@/components/labels-provider'
import { Eye, EyeOff } from '@/internal/icons'

import type {
  PasswordInputProps,
  PasswordStrengthLevel,
} from './password-input.types'

const passwordInput = tv({
  slots: {
    root: 'password-input-root flex flex-col gap-2',
    sections: 'password-input-sections flex items-center gap-1.5',
    strengthBar:
      'password-input-strength-bar h-1 flex-1 rounded-full transition-colors',
    strengthBars: 'password-input-strength-bars flex gap-1',
    strengthFooter:
      'password-input-strength-footer flex items-center justify-between',
    strengthLabel:
      'password-input-strength-label text-muted-foreground text-xs',
  },
})

/** Each level reads its verdict from the `passwordInput` labels. */
const strengthLevelLabelKeys = {
  medium: 'medium',
  strong: 'strong',
  'very-strong': 'veryStrong',
  'very-weak': 'veryWeak',
  weak: 'weak',
} as const satisfies Record<PasswordStrengthLevel, string>

/**
 * Three status tokens for five levels: the count of filled bars tells the
 * levels apart, the colour tells the verdict — failing, passable, good. Every
 * token keeps 3:1 against the empty `bg-muted` bar in light and dark (the
 * non-text contrast AA asks of a meter), which the old yellow did not.
 */
const strengthLevelColors: Record<PasswordStrengthLevel, string> = {
  medium: 'bg-warning',
  strong: 'bg-success',
  'very-strong': 'bg-success',
  'very-weak': 'bg-destructive',
  weak: 'bg-destructive',
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
  defaultValue,
  rightSection,
  onChange,
  ...props
}: PasswordInputProps) {
  const labels = useLabels()
  const [visible, setVisible] = useState(false)
  const [typedValue, setTypedValue] = useState(defaultValue ?? '')
  const {
    root,
    sections,
    strengthBars,
    strengthBar,
    strengthFooter,
    strengthLabel,
  } = passwordInput()

  const isControlled = value !== undefined
  const password = isControlled ? (value ?? '') : typedValue

  const level = showStrength && password ? getStrengthLevel(password) : null
  const score = level ? strengthLevelScore[level] : 0
  const activeColor = level ? strengthLevelColors[level] : 'bg-muted'

  const handleChange = (next: string | null) => {
    if (!isControlled) {
      setTypedValue(next ?? '')
    }
    onChange?.(next)
  }

  const toggle = (
    <button
      aria-label={
        visible ? labels.passwordInput.hide : labels.passwordInput.show
      }
      className="password-input-toggle pointer-events-auto flex cursor-pointer items-center text-muted-foreground hover:text-foreground"
      onClick={() => setVisible((v) => !v)}
      tabIndex={-1}
      type="button"
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <div className={root()} data-testid="password-input-root">
      <ComposedInput
        {...props}
        defaultValue={defaultValue}
        onChange={handleChange}
        rightSection={
          <span className={sections()}>
            {rightSection}
            {toggle}
          </span>
        }
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
                {labels.passwordInput[strengthLevelLabelKeys[level]]}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { PasswordInput }
