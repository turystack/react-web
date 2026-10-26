/**
 * Layout
 *
 * The application shell: a flex column of Header, Main (holding Content) and
 * Footer where exactly one region scrolls, plus the navigation rail it is
 * composed with — `Layout.Sidebar`.
 *
 * Behavior:
 * - The column is overflow-hidden and header/footer are shrink-0, so
 *   Layout.Content is the only box in the stack that scrolls
 * - Standing alone the root is h-svh, the viewport
 * - Inside a Layout.Sidebar.Provider the root *is* the content pane beside the
 *   rail: it fills what the rail leaves and picks up the inset variant's frame.
 *   Nothing is passed for this — the root reads the sidebar context, and the
 *   `height` prop is ignored rather than fought with
 * - `useLayout()` publishes that answer to anything below
 * - `variant="centered"` is the shell of a screen that is one thing in the
 *   middle — sign in, sign up, a code to type. The content centres itself on
 *   both axes in a narrow column (`maxWidth` defaults to `xs`, 384px), and it
 *   is still the same shell: no header or sidebar is required, and a split
 *   screen is two `Layout.Content` side by side in `Layout.Main`
 * - `banner` is a full-width strip above everything else in the shell — an
 *   environment notice ("Sandbox — test data"), a maintenance window. It is
 *   the first box in the root that takes space — only the skip links and the
 *   loading bar come before it — and does not shrink, so the header, main and
 *   footer share what is left of the shell's height and `height` still means
 *   the whole shell, banner included. It belongs to the outermost box: with a
 *   sidebar that box is `Layout.Sidebar.Provider`, whose own `banner` spans
 *   the rail too; a `banner` on a Layout beside a rail sits over the content
 *   pane only. Usually an `<Alert layout="banner">`
 * - `skipLinks` are the "Skip to content" links a keyboard user meets first:
 *   rendered before everything else in the root (the banner included),
 *   visually hidden until one takes keyboard focus, then shown over the top
 *   corner of the shell. None by default. Each `href` points at an id on the
 *   page (`#main`) — give `Layout.Main` or the target an `id`. Beside a
 *   `Layout.Sidebar` the root is the content pane, so the links come after the
 *   rail in tab order there
 * - `loadingBar` turns on the bar across the shell's top edge while a page
 *   loads (see LoadingBar). Absent is off: nothing is rendered. Present, it
 *   stays mounted and `loading` drives it — so `false` is "idle", not "off",
 *   and the bar can still run to 100% when a load ends. It comes after the
 *   skip links, so they stay the first thing in the root. Where it sits is
 *   derived, never passed: a `viewport` shell pins it to the top of the
 *   screen; a `fill` shell, or the content pane beside a rail, to its own top
 *   edge. It takes no height, so the header does not move
 *
 * Implementation:
 * - Semantic HTML: <header>, <main>, <footer>. The root is a <div>, so
 *   Layout.Main is the page's only main landmark
 * - Root carries data-with-sidebar while a sidebar is above it
 * - <Layout.Sidebar.Provider>
 *     <Layout.Sidebar collapsible="icon">…</Layout.Sidebar>
 *     <Layout>
 *       <Layout.Header bordered size="md">Nav</Layout.Header>
 *       <Layout.Main>
 *         <Layout.Content maxWidth="lg" padding="md">Page</Layout.Content>
 *       </Layout.Main>
 *       <Layout.Footer bordered>Footer</Layout.Footer>
 *     </Layout>
 *   </Layout.Sidebar.Provider>
 * - <Layout loadingBar={{ loading: isNavigating }}>…</Layout>
 * - <Layout skipLinks={[{ href: '#main', label: 'Skip to content' }]}>…</Layout>
 * - <Layout banner={<Alert layout="banner" variant="warning">…</Alert>}>
 *     <Layout.Header>Nav</Layout.Header>
 *     <Layout.Main>…</Layout.Main>
 *   </Layout>
 *
 * Dependencies: React Context API, LoadingBar
 */

import type { ReactNode } from 'react'

import type { LoadingBarProps } from '@/components/loading-bar'

/**
 * - `viewport` — h-svh, the shell owns the screen (the default)
 * - `fill`     — h-full flex-1, the shell fills whatever box it was given
 *
 * Inside a sidebar neither applies and this prop is ignored: the shell is the
 * content pane, which takes `flex-1` and no height at all, because a height
 * plus the inset variant's margin overflows the row by the margin. Pass it for
 * the one remaining case — a shell embedded in a page that is not the page.
 */
export type LayoutHeight = 'viewport' | 'fill'

/**
 * The shell's gutter, one scale for every part: `sm` 16px, `md` 24px, `lg`
 * 32px — horizontal on the header and the footer, all round on the content, so
 * their padding is the same distance at every step. Default `md`. A Content
 * with `maxWidth` centres a narrower column, so on a pane wider than the cap
 * its edge sits further in than the header's.
 */
export type LayoutPadding = 'none' | 'sm' | 'md' | 'lg'

/**
 * The shell's loading bar: every LoadingBar prop but `position`, which the
 * shell derives from its own height.
 */
export type LayoutLoadingBar = Omit<LoadingBarProps, 'position'>

/**
 * - `default`  — content flows from the top, as wide as `maxWidth` allows
 * - `centered` — content sits in the middle of the pane, in a narrow column
 */
export type LayoutVariant = 'default' | 'centered'

export type LayoutSkipLink = {
  href: string // the in-page target, e.g. '#main' (required)
  label: string // what the link says, e.g. 'Skip to content' (required)
}

export type LayoutProps = {
  banner?: ReactNode // full-width strip above the header; usually <Alert layout="banner">
  height?: LayoutHeight // viewport-tall, or as tall as its parent
  loadingBar?: LayoutLoadingBar // top bar while a page loads; absent = off
  padding?: LayoutPadding // the gutter every part falls back to; default md
  skipLinks?: LayoutSkipLink[] // links shown first on keyboard focus, hidden otherwise; default none
  variant?: LayoutVariant // default, or centered for auth-like screens
}
