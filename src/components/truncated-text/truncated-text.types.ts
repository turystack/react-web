export type TruncatedTextComponent = 'code' | 'span'

export type TruncatedTextLines = 1 | 2 | 3

export type TruncatedTextPosition = 'end' | 'middle' | 'start'

export type TruncatedTextProps = {
  component?: TruncatedTextComponent
  end?: number
  lines?: TruncatedTextLines
  position?: TruncatedTextPosition
  start?: number
  value: number | string
}
