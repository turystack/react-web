import {
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  useContext,
} from 'react'
import { tv } from 'tailwind-variants'

import type { BottomTabsItemProps, BottomTabsProps } from './bottom-tabs.types'

const BottomTabsContext = createContext<
  Pick<BottomTabsProps, 'value' | 'onChange' | 'showLabels'> | undefined
>(undefined)

const bottomTabs = tv({
  slots: {
    icon: 'bottom-tabs-icon flex size-5 items-center justify-center transition-transform',
    item: [
      'bottom-tabs-item flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl',
      'px-2 py-1.5 text-muted-foreground text-xs outline-none transition-colors',
      'hover:text-foreground',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[selected]:text-foreground',
      'data-[selected]:font-semibold',
      'data-[selected]:[&_.bottom-tabs-icon]:scale-110',
    ],
    label: 'bottom-tabs-label max-w-full truncate text-sm',
    root: [
      'fixed inset-x-0 bottom-0 bottom-tabs z-40 flex gap-1 border-border border-t',
      'bg-background/95 px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur',
      'shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.12)]',
    ],
  },
})

function BottomTabsRoot({
  value,
  onChange,
  showLabels = true,
  children,
}: BottomTabsProps) {
  const { root } = bottomTabs()

  return (
    <BottomTabsContext.Provider
      value={{
        onChange,
        showLabels,
        value,
      }}
    >
      <nav className={root()} data-testid="bottom-tabs">
        {children}
      </nav>
    </BottomTabsContext.Provider>
  )
}

function BottomTabsItem({
  value,
  label,
  icon,
  disabled,
  onClick,
  asChild,
  children,
}: BottomTabsItemProps) {
  const context = useContext(BottomTabsContext)
  const selected = context?.value === value
  const { item, icon: iconClass, label: labelClass } = bottomTabs()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      context?.onChange?.(event, value)
    }
  }

  const content = (
    <>
      {icon && <span className={iconClass()}>{icon}</span>}
      {context?.showLabels !== false && label && (
        <span className={labelClass()}>{label}</span>
      )}
      {children}
    </>
  )

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{
      onClick?: React.MouseEventHandler<HTMLElement>
      'data-selected'?: string
    }>

    return cloneElement(child, {
      'data-selected': selected ? '' : undefined,
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) {
          context?.onChange?.(event, value)
        }
      },
    })
  }

  return (
    <button
      className={item()}
      data-selected={selected ? '' : undefined}
      data-testid="bottom-tabs-item"
      disabled={disabled}
      onClick={handleClick}
      type="button"
    >
      {content}
    </button>
  )
}

const BottomTabs = Object.assign(BottomTabsRoot, {
  Item: BottomTabsItem,
})

export { BottomTabs }
