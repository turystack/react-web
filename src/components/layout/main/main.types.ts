/**
 * Layout.Main
 *
 * Primary content area wrapping the scrollable region.
 * Renders as <main> with flex-grow to fill remaining space.
 *
 * Behavior:
 * - `id` names the landmark, so a Layout `skipLinks` entry (`#main`) can
 *   land on it; without one the element carries no id
 *
 * Implementation:
 * - <main> element with flex, flex-grow, overflow-hidden
 * - <Layout.Main>children</Layout.Main>
 * - <Layout.Main id="main">children</Layout.Main>
 *
 * Dependencies: none
 */

export type LayoutMainProps = {
  id?: string // id of the <main> element, the target of a skip link; default none
}
