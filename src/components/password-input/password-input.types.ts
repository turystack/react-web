/**
 * PasswordInput
 *
 * Password input with visibility toggle and optional strength indicator.
 * Extends Input with type toggling and strength bar visualization.
 *
 * Behavior:
 * - Eye icon in right section toggles between password/text visibility
 * - showStrength renders a 5-bar strength indicator below the input
 * - Strength rules: length >= 8, has uppercase, has lowercase, has digit, has special char
 * - Levels: very-weak (1/5), weak (2/5), medium (3/5), strong (4/5), very-strong (5/5)
 * - Bars are color-coded: red → orange → yellow → green → emerald
 * - Strength label text displayed beside the bars
 *
 * Implementation:
 * - Compose Input with type toggle (text/password) via internal state
 * - Right section: clickable Eye/EyeOff icon
 * - Strength: count matching rules, map to level, render colored bars
 * - <PasswordInput showStrength value={pw} onChange={setPw} />
 *
 * Dependencies: Input component, @turystack/react-icons (Eye, EyeOff)
 */

import type { InputProps } from '@/components/input/input.types'

export type PasswordStrengthLevel =
  | 'very-weak'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'very-strong'

export type PasswordInputProps = Omit<InputProps, 'type'> & {
  showStrength?: boolean // renders password strength indicator bar
}
