import { useState } from 'react'
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
  slots: {
    count: 'bulk-actions-count whitespace-nowrap font-medium text-sm',
    divider: 'bulk-actions-divider h-6 w-px shrink-0 bg-border',
    group: 'bulk-actions-group flex items-center gap-1 overflow-x-auto',
    root: 'bulk-actions flex items-center gap-2 px-3 py-2',
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
  position = 'bottom',
  selection,
}: BulkActionsProps<T>) {
  const labels = useLabels()
  const { can } = usePermissions()
  const [runningId, setRunningId] = useState<string | null>(null)
  const [pending, setPending] = useState<BulkAction<T> | null>(null)
  const { count, divider, group, root } = styles()

  const visible = actions.filter((action) => !read(action.hidden, selection))
  const blocked = (action: BulkAction<T>) =>
    Boolean(disabled) ||
    Boolean(loading) ||
    runningId !== null ||
    Boolean(read(action.disabled, selection)) ||
    (action.permissionIds ? !can(action.permissionIds) : false)

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

  return (
    <>
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
        <div className={root()} data-testid="bulk-actions">
          {leftSection}
          <span
            aria-live="polite"
            className={count()}
            data-testid="bulk-actions-count"
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
                    <DropdownMenu.Item
                      disabled={blocked(action)}
                      key={action.id}
                      onClick={() => start(action)}
                      variant={
                        action.variant === 'destructive'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      {action.icon}
                      {action.label}
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
        </div>
      </Sheet>

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
