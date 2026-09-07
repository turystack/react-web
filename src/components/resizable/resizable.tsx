import type { PropsWithChildren } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { tv } from 'tailwind-variants'

import type {
  ResizableHandleProps,
  ResizableLayout,
  ResizablePanelProps,
  ResizableProps,
} from './resizable.types'

/**
 * The library reads a bare number as pixels and a bare string as a percentage.
 * Everything crossing this boundary is a percentage, so it is said once, here.
 */
function percent(size: number | undefined) {
  return size === undefined ? undefined : `${size}%`
}

export const styles = tv({
  slots: {
    grip: 'resizable-grip z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-border',
    handle: [
      'resizable-handle relative flex items-center justify-center bg-border outline-none transition-colors',
      'focus-visible:ring-3 focus-visible:ring-ring/50',
      'data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary/60',
      'data-[panel-group-direction=horizontal]:w-px data-[panel-group-direction=vertical]:h-px',
      'data-[panel-group-direction=vertical]:w-full',
    ],
    panel: 'resizable-panel min-h-0 min-w-0 overflow-auto',
    root: 'resizable flex h-full w-full',
  },
})

/**
 * No `data-testid` on any of the three: the library assigns ids itself and
 * mirrors them onto `data-testid`, so anything set here is overwritten. What
 * it does expose is stable and semantic — `data-group`, `data-panel` and
 * `data-separator` — and that is what a test should hold on to.
 */
function ResizableRoot({
  children,
  defaultLayout,
  direction = 'horizontal',
  disabled,
  onChange,
}: PropsWithChildren<ResizableProps>) {
  const { root } = styles()

  return (
    <Group
      className={root()}
      data-panel-group-direction={direction}
      defaultLayout={defaultLayout}
      disabled={disabled}
      onLayoutChange={
        onChange ? (layout: ResizableLayout) => onChange(layout) : undefined
      }
      orientation={direction}
    >
      {children}
    </Group>
  )
}

function ResizablePanel({
  children,
  collapsedSize,
  collapsible,
  defaultSize,
  id,
  maxSize,
  minSize,
}: PropsWithChildren<ResizablePanelProps>) {
  const { panel } = styles()

  return (
    <Panel
      className={panel()}
      collapsedSize={percent(collapsedSize)}
      collapsible={collapsible}
      defaultSize={percent(defaultSize)}
      id={id}
      maxSize={percent(maxSize)}
      minSize={percent(minSize)}
    >
      {children}
    </Panel>
  )
}

function ResizableHandle({ disabled, withGrip }: ResizableHandleProps) {
  const { grip, handle } = styles()

  return (
    <Separator className={handle()} disabled={disabled}>
      {withGrip ? <span className={grip()} /> : null}
    </Separator>
  )
}

const Resizable = Object.assign(ResizableRoot, {
  Handle: ResizableHandle,
  Panel: ResizablePanel,
})

export { Resizable }
