/**
 * Layout.Header
 *
 * The shell's banner strip: a title with optional sections either side, or a
 * bar with a truly centred middle slot.
 *
 * Behavior:
 * - children is the title; leftSection / rightSection are controls either
 *   side of it (shrink-0 — they never squeeze), each rendered only if given
 * - centerSection switches the bar to three columns, `1fr auto 1fr`: the
 *   middle slot sits on the bar's true centre however uneven the two sides
 *   are (a logo between a menu button and three icon buttons). The side
 *   columns are equal shares that cannot grow past their half, so an
 *   over-long side truncates instead of pushing the centre off. With it, the
 *   title (children) sits in the left column after leftSection
 * - condenseOnScroll: once the shell's Layout.Content pane scrolls past 8px,
 *   the bar drops one height step (lg 64→48, md 56→40, sm 40→32px) and shows
 *   its bottom border; back at the top it restores both. The header listens
 *   on its own Layout root (a capturing, passive scroll listener, read once
 *   per animation frame); outside a Layout it follows the window. The height
 *   transition is off under prefers-reduced-motion. The state is published as
 *   `data-condensed="true|false"` for themes
 * - padding falls back to the shell's gutter, so the header lines up with
 *   the content and footer; size sets the height; bordered keeps a bottom
 *   border at all times; sticky pins it for a window-scrolled page
 * - maxWidth caps the bar's row at Container's scale — sm 384px, md 768px,
 *   lg 1152px, xl 1280px, 2xl 1536px, full (default, no cap) — and centres
 *   it, with or without a centerSection. The <header> still spans the screen
 *   (its height, border, background and stickiness do not move); only its
 *   content is capped, with the padding inside the cap the way a Container's
 *   paddingX is. So a marketing header lines up with the page below it:
 *   <Layout.Header maxWidth="lg"> over <Container maxWidth="lg"
 *   paddingX="md"> share their edges when the header's padding is md too
 *
 * Implementation:
 * - Semantic <header> (banner landmark)
 * - tailwind-variants (tv) slots: header, headerRow, headerInner,
 *   headerCenter, headerSection, headerStart, headerMiddle, headerEnd
 * - <Layout.Header leftSection={<MenuButton />} rightSection={<UserMenu />}>
 *     Dashboard
 *   </Layout.Header>
 * - <Layout.Header
 *     centerSection={<Logo />}
 *     condenseOnScroll
 *     leftSection={<MenuButton />}
 *     rightSection={<Actions />}
 *   />
 * - <Layout.Header maxWidth="lg" leftSection={<Logo />} rightSection={<Nav />} sticky />
 *
 * Dependencies: React (useEffect/useRef/useState), the Layout context
 */

import type { ReactNode } from 'react'

import type { LayoutPadding } from '../layout.types'

export type LayoutHeaderSize = 'sm' | 'md' | 'lg'

export type LayoutHeaderMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

export type LayoutHeaderProps = {
  bordered?: boolean // adds bottom border
  centerSection?: ReactNode // truly centred middle slot; lays the bar out as 1fr auto 1fr
  condenseOnScroll?: boolean // one height step smaller, with its border, once the content scrolls
  padding?: LayoutPadding // horizontal padding; falls back to the shell's
  leftSection?: ReactNode // content rendered on the left of the header
  maxWidth?: LayoutHeaderMaxWidth // caps and centres the bar's content at Container's scale; default full
  rightSection?: ReactNode // content rendered on the right of the header
  size?: LayoutHeaderSize // controls header height
  sticky?: boolean // makes header sticky at top
}
