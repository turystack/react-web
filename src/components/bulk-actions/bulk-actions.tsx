import { type KeyboardEvent, useId, useState } from 'react'
import { tv } from 'tailwind-variants'

import { Button } from '@/components/button'
import { Confirm } from '@/components/confirm'
import type { ConfirmProps } from '@/components/confirm/confirm.types'
import { DropdownMenu } from '@/components/dropdown-menu'
import { useLabels } from '@/components/labels-provider'
import { usePermissions } from '@/components/protected-provider'
import { Sheet } from '@/components/sheet'
import { MoreHorizontal, X } from '@/internal/icons'

import type {
  BulkAction,
  BulkActionConfirm,
  BulkActionsProps,
} from './bulk-actions.types'

export const styles = tv({
  defaultVariants: {
    placement: 'floating',
  },
  slots: {
    count: 'bulk-actions-count whitespace-nowrap font-medium text-sm',
    divider: 'bulk-actions-divider h-6 w-px shrink-0 bg-border',
    group: 'bulk-actions-group flex items-center gap-1 overflow-x-auto',
    // A <fieldset>: min-w-0 lifts its min-content floor, and its own border
    // and margin go (the inline placement draws its own border).
    root: 'bulk-actions m-0 flex min-w-0 items-center gap-2 border-0 px-3 py-2',
  },
  variants: {
    placement: {
      floating: {},
      inline: {
        root: 'w-full min-w-0 rounded-md border border-border bg-muted/40',
      },
    },
  },
})

const DEFAULT_MAX_VISIBLE = 3

function read<T, R>(
  source: R | ((selection: T[]) => R) | undefined,
  selection: T[],
): R | undefined {
  return typeof source === 'function'
    ? (source as (value: T[]) => R)(selection)
    : source
}

export function BulkActions<T = string>({
  actions,
  clearOnRun = true,
  disabled,
  extra,
  leftSection,
  loading,
  maxVisible = DEFAULT_MAX_VISIBLE,
  onClear,
  placement = 'floating',
  position = 'bottom',
  selection,
}: BulkActionsProps<T>) {
  const labels = useLabels()
  const { can, loading: permissionsLoading } = usePermissions()
  const countId = useId()
  const [runningId, setRunningId] = useState<string | null>(null)
  const [pending, setPending] = useState<BulkAction<T> | null>(null)
  const { count, divider, group, root } = styles({
    placement,
  })
  const inline = placement === 'inline'

  const visible = actions.filter((action) => !read(action.hidden, selection))
  /**
   * Why an action is blocked, when the bar can say: its own reason first, then
   * the permission it lacks. A busy bar or a plain `disabled` says nothing —
   * the first is momentary, the second is the consumer's choice. Neither do
   * permissions that have not arrived yet: unknown is not denied, so such an
   * action waits, blocked and silent, instead of flashing "no permission".
   */
  const awaitingPermissions = (action: BulkAction<T>) =>
    permissionsLoading && Boolean(action.permissionIds?.length)
  const reasonFor = (action: BulkAction<T>) =>
    read(action.disabledReason, selection) ||
    (action.permissionIds && !permissionsLoading && !can(action.permissionIds)
      ? labels.protected.denied
      : undefined)
  const blocked = (action: BulkAction<T>) =>
    Boolean(disabled) ||
    Boolean(loading) ||
    awaitingPermissions(action) ||
    runningId !== null ||
    Boolean(read(action.disabled, selection)) ||
    Boolean(reasonFor(action))

  const shown = visible.slice(0, maxVisible)
  const collapsed = visible.slice(maxVisible)
  const extraNode = read<T, React.ReactNode>(extra, selection)

  async function run(action: BulkAction<T>, confirmation?: string) {
    setRunningId(action.id)

    try {
      await action.onRun(selection, confirmation)
    } finally {
      setRunningId(null)
    }

    if (clearOnRun) {
      onClear?.()
    }
  }

  /**
   * A confirmed action is handed to the dialog whole: Confirm already awaits
   * what it is given, spins its own button, and keeps itself open with the
   * reason when the promise rejects. Running it here as well would mean two
   * spinners and a dialog that closes on a failure the reader never saw.
   */
  function start(action: BulkAction<T>) {
    if (action.confirm) {
      setPending(action)

      return
    }

    /**
     * The rejection is deliberately dropped here. What went wrong belongs to
     * the message the API sent, and the app's own mutation shows it — this bar
     * only has to survive the failure with bar and selection intact.
     */
    void run(action).catch(() => undefined)
  }

  function closeConfirm() {
    setPending(null)
  }

  const confirmProps = pending
    ? ((read(pending.confirm, selection) as BulkActionConfirm) ?? null)
    : null

  /**
   * The floating bar hears Escape from its Sheet. In place there is no Sheet,
   * so the bar listens itself — only to keys pressed inside its own DOM.
   * Content portalled out of it (a popover opened from `extra`) bubbles its
   * Escape here through React, and that Escape closes the popover, not the
   * selection.
   */
  function handleInlineKeyDown(event: KeyboardEvent<HTMLFieldSetElement>) {
    if (
      event.key === 'Escape' &&
      event.target instanceof Node &&
      event.currentTarget.contains(event.target)
    ) {
      onClear?.()
    }
  }

  // Named by its count in both placements: "3 selected" is what the controls
  // in it act on.
  const bar = (
    // A <fieldset> is the native group the count names.
    <fieldset
      aria-labelledby={countId}
      className={root()}
      data-placement={placement}
      data-testid="bulk-actions"
      onKeyDown={inline ? handleInlineKeyDown : undefined}
    >
      {leftSection}
      <span
        aria-live="polite"
        className={count()}
        data-testid="bulk-actions-count"
        id={countId}
      >
        {labels.bulkActions.selected(selection.length)}
      </span>
      {extraNode ? (
        <span data-testid="bulk-actions-extra">{extraNode}</span>
      ) : null}

      <span className={divider()} />

      <div className={group()}>
        {shown.map((action) => (
          <Button
            data-testid={`bulk-actions-action-${action.id}`}
            disabled={blocked(action)}
            disabledReason={reasonFor(action)}
            key={action.id}
            leftSection={action.icon}
            loading={runningId === action.id}
            onClick={() => start(action)}
            size="sm"
            variant={action.variant ?? 'ghost'}
          >
            {action.label}
          </Button>
        ))}

        {collapsed.length > 0 ? (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                ariaLabel={labels.bulkActions.more}
                data-testid="bulk-actions-more"
                disabled={disabled || loading || runningId !== null}
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" sideOffset={4}>
              {collapsed.map((action) => (
                // A blocked item stays reachable by the arrow keys (the menu
                // keeps disabled items focusable), so its reason is heard there.
                <DropdownMenu.Item
                  asChild
                  disabled={blocked(action)}
                  disabledReason={reasonFor(action)}
                  key={action.id}
                  onClick={() => start(action)}
                  variant={
                    action.variant === 'destructive' ? 'destructive' : 'default'
                  }
                >
                  <div data-testid={`bulk-actions-item-${action.id}`}>
                    {action.icon}
                    {action.label}
                  </div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu>
        ) : null}
      </div>

      <span className={divider()} />

      <Button
        ariaLabel={labels.bulkActions.clear}
        data-testid="bulk-actions-clear"
        disabled={loading || runningId !== null}
        onClick={onClear}
        size="icon-sm"
        variant="ghost"
      >
        <X />
      </Button>
    </fieldset>
  )

  return (
    <>
      {inline ? (
        selection.length > 0 ? (
          bar
        ) : null
      ) : (
        <Sheet
          dismissible={false}
          modal={false}
          onChange={(next) => {
            if (!next) {
              onClear?.()
            }
          }}
          open={selection.length > 0}
          side={position}
          variant="floating"
        >
          {bar}
        </Sheet>
      )}

      {pending && confirmProps ? (
        <Confirm
          {...(confirmProps as ConfirmProps)}
          onCancel={closeConfirm}
          onClose={closeConfirm}
          onConfirm={async (value?: string) => {
            await run(pending, value)
            closeConfirm()
          }}
          open
        />
      ) : null}
    </>
  )
}
