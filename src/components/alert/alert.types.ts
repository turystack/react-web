/**
 * Alert
 *
 * A message that stands out from the page: a neutral note, information, a
 * success, a warning or an error, told with an icon, a title, a description
 * and an action. It comes in two layouts — a card that sits in the content,
 * and a banner that spans the top of an app (an environment notice such as
 * "Sandbox — test data", a maintenance window).
 *
 * Behavior:
 * - Variant (default/info/success/warning/destructive) propagates via context
 *   to the child parts; the icon takes the variant's colour and is hidden
 *   from assistive technology (the title and description carry the message)
 * - `layout="card"` (default) is a bordered, rounded box whose title and
 *   description stack beside the icon, with the action and close button in
 *   columns of their own
 * - `layout="banner"` is full-bleed: square corners, no side border, one line
 *   of icon + title + description with the action pushed to the far edge; the
 *   description truncates rather than wrapping. It is announced politely
 *   (role="status") because it is there on every screen, while the card keeps
 *   role="alert". Meant for the shell's banner slot (`Layout banner`,
 *   `Layout.Sidebar.Provider banner`)
 * - Closable prop renders an X button (named by the i18n `common.close` label)
 *   that triggers a fade + slide-up transition; on transition end (or after a
 *   200ms fallback) it fires onClose and unmounts. Works in both layouts
 * - Root carries data-variant and data-layout
 *
 * Implementation:
 * - Use a context provider to share the variant's part styles
 * - Fade-out animation: opacity 0, translateY -4px, transition ~200ms
 * - tailwind-variants (tv) for variant- and layout-driven styling
 * - Colours: theme tokens only — default/destructive their own, info follows
 *   `primary`, success and warning the `success`/`warning` tokens; a tinted
 *   variant's description is the card ink at 80% so it keeps AA on the tint
 * - <Alert variant="destructive" closable onClose={fn}>
 *     <Alert.Icon><IconComponent /></Alert.Icon>
 *     <Alert.Title>Title</Alert.Title>
 *     <Alert.Description>Message</Alert.Description>
 *     <Alert.Action><Button>Retry</Button></Alert.Action>
 *   </Alert>
 * - <Alert layout="banner" variant="warning">
 *     <Alert.Icon><FlaskConical /></Alert.Icon>
 *     <Alert.Title>Sandbox</Alert.Title>
 *     <Alert.Description>You are looking at test data.</Alert.Description>
 *   </Alert>
 *
 * Dependencies: @turystack/react-icons (X icon), @turystack/react-i18n (close label)
 */

export type AlertVariant =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'destructive'

/**
 * - `card`   — a bordered, rounded box in the content (the default)
 * - `banner` — full-bleed single line across the top of the app shell
 */
export type AlertLayout = 'card' | 'banner'

export type AlertProps = {
  variant?: AlertVariant // tone of the message; default default
  layout?: AlertLayout // card in the content, or banner across the shell; default card
  closable?: boolean // shows close button
  onClose?: () => void // fires when close button is clicked
}

export type AlertIconProps = {}

export type AlertTitleProps = {}

export type AlertDescriptionProps = {}

export type AlertActionProps = {}
