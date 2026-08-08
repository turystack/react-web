/**
 * Alert
 *
 * Dismissible notification banner for success, error, warning, or info messages.
 * Supports icon, title, description, and action slot composition.
 *
 * Behavior:
 * - Variant (default/destructive) propagates via context to child components
 * - Closable prop renders an X button that triggers a fade + slide-up transition
 * - On transition end, fires onClose callback and unmounts
 * - Icon inherits color from variant context
 *
 * Implementation:
 * - Use a context provider to share variant across sub-components
 * - Fade-out animation: opacity 0, translateY -4px, transition ~200ms
 * - tailwind-variants (tv) for variant-driven styling
 * - <Alert variant="destructive" closable onClose={fn}>
 *     <Alert.Icon><IconComponent /></Alert.Icon>
 *     <Alert.Title>Title</Alert.Title>
 *     <Alert.Description>Message</Alert.Description>
 *     <Alert.Action><Button>Retry</Button></Alert.Action>
 *   </Alert>
 *
 * Dependencies: @turystack/react-icons (X icon)
 */

export type AlertVariant = 'default' | 'destructive'

export type AlertProps = {
  variant?: AlertVariant // visual style variant
  closable?: boolean // shows close button
  onClose?: () => void // fires when close button is clicked
}

export type AlertIconProps = {}

export type AlertTitleProps = {}

export type AlertDescriptionProps = {}

export type AlertActionProps = {}
