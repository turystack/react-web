/**
 * What a composing parent of this package may add at runtime: Form.Field
 * floats the label, Switch makes it a click target. Plumbing between
 * components, never part of the public contract — see `label.composed.ts`.
 */
export type LabelInjectedProps = {
  className?: string
}
