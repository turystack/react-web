/**
 * Layout
 *
 * Full-screen application shell providing structural regions:
 * Header, Main, Content, Footer, and optional Sidebar.
 *
 * Behavior:
 * - Root fills viewport (h-screen) as a flex column
 * - withSidebar enables sidebar integration via context
 * - Header supports sticky positioning, three sizes, and bordered variant
 * - Content provides scrollable area with max-width and padding constraints
 * - Footer supports sticky bottom positioning
 *
 * Implementation:
 * - LayoutContext shares withSidebar state across sub-components
 * - Semantic HTML elements: <header>, <main>, <footer>
 * - <Layout withSidebar>
 *     <Layout.Header sticky bordered size="md">Nav</Layout.Header>
 *     <Layout.Main>
 *       <Layout.Content maxWidth="lg" padding="md">Page</Layout.Content>
 *     </Layout.Main>
 *     <Layout.Footer sticky bordered>Footer</Layout.Footer>
 *   </Layout>
 *
 * Dependencies: React Context API
 */

export type LayoutProps = {
  withSidebar?: boolean // enables sidebar layout mode
}
