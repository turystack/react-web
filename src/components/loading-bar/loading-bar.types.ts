/**
 * LoadingBar
 *
 * The thin bar across the top of the screen while a page loads — the one a
 * router transition shows. Not `Progress`: that is a labelled bar in the
 * content, this is a strip over the shell with no layout of its own.
 *
 * Behavior:
 * - `loading` true waits `delay` ms, then shows the bar and creeps it towards
 *   90% — it never reaches the end on its own, because it does not know when
 *   the work ends. Default delay 200ms
 * - `loading` false runs it to 100%, fades it out and resets it. A load that
 *   ends inside the delay shows nothing at all, so a fast navigation does not
 *   flash. A load that starts while the last bar is fading drops that bar and
 *   starts a new one, rather than reviving it from 100%
 * - `value` (0-100) is real progress, an upload: the bar shows it instead of
 *   creeping, and reports it to assistive technology. `loading` still decides
 *   when the bar is there, and ending it always runs the bar to 100% — there
 *   is no failed state, so an aborted upload is the caller's to report. Name
 *   it with `ariaLabel`: the default says "Loading page"
 * - Nothing is rendered while idle — no progressbar for a screen reader to
 *   find when nothing is loading
 * - `position="fixed"` pins it to the top of the viewport (the default);
 *   `absolute` to the top of the nearest positioned ancestor
 * - Under `prefers-reduced-motion` it does not creep and does not animate:
 *   it appears, holds at 100% for half a second and is removed
 * - Takes no pointer and no height: it covers the shell's top edge, never
 *   pushes it down
 *
 * Implementation:
 * - role="progressbar"; aria-valuenow only with a `value` — a creeping width
 *   is a guess, and a guess announced as a number would be a lie. No
 *   aria-busy, which would tell a screen reader to ignore the bar; the
 *   finished, fading bar is aria-hidden
 * - Named by `ariaLabel`, else `labels.loadingBar.loading`
 * - Root publishes data-size / data-variant / data-position
 * - <LoadingBar loading={isLoading} />
 * - <LoadingBar ariaLabel="Uploading" loading={uploading} value={percent} />
 * - Inside a shell, prefer `<Layout loadingBar={{ loading }}>`
 *
 * Dependencies: LabelsProvider
 */

/**
 * - `fixed`    — top of the viewport, over everything (the default)
 * - `absolute` — top of the nearest positioned ancestor
 */
export type LoadingBarPosition = 'fixed' | 'absolute'

/** Bar height: `sm` 2px, `md` 3px, `lg` 4px. */
export type LoadingBarSize = 'sm' | 'md' | 'lg'

export type LoadingBarVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'destructive'

export type LoadingBarProps = {
  ariaLabel?: string // accessible name; default labels.loadingBar.loading
  delay?: number // ms before the bar appears; default 200
  loading?: boolean // true shows and creeps; false completes and fades
  position?: LoadingBarPosition // fixed to the viewport, or absolute; default fixed
  size?: LoadingBarSize // bar height; default sm (2px)
  value?: number // real progress 0-100; replaces the creep
  variant?: LoadingBarVariant // bar colour; default default (primary)
}
