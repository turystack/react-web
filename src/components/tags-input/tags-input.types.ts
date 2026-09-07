/**
 * TagsInput
 *
 * Input that manages a list of string tags.
 * Enter key adds a tag, X button removes it.
 *
 * Behavior:
 * - Typing and pressing Enter adds the input value as a new tag
 * - Tags render as Badge components with remove (X) button
 * - maxTags limits the number of tags allowed
 * - allowDuplicates controls whether duplicate values are permitted
 * - A refused entry stays in the field and is reported through onReject
 * - Tags and input render in a flex-wrap container
 * - Controlled (value/onChange) and uncontrolled (defaultValue) patterns
 *
 * Implementation:
 * - Compose Input + Badge components in a flex-wrap container
 * - onKeyDown handler for Enter key to add tags
 * - <TagsInput value={tags} maxTags={5} onChange={setTags} placeholder="Add tag..." />
 *
 * Dependencies: Input component, Badge component
 */

import type { InputProps } from '@/components/input/input.types'

export type TagsInputRejectReason = 'duplicate' | 'max-tags'

export type TagsInputProps = Omit<
  InputProps,
  'value' | 'defaultValue' | 'onChange' | 'debounce'
> & {
  value?: string[] // controlled list of tags
  defaultValue?: string[] // uncontrolled initial tags
  maxTags?: number // maximum number of tags allowed
  allowDuplicates?: boolean // whether duplicate tags are permitted
  onChange?: (value: string[]) => void // fires when tags change
  onReject?: (value: string, reason: TagsInputRejectReason) => void // fires when an entry is refused
}
