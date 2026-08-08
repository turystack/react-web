/**
 * Card
 *
 * Content container with optional header, title, description, content body,
 * footer, and separator sections. Used for grouping related information.
 *
 * Behavior:
 * - Renders with border, rounded corners, and subtle shadow (shadow-sm)
 * - Header/Footer bordered prop adds a divider line between sections
 * - onClick on root makes the entire card interactive (cursor-pointer)
 * - Sections compose freely — all sub-components are optional
 *
 * Implementation:
 * - Pure div-based composition with Tailwind styling
 * - <Card onClick={fn}>
 *     <Card.Header bordered><Card.Title>Title</Card.Title><Card.Description>Desc</Card.Description></Card.Header>
 *     <Card.Content>Body</Card.Content>
 *     <Card.Separator />
 *     <Card.Footer bordered>Actions</Card.Footer>
 *   </Card>
 *
 * Dependencies: none (pure CSS)
 */

export type CardMinHeight = 'sm' | 'md' | 'lg' | 'xl'

export type CardVerticalAlign = 'start' | 'center'

export type CardProps = {
  minHeight?: CardMinHeight // minimum card height preset
  onClick?: React.MouseEventHandler<HTMLDivElement> // makes card interactive/clickable
  verticalAlign?: CardVerticalAlign // vertical alignment for card sections
}

export type CardHeaderProps = {
  bordered?: boolean // adds bottom border to header
}

export type CardTitleProps = {}

export type CardDescriptionProps = {}

export type CardContentProps = {}

export type CardFooterProps = {
  bordered?: boolean // adds top border to footer
}

export type CardSeparatorProps = {}
