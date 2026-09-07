import { type KeyboardEvent, useMemo, useRef, useState } from 'react'
import { tv } from 'tailwind-variants'

import { ChevronDown, ChevronRight } from '@/internal/icons'

import type { TreeProps } from './tree.types'

export const styles = tv({
  slots: {
    branch: 'tree-branch',
    chevron:
      'tree-chevron flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-3.5',
    group: 'tree-group ml-4 border-border border-l pl-2',
    label: 'tree-label flex min-w-0 flex-1 items-center gap-2 truncate',
    root: 'tree flex w-full flex-col gap-0.5 text-sm',
    row: [
      'tree-row flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-left outline-none',
      'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
      'aria-selected:bg-accent aria-selected:text-accent-foreground',
      'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    ],
  },
})

function read<T, R>(
  item: T,
  extractor: keyof T | ((value: T) => R) | undefined,
): R | undefined {
  if (extractor === undefined) {
    return undefined
  }

  return typeof extractor === 'function'
    ? extractor(item)
    : (item[extractor] as unknown as R)
}

export function Tree<T, V = string>({
  ariaLabel,
  defaultExpanded,
  defaultSelected,
  expanded,
  itemChildren,
  itemDisabled,
  itemIcon,
  itemKey,
  itemLabel,
  items,
  onExpandedChange,
  onSelect,
  selected,
}: TreeProps<T, V>) {
  const [internalExpanded, setInternalExpanded] = useState<V[]>(
    defaultExpanded ?? [],
  )
  const [internalSelected, setInternalSelected] = useState<V | null>(
    defaultSelected ?? null,
  )
  const rootRef = useRef<HTMLDivElement | null>(null)
  const { branch, chevron, group, label, root, row } = styles()

  const openKeys = expanded ?? internalExpanded
  const currentSelected = selected === undefined ? internalSelected : selected

  const keyOf = (item: T) => read<T, V>(item, itemKey) as V
  const childrenOf = (item: T) =>
    read<T, T[] | undefined>(item, itemChildren) ?? []

  /** The rows a reader can actually reach right now, in the order they appear. */
  const visible = useMemo(() => {
    const flat: T[] = []

    function walk(nodes: T[]) {
      for (const node of nodes) {
        flat.push(node)

        if (openKeys.includes(keyOf(node))) {
          walk(childrenOf(node))
        }
      }
    }

    walk(items)

    return flat
  }, [items, openKeys])

  function toggle(key: V) {
    const next = openKeys.includes(key)
      ? openKeys.filter((current) => current !== key)
      : [...openKeys, key]

    if (expanded === undefined) {
      setInternalExpanded(next)
    }

    onExpandedChange?.(next)
  }

  function pick(item: T) {
    const key = keyOf(item)

    if (selected === undefined) {
      setInternalSelected(key)
    }

    onSelect?.(key, item)
  }

  function move(from: V, offset: number) {
    const index = visible.findIndex((item) => keyOf(item) === from)
    const next = visible[index + offset]

    if (!next) {
      return
    }

    rootRef.current
      ?.querySelector<HTMLElement>(`[data-key="${String(keyOf(next))}"]`)
      ?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, item: T) {
    const key = keyOf(item)
    const hasChildren = childrenOf(item).length > 0
    const isOpen = openKeys.includes(key)

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      move(key, event.key === 'ArrowDown' ? 1 : -1)

      return
    }

    if (event.key === 'ArrowRight' && hasChildren && !isOpen) {
      event.preventDefault()
      toggle(key)

      return
    }

    if (event.key === 'ArrowLeft' && hasChildren && isOpen) {
      event.preventDefault()
      toggle(key)

      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(item)
    }
  }

  function renderNodes(nodes: T[], level: number) {
    return nodes.map((item) => {
      const key = keyOf(item)
      const children = childrenOf(item)
      const hasChildren = children.length > 0
      const isOpen = openKeys.includes(key)
      const disabled = Boolean(read<T, boolean>(item, itemDisabled))
      const focusable = visible[0] !== undefined && keyOf(visible[0]) === key

      return (
        <div className={branch()} key={String(key)} role="none">
          <div
            aria-disabled={disabled || undefined}
            aria-expanded={hasChildren ? isOpen : undefined}
            aria-level={level}
            aria-selected={currentSelected === key}
            className={row()}
            data-key={String(key)}
            data-testid="tree-row"
            onClick={() => {
              if (disabled) {
                return
              }

              if (hasChildren) {
                toggle(key)
              }

              pick(item)
            }}
            onKeyDown={(event) => handleKeyDown(event, item)}
            role="treeitem"
            tabIndex={focusable ? 0 : -1}
          >
            <span className={chevron()} data-testid="tree-chevron">
              {hasChildren ? isOpen ? <ChevronDown /> : <ChevronRight /> : null}
            </span>
            <span className={label()}>
              {read<T, React.ReactNode>(item, itemIcon)}
              {read<T, React.ReactNode>(item, itemLabel)}
            </span>
          </div>

          {hasChildren && isOpen ? (
            // biome-ignore lint/a11y/useSemanticElements: the tree pattern puts child items in a role="group" container; <fieldset> is a form grouping, not a tree one
            <div className={group()} role="group">
              {renderNodes(children, level + 1)}
            </div>
          ) : null}
        </div>
      )
    })
  }

  return (
    <div
      aria-label={ariaLabel}
      className={root()}
      data-testid="tree"
      ref={rootRef}
      role="tree"
    >
      {renderNodes(items, 1)}
    </div>
  )
}
