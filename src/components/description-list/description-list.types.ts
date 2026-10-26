/**
 * DescriptionList
 *
 * The "Details" panel of a record page: a list of label / value pairs, the
 * way Stripe shows a payment's id, customer and method beside the main
 * content.
 *
 * Behavior:
 * - Renders a real `dl`: each pair is a `div` holding one `dt` (label) and
 *   one `dd` (value), so assistive technology reads the pairs as pairs
 * - `layout="stacked"` (default) puts the label above the value;
 *   `layout="inline"` puts label and value side by side in two columns
 * - `columns` (1, 2 or 3; default 1) lays the pairs out in a grid, in either
 *   layout
 * - `dividers` draws a rule between rows of pairs
 * - A value that is null, undefined, false or an empty string renders a
 *   muted em dash, so a missing field reads as missing rather than as a gap
 * - `copyable` on an item adds a CopyButton beside the value: a string is
 *   copied as given (use it when the value is a node, or to copy something
 *   other than what is shown); `true` copies the value itself when it is a
 *   string or number, and adds nothing when the value is a node. An empty
 *   value is never copyable
 * - Each copy button is named after its item: a string `label` gives
 *   "Copy <label>" (the `common.copyValue` label); a node label leaves the
 *   plain `common.copy` name
 * - `key` identifies an item across renders; the index is used without it
 *
 * Implementation:
 * - <DescriptionList items={[{ label: 'Payment ID', value: payment.id, copyable: true }, { label: 'Customer', value: <Link href={url}>{name}</Link>, copyable: email }]} />
 * - <DescriptionList columns={2} dividers items={items} layout="inline" />
 *
 * Dependencies: CopyButton, LabelsProvider
 */

import type { ReactNode } from 'react'

export type DescriptionListLayout = 'stacked' | 'inline'

export type DescriptionListColumns = 1 | 2 | 3

export type DescriptionListItem = {
  copyable?: string | boolean // string = what to copy; true = copy a string/number value
  key?: string // stable identity for the pair; default its index
  label: ReactNode // the term, rendered in the dt (required)
  value: ReactNode // the description, rendered in the dd; empty renders a muted em dash (required)
}

export type DescriptionListProps = {
  columns?: DescriptionListColumns // pairs per row; default 1
  dividers?: boolean // draws a rule between rows of pairs
  items: DescriptionListItem[] // the label / value pairs, in order (required)
  layout?: DescriptionListLayout // stacked = label above value, inline = side by side; default stacked
}
