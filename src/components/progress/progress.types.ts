/**
 * Progress
 *
 * Horizontal progress bar with optional label.
 * Shows completion percentage via animated indicator width.
 *
 * Behavior:
 * - Value (0-100) controls indicator width via CSS transform translateX
 * - Size variants: sm (8px), md (16px), lg (24px) bar height
 * - Label prop adds text above the bar (inherits WithLabelProps)
 * - Smooth transition on value changes
 *
 * Implementation:
 * - Use Radix UI Progress primitive for accessibility (role="progressbar")
 * - Indicator uses transform: translateX(-(100-value)%) for width animation
 * - <Progress value={65} size="md" label="Upload progress" />
 *
 * Dependencies: @radix-ui/react-progress, Label component (WithLabelProps)
 */

import type { WithLabelProps } from '@/components/label'

export type ProgressSize = 'sm' | 'md' | 'lg'

export type ProgressProps = WithLabelProps<{
  value?: number // current progress value (0-100)
  defaultValue?: number // uncontrolled initial value
  size?: ProgressSize // visual size of the progress bar
}>
