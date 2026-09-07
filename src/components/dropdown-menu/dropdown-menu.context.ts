import { createContext, useContext } from 'react'

type DropdownMenuGroupContextValue = {
  /**
   * Whether the subtree is inside a `DropdownMenu.Group`.
   *
   * The headless menu's group label reads a context the group provides, and
   * throws without it. That is correct for the headless layer — a label with no
   * group labels nothing — but it is not the consumer's problem: a label is a
   * reasonable thing to put in a menu on its own, and the primitive is what
   * knows which element to render.
   */
  inGroup: boolean
}

export const DropdownMenuGroupContext =
  createContext<DropdownMenuGroupContextValue>({
    inGroup: false,
  })

export const useInDropdownMenuGroup = () =>
  useContext(DropdownMenuGroupContext).inGroup

type DropdownMenuRadioContextValue = {
  /** Whether the subtree is inside a `DropdownMenu.RadioGroup`. */
  inRadioGroup: boolean
}

export const DropdownMenuRadioContext =
  createContext<DropdownMenuRadioContextValue>({
    inRadioGroup: false,
  })

/**
 * A radio item outside a radio group has nothing to be exclusive with, so
 * unlike a label it cannot fall back to anything sensible — it has to fail.
 *
 * What it must not do is fail in the headless layer's words: that message names
 * `<Menu.RadioGroup>`, a component the consumer never wrote and cannot find in
 * this library's API.
 */
export const useDropdownMenuRadioGroup = () => {
  const { inRadioGroup } = useContext(DropdownMenuRadioContext)

  if (!inRadioGroup) {
    throw new Error(
      'DropdownMenu.RadioItem must be used inside DropdownMenu.RadioGroup.',
    )
  }
}
