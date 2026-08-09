import { useControllableState, useLatest } from '@turystack/react-hooks'
import type { ChangeEvent, RefCallback } from 'react'
import { useCallback, useLayoutEffect, useRef } from 'react'

/** Any field with a text value and a caret — `input` and `textarea` both fit. */
type TextField = HTMLInputElement | HTMLTextAreaElement

export type UseInputTransformOptions<T = string> = {
  /**
   * Rewrites what the field shows, on every keystroke and on whatever arrives
   * through `value` or `defaultValue`. It must be pure: it runs during render
   * for controlled values.
   */
  transform: (raw: string) => string
  /**
   * Converts the displayed text into the value handed to `onChange`. Use it
   * when what you store differs from what you show — digits without the mask,
   * a number rather than a formatted amount. Defaults to the display text.
   */
  parse?: (display: string) => T
  /** Controlled text. Displayed through `transform`, like anything typed. */
  value?: string
  /** Initial text for the uncontrolled case, also passed through `transform`. */
  defaultValue?: string
  onChange?: (value: T, display: string) => void
}

export type UseInputTransformReturn<T = string> = {
  /** Spread onto the `input` or `textarea`. */
  props: {
    /**
     * A callback rather than a ref object so one hook fits both elements: a
     * `RefObject<HTMLInputElement | HTMLTextAreaElement>` will not go onto a
     * concrete `<input>`, but a callback taking the union will.
     */
    ref: RefCallback<TextField>
    value: string
    onChange: (event: ChangeEvent<TextField>) => void
  }
  /** The parsed value, the same one `onChange` receives. */
  value: T
  /** What the field is showing. */
  display: string
  /** Set the field from code. Goes through `transform` like typed text does. */
  setValue: (raw: string) => void
}

/**
 * Compares characters loosely enough to survive a case transform.
 *
 * Caret alignment walks the typed text against the transformed text looking
 * for the same characters; an `uppercase` transform would fail every
 * comparison and send the caret to position zero.
 */
function alike(left: string, right: string): boolean {
  return left === right || left.toLowerCase() === right.toLowerCase()
}

/**
 * Finds where the caret belongs in the transformed text.
 *
 * The typed characters before the caret are matched as a subsequence of the
 * result, so anything the transform inserted along the way is stepped over.
 * Typing `4` into `1.23|4.567` keeps the caret against the `4` instead of
 * throwing it to the end, which is what a naive implementation does and what
 * makes masked fields unusable for anything but appending.
 */
function alignCaret(typedPrefix: string, display: string): number {
  let index = 0
  let consumed = 0

  while (index < display.length && consumed < typedPrefix.length) {
    if (alike(display[index], typedPrefix[consumed])) {
      consumed += 1
    }
    index += 1
  }

  return index
}

/**
 * Applies a transform to a field as it is typed in, and to the value it emits.
 *
 * Headless: it owns no markup and renders nothing, so the same hook drives an
 * `input`, a `textarea`, or whatever component forwards a ref to one.
 *
 * ```tsx
 * const upper = useInputTransform({
 *   onChange: (value) => console.log(value),
 *   transform: (raw) => raw.toUpperCase(),
 * })
 *
 * <input {...upper.props} />
 * ```
 *
 * The caret survives transforms that change length, which is the part that
 * makes this worth a hook rather than an `onChange` one-liner.
 */
export function useInputTransform<T = string>({
  defaultValue = '',
  onChange,
  parse,
  transform,
  value,
}: UseInputTransformOptions<T>): UseInputTransformReturn<T> {
  const elementReference = useRef<TextField | null>(null)

  // Stable, so React does not detach and reattach the element every render.
  const setElement = useCallback<RefCallback<TextField>>((element) => {
    elementReference.current = element
  }, [])

  // Where to put the caret once React has painted the transformed text.
  // Applying it inside the change handler would fight the re-render.
  const pendingCaret = useRef<number | null>(null)

  const transformReference = useLatest(transform)
  const parseReference = useLatest(parse)
  const onChangeReference = useLatest(onChange)

  const toValue = useCallback(
    (display: string): T =>
      parseReference.current
        ? parseReference.current(display)
        : (display as unknown as T),
    [parseReference],
  )

  const [display, setDisplay] = useControllableState<string>({
    defaultValue: transform(defaultValue),
    onChange: (next) => onChangeReference.current?.(toValue(next), next),
    // A controlled field is transformed too: the caller sets `value="ab"` and
    // an uppercase transform still shows `AB`, rather than the field
    // disagreeing with itself until the first keystroke.
    value: value === undefined ? undefined : transform(value),
  })

  const commit = useCallback(
    (raw: string, caret: number | null) => {
      const next = transformReference.current(raw)

      pendingCaret.current =
        caret === null || caret >= raw.length
          ? next.length
          : alignCaret(raw.slice(0, caret), next)

      setDisplay(next)
    },
    [setDisplay, transformReference],
  )

  const handleChange = useCallback(
    (event: ChangeEvent<TextField>) => {
      commit(event.target.value, event.target.selectionStart)
    },
    [commit],
  )

  const setValue = useCallback(
    (raw: string) => {
      commit(raw, null)
    },
    [commit],
  )

  useLayoutEffect(() => {
    const element = elementReference.current
    const caret = pendingCaret.current
    pendingCaret.current = null

    // Only ever move the caret in the field the user is actually in. A
    // controlled update from elsewhere must not yank it around.
    if (caret === null || !element || document.activeElement !== element) {
      return
    }

    try {
      element.setSelectionRange(caret, caret)
    } catch {
      // `number`, `email` and `date` inputs have no selection to set and
      // throw rather than ignoring it. The text is already correct.
    }
  }, [display])

  return {
    display,
    props: {
      onChange: handleChange,
      ref: setElement,
      value: display,
    },
    setValue,
    value: toValue(display),
  }
}
