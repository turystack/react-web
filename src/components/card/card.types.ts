/**
 * Card
 *
 * Content container with optional header, title, description, content body,
 * footer, and separator sections. Used for grouping related information.
 *
 * Behavior:
 * - Renders with border, rounded corners, and subtle shadow (shadow-sm)
 * - Header/Footer bordered prop adds a divider line between sections
 * - onClick without href makes the card itself a button: role="button",
 *   reached by Tab, pressed with Enter or Space, focus-visible ring, named by
 *   ariaLabel (else by its text). A click or key press that starts in a nested
 *   control (button, link, input…) belongs to that control and does not run
 *   the card's onClick — the same rule as href mode. Trade-off: ARIA makes the
 *   descendants of a button presentational, so a screen reader may flatten
 *   controls nested in an onClick card; they stay clickable and reachable by
 *   Tab, but a card that holds its own controls reads better with href (a
 *   stretched link that sits below them) or with the action on a Button
 * * - href makes the card a real link: the Card.Title's text becomes an <a>
 *   stretched over the whole card, so it takes focus, navigates on click
 *   anywhere and on Enter, and gets the same hover lift as onClick. Its
 *   accessible name is the title, not every word in the card. With ariaLabel
 *   the card renders the stretched link itself, named by ariaLabel, and the
 *   title stays plain text — use it for a card with no Card.Title (without
 *   either there is nothing to name the link, so none is rendered and a
 *   development-only console.error says so). Buttons
 *   and links nested in the card sit above the link and act on their own
 *   without navigating
 * - href + onClick: onClick becomes the link's click handler — it runs when
 *   the link is activated (pointer or Enter) before navigation, and a nested
 *   control does not trigger it; call event.preventDefault() to route
 *   client-side instead of following the href
 * - size="sm" is the compact card for a row in a list: tighter padding and gap,
 *   no resting shadow (a clickable one still lifts on hover); every part
 *   reads the size from the root, so it is set once
 * - selected marks the card the user picked: a 2px primary ring and a
 *   primary tint. onSelectedChange makes the card a toggle button (without
 *   href): a click, Enter or Space asks for the opposite state, and
 *   aria-pressed reports the current one. An onClick card given selected also
 *   reports aria-pressed. On a static or linked card selected is visual only,
 *   since neither role can carry a selection. To pick one of several options,
 *   prefer Radio.Group card, which also gives the group arrow-key navigation
 *   and single-choice semantics
 * - highlighted marks the recommended tier among siblings: the hairline ring
 *   turns primary. It is visual only — say "Recommended" in the content (a
 *   Badge) so it is not carried by colour alone. With selected too, the
 *   selection shows
 * - A selected or highlighted onClick card keeps its primary ring on focus and
 *   shows focus as an offset outline around the card
 * - height="full" makes the card fill the cell it sits in (h-full): inside a
 *   Grid.Item of a bento row, or a flex column with a height, every card
 *   reaches the bottom of its cell instead of stopping at its content. The
 *   content takes the spare height, so a bordered footer sits on the card's
 *   bottom edge and two cards side by side rule their footers on one line.
 *   The default "auto" is the content height
 * - Card.Title is a plain block by default. headingLevel makes it a real
 *   heading (h1–h6) so a page of cards is navigable by heading; the level is
 *   the consumer's, because only the page knows what the card sits under.
 *   In href mode the heading holds the stretched link, so the link is still
 *   named by the title and the heading is still a heading
 * - id lands on the root element, so a card can be the target of an in-page
 *   link or an AnchorNav section
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
 * - <Grid.Item rowSpan={2}><Card height="full">…</Card></Grid.Item>
 * - <Card size="sm"><Card.Content>One row of a list</Card.Content></Card>
 * - <Card href="/plans/pro"><Card.Header><Card.Title>Pro plan</Card.Title></Card.Header></Card>
 * - <Card><Card.Header><Card.Title headingLevel={3}>Pro plan</Card.Title></Card.Header></Card>
 * - <Card highlighted selected={plan === 'pro'} onSelectedChange={() => setPlan('pro')}>…</Card>
 *
 * Dependencies: none (pure CSS)
 */

export type CardMinHeight = 'sm' | 'md' | 'lg' | 'xl'

export type CardVerticalAlign = 'start' | 'center'

export type CardSize = 'default' | 'sm'

export type CardHeight = 'auto' | 'full'

// 1 included: on a card-only screen (sign-in, checkout result) the card's title IS
// the page title.
export type CardTitleHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type CardProps = {
  ariaLabel?: string // with href, names the link instead of the Card.Title; with onClick alone, names the card's button
  height?: CardHeight // 'full' fills its grid or flex cell (h-full); default 'auto', the content height
  highlighted?: boolean // emphasises the card among siblings (a recommended tier): primary ring
  href?: string // makes the whole card a link to this URL
  id?: string // id of the root element, e.g. an AnchorNav scroll target
  minHeight?: CardMinHeight // minimum card height preset
  onClick?: React.MouseEventHandler<HTMLElement> // makes the card a keyboard-operable button; with href, the link's click handler
  onSelectedChange?: (selected: boolean) => void // without href, makes the card a toggle button; receives the requested state
  selected?: boolean // the picked card: primary ring and tint; aria-pressed when the card is a button
  size?: CardSize // padding and gap of the card and its parts (default 'default')
  verticalAlign?: CardVerticalAlign // vertical alignment for card sections
}

export type CardHeaderProps = {
  bordered?: boolean // adds bottom border to header
}

export type CardTitleProps = {
  headingLevel?: CardTitleHeadingLevel // renders the title as that heading (h1–h6); default none, a plain div
}

export type CardDescriptionProps = {}

export type CardContentProps = {}

export type CardFooterProps = {
  bordered?: boolean // adds top border to footer
}

export type CardSeparatorProps = {}
