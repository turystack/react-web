/**
 * BulkActions
 *
 * A floating bar that appears when a selection exists and offers what can be
 * done to it.
 *
 * Behavior:
 * - Knows nothing about tables or lists: it takes the selection as data and
 *   hands it back to whichever action runs. Table emits keys, a list of
 *   checkboxes emits rows — both are the same component here, because the
 *   selected type is a generic that defaults to string
 * - It appears when the selection stops being empty and leaves when it empties.
 *   There is no `open` prop: visibility is the selection, and a second source
 *   of truth for it could only ever disagree
 * - The bar is a non-modal floating Sheet: the page underneath stays scrollable
 *   and clickable, because the reader is still selecting rows while it is up.
 *   An outside press does not dismiss it; Escape clears the selection
 * - An action may declare a `confirm`, which is the Confirm contract minus what
 *   this component drives. The dialog then owns the run: it spins its own
 *   button, keeps itself open on a rejection with the reason, and closes only
 *   on success. A challenge mode hands what it collected to `onRun`
 * - An action that finishes clears the selection, unless `clearOnRun` says
 *   otherwise. An action that fails leaves bar and selection exactly as they
 *   were: the reader tries again or picks something else
 * - `extra` is a slot beside the count, for whatever else the bar has to say
 *   about this selection: a sum, a warning, an offer to take the whole filter.
 *   It replaced a `total` prop that existed only to render one built-in
 *   sentence — a number the bar could not use for anything else, wired to a
 *   `selectAll` handler it could not offer without it. Every product needed a
 *   different sentence there, and none of them could say it
 * - Actions past `maxVisible` collapse into a menu rather than growing the bar
 *
 * Implementation:
 * - Sheet variant="floating" modal={false} dismissible={false}
 * - <BulkActions actions={actions} onClear={clear} selection={selectedKeys} />
 *
 * Dependencies: Sheet, Confirm, Button, DropdownMenu, Loader,
 * ProtectedProvider, LabelsProvider
 */

import type { ButtonVariant } from '@/components/button/button.types'
import type { ConfirmProps } from '@/components/confirm/confirm.types'
import type { PermissionId } from '@/components/protected-provider/protected-provider.types'

/**
 * Distributive on purpose: a plain `Omit` over a union flattens it, and
 * `mode: 'typed'` would stop requiring `confirmationValue` — the challenge
 * would become decoration.
 */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never

export type BulkActionConfirm = DistributiveOmit<
  ConfirmProps,
  'open' | 'onCancel' | 'onClose' | 'onConfirm'
>

export type BulkActionsPosition = 'bottom' | 'top'

export type BulkAction<T> = {
  /** Confirmation to pass before running; a function of the selection so the
   * dialog can count what it is about to touch. */
  confirm?: BulkActionConfirm | ((selection: T[]) => BulkActionConfirm)
  disabled?: boolean | ((selection: T[]) => boolean) // blocked, and visibly so
  hidden?: boolean | ((selection: T[]) => boolean) // absent from the bar entirely
  icon?: React.ReactNode // node slot, never an icon name
  id: string // stable identity, and the React key
  label: string // what the control says
  /** Runs the action. The second argument is what a challenge collected —
   * the typed text, the password, the code — and is absent without one. */
  onRun: (selection: T[], confirmation?: string) => void | Promise<void>
  permissionIds?: PermissionId[] // disables the action when they are not held
  variant?: ButtonVariant // visual weight; destructive for the ones that are
}

export type BulkActionsProps<T = string> = {
  actions: BulkAction<T>[] // what can be done to the selection
  clearOnRun?: boolean // a finished action empties the selection; default true
  disabled?: boolean // blocks every action
  /** A node beside the count: a sum, a warning, an offer to take the whole
   * filter. A function receives the selection, so it can count what it says. */
  extra?: React.ReactNode | ((selection: T[]) => React.ReactNode)
  leftSection?: React.ReactNode // a node before the count
  loading?: boolean // the page is busy; the bar shows it and blocks
  maxVisible?: number // actions shown as buttons; the rest go to a menu. Default 3
  onClear?: () => void // the X, and Escape
  position?: BulkActionsPosition // which edge it floats over; default bottom
  selection: T[] // keys, or rows — whatever the surface selects
}
