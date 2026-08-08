/**
 * Breadcrumb
 *
 * Navigation hierarchy showing the current page location within the app.
 * Compound component with semantic HTML structure.
 *
 * Behavior:
 * - Renders as <nav> with <ol>/<li> structure for accessibility
 * - Separator (ChevronRight by default) auto-inserted between items
 * - Link is clickable (navigable), Page represents current location
 * - Ellipsis renders a "..." button for collapsed middle items
 * - Link supports asChild for integration with routing libraries
 *
 * Implementation:
 * - Semantic: <nav aria-label="breadcrumb"> > <ol> > <li> items
 * - Page gets aria-current="page", Separator gets aria-hidden="true"
 * - Radix Slot for asChild on Link
 * - <Breadcrumb>
 *     <Breadcrumb.List>
 *       <Breadcrumb.Item><Breadcrumb.Link href="/">Home</Breadcrumb.Link></Breadcrumb.Item>
 *       <Breadcrumb.Separator />
 *       <Breadcrumb.Item><Breadcrumb.Page>Current</Breadcrumb.Page></Breadcrumb.Item>
 *     </Breadcrumb.List>
 *   </Breadcrumb>
 *
 * Dependencies: @radix-ui/react-slot, @turystack/react-icons (ChevronRight, MoreHorizontal)
 */

export type BreadcrumbProps = {}

export type BreadcrumbListProps = {}

export type BreadcrumbItemProps = {}

export type BreadcrumbLinkProps = {
  asChild?: boolean // render as child element for custom link components
  href?: string // navigation URL
}

export type BreadcrumbPageProps = {}

export type BreadcrumbSeparatorProps = {}

export type BreadcrumbEllipsisProps = {}
