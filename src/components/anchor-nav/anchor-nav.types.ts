/**
 * AnchorNav
 *
 * The "On this page" index beside a long, anchored page — a settings screen
 * split into sections, each with an `id`, and a column of links into them.
 *
 * Behavior:
 * - Renders a `nav` named by the labels provider (`anchorNav.label`,
 *   overridable with `ariaLabel`) holding one link per item, `href="#<id>"`,
 *   so it still works with no script
 * - Scroll-spy by default: an IntersectionObserver watches the elements whose
 *   ids the items name, and the first one crossing the top half of the
 *   scroll area (below the header when `offset="header"`) becomes active.
 *   The scroll area is the sections' nearest ancestor whose computed overflow
 *   scrolls — a layout column that scrolls on its own — or the viewport when
 *   the window scrolls
 * - Scrolled to the end (within 1px), the last item is active: the last
 *   sections are often too short to ever reach the top
 * - `activeId` controls the active link; `defaultActiveId` seeds it (otherwise
 *   the section in the URL hash, otherwise the first item). Every change —
 *   from scrolling or from a click — is reported through `onActiveChange`
 * - `scrollSpy={false}` turns the observer off: the active link then moves
 *   only on click or through `activeId`
 * - Clicking a link scrolls its section into view — smoothly, or instantly
 *   under `prefers-reduced-motion` — and writes `#<id>` to the URL with
 *   `history.replaceState`, so the address can be shared without piling up
 *   history entries. The clicked link stays active through its scroll and
 *   after it — even a short late section that could not reach the top —
 *   until the reader scrolls again (a wheel or touch drag mid-glide counts)
 * - The active link carries `aria-current="location"`
 * - `offset="header"` (default) keeps the section clear of a sticky or fixed
 *   page header: the header is measured at click time and nothing is assumed
 *   about its height. Inside a scrolling pane only a header in that pane
 *   counts. `offset="none"` scrolls the section flush to the top
 * - Sticky positioning of the nav itself is the consuming layout's job: put
 *   it in a column that is `sticky`, the component does not pin itself
 *
 * Implementation:
 * - <AnchorNav items={[{ id: 'general', label: 'General' }, { id: 'billing', label: 'Billing' }]} />
 * - <AnchorNav activeId={section} items={sections} onActiveChange={setSection} offset="none" />
 *
 * Dependencies: labels provider (`useLabels`), IntersectionObserver
 */

export type AnchorNavOffset = 'none' | 'header'

export type AnchorNavItem = {
  id: string // id of the section element on the page
  label: React.ReactNode // what the link says
}

export type AnchorNavProps = {
  activeId?: string // controlled active section id
  ariaLabel?: string // names the nav; defaults to the anchorNav.label label
  defaultActiveId?: string // uncontrolled initial active section id
  items: AnchorNavItem[] // the sections, in page order
  offset?: AnchorNavOffset // clearance above a section on scroll; default header
  onActiveChange?: (id: string) => void // called with the id that became active
  scrollSpy?: boolean // follows the scroll position; default true
}
