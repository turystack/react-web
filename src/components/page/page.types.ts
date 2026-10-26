import type { ReactNode } from 'react'

/**
 * Page
 *
 * The inside of a shell: the block a route renders into Layout.Content.
 *
 * Behavior:
 * - A column with one rhythm, so every screen in an app is spaced alike
 * - Header lays the identity out against the action: breadcrumbs above, then
 *   icon, title and description on one side and whatever you hand it on the
 *   other
 * - The header row wraps: when it cannot keep about 16rem for the title block
 *   beside the action, the action moves to its own line under the title
 *   rather than squeezing the title and description into a narrow column
 * - Toolbar and Content are slots: children, plus an `id`
 * - Header, Toolbar and Content take an `id` that lands on the element, so a
 *   part can be an in-page anchor target (AnchorNav, `#activity` links) —
 *   a page with several Content blocks can link to each
 *
 * Implementation:
 * - Header is the only part with layout props, because its arrangement is fixed;
 *   everything else is composition, so nothing here wraps a component you
 *   could not have placed yourself
 * - Renders no landmark: Layout.Main already is one, and a page inside it is a
 *   section of that main, not a second one
 * - `breadcrumbs` is data rather than a nested <Breadcrumb>, because the trail
 *   is the same three elements every time and the composition is the part that
 *   gets written differently on every page
 * - <Page>
 *     <Page.Header
 *       action={<Button>New order</Button>}
 *       breadcrumbs={[{ label: 'Orders' }]}
 *       description="Every order, across every channel."
 *       icon={<Package />}
 *       title="Orders"
 *     />
 *     <Page.Toolbar><Search … /></Page.Toolbar>
 *     <Page.Content><Table … /></Page.Content>
 *   </Page>
 *
 * Dependencies: Breadcrumb component
 */

export type PageProps = {}

/** One step of the trail. The last one is the current page and never a link. */
export type PageBreadcrumb = {
  label: ReactNode
  href?: string
}

export type PageHeaderProps = {
  title: ReactNode // what this page is (required)
  icon?: ReactNode // mark beside the title, in a tinted square
  description?: ReactNode // one line under the title
  action?: ReactNode // pushed to the far end of the row; wraps under the title when the row is too narrow
  breadcrumbs?: PageBreadcrumb[] // the trail above the title
  id?: string // DOM id, the target of an in-page anchor link
}

export type PageToolbarProps = {
  id?: string // DOM id, the target of an in-page anchor link
}

export type PageContentProps = {
  id?: string // DOM id, the target of an in-page anchor link
}
