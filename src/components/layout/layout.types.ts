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
 *
 * Dependencies: React Context API
 */

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
 * The horizontal step the header and the footer use, and the all-round step
 * the content uses: `sm` 8/16px, `md` 16/24px, `lg` 24/32px.
 */
export type LayoutPadding = 'none' | 'sm' | 'md' | 'lg'

export type LayoutProps = {
  height?: LayoutHeight // viewport-tall, or as tall as its parent
  padding?: LayoutPadding // the default every part falls back to
}
