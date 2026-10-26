/**
 * Checklist
 *
 * The first-run setup list a new account works through — "set up your
 * account", a setup assistant: a handful of steps, how far along they are, and
 * the way into the next one.
 *
 * Behavior:
 * - Reads back its progress as "2 of 5 complete" beside a Progress bar, both
 *   derived from the items' `done` flags — the consumer never counts
 * - A done item shows a check and a muted, struck-through label; its action is
 *   not rendered, because a finished step has nothing left to do
 * - The first undone item is the next step: its label is emphasised and it is
 *   marked `aria-current="step"`
 * - `onDismiss` adds a close control to the header; without it there is none
 * - `collapsible` folds the done items away behind a toggle that says how many
 *   it hides; the toggle exposes `aria-expanded`. Folded is the default
 * - Every word it renders on its own comes from the labels provider
 *   (`checklist.*`, `common.close`)
 *
 * Implementation:
 * - <Checklist items={[{ id: 'profile', label: 'Complete your profile', done: true }, { id: 'bank', label: 'Add a bank account', done: false, action: <Button size="sm">Add</Button> }]} title="Set up your account" />
 * - <Checklist collapsible items={steps} onDismiss={hideChecklist} title="Get started" />
 *
 * Dependencies: Progress, Button, labels provider (`useLabels`)
 */

export type ChecklistItem = {
  action?: React.ReactNode // the way into this step; not rendered once it is done
  description?: React.ReactNode // one line on what the step involves
  done: boolean // whether the step is finished
  id: string // stable key for the step
  label: React.ReactNode // what the step is
}

export type ChecklistProps = {
  collapsible?: boolean // folds the done items behind a toggle; default false
  items: ChecklistItem[] // the steps, in the order they should be taken
  onDismiss?: () => void // renders a close control that calls this; absent, no control
  title?: React.ReactNode // heading above the progress; also names the list
}
